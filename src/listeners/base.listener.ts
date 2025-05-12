import { AmqpService } from '@/services/amqp.service';
import { IAmqpEvents } from '@/types/amqp';

export abstract class BaseListener<Topic extends keyof IAmqpEvents> {
  protected amqpService: AmqpService;

  constructor() {
    this.amqpService = new AmqpService();
  }

  abstract topic: Topic;

  abstract init(): void;

  abstract handleMessage<K extends Topic>(msg: IAmqpEvents[K]['input']): void;

  consume<K extends keyof IAmqpEvents>(topic: K) {
    console.log('se ha comenzado ha consumir', this.topic);
    this.amqpService.subscribe(topic, msg => {
      console.log('mensaje recibido...');
      this.handleMessage(msg);
    });
  }
}
