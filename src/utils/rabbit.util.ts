import { Connection } from 'amqplib';
import { BaseListener } from '../listeners/base.listener';
import { RabbitAMQP } from './amqp.util';

export class RabbitMQService {
  private listeners: BaseListener[] = [];
  private connection: Connection | null = null;

  async connect() {
    try {
      this.connection = await RabbitAMQP.getConnection();
    } catch (error) {
      console.error('Error al conectar a RabbitMQ', error);
    }
  }

  async registerListener(listener: BaseListener) {
    if (this.connection) {
      this.listeners.push(listener);
    }
    /*  await this.channel.assertQueue(listener.topic, { durable: true });
    listener.consume(this.channel);
    console.log(`Listener registrado para el topic: ${listener.topic}`) */
  }

  execute() {
    return Promise.all(this.listeners.map(app => app.init()));
  }
}
