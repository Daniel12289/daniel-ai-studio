import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { initFirebaseAdmin } from "../services/firebaseAdmin.js";

const router = Router();
router.use(requireAuth, requireAdmin);

/** GET /api/admin/users — list all registered users (paged, 1000 max/page). */
router.get("/users", async (req, res) => {
  try {
    const admin = initFirebaseAdmin();
    const pageToken = req.query.pageToken || undefined;
    const result = await admin.auth().listUsers(1000, pageToken);
    res.json({
      users: result.users.map((u) => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName || null,
        disabled: u.disabled,
        createdAt: u.metadata.creationTime,
        lastSignIn: u.metadata.lastSignInTime,
      })),
      nextPageToken: result.pageToken || null,
    });
  } catch (err) {
    console.error("[admin/users]", err.message);
    res.status(500).json({ error: "Could not load users." });
  }
});

/** POST /api/admin/users/:uid/suspend — disable/enable a user account. */
router.post("/users/:uid/suspend", async (req, res) => {
  try {
    const admin = initFirebaseAdmin();
    const disabled = req.body.disabled !== false; // default true (suspend)
    await admin.auth().updateUser(req.params.uid, { disabled });
    res.json({ uid: req.params.uid, disabled });
  } catch (err) {
    console.error("[admin/suspend]", err.message);
    res.status(500).json({ error: "Could not update user." });
  }
});

/** GET /api/admin/projects — list all projects across all users. */
router.get("/projects", async (req, res) => {
  try {
    const admin = initFirebaseAdmin();
    const snap = await admin.firestore().collectionGroup("projects").limit(500).get();
    const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ projects });
  } catch (err) {
    console.error("[admin/projects]", err.message);
    res.status(500).json({ error: "Could not load projects." });
  }
});

/** DELETE /api/admin/projects/:ownerUid/:projectId */
router.delete("/projects/:ownerUid/:projectId", async (req, res) => {
  try {
    const admin = initFirebaseAdmin();
    const { ownerUid, projectId } = req.params;
    await admin
      .firestore()
      .collection("users")
      .doc(ownerUid)
      .collection("projects")
      .doc(projectId)
      .delete();
    res.json({ deleted: true });
  } catch (err) {
    console.error("[admin/deleteProject]", err.message);
    res.status(500).json({ error: "Could not delete project." });
  }
});

/**
 * GET /api/admin/stats — basic usage stats.
 * NOTE: this is intentionally lightweight (counts only). A production
 * version should aggregate this in a scheduled job rather than counting
 * on every request once user/project counts grow large.
 */
router.get("/stats", async (req, res) => {
  try {
    const admin = initFirebaseAdmin();
    const [usersResult, projectsSnap] = await Promise.all([
      admin.auth().listUsers(1000),
      admin.firestore().collectionGroup("projects").limit(1000).get(),
    ]);
    res.json({
      totalUsers: usersResult.users.length,
      disabledUsers: usersResult.users.filter((u) => u.disabled).length,
      totalProjects: projectsSnap.size,
    });
  } catch (err) {
    console.error("[admin/stats]", err.message);
    res.status(500).json({ error: "Could not load stats." });
  }
});

export default router;
