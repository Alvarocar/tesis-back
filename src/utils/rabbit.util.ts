import amqp from 'amqplib';
import { BaseListener } from '../listeners/base.listener';

export class RabbitMQService {
  private connection: any;
  private channel: any;
  private listeners: BaseListener[] = [];

  constructor(private url: string) {}

  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      console.log('Conectado a RabbitMQ');
    } catch (error) {
      console.error('Error al conectar a RabbitMQ', error);
    }
  }

  async registerListener(listener: BaseListener) {
    this.listeners.push(listener);
    await this.channel.assertQueue(listener.topic, { durable: true });
    listener.consume(this.channel);
    console.log(`Listener registrado para el topic: ${listener.topic}`);
  }
}
