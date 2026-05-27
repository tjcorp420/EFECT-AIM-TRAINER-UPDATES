import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
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

const getLeaderboardId = (scenario: string, uid: string) => {
  return `${cleanScenario(scenario)}_${uid.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 96)}`;
};

// --- LEADERBOARD LOGIC ---
export const submitScore = async (scenario: string, username: string, score: number, accuracy: number) => {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  try {
    const scenarioKey = cleanScenario(scenario);
    const leaderboardRef = doc(db, "leaderboards", getLeaderboardId(scenario, user.uid));
    const existingSnap = await getDoc(leaderboardRef);
    const existingScore = existingSnap.exists() ? cleanScore(Number(existingSnap.data().score)) : 0;
    const nextScore = cleanScore(score);
    const sharedPayload = {
      uid: user.uid,
      scenario: scenarioKey,
      username: cleanUsername(username),
      updatedAt: serverTimestamp(),
    };

    if (nextScore >= existingScore) {
      await setDoc(
        leaderboardRef,
        {
          ...sharedPayload,
          score: nextScore,
          accuracy: cleanAccuracy(accuracy),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      await setDoc(leaderboardRef, sharedPayload, { merge: true });
    }

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
      limit(500)
    );
    const querySnapshot = await getDocs(q);
    const bestByPlayer = new Map<string, any>();
    
    querySnapshot.forEach((scoreDoc) => {
      const data = scoreDoc.data();
      const username = cleanUsername(String(data.username || ""));
      const score = cleanScore(Number(data.score));
      const accuracy = cleanAccuracy(Number(data.accuracy));
      const playerKey =
        typeof data.uid === "string" && data.uid
          ? data.uid
          : username.trim().toLowerCase().replace(/\s+/g, "_");
      const currentBest = bestByPlayer.get(playerKey);

      if (!currentBest || score > currentBest.score) {
        bestByPlayer.set(playerKey, {
          id: scoreDoc.id,
          ...data,
          username,
          score,
          accuracy,
        });
      }
    });
    
    return Array.from(bestByPlayer.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
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
