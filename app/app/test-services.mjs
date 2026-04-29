// Check service types and find catering/emergency bag IDs
fetch("http://localhost:3000/api/rest/service-types")
  .then(r => r.json())
  .then(j => { console.log("Service Types:"); j.data.forEach(t => console.log(t.t_id, t.t_name)); })
  .catch(e => console.error(e));

setTimeout(() => {
  fetch("http://localhost:3000/api/rest/services")
    .then(r => r.json())
    .then(j => {
      console.log("\nAll services (id | name | typeId | price):");
      j.data.forEach(s => console.log(s.service_id, '|', s.s_name, '| t_id:', s.t_id, '| price:', s.price));
    })
    .catch(e => console.error(e));
}, 500);
