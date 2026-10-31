const places = [
  { id: 1, name: 'Swapnopuri Dreamland', district: 'Dinajpur', experience: 'Adventure + rides', icon: '🎡', desc: 'Dinajpur’s iconic day-out destination with gardens, rides, lakeside views, and space for everyone', tags: ['Swapnopuri pick', 'Scenic', 'Food nearby'], filter: ['food'], votes: 0, featured: true },
  { id: 2, name: 'Ramsagar National Park', district: 'Dinajpur', experience: 'Lakeside nature', icon: '🌊', desc: 'A peaceful historic lake surrounded by trees, open lawns, and calm picnic corners', tags: ['Quiet', 'Nature'], filter: ['quiet'], votes: 0 },
  { id: 3, name: 'Kantajew Temple', district: 'Dinajpur', experience: 'Heritage + photos', icon: '🛕', desc: 'Terracotta architecture and a memorable cultural stop near Kantanagar', tags: ['Heritage', 'Scenic'], filter: [], votes: 0 },
  { id: 4, name: 'Nayabad Mosque', district: 'Dinajpur', experience: 'Heritage trail', icon: '🏛️', desc: 'A beautiful historic landmark to pair with a relaxed day around Kantanagar', tags: ['Quiet', 'Heritage'], filter: ['quiet'], votes: 0 },
  { id: 5, name: 'Dinajpur Rajbari', district: 'Dinajpur', experience: 'History + gardens', icon: '🏰', desc: 'Explore local history, architecture, and spacious surroundings close to town', tags: ['Heritage', 'Spacious'], filter: [], votes: 0 },
  { id: 6, name: 'Singra Forest', district: 'Dinajpur', experience: 'Forest escape', icon: '🌳', desc: 'Green trails and fresh air for a slower, nature-filled group afternoon', tags: ['Quiet', 'Nature'], filter: ['quiet'], votes: 0 },
  { id: 7, name: 'Tajhat Palace', district: 'Rangpur', experience: 'Palace + gardens', icon: '🏛️', desc: 'A grand historic palace with lawns, galleries, and a beautiful group-photo backdrop', tags: ['Heritage', 'Spacious'], filter: [], votes: 0 },
  { id: 8, name: 'Nilsagar', district: 'Nilphamari', experience: 'Lake + open sky', icon: '🦢', desc: 'A peaceful waterbody with wide open views for a relaxed division-wide day trip', tags: ['Quiet', 'Scenic'], filter: ['quiet'], votes: 0 },
  { id: 9, name: 'Banglabandha Zero Point', district: 'Panchagarh', experience: 'Borderland adventure', icon: '🧭', desc: 'A memorable northern journey with dramatic landscapes and a once-in-a-lifetime group photo', tags: ['Adventure', 'Scenic'], filter: [], votes: 0 },
  { id: 10, name: 'Teesta Barrage', district: 'Lalmonirhat', experience: 'River views + breeze', icon: '🌅', desc: 'Fresh river air, open views, and a spacious setting for games and snacks', tags: ['Scenic', 'Spacious'], filter: [], votes: 0 }
];

const storage = {
  get(key, fallback = null) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private browsing can block storage */ } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore unavailable storage */ } }
};
function readJson(key, fallback) { try { return JSON.parse(storage.get(key, 'null')) || fallback; } catch { return fallback; } }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function escapeCsv(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }

let myVote = null;
let activeFilter = 'all';
let participants = readJson('picnicParticipants', []);
const legacyParticipant = readJson('picnicParticipant', null);
if (!participants.length && legacyParticipant?.token) participants = [legacyParticipant];
participants.forEach(record => { const place = places.find(item => String(item.id) === String(record.destinationId)); if (place) place.votes += 1; });
if (!participants.length) storage.remove('picnicVote');

