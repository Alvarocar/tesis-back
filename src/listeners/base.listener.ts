import amqp from 'amqplib';

export abstract class BaseListener {
  abstract topic: string;

  abstract init(): void;

  abstract handleMessage(msg: string): void;

  consume(channel: amqp.Channel) {
    console.log('se ha comenzado ha consumir', this.topic);
    channel.consume(this.topic, msg => {
      console.log('mensaje recibido...');
      if (msg !== null) {
        const messageContent = msg.content.toString();
        try {
          this.handleMessage(messageContent);
          channel.ack(msg);
        } catch {
          console.error('[BaseListener] Mensaje no procesado', messageContent);
        }
      }
    });
  }
}
