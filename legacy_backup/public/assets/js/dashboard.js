// Dashboard logic for user, mentor and admin pages, and mentor application form
import { auth, db } from './firebase-init.js';
import { apiFetch } from './api.js';
import {
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collectionGroup,
  Timestamp,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Utility to get URL basename
function currentPage() {
  return window.location.pathname.split('/').pop();
}

// Common: handle auth state and load appropriate dashboard or protect pages
onAuthStateChanged(auth, async (user) => {
  const page = currentPage();
  if (!user) {
    // Unauthenticated: redirect if on protected pages
    const protectedPages = ['user.html', 'mentor.html', 'admin.html', 'apply-mentor.html'];
    if (protectedPages.includes(page)) {
      window.location.href = 'login.html';
    }
    return;
  }
  // If on apply-mentor page
  if (page === 'apply-mentor.html') {
    initMentorApplicationPage(user);
  } else if (page === 'user.html') {
    initUserDashboard(user);
  } else if (page === 'mentor.html') {
    initMentorDashboard(user);
  }
});

// Initialize mentor application form
async function initMentorApplicationPage(user) {
  const form = document.getElementById('mentorForm');
  const infoMsg = document.getElementById('infoMsg');
  const errorMsg = document.getElementById('errorMsg');
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.classList.remove('d-none');
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
  // Check if an application already exists
  const existingApp = await getDoc(doc(db, 'mentorApplications', user.uid));
  if (existingApp.exists() && existingApp.data().status !== 'rejected') {
    infoMsg.textContent = `You have already submitted an application. Current status: ${existingApp.data().status}.`;
    infoMsg.classList.remove('d-none');
    form.classList.add('d-none');
    return;
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('d-none');
    infoMsg.classList.add('d-none');
    const fullName = document.getElementById('fullName').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const additionalInfo = document.getElementById('additionalInfo').value.trim();
    try {
      // Use API to submit application
      await apiFetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          experience,
          additionalInfo,
        }),
      });

      infoMsg.textContent = 'Application submitted successfully! You will be notified via email when a decision has been made.';
      infoMsg.classList.remove('d-none');
      form.classList.add('d-none');
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('d-none');
    }
  });
}

// Initialize user dashboard
async function initUserDashboard(user) {
  // Show profile
  const profileDiv = document.getElementById('profile');
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const data = userDoc.data();
  profileDiv.innerHTML = `<div class="card p-3"><h5>Profile</h5>` +
    `<p><strong>Email:</strong> ${data.email}</p>` +
    `<p><strong>Nickname:</strong> ${data.nickname}</p>` +
    `<p><strong>Role:</strong> ${data.role}</p></div>`;
  // Show apply mentor button only if not mentor or admin
  if (data.role !== 'mentor' && data.role !== 'admin') {
    document.getElementById('applyMentorBtn').classList.remove('d-none');
  }
  // Load user's threads
  const threadsUl = document.getElementById('userThreads');
  const q = query(collection(db, 'discussions'), where('uid', '==', user.uid));
  const snap = await getDocs(q);
  snap.forEach((docSnap) => {
    const t = docSnap.data();
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = t.title;
    threadsUl.appendChild(li);
  });
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
}

// Initialize mentor dashboard
async function initMentorDashboard(user) {
  // Stats: count answered questions
  const statsDiv = document.getElementById('mentorStats');
  // Query replies posted by this mentor
  const repliesQuery = query(collectionGroup(db, 'replies'), where('uid', '==', user.uid));
  const repliesSnap = await getDocs(repliesQuery);
  const answeredCount = repliesSnap.size;
  statsDiv.innerHTML = `<div class="card p-3"><h5>Mentor Stats</h5>` +
    `<p><strong>Questions answered:</strong> ${answeredCount}</p></div>`;
  // Unanswered threads: threads with 0 replies
  const unansweredUl = document.getElementById('unansweredThreads');
  const threadsSnap = await getDocs(collection(db, 'discussions'));
  for (const docSnap of threadsSnap.docs) {
    const repliesColl = collection(db, 'discussions', docSnap.id, 'replies');
    const replies = await getDocs(repliesColl);
    if (replies.size === 0) {
      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action';
      li.textContent = docSnap.data().title;
      li.addEventListener('click', () => {
        window.location.href = 'forum.html#' + docSnap.id;
      });
      unansweredUl.appendChild(li);
    }
  }
  // Answered threads: threads where this mentor has replied
  const answeredUl = document.getElementById('answeredThreads');
  for (const reply of repliesSnap.docs) {
    const threadId = reply.ref.parent.parent.id;
    const threadSnap = await getDoc(doc(db, 'discussions', threadId));
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.textContent = threadSnap.data().title;
    li.addEventListener('click', () => {
      window.location.href = 'forum.html#' + threadId;
    });
    answeredUl.appendChild(li);
  }
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
}