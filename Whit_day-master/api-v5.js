/**
 * White Day — shared API helper
 * All fetch calls from the Vanilla JS frontend go through this file.
 *
 * SAFE FILE SIZES (confirmed real images, not placeholders):
 *   - left.jpeg  = 35349 bytes  → PLACEHOLDER, skip any file with this size
 *   - right.jpeg = 70199 bytes  → PLACEHOLDER, skip any file with this size
 *   - d65(4).jpeg= 70227 bytes  → PLACEHOLDER (logo), skip
 */
const API_BASE = 'http://192.168.1.2:3000/api/rest';

// ── Auth helpers ────────────────────────────────────────────────────────────

function getToken() { return localStorage.getItem('token') || ''; }
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

// ── Image pools per service type (t_id) — only confirmed real images ────────

const IMAGE_POOLS = {
  // Wedding Halls — hull series all confirmed real
  1: [
    'hull-1.jpg',   // 229591
    'hull-2.jpg',   // 76800
    'hull-3.jpg',   // 99473
    'hull-4.jpg',   // 263519
    'hull-5.jpg',   // 108313
    'hull-6.jpg',   // 500229
    'hull-7.jpg',   // 111635
    'hull-8.jpg',   // 159248
  ],

  // Wedding Dresses — d56 & d65 series, skipping bad files
  // BAD: d56(2)=35349, d56(3)=70199, d65(2)=35349, d65(4)=70227
  2: [
    'd56 (4).jpeg',  // 79048  ✓
    'd56 (5).jpeg',  // 244628 ✓
    'd56 (6).jpeg',  // 140412 ✓
    'd56 (1).jpeg',  // 126992 ✓
    'd65 (5).jpeg',  // 72538  ✓
    'd65 (6).jpeg',  // 228415 ✓
    'd65 (1).jpeg',  // 67703  ✓
    'd65 (7).jpeg',  // 77957  ✓  (replaces bad d65(4))
    'kj12 (1).jpeg', // 110517 ✓
    'kj12 (4).jpeg', // 95078  ✓
    'kj12 (5).jpeg', // 73980  ✓
  ],

  // Suit Store — su12 series, skipping bad files
  // BAD: su12(5)=35349, su12(6)=70199
  3: [
    'su12 (1).jpeg', // 33204 ✓
    'su12 (2).jpeg', // 44189 ✓
    'su12 (3).jpeg', // 32086 ✓
    'su12 (4).jpeg', // 51237 ✓
  ],

  // Makeup Artists — ma12 & ma56 series, skipping bad files
  // BAD: ma12(1)=35349, ma12(2)=70199, ma56(3)=35349, ma56(4)=70199
  4: [
    'ma56 (1).jpeg', // 161458 ✓
    'ma56 (2).jpeg', // 131306 ✓
    'ma56 (5).jpeg', // 93237  ✓
    'ma12 (3).jpeg', // 72093  ✓
    'ma12 (4).jpeg', // 58230  ✓
    'ma12 (5).jpeg', // 90589  ✓
  ],

  // Photographers — ph & md78 series, skipping bad files
  // BAD: md78(2)=35349, md78(3)=70199
  5: [
    'ph_1.jpeg',     // 112904 ✓
    'ph_2.jpeg',     // 148993 ✓
    'ph_3.jpeg',     // 86180  ✓
    'md78 (1).jpeg', // 129540 ✓
    'md78 (4).jpeg', // 169171 ✓
    'md78 (5).jpeg', // 105004 ✓
  ],

  // Catering
  6: [
    'Catering1.jpg', // 101681 ✓
    'Catering2.jpg', // 150392 ✓
  ],

  // Cars — var99 series, skipping bad files
  // BAD: var99(4)=35349, var99(5)=70199
  7: [
    'var99 (1).jpeg', // 209303 ✓
    'var99 (2).jpeg', // 364653 ✓
    'var99 (3).jpeg', // 309741 ✓
  ],

  // Artists & Singers — ar series, all confirmed real
  8: [
    'ar_1.jpeg', // 164266 ✓
    'ar_2.jpeg', // 31407  ✓
    'ar_3.jpeg', // 65255  ✓
    'ar_4.jpeg', // 79435  ✓
  ],

  // Emergency Bag
  9: [
    'Emergency_Bag1.jpg', // 107027 ✓
    'Emergency_Bag2.jpg', // 90627  ✓
    'Emergency_Bag3.jpg', // 80193  ✓
  ],

  // Bridesmaid
  10: [
    'Bridesmaid1.jpg', // 132672 ✓
    'Bridesmaid2.jpg', // 152739 ✓
    'Bridesmaid3.jpg', // 70358  ✓
  ],

  // Extra Services / Spa
  11: [
    'ExtraService1.jpg', // 43925  ✓
    'ExtraService2.jpg', // 131692 ✓
  ],

  // Barber Shop — br33 series, skipping bad file
  // BAD: br33(4)=70199
  12: [
    'br33 (1).jpeg', // 355001 ✓
    'br33 (2).jpeg', // 296268 ✓
    'br33 (3).jpeg', // 306948 ✓
  ],
};

