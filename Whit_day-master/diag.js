// Paste this ENTIRE block into Edge DevTools Console on any service page
// It will show exactly what images are being assigned to each card

(async () => {
  const typeId = window.__diagTypeId || 1; // change number to match current page
  const res = await fetch('http://192.168.1.2:3000/api/rest/services?typeId=' + typeId);
  const json = await res.json();
  
  console.log('API status:', res.status, '| rows:', json.data?.length);
  console.log('IMAGE_POOLS defined?', typeof IMAGE_POOLS !== 'undefined');
  
  if (typeof IMAGE_POOLS !== 'undefined') {
    const pool = IMAGE_POOLS[typeId];
    console.log('Pool for type', typeId, ':', pool);
    json.data?.forEach((s, idx) => {
      const img = pool[idx % pool.length];
      console.log('Card', idx, '|', s.s_name, '→', img);
    });
  }
})();
