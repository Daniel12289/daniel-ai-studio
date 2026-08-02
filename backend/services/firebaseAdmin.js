import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return admin;

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log("[firebaseAdmin] Initialized successfully.");
  } catch (err) {
    console.error("[firebaseAdmin]", err.message);
  }

  return admin;
}

export default admin;
