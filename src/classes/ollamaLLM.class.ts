import { OllamaClient } from './ollamaClient.class'; // La clase creada previamente
import { BaseLLMParams, LLM } from '@langchain/core/language_models/llms';

interface OllamaLLMConfig extends BaseLLMParams {
  model: string;
  baseURL?: string;
}

export class OllamaLLM extends LLM {
  private client: OllamaClient;
  private model: string;

  constructor({ model, baseURL, ...rest }: OllamaLLMConfig) {
    super(rest);
    this.client = new OllamaClient(baseURL);
    this.model = model;
  }

  _llmType(): string {
    return 'ollama';
  }

  async _call(prompt: string): Promise<string> {
    return this.client.callModel(this.model, prompt);
  }
}
