import { auth, db } from './firebase-init.js';
import {
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  Timestamp,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js';
import { apiFetch } from './api.js';

const analyticsDiv = document.getElementById('analytics');
const applicationsUl = document.getElementById('mentorApplications');
const admissionsList = document.getElementById('admissionsList');
const scholarshipsList = document.getElementById('scholarshipsList');
const threadsList = document.getElementById('allThreads');

// Forms
const admissionForm = document.getElementById('admissionForm');
const scholarshipForm = document.getElementById('scholarshipForm');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  const token = await user.getIdTokenResult();
  if (token.claims.role !== 'admin') {
    // Not admin; redirect to appropriate page
    window.location.href = 'user.html';
    return;
  }
  initAdmin(user);
});

async function initAdmin(user) {
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
  // Load analytics
  await loadAnalytics();
  // Load pending applications
  await loadMentorApplications();
  // Load admissions list
  await loadAdmissions();
  // Load scholarships list
  await loadScholarships();
  // Load threads list
  await loadThreads();
  // Setup forms
  admissionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const university = document.getElementById('admUniversity').value.trim();
    const degree = document.getElementById('admDegree').value.trim();
    const location = document.getElementById('admLocation').value.trim();
    const deadline = document.getElementById('admDeadline').value;
    const description = document.getElementById('admDescription').value.trim();
    const fundingType = document.getElementById('admFunding').value;
    if (!university || !degree) return;
    await addDoc(collection(db, 'admissions'), {
      university,
      degree,
      location,
      deadline: Timestamp.fromDate(new Date(deadline)),
      description,
      fundingType,
      createdAt: Timestamp.now(),
    });
    admissionForm.reset();
    await loadAdmissions();
  });
  scholarshipForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('schTitle').value.trim();
    const degreeLevel = document.getElementById('schDegree').value.trim();
    const location = document.getElementById('schLocation').value.trim();
    const amount = document.getElementById('schAmount').value.trim();
    const gpaRequirement = document.getElementById('schGpa').value.trim();
    const deadline = document.getElementById('schDeadline').value;
    const description = document.getElementById('schDescription').value.trim();
    await addDoc(collection(db, 'scholarships'), {
      title,
      degreeLevel,
      location,
      amount,
      gpaRequirement: gpaRequirement || null,
      deadline: Timestamp.fromDate(new Date(deadline)),
      description,
      createdAt: Timestamp.now(),
    });
    scholarshipForm.reset();
    await loadScholarships();
  });
}

async function loadAnalytics() {
  analyticsDiv.innerHTML = '<p>Loading…</p>';
  try {
    // Use Express API to get analytics
    const data = await apiFetch('/api/analytics');
    const items = [
      { label: 'Total Users', value: data.users },
      { label: 'Mentors', value: data.mentors },
      { label: 'Discussions', value: data.discussions },
      { label: 'Replies', value: data.replies },
    ];
    analyticsDiv.innerHTML = items.map(item => {
      return `<div class="col-md-3"><div class="card text-center p-3"><h4>${item.value}</h4><p class="mb-0">${item.label}</p></div></div>`;
    }).join('');
  } catch (err) {
    analyticsDiv.innerHTML = `<div class="text-danger">${err.message}</div>`;
  }
}

async function loadMentorApplications() {
  applicationsUl.innerHTML = '';
  const q = query(collection(db, 'mentorApplications'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  if (snap.empty) {
    applicationsUl.innerHTML = '<li class="list-group-item">No pending applications.</li>';
    return;
  }
  snap.forEach((docSnap) => {
    const app = docSnap.data();
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `<strong>${app.fullName}</strong><br/>` +
      `<small>Email: ${app.email}</small><br/>` +
      `<small>Experience: ${app.experience}</small><br/>` +
      `<button class="btn btn-sm btn-success me-2" data-action="approve">Approve</button>` +
      `<button class="btn btn-sm btn-danger" data-action="reject">Reject</button>`;
    // Attach click handlers
    li.querySelector('[data-action="approve"]').addEventListener('click', async () => {
      try {
        await apiFetch(`/api/applications/${docSnap.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'approved' })
        });
        await loadMentorApplications();
      } catch (e) { console.error(e); alert(e.message); }
    });
    li.querySelector('[data-action="reject"]').addEventListener('click', async () => {
      try {
        await apiFetch(`/api/applications/${docSnap.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'rejected' })
        });
        await loadMentorApplications();
      } catch (e) { console.error(e); alert(e.message); }
    });
    applicationsUl.appendChild(li);
  });
}

async function loadAdmissions() {
  admissionsList.innerHTML = '';
  const snap = await getDocs(collection(db, 'admissions'));
  snap.forEach((docSnap) => {
    const adm = docSnap.data();
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row';
    const deadlineDate = adm.deadline?.seconds ? new Date(adm.deadline.seconds * 1000).toLocaleDateString() : 'N/A';
    li.innerHTML = `<div class="flex-grow-1"><strong>${adm.university}</strong> – ${adm.degree} – ${adm.location}` +
      `<br/><small>Deadline: ${deadlineDate}</small></div>` +
      `<div class="mt-2 mt-md-0">` +
      `<button class="btn btn-sm btn-danger" data-action="delete">Delete</button>` +
      `</div>`;
    li.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      await deleteDoc(doc(db, 'admissions', docSnap.id));
      await loadAdmissions();
    });
    admissionsList.appendChild(li);
  });
}

async function loadScholarships() {
  scholarshipsList.innerHTML = '';
  const snap = await getDocs(collection(db, 'scholarships'));
  snap.forEach((docSnap) => {
    const s = docSnap.data();
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row';
    const deadlineDate = s.deadline?.seconds ? new Date(s.deadline.seconds * 1000).toLocaleDateString() : 'N/A';
    li.innerHTML = `<div class="flex-grow-1"><strong>${s.title}</strong> – ${s.degreeLevel} – ${s.location}` +
      `<br/><small>Deadline: ${deadlineDate}</small></div>` +
      `<div class="mt-2 mt-md-0">` +
      `<button class="btn btn-sm btn-danger" data-action="delete">Delete</button>` +
      `</div>`;
    li.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      await deleteDoc(doc(db, 'scholarships', docSnap.id));
      await loadScholarships();
    });
    scholarshipsList.appendChild(li);
  });
}

async function loadThreads() {
  threadsList.innerHTML = '';
  const snap = await getDocs(collection(db, 'discussions'));
  if (snap.empty) {
    threadsList.innerHTML = '<li class="list-group-item">No discussions.</li>';
    return;
  }
  snap.forEach((docSnap) => {
    const thread = docSnap.data();
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row';
    li.innerHTML = `<div class="flex-grow-1"><strong>${thread.title}</strong><br/>` +
      `<small>${thread.content.substring(0, 80)}…</small></div>` +
      `<div class="mt-2 mt-md-0">` +
      `<button class="btn btn-sm btn-danger" data-action="delete">Delete</button>` +
      `</div>`;
    li.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      await deleteDoc(doc(db, 'discussions', docSnap.id));
      await loadThreads();
    });
    threadsList.appendChild(li);
  });
}