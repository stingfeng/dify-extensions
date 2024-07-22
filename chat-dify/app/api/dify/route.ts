import { dify } from "@/lib/chat/providers/dify";
import { createEdgeRuntimeAPI } from "@assistant-ui/react/edge";

export const maxDuration = 30;

const model = dify(
  "dify",
  {
    userId: 'user-1234',
  },

)
const edgeApi = createEdgeRuntimeAPI({
  model: model,
});


import { NextRequest } from 'next/server';

export const POST = async (nextRequest: NextRequest) => {
  const searchParams = nextRequest.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  console.log(`userId: ${userId}`);
  if (userId)
    model.settings.userId = userId

  return edgeApi.POST(nextRequest);
};