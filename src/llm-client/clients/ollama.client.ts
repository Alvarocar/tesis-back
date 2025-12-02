import axios from 'axios';
import { nanoSecondsToSeconds } from 'src/shared/utils/time.util';
import { OLLAMA_HOST, OLLAMA_MODEL } from 'src/shared/constants/env.constant';
import { ILLMClient, LLMMessage, LLMResponse } from './llm.client';

interface OllamaApiResponse {
  model: string;
  created_at: string;
  response: string;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export class OllamaClient implements ILLMClient { 

  async sendMessage(messages: LLMMessage): Promise<LLMResponse> {
    const { prompt } = messages;
    try {
        const { data } = await axios.post<OllamaApiResponse>(`${OLLAMA_HOST}/api/generate`, {
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          format: "json",
        });

        return {
          content: JSON.parse(data.response) as { affinity: number; feedback: string },
          duration: nanoSecondsToSeconds(data.prompt_eval_duration + data.eval_duration),
          inputTokens: data.prompt_eval_count,
          outputTokens: data.eval_count,
          model: data.model,
        };
    }  catch (error) {
      console.error('Error generating response from Ollama:', error);
      throw new Error('Failed to generate response from Ollama');
    }
  }
}