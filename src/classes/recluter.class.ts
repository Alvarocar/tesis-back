import axios, { AxiosInstance } from 'axios';

export class RecluterIA {
  private axios: AxiosInstance;
  private model: string;

  constructor(domain: string, model = 'recluter') {
    this.model = model;

    this.axios = axios.create({
      baseURL: domain,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  generate(prompt: string, stream = false) {
    return this.axios.post('/api/generate', {
      model: this.model,
      prompt,
      stream,
    });
  }
}
