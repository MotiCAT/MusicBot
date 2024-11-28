import { queueManager, Queue } from '../classes/queue';
import { embeds } from '../embeds';
import { client } from '../index';
import { Message } from 'discord.js';

export async function loopCommand(message: Message, args: string[]) {
	const player = client.getPlayer(message.guildId!);
	if (!player) return message.reply(embeds.videoNotPlaying);
	const queue = queueManager.queues.get(message.guildId!) as Queue;
	args = args.filter((arg) => arg !== '');
	if (args.length === 0) {
		if (queue.loop === 'none') {
			queue.setLoop('queue');
		} else {
			queue.setLoop('none');
		}
	} else if (args.length === 1) {
		switch (args[0]) {
			case 'none':
				queue?.setLoop('none');
				break;
			case 'queue':
				queue?.setLoop('queue');
				break;
			case 'track':
				queue?.setLoop('track');
				break;
			default:
				message.reply(embeds.commandNotFound);
				break;
		}
	}

	message.reply(new embeds.embed().addFields({ name: 'Looping', value: queue.loop! }).setColor('Green').build());
}
