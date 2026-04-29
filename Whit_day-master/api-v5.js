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

// Image pools per service type (t_id) — only confirmed real images
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
          <button class="card-book-btn">Book now</button>
        </div>
      </div>
    </div>`;
}

/**
 * Fetch services from the REST API and render cards.
 * Images cycle through the per-category pool so every card is different.
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

    container.innerHTML = json.data.map((s, idx) => {
      const imgFile = pool[idx % pool.length];
      const imgSrc  = `../img/${imgFile}`;
      return buildCard(s, imgSrc);
    }).join('');

  } catch (err) {
    console.error('[loadServices] error:', err);
    container.innerHTML = `<p class="text-center col-span-full py-8 text-red-500">Error: ${err.message}</p>`;
  }
}
