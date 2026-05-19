import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8y-U6IfohJPMx6VDnXCSKy_ZIdalmXb0",
  authDomain: "efect-aim-trainer-lb.firebaseapp.com",
  databaseURL: "https://efect-aim-trainer-lb-default-rtdb.firebaseio.com",
  projectId: "efect-aim-trainer-lb",
  storageBucket: "efect-aim-trainer-lb.firebasestorage.app",
  messagingSenderId: "312486579575",
  appId: "1:312486579575:web:60d90e9fea6ba91187a572",
  measurementId: "G-FYLQ3M9SDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 

const cleanUsername = (username: string) => {
  const trimmed = username.trim();

  return (trimmed || "EMX TWEAKS").substring(0, 16);
};

const cleanScenario = (scenario: string) => {
  return scenario.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").substring(0, 80);
};

const cleanScore = (score: number) => {
  return Math.max(0, Math.min(10_000_000, Math.round(Number.isFinite(score) ? score : 0)));
};

const cleanAccuracy = (accuracy: number) => {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(accuracy) ? accuracy : 0)));
};

// --- LEADERBOARD LOGIC ---
export const submitScore = async (scenario: string, username: string, score: number, accuracy: number) => {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  try {
    await addDoc(collection(db, "leaderboards"), {
      uid: user.uid,
      scenario: cleanScenario(scenario),
      username: cleanUsername(username),
      score: cleanScore(score),
      accuracy: cleanAccuracy(accuracy),
      timestamp: serverTimestamp()
    });
    console.log("EMX Score uploaded to Global Network.");
    return true;
  } catch (e) {
    console.error("Error pushing score: ", e);
    return false;
  }
};

export const fetchTopScores = async (scenario: string) => {
  try {
    const q = query(
      collection(db, "leaderboards"),
      where("scenario", "==", cleanScenario(scenario)),
      orderBy("score", "desc"),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    const scores: any[] = [];
    
    querySnapshot.forEach((scoreDoc) => {
      scores.push({ id: scoreDoc.id, ...scoreDoc.data() });
    });
    
    return scores;
  } catch (e) {
    console.error("Error fetching leaderboard: ", e);
    return [];
  }
};

// --- CLOUD ARMORY LOGIC ---
// Pushes current settings to the user's specific cloud document
export const syncArmoryToCloud = async (uid: string, settings: any) => {
  try {
    await setDoc(doc(db, "armory", uid), settings, { merge: true });
    console.log("Armory synced to secure cloud.");
  } catch (e) {
    console.error("Error syncing armory: ", e);
  }
};

// Pulls settings down when a user logs in
export const fetchCloudArmory = async (uid: string) => {
  try {
    const docSnap = await getDoc(doc(db, "armory", uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (e) {
    console.error("Error fetching armory: ", e);
    return null;
  }
};
