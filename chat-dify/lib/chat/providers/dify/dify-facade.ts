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
  import type { DifyProviderSettings } from './dify-provider';
  
  /**
   * @deprecated Use `createDify` instead.
   */
  export class Dify {
    /**
     * Base URL for the Dify API calls.
     */
    readonly baseURL: string;
  
    readonly apiKey?: string;
  
    readonly headers?: Record<string, string>;
  
    private readonly generateId: () => string;
  
    /**
     * Creates a new Mistral provider instance.
     */
    constructor(options: DifyProviderSettings = {}) {
      this.baseURL =
        withoutTrailingSlash(options.baseURL ?? options.baseUrl) ??
        'https://api.dify.ai/v1';
  
      this.apiKey = options.apiKey;
      this.headers = options.headers;
      this.generateId = options.generateId ?? generateId;
    }
  
    private get baseConfig() {
      return {
        baseURL: this.baseURL,
        headers: () => ({
          Authorization: `Bearer ${loadApiKey({
            apiKey: this.apiKey,
            environmentVariableName: 'DIFY_API_KEY',
            description: 'Dify',
          })}`,
          ...this.headers,
        }),
      };
    }
  
    chat(modelId: DifyChatModelId, settings: DifyChatSettings = {}) {
      return new DifyChatLanguageModel(modelId, settings, {
        provider: 'dify.chat',
        ...this.baseConfig,
        generateId: this.generateId,
      });
    }
  }