// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1qcsH2H9RbZP7faD9lnGcSOG4lE6QWYA",
  authDomain: "inventory-49760.firebaseapp.com",
  projectId: "inventory-49760",
  storageBucket: "inventory-49760.firebasestorage.app",
  messagingSenderId: "166770111079",
  appId: "1:166770111079:web:4b8eab981057f5f6291ac2",
  measurementId: "G-497KS4N0K3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence
await setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error("Persistence error:", error);
});

export default app;
