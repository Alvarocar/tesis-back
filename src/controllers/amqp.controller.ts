import { Channel } from 'amqplib';
import { Body, Controller, Post } from 'routing-controllers';
import { RabbitAMQP } from '@/utils/amqp.util';
import { AMQP_EVENTS } from '@/constants/amqp.constants';

@Controller('/amqp')
export class AmqpController {
  @Post('/')
  async test(@Body() payload: any) {
    let channel: Channel | null = null;

    try {
      const connection = await RabbitAMQP.getConnection();
      channel = await connection.createChannel();
      console.log('connection finish');
      await channel.assertQueue(AMQP_EVENTS.APPLICANT.APPLY, { durable: true });
      console.log('the queue exists');
      const messageBuffer = Buffer.from(JSON.stringify(payload));
      channel.sendToQueue(AMQP_EVENTS.APPLICANT.APPLY, messageBuffer);
    } catch (e) {
      console.error(e);
      return { message: 'fail' };
    } finally {
      channel?.close();
    }
    return { message: 'successful' };
  }
}
