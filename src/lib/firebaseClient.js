
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onChildAdded, onValue, remove } from "firebase/database";

// TODO: Replace with your actual Firebase Project Config
// Get this from: Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "YOUR_DATABASE_URL",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Helper functions for common interactions
export const sendReaction = (roomId, type, senderName) => {
    const reactionsRef = ref(db, `rooms/${roomId}/reactions`);
    push(reactionsRef, {
        type: type, // 'heart', 'like', 'laugh', etc.
        sender: senderName,
        timestamp: Date.now()
    });
};

export const toggleRaiseHand = (roomId, userId, userName, isRaising) => {
    const handRef = ref(db, `rooms/${roomId}/hands/${userId}`);
    if (isRaising) {
        set(handRef, {
            name: userName,
            timestamp: Date.now()
        });
    } else {
        remove(handRef);
    }
};
