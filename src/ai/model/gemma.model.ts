import { OllamaLLM } from '@/classes/ollamaLLM.class';

export const ollamaLLM = new OllamaLLM({
  model: 'recluter',
  baseURL: 'http://localhost:11434', // Cambia si Ollama está en otro host o puerto
});
