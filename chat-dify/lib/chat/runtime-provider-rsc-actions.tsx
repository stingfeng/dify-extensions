"use server";

import { dify } from "./providers/dify";
import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { nanoid } from "nanoid";
import type { ReactNode } from "react";

export interface ServerMessage {
  role: "user" | "assistant";
  userId: string,
  conversationId: string;
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function continueConversation(
  input: string,
  userId: string,
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const lastMessage = (history.get() as ServerMessage[]).slice(-1)[0];
  userId = userId ?? lastMessage?.userId;
  const conversationId = userId ? lastMessage?.conversationId : undefined;
  
  const model = dify(
    "dify",
    {
      userId: userId,
      conversationId: conversationId,
    },
  );

  const result = await streamUI({
    model: model,
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", userId: model.settings.userId, conversationId: model.settings.conversationId, content: content },
        ]);
      } 
      console.log('content', content)

      return <div>{content}</div>;
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
