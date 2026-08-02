import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth);

/**
 * POST /api/deploy/vercel
 * Real one-click Vercel deploys require the user to connect their own
 * Vercel account (OAuth) and a token stored server-side per user, then
 * calling Vercel's Deployments API with the project files as a file map:
 * https://vercel.com/docs/rest-api/endpoints#create-a-new-deployment
 *
 * This stub validates the request and returns a clear "not connected"
 * response so the frontend can prompt the user to connect Vercel first.
 * Wire up real OAuth + the fetch call below once you have a Vercel app.
 */
router.post("/vercel", async (req, res) => {
  const { vercelToken } = req.body;
  if (!vercelToken) {
    return res.status(428).json({
      error: "Vercel account not connected.",
      action: "connect_vercel",
    });
  }

  // Example of the real call once a token is available:
  //
  // const response = await fetch("https://api.vercel.com/v13/deployments", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${vercelToken}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     name: req.body.projectName,
  //     files: req.body.files.map((f) => ({ file: f.path, data: f.content })),
  //     target: "production",
  //   }),
  // });
  // const data = await response.json();
  // return res.json({ url: `https://${data.url}` });

  res.status(501).json({ error: "Vercel deploy not yet wired up. See routes/deploy.js." });
});

/**
 * POST /api/deploy/firebase-hosting
 * Real deploys need the Firebase Hosting REST API or the `firebase-tools`
 * CLI invoked server-side with a service account that has Hosting Admin
 * permissions on the target project.
 */
router.post("/firebase-hosting", async (req, res) => {
  res.status(501).json({
    error: "Firebase Hosting deploy not yet wired up. See routes/deploy.js.",
  });
});

export default router;
