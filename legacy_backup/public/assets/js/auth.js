// Authentication logic for the Student Academic Portal
import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  doc,
  setDoc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Utility: redirect based on role
async function redirectToDashboard(user) {
  if (!user) return;
  const tokenResult = await user.getIdTokenResult();
  const claimsRole = tokenResult.claims.role;
  let role = claimsRole;
  // fallback to Firestore role if custom claim not set
  if (!role) {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      role = snap.data().role;
    }
  }
  if (role === 'admin') {
    window.location.href = 'admin.html';
  } else if (role === 'mentor') {
    window.location.href = 'mentor.html';
  } else {
    window.location.href = 'user.html';
  }
}

// Sign up handler
async function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const nickname = document.getElementById('nickname').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;
  const errorMsg = document.getElementById('errorMsg');
  const infoMsg = document.getElementById('infoMsg');
  errorMsg.classList.add('d-none');
  infoMsg.classList.add('d-none');
  if (password !== confirm) {
    errorMsg.textContent = 'Passwords do not match.';
    errorMsg.classList.remove('d-none');
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: nickname });
    // create user doc in Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      nickname,
      role: 'user',
      createdAt: new Date(),
    });
    await sendEmailVerification(cred.user);
    infoMsg.textContent = 'Registration successful! Please verify your email before logging in.';
    infoMsg.classList.remove('d-none');
    await signOut(auth);
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.classList.remove('d-none');
  }
}

// Login handler
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.classList.add('d-none');
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      await signOut(auth);
      errorMsg.textContent = 'Please verify your email before logging in.';
      errorMsg.classList.remove('d-none');
      return;
    }
    // redirect based on role
    await redirectToDashboard(cred.user);
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.classList.remove('d-none');
  }
}

// Attach event listeners if on login or signup page
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

// Auth state listener to update nav buttons across pages
onAuthStateChanged(auth, (user) => {
  const logoutBtn = document.getElementById('logoutBtn');
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  if (user) {
    // Show logout button, hide login/signup
    if (logoutBtn) logoutBtn.classList.remove('d-none');
    if (loginLink) loginLink.classList.add('d-none');
    if (signupLink) signupLink.classList.add('d-none');
    // Setup logout handler
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
      });
    }
    // If on login or signup page, redirect to dashboard
    const path = window.location.pathname.split('/').pop();
    if (path === 'login.html' || path === 'signup.html') {
      // Wait for custom claims to load then redirect
      redirectToDashboard(user);
    }
  } else {
    // Show login/signup, hide logout
    if (logoutBtn) logoutBtn.classList.add('d-none');
    if (loginLink) loginLink.classList.remove('d-none');
    if (signupLink) signupLink.classList.remove('d-none');
  }
});