// ── Filter / sort state ───────────────────────────────────────────────────────

/** Raw services returned by the API — kept for re-sorting without a new fetch */
let _servicesCache    = [];
let _currentPool      = [];
let _currentContainerId = '';

// ── UI helpers ───────────────────────────────────────────────────────────────

/** Build star HTML (Font Awesome) */
function buildStars(rating) {
  return Array.from({ length: 5 }).map((_, i) =>
    `<i class="${i < Math.floor(rating) ? 'fas' : 'far'} fa-star"></i>`
  ).join('');
}

/** Build a single service card */
function buildCard(s, imgSrc) {
  return `
    <div class="card-container border border-gray-200">
      <img src="${imgSrc}" class="w-full h-[350px] md:h-[450px] object-cover" alt="${s.s_name}">
      <div class="card-bottom">
        <div>
          <h3 class="card-title">${s.s_name}</h3>
          <div class="text-[#fff200] text-[25px] mt-2 tracking-widest">${buildStars(s.avg_rating)}</div>
        </div>
        <div class="text-right">
          <p class="card-price">${Number(s.price).toLocaleString()} L.E</p>
          <button
            class="card-book-btn"
            data-service-id="${s.service_id}"
            data-service-name="${s.s_name}"
            data-service-price="${s.price}"
            onclick="openBookingModal(this)"
          >Book now</button>
        </div>
      </div>
    </div>`;
}

/**
 * Render a list of services into the grid.
 * Uses service_id % pool.length for a STABLE image↔name mapping that
 * survives re-sorting (avoids names appearing under the wrong photo).
 */
function renderServices(data, pool, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = data.map((s) => {
    const imgFile = pool[s.service_id % pool.length];
    const imgSrc  = `../img/${imgFile}`;
    return buildCard(s, imgSrc);
  }).join('');
}

/**
 * Wire up the three filter buttons (Prices / Location / Ratings).
 * Each click cycles: off → ascending → descending → off.
 * Only one sort is active at a time; the others reset.
 */
