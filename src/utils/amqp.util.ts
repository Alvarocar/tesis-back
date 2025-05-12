import { ENV } from '@/constants';
import amqplib, { Channel, ChannelModel } from 'amqplib';

let channelModel: ChannelModel | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel;

  channelModel = await amqplib.connect(ENV.AMQP.URL);
  channel = await channelModel.createChannel();

  process.once('SIGINT', async () => {
    await channel?.close();
    await channelModel?.close();
    process.exit(0);
  });

  return channel;
};
