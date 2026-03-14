const crypto = require("crypto");

/**
 * verifyWebhook — validates VI webhook signatures.
 *
 * Expects:
 *   - Header: x-vi-signature  (HMAC SHA256 hex)
 *   - Secret: process.env.VI_WEBHOOK_SECRET
 *   - Raw body string on req.rawBody (set by express.json verify hook)
 */
function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = function verifyWebhook(req, res, next) {
  const secret = process.env.VI_WEBHOOK_SECRET;

  if (!secret) {
    console.warn(
      "[VI Webhook] VI_WEBHOOK_SECRET not set. Skipping signature verification (NOT SAFE FOR PRODUCTION).",
    );
    return next();
  }

  const signature = req.header("x-vi-signature");
  if (!signature) {
    console.warn("[VI Webhook] Missing x-vi-signature header");
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  const rawBody =
    typeof req.rawBody === "string"
      ? req.rawBody
      : JSON.stringify(req.body || {});

  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    if (!timingSafeEqual(expected, signature)) {
      console.warn("[VI Webhook] Signature mismatch");
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    return next();
  } catch (err) {
    console.error("[VI Webhook] Signature verification error:", err);
    return res.status(401).json({ error: "Invalid webhook signature" });
  }
};

