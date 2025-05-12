import { Channel, ConsumeMessage } from 'amqplib';
import { Singleton } from '@/decorator/singleton.decorator';
import { connectRabbitMQ } from '@/utils/amqp.util';
import { IAmqpEvents } from '@/types/amqp';
import { logger } from '@/utils/logger';

@Singleton
export class AmqpService {
  private async init(): Promise<Channel> {
    return await connectRabbitMQ();
  }

  async publish<K extends keyof IAmqpEvents>(event: K, payload: IAmqpEvents[K]['input']): Promise<void> {
    const channel = await this.init();
    await channel.assertQueue(event as string, { durable: true });
    channel.sendToQueue(event as string, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }

  async subscribe<K extends keyof IAmqpEvents>(
    event: K,
    handler: (data: IAmqpEvents[K]['input']) => Promise<IAmqpEvents[K]['output']> | IAmqpEvents[K]['output'],
  ): Promise<void> {
    const channel = await this.init();
    await channel.assertQueue(event as string, { durable: true });

    channel.consume(event as string, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString()) as IAmqpEvents[K]['input'];
        await handler(payload);

        logger.info(`Event ${String(event)}: processed successfully`);

        channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing ${String(event)}:`, error);
        channel.nack(msg, false, true);
      }
    });
  }
}
