import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getVoterId() {
  var id = localStorage.getItem("abtest_voter_id");
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(36).slice(2)));
    localStorage.setItem("abtest_voter_id", id);
  }
  return id;
}

function votedKey(pollId) {
  return "abtest_voted_" + pollId;
}

export function hasVoted(pollId) {
  return !!localStorage.getItem(votedKey(pollId));
}

export function myChoice(pollId) {
  return localStorage.getItem(votedKey(pollId));
}

// choice: 'a' or 'b'
export async function castVote(pollId, choice) {
  var current = myChoice(pollId);
  if (current === choice) return choice;

  var voterId = getVoterId();
  var voterRef = doc(db, "voters", voterId + "_" + pollId);
  var pollRef = doc(db, "polls", pollId);

  if (current) {
    // switching an existing vote to the other choice
    var swap = {};
    swap[current] = increment(-1);
    swap[choice] = increment(1);
    await updateDoc(pollRef, swap);
    await setDoc(voterRef, { pollId: pollId, choice: choice, votedAt: Date.now() }, { merge: true });
    localStorage.setItem(votedKey(pollId), choice);
    return choice;
  }

  var existing = await getDoc(voterRef);
  if (existing.exists()) {
    var already = existing.data().choice;
    localStorage.setItem(votedKey(pollId), already);
    return already;
  }

  await setDoc(voterRef, { pollId: pollId, choice: choice, votedAt: Date.now() });

  var pollSnap = await getDoc(pollRef);
  if (!pollSnap.exists()) {
    await setDoc(pollRef, { a: choice === "a" ? 1 : 0, b: choice === "b" ? 1 : 0 });
  } else {
    var field = {};
    field[choice] = increment(1);
    await updateDoc(pollRef, field);
  }

  localStorage.setItem(votedKey(pollId), choice);
  return choice;
}

// cb(result) called immediately and on every live update. result = { a:Number, b:Number, total:Number, pct:{a,b} }
export function watchResults(pollId, cb) {
  var pollRef = doc(db, "polls", pollId);
  return onSnapshot(pollRef, function (snap) {
    var data = snap.exists() ? snap.data() : { a: 0, b: 0 };
    var a = data.a || 0, b = data.b || 0;
    var total = a + b;
    var pctA = total ? Math.round((a / total) * 100) : 50;
    var pctB = total ? 100 - pctA : 50;
    cb({ a: a, b: b, total: total, pct: { a: pctA, b: pctB } });
  });
}
