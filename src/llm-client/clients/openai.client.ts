import OpenAI, { ClientOptions } from 'openai';
import { ILLMClient, LLMMessage, LLMResponse } from './llm.client';
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
} from 'src/shared/utils/time.util';
import { SYSTEM_PROMPT } from 'src/shared/constants/system.constant';

export class OpenAIClient implements ILLMClient {
  private client: OpenAI;
  private model: string;

  constructor(
    props: ClientOptions = {},
    model: string = 'mistralai/mistral-7b-instruct:free',
  ) {
    this.client = new OpenAI(props);
    this.model = model;
  }

  async sendMessage(message: LLMMessage): Promise<LLMResponse> {
    try {
      const start = new Date();
      const data = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message.prompt },
        ],
        response_format: {
          type: 'json_object',
        },
      });

      const end = new Date(secondsToMilliseconds(data.created));

      return {
        content: JSON.parse(data.choices[0].message.content!) as {
          affinity: number;
          feedback: string;
          recommendation: 'advance' | 'reject';
          strengths: string[];
          weaknesses: string[];
        },
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        model: this.model,
        duration: millisecondsToSeconds(end.getTime() - start.getTime()),
      };
    } catch (error) {
      console.error('Error generating response from OpenAI:', error);
      throw new Error('Failed to generate response from OpenAI');
    }
  }
}
