import { db } from './firebase-init.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const listEl = document.getElementById('scholarshipsList');
const filterForm = document.getElementById('filterForm');

async function loadScholarships() {
  listEl.innerHTML = '';
  const snap = await getDocs(collection(db, 'scholarships'));
  const scholarships = [];
  snap.forEach((doc) => scholarships.push({ id: doc.id, ...doc.data() }));
  applyFilters(scholarships);
}

function applyFilters(scholarships) {
  const locVal = document.getElementById('filterLocation').value.trim().toLowerCase();
  const degreeVal = document.getElementById('filterDegree').value;
  const gpaVal = parseFloat(document.getElementById('filterGpa').value);
  let results = scholarships;
  if (locVal) {
    results = results.filter((s) => s.location && s.location.toLowerCase().includes(locVal));
  }
  if (degreeVal) {
    results = results.filter((s) => s.degreeLevel === degreeVal);
  }
  if (!isNaN(gpaVal)) {
    results = results.filter((s) => s.gpaRequirement == null || parseFloat(s.gpaRequirement) <= gpaVal);
  }
  renderScholarships(results);
}

function renderScholarships(list) {
  listEl.innerHTML = '';
  list.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    const deadlineDate = s.deadline?.seconds ? new Date(s.deadline.seconds * 1000) : null;
    card.innerHTML = `<div class="card h-100">` +
      `<div class="card-body">` +
      `<h5 class="card-title">${s.title}</h5>` +
      `<p class="card-text">${s.degreeLevel} — ${s.location}</p>` +
      `<p class="card-text">${s.description || ''}</p>` +
      `<p class="card-text"><small class="text-muted">Deadline: ${deadlineDate ? deadlineDate.toLocaleDateString() : 'N/A'}</small></p>` +
      `</div>` +
      `</div>`;
    listEl.appendChild(card);
  });
}

filterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadScholarships();
});

loadScholarships();