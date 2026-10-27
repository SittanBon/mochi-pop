/* Live leaderboard on Firebase Firestore. Off until firebaseConfig.js is filled in. */
import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

export const enabled = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE') && !!firebaseConfig.projectId;
let db = null;
if (enabled) {
  try {
    const app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch (e) { db = null; }
}

export async function pushMe(id, data) {
  if (!db) return;
  try { await setDoc(doc(db, 'players', id), data, { merge: true }); } catch (e) {}
}

export function watchTop(cb) {
  if (!db) return () => {};
  const q = query(collection(db, 'players'), orderBy('solo', 'desc'), limit(50));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
}
