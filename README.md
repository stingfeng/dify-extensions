<p align="center">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-d9d9d9"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-d9d9d9"></a>
</p>

# dify-extensions

This repository is used to save my extensions for the [Dify](https://github.com/langgenius/dify) project.

## chat-dify

chat-dify is a demo created using the [assistant-ui](https://github.com/Yonom/assistant-ui) project, demonstrating how to call the Dify Chat API like calling LLM APIs.

The project first implements a Dify Provider of the Vercel AI SDK, located in the `chat-dify/lib/chat/providers/dify` directory, allowing developers to use the Vercel AI SDK to call the Dify API like calling an LLM. It then implements the chat UI based on assistant-ui.

### How to use

1. Copy the `chat-dify/lib/chat` directory to your project;
2. Copy the `api/dify/route.ts` file to your project;
3. Refer to the `chat-dify/app/page.tsx` file to add the assistant-ui's `Thread` component to your project;
4. Refer to the `chat-dify/app/layout.tsx` file to add the `RuntimeProviderEdge` component to your project and set the API parameter.

## tools/googlecustomsearch

Google Custom Search tool. The official Google Search plugin provided by Dify relies on [Serp API](https://serpapi.com/), which offers only 100 free searches per month. [Google Custom Search](https://programmablesearchengine.google.com) uses the Custom Search API provided by Google, offering 100 free searches per day.

### How to use

1. Copy the `googlecustomesearch` directory to the `api/core/tools/provider/builtin` directory of the Dify project;
2. Compile the Dify API docker image.

## tools/textsimilarity

Text similarity calculation, used to measure the similarity between the content recalled from the knowledge base and the answers provided by the LLM. For example, if you recall 3 pieces of material from the knowledge base and provide them to the LLM to answer a user's question, you may want to know which piece of material the LLM's answer referenced, or if it referenced any of the provided materials at all. This can be determined by calculating the similarity between them.

### How to use

1. Copy the `textsimilarity` directory to the `api/core/tools/provider/builtin` directory of the Dify project;
2. Compile the Dify API docker image.
