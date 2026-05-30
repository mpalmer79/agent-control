import { z } from "zod";

// Boundary validation schemas. Input is validated at the boundary in later
// phases; these foundational schemas establish the shapes and are reused by
// services and API routes.

export const riskLevelSchema = z.enum(["low", "medium", "high"]);

export const environmentSchema = z.enum([
  "development",
  "staging",
  "production",
]);

export const createAgentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  ownerUserId: z.string().min(1),
  riskLevel: riskLevelSchema,
});

export const createPromptVersionSchema = z.object({
  promptId: z.string().min(1),
  templateText: z.string().min(1),
  variables: z.record(z.string(), z.string()).optional(),
  changeReason: z.string().max(500).optional(),
});

export const deploymentRequestSchema = z.object({
  agentId: z.string().min(1),
  agentVersionId: z.string().min(1),
  environment: environmentSchema,
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type CreatePromptVersionInput = z.infer<
  typeof createPromptVersionSchema
>;
export type DeploymentRequestInput = z.infer<typeof deploymentRequestSchema>;

// Phase 4 workflow request schemas.

export const approveSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const rejectSchema = z.object({
  reason: z
    .string()
    .min(1, "A reason is required to reject a request.")
    .max(500),
});

export const requestPromotionSchema = z.object({
  deploymentId: z.string().min(1),
});

export const rollbackSchema = z.object({
  targetDeploymentId: z.string().min(1),
});

export type ApproveInput = z.infer<typeof approveSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;
export type RequestPromotionInput = z.infer<typeof requestPromotionSchema>;
export type RollbackInput = z.infer<typeof rollbackSchema>;
