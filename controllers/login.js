require("dotenv").config();
const crypto = require("crypto");

// --- Base64URL helpers ---
const base64urlEncode = (obj) => {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const base64urlDecode = (str) => {
  // Restore padding (Base64 requires length to be a multiple of 4)
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);

  return JSON.parse(
    Buffer.from(
      padded.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8"),
  );
};

// --- JWT sign & verify ---
const signJWT = (payload, secret) => {
  const encodedHeader = base64urlEncode({ alg: "HS256", typ: "JWT" });
  const encodedPayload = base64urlEncode({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  });

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret) // 1. Create HMAC using SHA-256 with your JWT_SECRET
    .update(unsignedToken) // 2. Feed the data to sign: "encodedHeader.encodedPayload"
    .digest("base64") // 3. Finalize and output as Base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_") // 4. Convert to Base64URL
    .replace(/=/g, "");

  return `${unsignedToken}.${signature}`;
};

const verifyJWT = (token, secret) => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token structure");

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Recreate signature and compare
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // Timing-safe comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid signature");
  }

  const payload = base64urlDecode(encodedPayload);

  // Check expiration
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error("Token expired");
  }

  // TODO: check after expiration case with OAuth (with short expiration time - or refresh in the background for users to prevent being logged out too often, automatic refresh handling expiring tokens)

  return payload;
};

// --- Route handlers ---
const loginPage = (req, res) => {
  const { username, password } = req.body;

  // check if username & password are not empty
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Username and password are required" }));
    return;
  }

  const token = signJWT({ username }, process.env.JWT_SECRET);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ msg: "Login successful", token }));
};

const dashboardPage = (req, res) => {
  const authenticator = req.headers.authorization;

  // authentication: Bearer <token>
  if (!authenticator || !authenticator.startsWith("Bearer ")) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ msg: "Unauthorized: No token provided" }));
    return;
  }

  const token = authenticator.split(" ")[1];

  try {
    const decoded = verifyJWT(token, process.env.JWT_SECRET);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ msg: `Welcome to the dashboard, ${decoded.username}` }),
    );
  } catch (error) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ msg: `Unauthorized: ${error.message}` }));
  }
};

module.exports = { loginPage, dashboardPage };
