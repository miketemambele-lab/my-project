import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

// Check Firebase initialization
export function checkFirebaseConnection() {
  try {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }
    if (!db) {
      throw new Error("Firestore not initialized");
    }
    console.log("Firebase services initialized successfully");
    return true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return false;
  }
}

// Check if user is admin
export async function isUserAdmin(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() && userDoc.data().role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Get user role
export async function getUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role : null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Create new user (Admin only)
export async function createNewUser(adminUid, email, password, userName, role = "user") {
  try {
    // Check if requester is admin
    const isAdmin = await isUserAdmin(adminUid);
    if (!isAdmin) {
      throw new Error("Only admins can create new users");
    }

    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Update profile
    await updateProfile(userCredential.user, { displayName: userName });

    // Store user data
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      userName,
      role,
      createdAt: new Date(),
      lastLogin: null,
      isOnline: false,
      totalSales: 0,
      sales: []
    });

    return { success: true, uid, message: "User created successfully" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: error.message };
  }
}

// Sign up user
export async function signUpUser(email, password, userName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await updateProfile(userCredential.user, { displayName: userName });

    // Store user data as regular user
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      userName,
      role: "user",
      createdAt: new Date(),
      lastLogin: new Date(),
      isOnline: true,
      totalSales: 0,
      sales: []
    });

    return { success: true, uid, message: "Account created successfully" };
  } catch (error) {
    console.error("Error signing up:", error);
    return { success: false, message: error.message };
  }
}

// Sign up admin with secret password
export async function signUpAdmin(email, password, userName, secretPassword) {
  try {
    console.log('Starting admin signup process...');

    // Check network connectivity
    if (!navigator.onLine) {
      throw new Error("No internet connection. Please check your network and try again.");
    }

    if (secretPassword !== "invet[]") {
      console.error('Invalid secret password provided');
      throw new Error("Invalid secret password. Please contact system administrator.");
    }

    console.log('Secret password validated, creating user...');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    console.log('User created in Firebase Auth, UID:', uid);

    await updateProfile(userCredential.user, { displayName: userName });
    console.log('User profile updated');

    // Store user data as admin
    const userData = {
      uid,
      email,
      userName,
      role: "admin",
      createdAt: new Date(),
      lastLogin: new Date(),
      isOnline: true,
      totalSales: 0,
      sales: []
    };

    console.log('Storing user data in Firestore:', userData);
    await setDoc(doc(db, "users", uid), userData);

    console.log('Admin account created successfully');
    return { success: true, uid, message: "Admin account created successfully" };
  } catch (error) {
    console.error("Error signing up admin:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    // Handle specific Firebase errors
    let userFriendlyMessage = error.message;

    switch (error.code) {
      case 'auth/email-already-in-use':
        userFriendlyMessage = "This email is already registered. Please use a different email or try logging in.";
        break;
      case 'auth/invalid-email':
        userFriendlyMessage = "Please enter a valid email address.";
        break;
      case 'auth/weak-password':
        userFriendlyMessage = "Password is too weak. Please use at least 6 characters.";
        break;
      case 'auth/network-request-failed':
        userFriendlyMessage = "Network error. Please check your internet connection and try again.";
        break;
      case 'permission-denied':
        userFriendlyMessage = "Permission denied. Please check Firebase security rules.";
        break;
      case 'unavailable':
        userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
        break;
      default:
        userFriendlyMessage = `Registration failed: ${error.message}`;
    }

    return { success: false, message: userFriendlyMessage, code: error.code };
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Update last login
    await setDoc(doc(db, "users", uid), {
      lastLogin: new Date(),
      isOnline: true
    }, { merge: true });

    const role = await getUserRole(uid);
    return { success: true, uid, role, message: "Login successful" };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: error.message };
  }
}

// Logout user
export async function logoutUser(uid) {
  try {
    // Update user status
    await setDoc(doc(db, "users", uid), {
      isOnline: false
    }, { merge: true });

    await signOut(auth);
    return { success: true, message: "Logout successful" };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, message: error.message };
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent. Check your inbox." };
  } catch (error) {
    console.error("Error sending reset email:", error);
    return { success: false, message: error.message };
  }
}

// Monitor auth state
export function monitorAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get online users
export async function getOnlineUsers() {
  try {
    const q = query(collection(db, "users"), where("isOnline", "==", true));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  } catch (error) {
    console.error("Error getting online users:", error);
    return [];
  }
}

// Get all registered users
export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

// Get user by ID
export async function getUserData(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}
