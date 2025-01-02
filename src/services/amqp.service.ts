import { Channel, Connection } from 'amqplib';
import { RabbitAMQP } from '@/utils/amqp.util';

export class AMQPService {
  private channel: Channel | null = null;
  private connection: Connection | null = null;
  private queueExists = false;
  private readonly queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  public async init(): Promise<void> {
    try {
      this.connection = await RabbitAMQP.getConnection();
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.queueName, { durable: true });
      this.queueExists = true;

      console.log(`[AMQPService] Initialized for queue: ${this.queueName}`);
    } catch (error) {
      console.error(`[AMQPService] Initialization error: ${error.message}`);
      this.cleanup();
      throw error;
    }
  }

  public publish(payload: object): boolean {
    if (this.queueExists && this.channel) {
      try {
        this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(payload)));
        return true;
      } catch (error) {
        console.error(`[AMQPService] Publish error: ${error.message}`);
        return false;
      }
    }

    console.warn(`[AMQPService] Queue not initialized or channel unavailable.`);
    return false;
  }

  public getChannel() {
    return this.channel;
  }

  public async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        console.log(`[AMQPService] Channel closed for queue: ${this.queueName}`);
      }
    } catch (error) {
      console.error(`[AMQPService] Error closing channel: ${error.message}`);
    } finally {
      this.channel = null;
    }
  }

  private cleanup() {
    this.channel = null;
    this.queueExists = false;
  }
}
