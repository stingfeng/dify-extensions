import {
    LanguageModelV1,
    LanguageModelV1CallWarning,
    LanguageModelV1FinishReason,
    LanguageModelV1StreamPart,
    UnsupportedFunctionalityError,
  } from '@ai-sdk/provider';
  import {
    ParseResult,
    combineHeaders,
    createEventSourceResponseHandler,
    createJsonResponseHandler,
    postJsonToApi,
    generateId,
  } from '@ai-sdk/provider-utils';
  import { z } from 'zod';
  import { convertToDifyChatMessages } from './convert-to-dify-chat-messages';
  import {
    DifyChatModelId,
    DifyChatSettings,
  } from './dify-chat-settings';
  import { difyFailedResponseHandler } from './dify-error';
  import {
    difyChatChunkSchema,
    difyChatResponseSchema,
  } from './dify-chat-schemas';
  import {
    DifyChatPrompt,
  } from './dify-chat-prompt';

  type DifyChatConfig = {
    provider: string;
    baseURL: string;
    headers: () => Record<string, string | undefined>;
    generateId: () => string;
    fetch?: typeof fetch;
  };
  
  export class DifyChatLanguageModel implements LanguageModelV1 {
    readonly specificationVersion = 'v1';
    readonly defaultObjectGenerationMode = 'json';
  
    readonly modelId: DifyChatModelId;
    readonly settings: DifyChatSettings;
  
    private readonly config: DifyChatConfig;
  
    constructor(
      modelId: DifyChatModelId,
      settings: DifyChatSettings,
      config: DifyChatConfig,
    ) {
      this.modelId = modelId;
      this.settings = settings;
      this.config = config;
      if (!this.settings.conversationId)
        this.settings.conversationId = "";
      if (!this.settings.userId)
        this.settings.userId = generateId();
    }
  
    get provider(): string {
      return this.config.provider;
    }
  
    private getBody(messages: DifyChatPrompt, stream: boolean) {
        const query = messages.filter((value)=> value.role === 'user').map(({ content }) => content).join(' ')
        const body = {
            response_mode: stream ? "streaming": "blocking",
            inputs: {},
            query: query,
            conversation_id: this.settings.conversationId,
            user: this.settings.userId
          }
        return body;
    }

    private getArgs({
      mode,
      prompt,
      maxTokens,
      temperature,
      topP,
      frequencyPenalty,
      presencePenalty,
      seed,
    }: Parameters<LanguageModelV1['doGenerate']>[0]) {
      const type = mode.type;
  
      const warnings: LanguageModelV1CallWarning[] = [];
  
      if (frequencyPenalty != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'frequencyPenalty',
        });
      }
  
      if (presencePenalty != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'presencePenalty',
        });
      }
  
      const baseArgs = {
        // model id:
        model: this.modelId,
  
        // model specific settings:
        safe_prompt: this.settings.safePrompt,
  
        // standardized settings:
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        random_seed: seed,
  
        // messages:
        messages: convertToDifyChatMessages(prompt),
      };
  
      switch (type) {
        case 'regular': {
          return {
            args: { ...baseArgs, ...prepareToolsAndToolChoice(mode) },
            warnings,
          };
        }
  
        case 'object-json': {
          return {
            args: {
              ...baseArgs,
              response_format: { type: 'json_object' },
            },
            warnings,
          };
        }
  
        case 'object-tool': {
          return {
            args: {
              ...baseArgs,
              tool_choice: 'any',
              tools: [{ type: 'function', function: mode.tool }],
            },
            warnings,
          };
        }
  
        case 'object-grammar': {
          throw new UnsupportedFunctionalityError({
            functionality: 'object-grammar mode',
          });
        }
  
        default: {
          const _exhaustiveCheck: never = type;
          throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
        }
      }
    }
  
    async doGenerate(
      options: Parameters<LanguageModelV1['doGenerate']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
      const { args, warnings } = this.getArgs(options);
  
      const { responseHeaders, value: response } = await postJsonToApi({
        url: `${this.config.baseURL}/chat-messages`,
        headers: combineHeaders(this.config.headers(), options.headers),
        body: this.getBody(args.messages, false),
        failedResponseHandler: difyFailedResponseHandler,
        successfulResponseHandler: createJsonResponseHandler(
          difyChatResponseSchema,
        ),
        abortSignal: options.abortSignal,
        fetch: this.config.fetch,
      });
  
      const { messages: rawPrompt, ...rawSettings } = args;

      this.settings.conversationId = response.conversation_id;
  
      return {
        text: response.answer,
        finishReason: "other",
        usage: {
          promptTokens: response.metadata.usage.prompt_tokens,
          completionTokens: response.metadata.usage.completion_tokens,
        },
        rawCall: { rawPrompt, rawSettings },
        rawResponse: { headers: responseHeaders },
        warnings,
      };
    }
  
    async doStream(
      options: Parameters<LanguageModelV1['doStream']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {
      const { args, warnings } = this.getArgs(options);    
       
      const { responseHeaders, value: response } = await postJsonToApi({
        url: `${this.config.baseURL}/chat-messages`,
        headers: combineHeaders(this.config.headers(), options.headers),
        body: this.getBody(args.messages, true),
        failedResponseHandler: difyFailedResponseHandler,
        successfulResponseHandler: createEventSourceResponseHandler(
          difyChatChunkSchema,
        ),
        abortSignal: options.abortSignal,
        fetch: this.config.fetch,
      });
  
      const { messages: rawPrompt, ...rawSettings } = args;
  
      const settings = this.settings;

      let finishReason: LanguageModelV1FinishReason = 'other';
      let usage: { promptTokens: number; completionTokens: number } = {
        promptTokens: Number.NaN,
        completionTokens: Number.NaN,
      };
   
      return {
        stream: response.pipeThrough(
          new TransformStream<
            ParseResult<z.infer<typeof difyChatChunkSchema>>,
            LanguageModelV1StreamPart
          >({
            transform(chunk, controller) {
              if (!chunk.success) {
                finishReason = 'error';
                controller.enqueue({ type: 'error', error: chunk.error });
                return;
              }
  
              const value = chunk.value;

              if (value.conversation_id !== settings.conversationId) {
                settings.conversationId = value.conversation_id;
              }

              if (value.event === 'message') {
                if (value.answer) {
                    controller.enqueue({
                        type: 'text-delta',
                        textDelta: value.answer,
                      });
                }
              }
              else if (value.event === 'message_end') {
                if (value.metadata) {
                    usage = {
                        promptTokens: value.metadata.usage.prompt_tokens,
                        completionTokens: value.metadata.usage.completion_tokens,
                      };
                }
              }
            //   else if (value.event === 'node_finished') {
            //     if (value.data.outputs.usage) {
            //         usage = {
            //             promptTokens: value.data.outputs.usage.prompt_tokens,
            //             completionTokens: value.data.outputs.usage.completion_tokens,
            //           };
            //     }
            //   }
  
            },
  
            flush(controller) {
              controller.enqueue({ type: 'finish', finishReason, usage });
            },
          }),
        ),
        rawCall: { rawPrompt, rawSettings },
        rawResponse: { headers: responseHeaders },
        warnings,
      };
    }
  }
  

  function prepareToolsAndToolChoice(
    mode: Parameters<LanguageModelV1['doGenerate']>[0]['mode'] & {
      type: 'regular';
    },
  ) {
    // when the tools array is empty, change it to undefined to prevent errors:
    const tools = mode.tools?.length ? mode.tools : undefined;
  
    if (tools == null) {
      return { tools: undefined, tool_choice: undefined };
    }
  
    const mappedTools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  
    const toolChoice = mode.toolChoice;
  
    if (toolChoice == null) {
      return { tools: mappedTools, tool_choice: undefined };
    }
  
    const type = toolChoice.type;
  
    switch (type) {
      case 'auto':
      case 'none':
        return { tools: mappedTools, tool_choice: type };
      case 'required':
        return { tools: mappedTools, tool_choice: 'any' };
  
      // dify does not support tool mode directly,
      // so we filter the tools and force the tool choice through 'any'
      case 'tool':
        return {
          tools: mappedTools.filter(
            tool => tool.function.name === toolChoice.toolName,
          ),
          tool_choice: 'any',
        };
      default: {
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported tool choice type: ${_exhaustiveCheck}`);
      }
    }
  }