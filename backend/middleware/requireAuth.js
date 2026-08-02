import { initFirebaseAdmin } from "../services/firebaseAdmin.js";

/**
 * Verifies the Firebase ID token sent by the frontend and attaches
 * the decoded user (uid, email, etc.) to req.user.
 *
 * Frontend must send: Authorization: Bearer <idToken>
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization bearer token." });
  }

  try {
    const admin = initFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
  }
}

/**
 * Optional variant — attaches req.user if a valid token is present,
 * but does not block the request otherwise. Used for endpoints that
 * behave differently for logged-in vs anonymous users.
 */
export async function attachUserIfPresent(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const admin = initFirebaseAdmin();
    req.user = await admin.auth().verifyIdToken(token);
  } catch {
    // ignore — treated as anonymous
  }
  next();
}

/**
 * Simple role gate for the admin panel. Expects a custom claim
 * `admin: true` set on the Firebase user (set this via a secure
 * one-off script using firebase-admin, never from the client).
 */
export function requireAdmin(req, res, next) {
  if (!req.user?.admin) {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}
