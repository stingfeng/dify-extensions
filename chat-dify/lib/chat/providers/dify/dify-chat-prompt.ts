/* eslint-disable @typescript-eslint/array-type */
export type DifyChatPrompt = Array<DifyChatMessage>;

export type DifyChatMessage =
  | DifySystemMessage
  | DifyUserMessage
  | DifyAssistantMessage
  | DifyToolMessage;

export interface DifySystemMessage {
  role: 'system';
  content: string;
}

export interface DifyUserMessage {
  role: 'user';
  content: string;
}

export interface DifyAssistantMessage {
  role: 'assistant';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface DifyToolMessage {
  role: 'tool';
  name: string;
  content: string;
}