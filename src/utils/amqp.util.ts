import { ENV } from '../constants/env.constants';
import amqp, { ChannelModel } from 'amqplib';

class CustomAMQP {
  private static instance: CustomAMQP;
  private connection: ChannelModel | null = null;
  private readonly amqpUrl: string;

  private constructor(amqpUrl: string) {
    this.amqpUrl = amqpUrl;
  }

  public static getInstance(amqpUrl: string = ENV.AMQP.URL): CustomAMQP {
    if (!CustomAMQP.instance) {
      CustomAMQP.instance = new CustomAMQP(amqpUrl);
    }
    return CustomAMQP.instance;
  }

  private async createConnection(): Promise<ChannelModel> {
    if (this.connection) return this.connection;

    try {
      this.connection = await amqp.connect(this.amqpUrl);
      console.log('[AMQP] Connection established');
      this.handleConnectionClose();
    } catch (error) {
      console.error(`[AMQP] Connection error: ${error.message}`);
      throw new Error(`[AMQP] Failed to connect: ${error.message}`);
    }

    return this.connection;
  }

  private handleConnectionClose() {
    if (this.connection) {
      this.connection.on('close', () => {
        console.warn('[AMQP] Connection closed');
        this.connection = null; // Reset connection
      });

      this.connection.on('error', err => {
        console.error(`[AMQP] Connection error: ${err.message}`);
      });
    }
  }

  public async getConnection(): Promise<ChannelModel> {
    if (!this.connection) {
      return this.createConnection();
    }
    return this.connection;
  }

  public async closeConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
        console.log('[AMQP] Connection closed successfully');
      } catch (error) {
        console.error(`[AMQP] Error closing connection: ${error.message}`);
      } finally {
        this.connection = null;
      }
    }
  }
}

export const RabbitAMQP = CustomAMQP.getInstance();
