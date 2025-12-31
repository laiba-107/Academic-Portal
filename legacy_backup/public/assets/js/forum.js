import { auth, db } from './firebase-init.js';
import {
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const threadsContainer = document.getElementById('threadsContainer');
const newThreadSection = document.getElementById('newThreadSection');
const newThreadForm = document.getElementById('newThreadForm');
const loginLink = document.getElementById('loginLink');
const signupLink = document.getElementById('signupLink');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    if (logoutBtn) logoutBtn.classList.remove('d-none');
    if (loginLink) loginLink.classList.add('d-none');
    if (signupLink) signupLink.classList.add('d-none');
    if (newThreadSection) newThreadSection.classList.remove('d-none');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await auth.signOut();
        window.location.href = 'index.html';
      });
    }
  } else {
    if (newThreadSection) newThreadSection.classList.add('d-none');
    if (logoutBtn) logoutBtn.classList.add('d-none');
    if (loginLink) loginLink.classList.remove('d-none');
    if (signupLink) signupLink.classList.remove('d-none');
  }
});

// Listen for threads in real time
const threadsQuery = query(collection(db, 'discussions'), orderBy('timestamp', 'desc'));
onSnapshot(threadsQuery, (snapshot) => {
  threadsContainer.innerHTML = '';
  snapshot.forEach((docSnap, index) => {
    const data = docSnap.data();
    const threadId = docSnap.id;
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    accordionItem.innerHTML = `<h2 class="accordion-header" id="heading${threadId}">` +
      `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${threadId}" aria-expanded="false" aria-controls="collapse${threadId}">` +
      `${data.title}` +
      `</button>` +
      `</h2>` +
      `<div id="collapse${threadId}" class="accordion-collapse collapse" aria-labelledby="heading${threadId}" data-bs-parent="#threadsContainer">` +
      `<div class="accordion-body">` +
      `<p>${data.content.replace(/\n/g, '<br/>')}</p>` +
      `<p><small class="text-muted">Tags: ${data.tags ? data.tags.join(', ') : 'none'}</small></p>` +
      `<div class="replies mb-2" id="replies-${threadId}"></div>` +
      `<form class="replyForm" data-thread-id="${threadId}">` +
      `<div class="input-group mb-2">` +
      `<input type="text" class="form-control" placeholder="Your reply" required />` +
      `<button class="btn btn-outline-secondary" type="submit">Reply</button>` +
      `</div>` +
      `</form>` +
      `</div>` +
      `</div>`;
    threadsContainer.appendChild(accordionItem);
    // Load replies when collapsed element is shown
    const collapseEl = accordionItem.querySelector(`#collapse${threadId}`);
    collapseEl.addEventListener('show.bs.collapse', async () => {
      loadReplies(threadId);
    });
    // Handle reply submission
    const replyForm = accordionItem.querySelector('.replyForm');
    replyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) {
        alert('Please log in to reply.');
        return;
      }
      const input = replyForm.querySelector('input');
      const content = input.value.trim();
      if (content === '') return;
      await addDoc(collection(db, 'discussions', threadId, 'replies'), {
        uid: currentUser.uid,
        content,
        timestamp: serverTimestamp(),
      });
      input.value = '';
      loadReplies(threadId);
    });
  });
});

async function loadReplies(threadId) {
  const repliesDiv = document.getElementById(`replies-${threadId}`);
  repliesDiv.innerHTML = '<div class="text-muted">Loading replies…</div>';
  const repliesSnap = await getDocs(query(collection(db, 'discussions', threadId, 'replies'), orderBy('timestamp', 'asc')));
  repliesDiv.innerHTML = '';
  if (repliesSnap.empty) {
    repliesDiv.innerHTML = '<div class="text-muted">No replies yet.</div>';
  } else {
    repliesSnap.forEach((replyDoc) => {
      const reply = replyDoc.data();
      const p = document.createElement('p');
      p.innerHTML = `<strong>${reply.uid}</strong>: ${reply.content}`;
      repliesDiv.appendChild(p);
    });
  }
}

// Handle new thread creation
if (newThreadForm) {
  newThreadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to post.');
      return;
    }
    const title = document.getElementById('threadTitle').value.trim();
    const content = document.getElementById('threadContent').value.trim();
    const tagsString = document.getElementById('threadTags').value.trim();
    if (!title || !content) return;
    const tags = tagsString ? tagsString.split(',').map((t) => t.trim()).filter((t) => t.length > 0) : [];
    await addDoc(collection(db, 'discussions'), {
      title,
      content,
      tags,
      uid: currentUser.uid,
      timestamp: serverTimestamp(),
    });
    // Reset form
    newThreadForm.reset();
  });
}