function wireFilters() {
  const buttons = Array.from(document.querySelectorAll('.filter-box'));
  if (buttons.length < 3) return;

  // Sort modes per button: 0=off, 1=asc, 2=desc
  const state = [0, 0, 0];

  const ICON_MAP = {
    0: 'fa-sort',
    1: 'fa-sort-up',
    2: 'fa-sort-down',
  };

  const LABEL = ['Prices', 'Location', 'Ratings'];

  function applyBtnState(btn, i) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = `fas ${ICON_MAP[state[i]]}`;
    }
    // Highlight active sort button
    btn.style.fontWeight = state[i] !== 0 ? '700' : '';
  }

  function sortData(idx) {
    let data = [..._servicesCache];
    if (state[idx] === 0) {
      // No sort — restore original order (by avg_rating desc as returned by API)
      return data;
    }
    const asc = state[idx] === 1;
    if (idx === 0) {
      // Prices
      data.sort((a, b) => asc ? a.price - b.price : b.price - a.price);
    } else if (idx === 1) {
      // Location (city)
      data.sort((a, b) => {
        const ca = (a.city || '').toLowerCase();
        const cb = (b.city || '').toLowerCase();
        return asc ? ca.localeCompare(cb) : cb.localeCompare(ca);
      });
    } else {
      // Ratings
      data.sort((a, b) => asc ? a.avg_rating - b.avg_rating : b.avg_rating - a.avg_rating);
    }
    return data;
  }

  buttons.forEach((btn, i) => {
    // Remove any stale listeners by replacing the button node
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    buttons[i] = clone;

    clone.addEventListener('click', () => {
      // Cycle state for this button
      state[i] = (state[i] + 1) % 3;
      // Reset all other buttons
      state.forEach((_, j) => {
        if (j !== i) { state[j] = 0; applyBtnState(buttons[j], j); }
      });
      applyBtnState(clone, i);
      renderServices(sortData(i), _currentPool, _currentContainerId);
    });

    // Reset icon label in case the pool is loaded again
    clone.innerHTML = `${LABEL[i]} <i class="fas ${ICON_MAP[state[i]]}"></i>`;
  });
}

/**
 * Fetch services from the REST API and render cards.
 * Images use service_id % pool.length for a stable name↔image pairing.
 */
