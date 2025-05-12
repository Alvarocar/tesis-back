import { customModel } from '@/classes/llClient.class';
import { ENV } from '@/constants';
import { Singleton } from '@/decorator/singleton.decorator';
import { generateText } from 'ai';
import { z } from 'zod';

@Singleton
export class AIService {
  async generate(prompt: string) {
    const response = await generateText({
      model: customModel.chatModel(ENV.AI.MODEL),
      system: ENV.AI.SYSTEM_PROMPT,
      prompt,
    });

    return response;
  }
}
