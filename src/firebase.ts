import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
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

// --- LEADERBOARD LOGIC ---
export const submitScore = async (scenario: string, username: string, score: number, accuracy: number) => {
  try {
    await addDoc(collection(db, "leaderboards"), {
      scenario,
      username,
      score,
      accuracy,
      timestamp: new Date()
    });
    console.log("EFECT Score uploaded to Global Network.");
  } catch (e) {
    console.error("Error pushing score: ", e);
  }
};

export const fetchTopScores = async (scenario: string) => {
  try {
    const q = query(collection(db, "leaderboards"), orderBy("score", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    const scores: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.scenario === scenario) {
        scores.push({ id: doc.id, ...data });
      }
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