// Firebase initialization module
// Replace the configuration object below with your Firebase project's settings.
// You can find these in your Firebase console under Project Settings > General.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// TODO: Fill in your project's Firebase configuration here
const firebaseConfig = {
  apiKey: "AIzaSyDBS6f3JJgM8iURrvAg_y72DfX-Qp4jPk0",
  authDomain: "student-portal-myname.firebaseapp.com",
  projectId: "student-portal-myname",
  storageBucket: "student-portal-myname.firebasestorage.app",
  messagingSenderId: "343811371978",
  appId: "1:343811371978:web:b535c0c486793d89e49533",
  measurementId: "G-091MCJKPWG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Persist auth state across reloads
setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };