"use client";

import { AssistantRuntimeProvider, useEdgeRuntime } from "@assistant-ui/react";

export function RuntimeProviderEdge({
  children,
  api,
}: Readonly<{
  children: React.ReactNode;
  api: string;
}>) {
  const runtime = useEdgeRuntime({ api: api });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}