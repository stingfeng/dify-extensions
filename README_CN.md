<p align="center">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-d9d9d9"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-d9d9d9"></a>
</p>

# dify-extensions

这个仓库主要用于保存一些日常开发的[Dify](https://github.com/langgenius/dify)项目的扩展。

## chat-dify

chat-dify是一个用[assistant-ui](https://github.com/Yonom/assistant-ui)项目创建的demo程序，演示如何像调用LLM API一样调用Dify API。
该项目首先实现了一个Vercel AI SDK的Dify Provider，位于`chat-dify/lib/chat/providers/dify`目录，允许开发者使用Vercel AI SDK，像调用LLM一样调用Dify API。再基于assistant-ui实现了chat ui。

### 如何使用

1. 拷贝`chat-dify/lib/chat`目录到你的项目；
2. 拷贝`api/dify/route.ts`文件到你的项目；
3. 参考`chat-dify/app/page.tsx`文件，在你的项目中添加assistant-ui的`Thread`组件；
4. 参考`chat-dify/app/layout.tsx`文件，在你的项目中添加`RuntimeProviderEdge`组件并设置api参数。

## tools/googlecustomsearch

Google Custom Search插件。Dify官方提供的Google Search插件依赖[Serp API](https://serpapi.com/)，每月只有100次免费搜索额度。[Google Custom Search](https://programmablesearchengine.google.com)使用了Google官方提供的Custom Search API，每天有100次免费搜索额度。

### 如何使用

1. 把googlecustomesearch目录拷贝到Dify项目的`api/core/tools/provider/builtin`目录；
2. 编译Dify的api docker镜像。
