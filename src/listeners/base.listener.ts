import amqp from 'amqplib';

export abstract class BaseListener {
  abstract topic: string;

  abstract handleMessage(msg: string): void;

  consume(channel: amqp.Channel) {
    channel.consume(this.topic, msg => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        this.handleMessage(messageContent);
        channel.ack(msg);
      }
    });
  }
}
