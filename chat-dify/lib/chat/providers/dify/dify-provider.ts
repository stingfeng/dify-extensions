import {
    generateId,
    loadApiKey,
    withoutTrailingSlash,
  } from '@ai-sdk/provider-utils';
  import { DifyChatLanguageModel } from './dify-chat-language-model';
  import type {
    DifyChatModelId,
    DifyChatSettings,
  } from './dify-chat-settings';
  
  export interface DifyProvider {
    (
      modelId: DifyChatModelId,
      settings?: DifyChatSettings,
    ): DifyChatLanguageModel;
  
    /**
  Creates a model for text generation.
  */
    languageModel(
      modelId: DifyChatModelId,
      settings?: DifyChatSettings,
    ): DifyChatLanguageModel;
  
    /**
  Creates a model for text generation.
  */
    chat(
      modelId: DifyChatModelId,
      settings?: DifyChatSettings,
    ): DifyChatLanguageModel;
}
      
  export interface DifyProviderSettings {
    /**
  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.dify.ai/v1`.
     */
    baseURL?: string;
  
    /**
  @deprecated Use `baseURL` instead.
     */
    baseUrl?: string;
  
    /**
  API key that is being send using the `Authorization` header.
  It defaults to the `DIFY_API_KEY` environment variable.
     */
    apiKey?: string;
  
    /**
  Custom headers to include in the requests.
       */
    headers?: Record<string, string>;
  
    /**
  Custom fetch implementation. You can use it as a middleware to intercept requests,
  or to provide a custom fetch implementation for e.g. testing.
      */
    fetch?: typeof fetch;
  
    generateId?: () => string;
  }
  
  /**
  Create a Dify AI provider instance.
   */
  export function createDify(
    options: DifyProviderSettings = {},
  ): DifyProvider {
    const baseURL =
      withoutTrailingSlash(options.baseURL ?? options.baseUrl) ??
      'https://api.dify.ai/v1';
  
    const getHeaders = () => ({
      Authorization: `Bearer ${loadApiKey({
        apiKey: options.apiKey,
        environmentVariableName: 'DIFY_API_KEY',
        description: 'Dify',
      })}`,
      ...options.headers,
    });
  
    const createChatModel = (
      modelId: DifyChatModelId,
      settings: DifyChatSettings = {},
    ) =>
      new DifyChatLanguageModel(modelId, settings, {
        provider: 'dify.chat',
        baseURL,
        headers: getHeaders,
        generateId: options.generateId ?? generateId,
        fetch: options.fetch,
      });
   
    const provider = function (
      modelId: DifyChatModelId,
      settings?: DifyChatSettings,
    ) {
      if (new.target) {
        throw new Error(
          'The Dify model function cannot be called with the new keyword.',
        );
      }
  
      return createChatModel(modelId, settings);
    };
  
    provider.languageModel = createChatModel;
    provider.chat = createChatModel;
  
    return provider as DifyProvider;
  }
  
  /**
  Default Dify provider instance.
   */
  export const dify = createDify();