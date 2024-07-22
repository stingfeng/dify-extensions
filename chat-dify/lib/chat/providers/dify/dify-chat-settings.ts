/* eslint-disable @typescript-eslint/ban-types */
// https://docs.mistral.ai/platform/endpoints/
export type DifyChatModelId =
  | 'dify'
  | (string & {});

export interface DifyChatSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;
  conversationId?: string;
  userId?: string;
}