const list = document.querySelector('#placeList');
const toast = document.querySelector('#toast');
const totalVotes = document.querySelector('#totalVotes');
const destination = document.querySelector('#destination');
const passResult = document.querySelector('#passResult');
const participantList = document.querySelector('#participantList');
const participantCount = document.querySelector('#participantCount');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function visiblePlaces() {
  const query = document.querySelector('#searchInput').value.toLowerCase().trim();
  return places.filter(place => {
    const matchesFilter = activeFilter === 'all' || place.filter.includes(activeFilter) || place.tags.some(tag => tag.toLowerCase().includes(activeFilter));
    const searchable = `${place.name} ${place.desc} ${place.district} ${place.experience} ${place.tags.join(' ')}`.toLowerCase();
    return matchesFilter && (!query || searchable.includes(query));
  });
}
function render() {
  const maxVotes = Math.max(...places.map(place => place.votes), 1);
  const leader = places.reduce((current, place) => current.votes >= place.votes ? current : place);
  const shown = visiblePlaces();
  list.innerHTML = shown.map(place => `
    <article class="place-card ${place.id === leader.id ? 'leading' : ''} ${myVote === place.id ? 'selected-card' : ''}" data-destination-card="${place.id}">
      ${place.id === leader.id ? '<span class="leading-label">✦ Leading</span>' : ''}
      ${place.featured ? '<span class="pick-label">Swapnopuri pick</span>' : ''}
      <div class="place-head"><span class="place-icon">${place.icon}</span><div><h3 class="place-name">${escapeHtml(place.name)}</h3><p class="place-desc">${escapeHtml(place.desc)}</p></div></div>
      <div class="place-meta"><span>📍 ${escapeHtml(place.district)}</span><span>✦ ${escapeHtml(place.experience)}</span></div>
      <div class="tags">${place.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="vote-row"><button class="vote-btn ${myVote === place.id ? 'voted' : ''}" data-vote="${place.id}" aria-pressed="${myVote === place.id}">${myVote === place.id ? '✓ Voted' : '♡ Vote'}</button><span class="vote-count">${place.votes} vote${place.votes === 1 ? '' : 's'}</span><div class="card-bar"><span style="width:${Math.round(place.votes / maxVotes * 100)}%"></span></div></div>
    </article>`).join('');
  document.querySelector('#noResults').hidden = shown.length > 0;
  totalVotes.textContent = places.reduce((sum, place) => sum + place.votes, 0);
  const participation = Math.min(100, Math.round((5 + (myVote ? 1 : 0)) / 6 * 100));
  document.querySelector('#participation').textContent = `${participation}%`;
  document.querySelector('#participationBar').style.width = `${participation}%`;
  list.querySelectorAll('[data-vote]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); vote(Number(button.dataset.vote)); }));
  list.querySelectorAll('[data-destination-card]').forEach(card => card.addEventListener('click', event => {
    if (!event.target.closest('[data-vote]')) {
      destination.value = card.dataset.destinationCard;
      document.querySelector('#votingPass').scrollIntoView({ behavior: 'smooth' });
      showToast('Destination selected. Complete your voting pass.');
    }
  }));
}
function vote(id) {
  const selected = places.find(place => place.id === id);
  if (!selected) return;
  if (myVote === id) { selected.votes--; myVote = null; storage.remove('picnicVote'); showToast('Vote removed · ভোট বাতিল হয়েছে'); }
  else { if (myVote) places.find(place => place.id === myVote).votes--; selected.votes++; myVote = id; storage.set('picnicVote', id); showToast(`Vote added for ${selected.name}`); }
  render();
}
function renderRoster() {
  participantCount.textContent = participants.length;
  if (!participants.length) {
    participantList.innerHTML = '<tr><td class="empty-roster" colspan="7">No student pass yet · এখনও কোনো পাস জমা হয়নি</td></tr>';
    return;
  }
  participantList.innerHTML = participants.slice().reverse().map(record => `<tr><td class="token-cell">${escapeHtml(record.token)}</td><td>${escapeHtml(record.semester)}</td><td>${escapeHtml(record.shift)}</td><td>${escapeHtml(record.roll)}</td><td>${escapeHtml(record.phone)}</td><td>${escapeHtml(record.destinationName)}</td><td>${new Date(record.createdAt).toLocaleDateString()}</td></tr>`).join('');
}
function triggerCelebration() {
  const confetti = document.querySelector('#confetti');
  confetti.innerHTML = '';
  const colors = ['#ee765c', '#6e6acb', '#35a878', '#ffd38b', '#74d9ff'];
  for (let index = 0; index < 28; index++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty('--drift', `${(Math.random() - .5) * 240}px`);
    piece.style.animationDelay = `${Math.random() * .25}s`;
    confetti.appendChild(piece);
  }
  setTimeout(() => { confetti.innerHTML = ''; }, 1800);
}
function showTicket(record, celebrate = true) {
  passResult.innerHTML = `<span class="result-icon">✓</span><p class="eyebrow">Pass confirmed · পাস নিশ্চিত</p><h3>${escapeHtml(record.token)}</h3><p><strong>${escapeHtml(record.destinationName)}</strong><br>${escapeHtml(record.semester)} · ${escapeHtml(record.shift)} · Roll ${escapeHtml(record.roll)}<br>Ticket saved locally · টিকিট সংরক্ষিত হয়েছে।</p>`;
  passResult.classList.remove('ticket-issued');
  void passResult.offsetWidth;
  passResult.classList.add('ticket-issued');
  if (celebrate) triggerCelebration();
}
function generateToken() { return `DPI-CST-26-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }
function downloadCsv() {
  if (!participants.length) { showToast('No student records to export yet · এখনও কোনো রেকর্ড নেই'); return; }
  const rows = [['Token', 'Semester', 'Shift', 'Roll', 'Phone', 'Destination', 'Submitted']];
  participants.forEach(record => rows.push([record.token, record.semester, record.shift, record.roll, record.phone, record.destinationName, new Date(record.createdAt).toLocaleString()]));
  const csv = `\uFEFF${rows.map(row => row.map(escapeCsv).join(',')).join('\r\n')}`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'dpi-cst-picnic-student-votes.csv';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  showToast('Excel-compatible student list downloaded');
}

places.forEach(place => { const option = document.createElement('option'); option.value = place.id; option.textContent = `${place.name} · ${place.district}`; destination.appendChild(option); });
const savedParticipant = participants[participants.length - 1];
if (savedParticipant) {
  myVote = Number(savedParticipant.destinationId) || null;
  ['semester', 'shift', 'roll', 'phone'].forEach(id => { document.querySelector(`#${id}`).value = savedParticipant[id] || ''; });
  destination.value = savedParticipant.destinationId || '';
  showTicket(savedParticipant, false);
}

document.querySelector('#participantForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) { form.reportValidity(); showToast('Please complete every required field · সব ঘর পূরণ করুন'); return; }
  const selected = places.find(place => String(place.id) === destination.value);
  if (!selected) { showToast('Choose a destination first · গন্তব্য নির্বাচন করুন'); return; }
  const identity = `${document.querySelector('#semester').value}|${document.querySelector('#shift').value}|${document.querySelector('#roll').value.trim()}`;
  const existing = participants.find(record => record.identity === identity);
  const record = { identity, semester: document.querySelector('#semester').value, shift: document.querySelector('#shift').value, roll: document.querySelector('#roll').value.trim(), phone: document.querySelector('#phone').value.trim(), destinationId: selected.id, destinationName: selected.name, token: existing?.token || generateToken(), createdAt: existing?.createdAt || new Date().toISOString() };
  const index = participants.findIndex(item => item.identity === identity);
  if (index >= 0) participants[index] = record; else participants.push(record);
  storage.set('picnicParticipants', JSON.stringify(participants));
  storage.set('picnicParticipant', JSON.stringify(record));
  if (myVote && myVote !== selected.id) places.find(place => place.id === myVote).votes--;
  if (myVote !== selected.id) selected.votes++;
  myVote = selected.id; storage.set('picnicVote', selected.id);
  showTicket(record); renderRoster(); render(); showToast(`Ticket ready for ${selected.name} · ${record.token}`);
});

