import http from "node:http";
import crypto from "node:crypto";

const port = Number(process.env.PORT || 8787);
const required = ["PAYVERSE_MID", "PAYVERSE_CLIENT_KEY", "PAYVERSE_SECRET_KEY"];

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function sign({ mid, orderId, amount, reqDate }) {
  return crypto
    .createHash("sha512")
    .update(`||${env("PAYVERSE_SECRET_KEY")}||${mid}||${orderId}||${amount}||${reqDate}||`)
    .digest("hex");
}

function json(res, status, body) {
  const origin = process.env.ALLOWED_ORIGIN || "https://partscombined.com";
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "vary": "Origin",
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": process.env.ALLOWED_ORIGIN || "https://partscombined.com",
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "POST, OPTIONS",
      });
      return res.end();
    }
    if (req.method === "GET" && req.url === "/health") return json(res, 200, { ok: true });

    if (req.method === "POST" && req.url === "/api/payverse/request") {
      for (const name of required) env(name);
      const body = await readJson(req);
      if (!body.productName || !body.amount || !body.currency) {
        return json(res, 400, { error: "productName, amount, and currency are required" });
      }

      const orderId = `pc_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const reqDate = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
      const mid = env("PAYVERSE_MID");
      const amount = String(body.amount).replace(/\.0+$/, "");

      return json(res, 200, {
        mid,
        clientKey: env("PAYVERSE_CLIENT_KEY"),
        reqDate,
        orderId,
        productName: String(body.productName).slice(0, 100),
        requestCurrency: String(body.currency).slice(0, 3),
        requestAmount: amount,
        returnUrl: env("PAYVERSE_RETURN_URL"),
        webhookUrl: env("PAYVERSE_WEBHOOK_URL"),
        sign: sign({ mid, orderId, amount, reqDate }),
      });
    }

    if (req.method === "POST" && req.url === "/api/payverse/webhook") {
      // TODO: verify the PayVerse webhook signature/status and persist the Shopify order mapping.
      return json(res, 501, { error: "Webhook verification requires PayVerse production specification and Shopify order storage" });
    }

    json(res, 404, { error: "Not found" });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
});

server.listen(port, () => console.log(`PayVerse scaffold listening on ${port}`));
