import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  validateBody,
  generateSchema,
  editSchema,
  fixSchema,
  redesignSchema,
} from "../middleware/validate.js";
import {
  generateProject,
  editProject,
  fixProject,
  redesignProject,
} from "../services/groqClient.js";

const router = Router();

// Every AI call costs real money — rate limit per user/IP on top of any
// plan-based limits you add later (see billing placeholder).
const aiLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.AI_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please wait a moment and try again." },
});

router.use(aiLimiter);
router.use(requireAuth); // the Groq key must never be reachable without a verified user

router.post("/generate", validateBody(generateSchema), async (req, res) => {
  try {
    const result = await generateProject(req.body);
    res.json(result);
  } catch (err) {
    console.error("[ai/generate]", err.message);
    res.status(502).json({ error: err.message || "Generation failed." });
  }
});

router.post("/edit", validateBody(editSchema), async (req, res) => {
  try {
    const result = await editProject(req.body);
    res.json(result);
  } catch (err) {
    console.error("[ai/edit]", err.message);
    res.status(502).json({ error: err.message || "Edit failed." });
  }
});

router.post("/fix", validateBody(fixSchema), async (req, res) => {
  try {
    const result = await fixProject(req.body);
    res.json(result);
  } catch (err) {
    console.error("[ai/fix]", err.message);
    res.status(502).json({ error: err.message || "Fix failed." });
  }
});

router.post("/redesign", validateBody(redesignSchema), async (req, res) => {
  try {
    const result = await redesignProject(req.body);
    res.json(result);
  } catch (err) {
    console.error("[ai/redesign]", err.message);
    res.status(502).json({ error: err.message || "Redesign failed." });
  }
});

export default router;
