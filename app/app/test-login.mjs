const body = JSON.stringify({ email: "ahmed.ali@gmail.com", password: "123" });

fetch("http://localhost:3000/api/rest/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body
}).then(async res => {
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}).catch(err => {
  console.error("Error:", err.message);
});
