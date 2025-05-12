import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ENV } from '@/constants';

export const customModel = createOpenAICompatible({
  name: 'custom-llm',
  baseURL: ENV.AI.BASE_URL,
  apiKey: ENV.AI.API_KEY,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ENV.AI.API_KEY}`,
  },
});
