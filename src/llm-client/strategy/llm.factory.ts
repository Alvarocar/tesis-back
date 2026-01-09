import { ILLMClient } from '../clients/llm.client';
import { OllamaClient } from '../clients/ollama.client';

export class LlmStrategy {
  create(provider: 'openai' | 'ollama' | 'openrouter'): ILLMClient {
    switch (provider) {
      case 'ollama':
        return new OllamaClient();
      default:
        throw new Error(`LLM provider ${provider} not supported or not given`);
    }
  }
}
