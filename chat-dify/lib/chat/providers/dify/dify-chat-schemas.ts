import { z } from "zod";

// limited version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
// limited version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
export const difyChatResponseSchema = z.object({
  event: z.literal("message"),
  task_id: z.string(),
  id: z.string(),
  message_id: z.string(),
  conversation_id: z.string(),
  mode: z.string(),
  answer: z.string(),
  created_at: z.number(),
  metadata: z.object({
    usage: z.object({
      prompt_tokens: z.number(),
      prompt_unit_price: z.string(),
      prompt_price_unit: z.string(),
      prompt_price: z.string(),
      completion_tokens: z.number(),
      completion_unit_price: z.string(),
      completion_price_unit: z.string(),
      completion_price: z.string(),
      total_tokens: z.number(),
      total_price: z.string(),
      currency: z.string(),
      latency: z.number(),
    }),
  }),
});

const commonSchema = z.object({
  event: z.union([
    z.literal("workflow_started"),
    z.literal("workflow_finished"),
    z.literal("node_started"),
    z.literal("node_finished"),
    z.literal("message"),
    z.literal("message_end"),
    z.literal("tts_message_end"),
  ]),
  conversation_id: z.string(),
  message_id: z.string(),
  created_at: z.number(),
  task_id: z.string(),
  
  workflow_run_id: z.optional(z.string()), // 将 workflow_run_id 设为可选
  id: z.optional(z.string()), // 将 id 设为可选
  answer: z.optional(z.string()), // 将 answer 设为可选
  audio: z.optional(z.string()), // 将 answer 设为可选
  metadata: z.optional(z.object({
    usage: z.object({
        prompt_tokens: z.number(),
        prompt_unit_price: z.string(),
        prompt_price_unit: z.string(),
        prompt_price: z.string(),
        completion_tokens: z.number(),
        completion_unit_price: z.string(),
        completion_price_unit: z.string(),
        completion_price: z.string(),
        total_tokens: z.number(),
        total_price: z.string(),
        currency: z.string(),
        latency: z.number(),
    })
  }))
});

const workflowStartedDataSchema = z.object({
  id: z.string(),
  workflow_id: z.string(),
  sequence_number: z.number(),
  inputs: z.object({
    "sys.query": z.string(),
    "sys.files": z.array(z.any()),
    "sys.conversation_id": z.string(),
    "sys.user_id": z.string(),
  }),
  created_at: z.number(),
});

const workflowFinishedDataSchema = z.object({
    id: z.string(),
    workflow_id: z.string(),
    sequence_number: z.number(),
    status: z.string(),
    outputs: z.object({
        answer: z.string()
    }),
    error: z.nullable(z.unknown()),
    elapsed_time: z.number(),
    total_tokens: z.number(),
    total_steps: z.number(),
    created_by: z.object({
        id: z.string(),
        user: z.string(),
    }),
    created_at: z.number(),
    finished_at: z.number(),
    files: z.array(z.unknown()),
});
  
const nodeStartedDataSchema = z.object({
  id: z.string(),
  node_id: z.string(),
  node_type: z.string(),
  title: z.string(),
  index: z.number(),
  predecessor_node_id: z.nullable(z.string()),
  inputs: z.nullable(z.unknown()),
  created_at: z.number(),
  extras: z.record(z.unknown()),
});

const nodeFinishedDataSchema = z.object({
  id: z.string(),
  node_id: z.string(),
  node_type: z.string(),
  title: z.string(),
  index: z.number(),
  predecessor_node_id: z.nullable(z.string()),
  inputs: z.nullable(
    z.object({
      "sys.query": z.string(),
      "sys.files": z.array(z.any()),
      "sys.conversation_id": z.string(),
      "sys.user_id": z.string(),
    })
  ),
  process_data: z.nullable(
    z.object({
      model_mode: z.string(),
      prompts: z.array(
        z.object({
          role: z.string(),
          text: z.string(),
          files: z.array(z.any()),
        })
      ),
    })
  ),
  outputs: z.union([
    z.object({
      "sys.query": z.string(),
      "sys.files": z.array(z.any()),
      "sys.conversation_id": z.string(),
      "sys.user_id": z.string(),
    }),
    z.union([
      z.object({
        text: z.string(),
        usage: z.object({
          prompt_tokens: z.number(),
          prompt_unit_price: z.string(),
          prompt_price_unit: z.string(),
          prompt_price: z.string(),
          completion_tokens: z.number(),
          completion_unit_price: z.string(),
          completion_price_unit: z.string(),
          completion_price: z.string(),
          total_tokens: z.number(),
          total_price: z.string(),
          currency: z.string(),
          latency: z.number(),
        }),
      }),
      z.object({
        answer: z.string(),
      }),
    ]),
  ]),
  status: z.string(),
  error: z.nullable(z.unknown()),
  elapsed_time: z.number(),
  execution_metadata: z.nullable(
    z.object({
      total_tokens: z.number(),
      total_price: z.string(),
      currency: z.string(),
    })
  ),
  created_at: z.number(),
  finished_at: z.number(),
  files: z.array(z.unknown()),
});

export const difyChatChunkSchema = z.object({
  ...commonSchema.shape,
  data: z
    .union([
      workflowStartedDataSchema,
      workflowFinishedDataSchema,
      nodeStartedDataSchema,
      nodeFinishedDataSchema,
    ])
    .optional(),
});
