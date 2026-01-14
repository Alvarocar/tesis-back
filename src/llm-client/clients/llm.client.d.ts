export interface LLMMessage {
  prompt: string;
}

export interface LLMResponse {
  content: {
    affinity: number;
    feedback: string;
    recommendation: 'advance' | 'reject';
    strengths: string[];
    weaknesses: string[];
  };
  duration: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface ILLMClient {
  sendMessage(messages: LLMMessage): Promise<LLMResponse>;
}
