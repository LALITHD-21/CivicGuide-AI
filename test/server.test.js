const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const { spawn } = require("node:child_process");

const TEST_PORT = 39123;

// Helper to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${TEST_PORT}${path}`,
      options,
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

test("Server and API tests", async (t) => {
  let serverProcess;

  // Setup: start the server
  await t.test("Start server", () => {
    return new Promise((resolve, reject) => {
      serverProcess = spawn(process.execPath, ["server/server.js"], {
        env: { ...process.env, PORT: String(TEST_PORT), OPENAI_API_KEY: "", GEMINI_API_KEY: "" }
      });
      
      let started = false;
      serverProcess.stdout.on("data", (data) => {
        if (data.toString().includes("is running") && !started) {
          started = true;
          // Wait a moment for server to fully bind
          setTimeout(resolve, 500);
        }
      });
      
      serverProcess.stderr.on("data", (data) => {
        console.error("Server error output:", data.toString());
      });

      serverProcess.on("error", reject);
      
      // Failsafe timeout
      setTimeout(() => {
        if (!started) reject(new Error("Server start timeout"));
      }, 5000);
    });
  });

  await t.test("GET /api/health should return 200 OK", async () => {
    const res = await makeRequest("/api/health");
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.status, "ok");
  });

  await t.test("Security headers are present", async () => {
    const res = await makeRequest("/api/health");
    assert.ok(res.headers["content-security-policy"], "CSP header missing");
    assert.strictEqual(res.headers["x-content-type-options"], "nosniff");
    assert.strictEqual(res.headers["x-frame-options"], "DENY");
  });

  await t.test("CORS is configured", async () => {
    const res = await makeRequest("/api/health", { method: "OPTIONS" });
    assert.strictEqual(res.statusCode, 204);
    assert.strictEqual(res.headers["access-control-allow-origin"], "*");
  });

  await t.test("POST /api/guide handles valid init", async () => {
    const payload = JSON.stringify({ message: "__init__", context: {} });
    const res = await makeRequest("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
      body: payload
    });
    
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.ok(data.title.includes("starting point"));
    assert.ok(data.steps.length > 0);
  });

  await t.test("POST /api/guide rejects invalid JSON", async () => {
    const payload = "{ invalid json }";
    const res = await makeRequest("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
      body: payload
    });
    
    assert.strictEqual(res.statusCode, 400);
  });

  await t.test("POST /api/guide enforces payload limit", async () => {
    // Generate > 100KB payload
    const bigString = "x".repeat(105000);
    const payload = JSON.stringify({ message: bigString, context: {} });
    
    const res = await makeRequest("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
      body: payload
    });
    
    assert.strictEqual(res.statusCode, 413); // Payload Too Large
  });

  await t.test("Guide logic handles specific profiles", async () => {
    const payload = JSON.stringify({ 
      message: "What do I do?", 
      context: { profile: { location: "India", ageGroup: "under-18", registered: "no" } } 
    });
    
    const res = await makeRequest("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
      body: payload
    });
    
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.ok(data.overview.includes("not be old enough"), "Should identify under-18 profile");
    assert.ok(data.resources.some(r => r.url.includes("eci.gov.in")), "Should return Indian resources");
  });

  await t.test("Rate limiting is enforced", async () => {
    // We configured rate limit to 60 req/min
    // Hit it 61 times fast
    let lastRes;
    const reqs = [];
    for (let i = 0; i < 65; i++) {
      reqs.push(makeRequest("/api/health"));
    }
    
    const results = await Promise.all(reqs);
    const tooMany = results.filter(r => r.statusCode === 429);
    
    // Some requests should hit the 429 limit
    assert.ok(tooMany.length > 0, "Rate limiting did not return 429");
  });

  // Cleanup: kill the server
  await t.test("Teardown", () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });
});
