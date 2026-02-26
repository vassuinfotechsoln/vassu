/**
 * backend/src/routes/auth.js
 * Email/password auth with file-based persistence
 * Users survive backend restarts — saved to data/users.json
 */

const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../../data/users.json");

// ── Load users from file ───────────────────────────────────────────────────
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    }
  } catch (e) {
    console.error("[Auth] Error loading users:", e.message);
  }
  return {};
}

// ── Save users to file ─────────────────────────────────────────────────────
function saveUsers(users) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("[Auth] Error saving users:", e.message);
  }
}

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "vassu_salt_2026")
    .digest("hex");
}

// ── POST /api/auth/signup ──────────────────────────────────────────────────
router.post("/signup", (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  if (password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });

  const users = loadUsers();
  if (users[email])
    return res.status(409).json({ error: "Email already registered" });

  const id = crypto.randomUUID();
  const user = {
    id,
    name: name || email.split("@")[0],
    email,
    passwordHash: hashPassword(password),
  };
  users[email] = user;
  saveUsers(users);

  console.log(`[Auth] ✅ New user registered: ${email}`);
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const users = loadUsers();
  const user = users[email];

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  console.log(`[Auth] ✅ User logged in: ${email}`);
  res.json({ id: user.id, name: user.name, email: user.email });
});

module.exports = router;
