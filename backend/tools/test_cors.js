// Quick CORS + auth smoke test
(async () => {
  const origin = "http://localhost:8081";
  const base = "http://localhost:5000/api";
  try {
    const h = await fetch(base + "/health", {
      method: "GET",
      headers: { Origin: origin },
    });
    console.log("/health status", h.status);
    console.log("CORS header:", h.headers.get("access-control-allow-origin"));

    // Try register
    const body = {
      name: "Test User",
      email: `test+${Date.now()}@example.com`,
      password: "Test@1234",
    };
    const r = await fetch(base + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    console.log("/auth/register", r.status, data.success ? "ok" : data.message);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