async function loadServices(containerId, typeId, fallbackImg) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p class="text-center col-span-full py-8 opacity-60">Loading...</p>';

  try {
    const res  = await fetch(`${API_BASE}/services?typeId=${typeId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load');
    if (!json.data || !json.data.length) {
      container.innerHTML = '<p class="text-center col-span-full py-8 opacity-60">No services found.</p>';
      return;
    }

    const pool = IMAGE_POOLS[typeId] || [fallbackImg];

    // Cache for re-sorting on filter clicks
    _servicesCache      = json.data;
    _currentPool        = pool;
    _currentContainerId = containerId;

    renderServices(json.data, pool, containerId);

    // Inject shared modals and wire filter buttons
    injectModals();
    wireFilters();

  } catch (err) {
    console.error('[loadServices] error:', err);
    container.innerHTML = `<p class="text-center col-span-full py-8 text-red-500">Error: ${err.message}</p>`;
  }
}

// ── Booking modal ─────────────────────────────────────────────────────────────

let _modalsInjected = false;

function injectModals() {
  if (_modalsInjected) return;
  _modalsInjected = true;

  const html = `
  <!-- Booking Modal -->
  <div id="bookingModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
    <div class="bg-[#F5ECDF] rounded-2xl p-8 w-full max-w-md mx-4 shadow-xl relative font-serif">
      <button onclick="closeBookingModal()" class="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black">&times;</button>
      <h2 class="text-2xl font-bold italic mb-1" id="bookingModalTitle">Book Service</h2>
      <p class="text-gray-600 mb-4" id="bookingModalPrice"></p>
      <label class="block mb-1 font-semibold">Event Date</label>
      <input id="bookingEventDate" type="date" class="custom-input mb-4 w-full">
      <label class="block mb-1 font-semibold">Notes (optional)</label>
      <textarea id="bookingNotes" rows="3" class="custom-input mb-4 w-full resize-none" placeholder="Any special requests..."></textarea>
      <div id="bookingError" class="text-red-600 text-sm mb-2 hidden"></div>
      <button onclick="submitBooking()" class="btn-primary btn-auth w-full">Confirm Booking</button>
    </div>
  </div>

  <!-- Wallet Modal -->
  <div id="walletModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
    <div class="bg-[#F5ECDF] rounded-2xl p-8 w-full max-w-md mx-4 shadow-xl relative font-serif">
      <button onclick="closeWalletModal()" class="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black">&times;</button>
      <h2 class="text-2xl font-bold italic mb-4">My Wallet</h2>
      <p class="mb-4">Balance: <span id="walletBalance" class="font-bold text-green-700">—</span> L.E</p>

      <h3 class="font-semibold mb-1">Top Up</h3>
      <input id="topupAmount" type="number" min="1" class="custom-input mb-3 w-full" placeholder="Amount (L.E)">
      <div id="topupError" class="text-red-600 text-sm mb-2 hidden"></div>
      <button onclick="submitTopup()" class="btn-primary w-full mb-4" style="padding:0.6rem; border-radius:12px;">Add Funds</button>

      <h3 class="font-semibold mb-1">Transaction History</h3>
      <div id="walletHistory" class="text-sm max-h-40 overflow-y-auto space-y-1 bg-white/40 rounded-xl p-3">
        Loading…
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  loadWalletData();
}

// ── Booking modal handlers ───────────────────────────────────────────────────

let _currentServiceId = null;

function openBookingModal(btn) {
  if (!getToken()) {
    alert('Please log in to make a booking.');
    return;
  }
  _currentServiceId = btn.dataset.serviceId;
  document.getElementById('bookingModalTitle').textContent = btn.dataset.serviceName;
  document.getElementById('bookingModalPrice').textContent =
    `Price: ${Number(btn.dataset.servicePrice).toLocaleString()} L.E`;
  document.getElementById('bookingError').classList.add('hidden');
  document.getElementById('bookingEventDate').value = '';
  document.getElementById('bookingNotes').value = '';
  document.getElementById('bookingModal').classList.remove('hidden');
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.add('hidden');
}

async function submitBooking() {
  const eventDate = document.getElementById('bookingEventDate').value;
  const notes     = document.getElementById('bookingNotes').value;
  const errEl     = document.getElementById('bookingError');
  errEl.classList.add('hidden');

  if (!eventDate) {
    errEl.textContent = 'Please select an event date.';
    errEl.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ service_id: Number(_currentServiceId), event_date: eventDate, notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Booking failed');
    closeBookingModal();
    alert(`Booking confirmed! Booking ID: ${json.data.booking_id}`);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
}

// ── Wallet modal handlers ─────────────────────────────────────────────────────

function openWalletModal() {
  if (!getToken()) { alert('Please log in to access your wallet.'); return; }
  document.getElementById('walletModal').classList.remove('hidden');
  loadWalletData();
}

function closeWalletModal() {
  document.getElementById('walletModal').classList.add('hidden');
}

async function loadWalletData() {
  if (!getToken()) return;
  try {
    const [balRes, histRes] = await Promise.all([
      fetch(`${API_BASE}/wallet/balance`, { headers: authHeaders() }),
      fetch(`${API_BASE}/wallet/history`,  { headers: authHeaders() }),
    ]);
    const balJson  = await balRes.json();
    const histJson = await histRes.json();

    const balEl = document.getElementById('walletBalance');
    if (balEl && balJson.data) {
      balEl.textContent = Number(balJson.data.balance).toLocaleString();
    }

    const histEl = document.getElementById('walletHistory');
    if (histEl && histJson.data) {
      if (!histJson.data.length) {
        histEl.textContent = 'No transactions yet.';
      } else {
        histEl.innerHTML = histJson.data.map(t =>
          `<div class="flex justify-between border-b border-gray-200 pb-1">
             <span class="capitalize">${t.payment_method}</span>
             <span class="${t.payment_method === 'topup' ? 'text-green-700' : 'text-red-600'}">
               ${t.payment_method === 'topup' ? '+' : '-'}${Number(t.amount).toLocaleString()} L.E
             </span>
             <span class="text-gray-400">${t.payment_date}</span>
           </div>`
        ).join('');
      }
    }
  } catch (err) {
    console.warn('[wallet] failed to load:', err);
  }
}

async function submitTopup() {
  const amount = Number(document.getElementById('topupAmount').value);
  const errEl  = document.getElementById('topupError');
  errEl.classList.add('hidden');

  if (!amount || amount <= 0) {
    errEl.textContent = 'Enter a valid amount.';
    errEl.classList.remove('hidden');
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/wallet/topup`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Top-up failed');
    document.getElementById('topupAmount').value = '';
    loadWalletData();
    alert(`Wallet topped up by ${amount.toLocaleString()} L.E`);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
}

