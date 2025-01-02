import axios from 'axios';

export class OllamaClient {
  private baseURL: string;

  constructor(baseURL = 'http://localhost:11434') {
    this.baseURL = baseURL;
  }

  async callModel(model: string, prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model,
        prompt,
      });
      return response.data.response;
    } catch (error) {
      console.error('Error calling Ollama model:', error);
      throw error;
    }
  }
}