document.querySelector('#exportCsv').addEventListener('click', downloadCsv);
const themeSelect = document.querySelector('#themeSelect');
const savedTheme = storage.get('picnicTheme', 'liquid');
themeSelect.value = ['liquid', 'neon', 'dawn'].includes(savedTheme) ? savedTheme : 'liquid';
document.documentElement.dataset.theme = themeSelect.value;
themeSelect.addEventListener('change', () => { document.documentElement.dataset.theme = themeSelect.value; storage.set('picnicTheme', themeSelect.value); showToast(`${themeSelect.options[themeSelect.selectedIndex].text} theme selected`); });

document.querySelectorAll('.dept-pill').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.dept-pill').forEach(item => item.classList.remove('active')); button.classList.add('active'); document.querySelector('.community-strip strong').textContent = `${button.textContent} poll`; showToast(`${button.textContent} participation selected`); }));
document.querySelector('#searchInput').addEventListener('input', render);
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.filter').forEach(item => item.classList.remove('active')); button.classList.add('active'); activeFilter = button.dataset.filter; render(); }));
document.querySelector('#jumpToPlaces').addEventListener('click', () => document.querySelector('#votingPass').scrollIntoView({ behavior: 'smooth' }));
const dialog = document.querySelector('#suggestDialog');
document.querySelector('#openSuggest').addEventListener('click', () => dialog.showModal());
document.querySelector('#suggestForm').addEventListener('submit', event => { event.preventDefault(); const name = document.querySelector('#placeName').value.trim(); const reason = document.querySelector('#placeReason').value.trim(); if (!name || !reason) return; places.push({ id: Date.now(), name, district: 'Suggested by CST', experience: 'New idea', icon: '📍', desc: reason, tags: ['New idea'], filter: [], votes: 0 }); dialog.close(); event.target.reset(); render(); showToast(`${name} added to the shortlist`); });
document.querySelector('#liveStatus').textContent = 'Real votes only';
function updateCountdown() { const difference = new Date('2026-11-10T00:00:00+06:00') - new Date(); const target = document.querySelector('#countdown'); if (difference <= 0) { target.textContent = 'Picnic day!'; return; } target.textContent = `${Math.floor(difference / 86400000)}d ${String(Math.floor(difference / 3600000) % 24).padStart(2, '0')}h ${String(Math.floor(difference / 60000) % 60).padStart(2, '0')}m ${String(Math.floor(difference / 1000) % 60).padStart(2, '0')}s`; }
updateCountdown(); setInterval(updateCountdown, 1000); renderRoster(); render();
