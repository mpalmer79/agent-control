export interface PromptVersionInput {
  promptId: string;
  templateText: string;
  variables?: Record<string, string>;
  changeReason?: string;
}

export interface PromptVersionRecord extends PromptVersionInput {
  id: string;
  version: string;
  createdBy: string;
  createdAt: string;
}
