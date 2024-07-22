import { Thread } from "@assistant-ui/react";
import { MarkdownText } from "@/lib/chat/markdown-text";

export default function Home() {
  return (
    <main className="h-full">
      <Thread assistantMessage={{ components: { Text: MarkdownText } }}/>
    </main>
  );
}
