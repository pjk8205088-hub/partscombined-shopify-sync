import { spawn } from "node:child_process";

const env = {
  ...process.env,
  PORT: "8789",
  PAYVERSE_ENV: "test",
  PAYVERSE_MID: "TESTMID",
  PAYVERSE_CLIENT_KEY: "TESTCLIENTKEY",
  PAYVERSE_SECRET_KEY: "local-only-secret",
  PAYVERSE_RETURN_URL: "https://example.test/payverse/return",
  PAYVERSE_WEBHOOK_URL: "https://example.test/payverse/webhook",
  ALLOWED_ORIGIN: "https://partscombined.com",
};

const child = spawn(process.execPath, ["server.mjs"], {
  cwd: new URL(".", import.meta.url),
  env,
  stdio: ["ignore", "pipe", "pipe"],
});

try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 1000);
    child.once("error", reject);
    child.stdout.on("data", (chunk) => {
      if (String(chunk).includes("listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
  });

  const health = await fetch("http://127.0.0.1:8789/health");
  if (!health.ok) throw new Error(`health failed: ${health.status}`);

  const request = await fetch("http://127.0.0.1:8789/api/payverse/request", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productName: "Smoke Test Product", amount: "100", currency: "USD" }),
  });
  const payload = await request.json();
  if (!request.ok || !payload.orderId || !payload.sign || payload.requestAmount !== "100") {
    throw new Error(`payment request failed: ${JSON.stringify(payload)}`);
  }
  console.log("PayVerse local smoke test passed");
} finally {
  child.kill();
}
