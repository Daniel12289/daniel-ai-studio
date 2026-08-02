/**
 * One-off script: grants a user the `admin: true` custom claim so they can
 * access the Admin Panel (/admin) and its backend routes.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_JSON='<paste service account json>' \
 *     node scripts/setAdmin.js someone@example.com
 *
 * Never run this from the frontend or expose it as an HTTP endpoint —
 * anyone who could call it could make themselves an admin.
 */
import "dotenv/config";
import { initFirebaseAdmin } from "../services/firebaseAdmin.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/setAdmin.js <email>");
  process.exit(1);
}

const admin = initFirebaseAdmin();
const user = await admin.auth().getUserByEmail(email);
await admin.auth().setCustomUserClaims(user.uid, { admin: true });
console.log(`Granted admin claim to ${email} (${user.uid}).`);
console.log("They must sign out and back in for the claim to take effect.");
