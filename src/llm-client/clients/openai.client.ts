import OpenAI, { ClientOptions } from "openai";
import { ILLMClient, LLMMessage, LLMResponse } from "./llm.client";
import { millisecondsToSeconds, secondsToMilliseconds } from "src/shared/utils/time.util";

export class OpenAIClient implements ILLMClient {

    private client: OpenAI;

    constructor(props: ClientOptions = {}) {
        this.client = new OpenAI(props);
    }

    async sendMessage(message: LLMMessage): Promise<LLMResponse> {
        try {
            const start = new Date()
            const data = await this.client.chat.completions.create({
                model: "gtp-4",
                messages: [
                    { role: "user", content: message.prompt },
                ],
                response_format: { type: "json_object", }
            })

            const end = new Date(secondsToMilliseconds(data.created))

            return {
                content: JSON.parse(data.choices[0].message.content!) as { affinity: number; feedback: string },
                inputTokens: data.usage?.prompt_tokens ?? 0,
                outputTokens: data.usage?.completion_tokens ?? 0,
                model: data.model,
                duration: millisecondsToSeconds(end.getTime() - start.getTime())
            }
        } catch (error) {
            console.error('Error generating response from OpenAI:', error);
            throw new Error('Failed to generate response from OpenAI');
        }
    }
}