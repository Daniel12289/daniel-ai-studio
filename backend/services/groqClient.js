import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// All AI calls return this shape:
// { files: [{ path, content }], summary, explanation? }
const RESPONSE_CONTRACT = `
Respond with ONLY a single JSON object, no markdown fences, no commentary before or after it.
Shape:
{
  "summary": "one sentence describing what you built or changed",
  "files": [
    { "path": "index.html", "content": "<full file content as a string>" },
    { "path": "style.css", "content": "..." }
  ],
  "explanation": "optional short explanation of key decisions or fixes"
}
Rules:
- "path" is relative (e.g. "src/App.jsx", "assets/logo.svg", "README.md").
- Only include files that are new or changed. Do not repeat unchanged files.
- "content" must be the COMPLETE file content, not a diff or snippet.
- Never wrap the JSON in \`\`\`json fences.
- Never include an API key, secret, or credential in generated code.
`.trim();

const FRAMEWORK_GUIDANCE = {
  "html-css-js": "Plain HTML/CSS/JavaScript, no build step. Entry file must be index.html.",
  react: "React 18 + Vite + plain CSS or Tailwind via CDN. Entry file is src/main.jsx, index.html at root.",
  nextjs: "Next.js 14 App Router. Include package.json, app/page.jsx, app/layout.jsx.",
  vue: "Vue 3 + Vite. Entry file src/main.js, App.vue, index.html at root.",
};

function baseSystemPrompt(framework) {
  return `
You are the code-generation engine inside "Daniel AI Studio", an AI website/app builder.
You generate complete, working, production-quality project files from natural language.

Target stack: ${FRAMEWORK_GUIDANCE[framework] || FRAMEWORK_GUIDANCE["html-css-js"]}

Standards:
- Clean, readable, commented code.
- Responsive, mobile-first layout.
- Accessible markup (semantic tags, labels, alt text, focus states).
- Modern, polished visual design — no default browser styling left unstyled.
- If the project needs a backend feature (auth, database), use Firebase
  (Authentication, Firestore, Storage) with clear TODO comments for config.
- Always include a README.md with setup + run instructions.

${RESPONSE_CONTRACT}
`.trim();
}

async function callGroq(messages, { temperature = 0.4 } = {}) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature,
    max_tokens: 8000,
    messages,
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() || "";
  return parseModelJson(raw);
}

function parseModelJson(raw) {
  // Defensively strip stray markdown fences in case the model adds them anyway.
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.files)) throw new Error("Missing files array");
    return parsed;
  } catch (err) {
    throw new Error(
      "The AI response could not be parsed as valid project JSON. Try again or simplify the prompt."
    );
  }
}

/** Generate a brand-new project from a description. */
export async function generateProject({ description, framework, projectName }) {
  const messages = [
    { role: "system", content: baseSystemPrompt(framework) },
    {
      role: "user",
      content: `Project name: ${projectName}\n\nBuild this: ${description}\n\nGenerate the full initial project now.`,
    },
  ];
  return callGroq(messages, { temperature: 0.5 });
}

/** Apply a follow-up edit instruction to an existing project's files. */
export async function editProject({ instruction, framework, currentFiles }) {
  const filesManifest = currentFiles
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const messages = [
    { role: "system", content: baseSystemPrompt(framework) },
    {
      role: "user",
      content: `Here is the current project:\n\n${filesManifest}\n\nEdit instruction: "${instruction}"\n\nOnly return files that are new or changed, with their COMPLETE updated content.`,
    },
  ];
  return callGroq(messages, { temperature: 0.35 });
}

/** Ask the AI to find and repair bugs across the project. */
export async function fixProject({ framework, currentFiles, errorContext }) {
  const filesManifest = currentFiles
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const messages = [
    { role: "system", content: baseSystemPrompt(framework) },
    {
      role: "user",
      content: `Here is the current project:\n\n${filesManifest}\n\n${
        errorContext ? `Known error/console output:\n${errorContext}\n\n` : ""
      }Find and fix all bugs, broken imports, syntax errors, and obvious runtime issues. Return only the corrected files, and explain what was wrong in "explanation".`,
    },
  ];
  return callGroq(messages, { temperature: 0.2 });
}

/** Apply a design-only pass (visual polish) without changing functionality. */
export async function redesignProject({ instruction, framework, currentFiles }) {
  const filesManifest = currentFiles
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const messages = [
    { role: "system", content: baseSystemPrompt(framework) },
    {
      role: "user",
      content: `Here is the current project:\n\n${filesManifest}\n\nDesign instruction: "${instruction}"\n\nImprove visual design only — layout, spacing, typography, color, and micro-interactions. Do not change app logic or data structures unless required to support the visual change.`,
    },
  ];
  return callGroq(messages, { temperature: 0.5 });
}

export default groq;
