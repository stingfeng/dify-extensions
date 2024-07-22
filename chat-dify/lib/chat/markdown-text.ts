"use client";

import { makeMarkdownText } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { makePrismAsyncSyntaxHighlighter } from "@assistant-ui/react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export const MarkdownText = makeMarkdownText({
  remarkPlugins: [remarkGfm],
  components: {
    SyntaxHighlighter: makePrismAsyncSyntaxHighlighter({
      style: coldarkDark,
      customStyle: {
        margin: 0,
        backgroundColor: "black",
      },
    }),
  },
});
