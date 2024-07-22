This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project.

## Getting Started

First, add your OpenAI API key to `.env.local` file:

```
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Configure the Project

1. In `/app/layout.tsx`, specify the API parameter for `RuntimeProviderEdge`: `<RuntimeProviderEdge api='api/dify'>`.
2. In `/app/page.tsx`, configure the `Thread`, for example, specify the markdown rendering format: `<Thread assistantMessage={{ components: { Text: MarkdownText } }}/>`.
