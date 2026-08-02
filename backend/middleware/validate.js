import { z } from "zod";

const fileSchema = z.object({
  path: z.string().min(1).max(300),
  content: z.string().max(200_000), // guard against runaway payloads
});

export const generateSchema = z.object({
  projectName: z.string().min(1).max(120),
  framework: z.enum(["html-css-js", "react", "nextjs", "vue"]),
  description: z.string().min(3).max(4000),
});

export const editSchema = z.object({
  instruction: z.string().min(1).max(2000),
  framework: z.enum(["html-css-js", "react", "nextjs", "vue"]),
  currentFiles: z.array(fileSchema).min(1).max(200),
});

export const fixSchema = z.object({
  framework: z.enum(["html-css-js", "react", "nextjs", "vue"]),
  currentFiles: z.array(fileSchema).min(1).max(200),
  errorContext: z.string().max(4000).optional(),
});

export const redesignSchema = editSchema;

/** Express middleware factory: validates req.body against a zod schema. */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request.",
        details: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
    }
    req.body = result.data;
    next();
  };
}
