import { db } from './firebase-init.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const listEl = document.getElementById('admissionsList');
const filterForm = document.getElementById('filterForm');

async function loadAdmissions() {
  listEl.innerHTML = '';
  const snap = await getDocs(collection(db, 'admissions'));
  const admissions = [];
  snap.forEach((doc) => admissions.push({ id: doc.id, ...doc.data() }));
  applyFilters(admissions);
}

function applyFilters(admissions) {
  const locationVal = document.getElementById('filterLocation').value.trim().toLowerCase();
  const degreeVal = document.getElementById('filterDegree').value;
  const fundingVal = document.getElementById('filterFunding').value;
  let results = admissions;
  if (locationVal) {
    results = results.filter((adm) => adm.location && adm.location.toLowerCase().includes(locationVal));
  }
  if (degreeVal) {
    results = results.filter((adm) => adm.degree === degreeVal);
  }
  if (fundingVal) {
    results = results.filter((adm) => adm.fundingType === fundingVal);
  }
  renderAdmissions(results);
}

function renderAdmissions(list) {
  listEl.innerHTML = '';
  list.forEach((adm) => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    const deadlineDate = adm.deadline?.seconds ? new Date(adm.deadline.seconds * 1000) : null;
    card.innerHTML = `<div class="card h-100">` +
      `<div class="card-body">` +
      `<h5 class="card-title">${adm.university}</h5>` +
      `<p class="card-text">${adm.degree} — ${adm.location}</p>` +
      `<p class="card-text">${adm.description || ''}</p>` +
      `<p class="card-text"><small class="text-muted">Deadline: ${deadlineDate ? deadlineDate.toLocaleDateString() : 'N/A'}</small></p>` +
      `</div>` +
      `</div>`;
    listEl.appendChild(card);
  });
}

filterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadAdmissions();
});

loadAdmissions();