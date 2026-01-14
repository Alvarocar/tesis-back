import { Injectable } from '@nestjs/common';
import {
  MODEL_PROVIDER,
  OPENAI_BASE_URL,
  OPENAI_API_KEY,
  OPENAI_MODEL,
} from 'src/shared/constants/env.constant';
import { OllamaClient } from './clients/ollama.client';
import { OpenAIClient } from './clients/openai.client';
import { ILLMClient } from './clients/llm.client';

@Injectable()
export class LLMClientService {
  private readonly provider: 'ollama' | 'openai';
  private readonly client: ILLMClient;

  constructor() {
    this.provider = (MODEL_PROVIDER as 'ollama' | 'openai') ?? 'openai';
    this.client = this.createClient(this.provider);
  }

  private createClient(provider: 'ollama' | 'openai'): ILLMClient {
    switch (provider) {
      case 'ollama':
        return new OllamaClient();
      case 'openai':
        return new OpenAIClient(
          {
            apiKey: OPENAI_API_KEY,
            baseURL: OPENAI_BASE_URL,
          },
          OPENAI_MODEL,
        );
      default:
        throw new Error(
          `LLM provider ${this.provider} not supported or not given`,
        );
    }
  }

  ask(prompt: string) {
    return this.client.sendMessage({ prompt });
  }
}
