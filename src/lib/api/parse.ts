// Safe JSON body parsing for mutation routes.
//
// Parses and validates a request body with a zod schema, throwing a typed
// ValidationError on failure so routes return the standard error envelope.

import type { ZodType } from "zod";

import { ValidationError } from "@/lib/errors";

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let raw: unknown;
  try {
    // An empty body is valid for endpoints whose fields are all optional.
    const text = await request.text();
    raw = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    throw new ValidationError("Request body is not valid JSON");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ValidationError(issue ? issue.message : "Invalid request body");
  }
  return result.data;
}
