import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const difyErrorDataSchema = z.object({
  object: z.literal('error'),
  message: z.string(),
  type: z.string(),
  param: z.string().nullable(),
  code: z.string().nullable(),
});

export type DifyErrorData = z.infer<typeof difyErrorDataSchema>;

function errorToMessage(data: DifyErrorData): string {
  console.log('errorToMessage', data);
  return data.message;
}
export const difyFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: difyErrorDataSchema,
  errorToMessage: errorToMessage,
});