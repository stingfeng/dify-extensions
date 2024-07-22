"use client";

import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
import type { AI, ClientMessage } from "./runtime-provider-rsc-actions";

import {
  type AppendMessage,
  AssistantRuntimeProvider,
} from "@assistant-ui/react";
import { useVercelRSCRuntime } from "@assistant-ui/react-ai-sdk";

export const RuntimeProviderRSC = ({ children }: { children: React.ReactNode }) => {
    const { continueConversation } = useActions();
    const [messages, setMessages] = useUIState<typeof AI>();
  
    const userId = 'user-123';
  
    
    const append = async (m: AppendMessage) => {
      if (m.content[0]?.type !== "text")
        throw new Error("Only text messages are supported");
  
      const input = m.content[0].text;
      setMessages((currentConversation) => [
        ...currentConversation,
        { id: nanoid(), role: "user", display: input },
      ]);
     
      const message: ClientMessage = await continueConversation(input, userId);
  
      setMessages((currentConversation) => [...currentConversation, message]);
    };
  
    const runtime = useVercelRSCRuntime({ messages, append });
  
    return (
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    );
  };
  