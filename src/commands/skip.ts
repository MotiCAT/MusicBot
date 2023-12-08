import { embeds } from '../embeds';
import { client } from '../index';
import { Message } from 'discord.js';

export async function skipCommand(message: Message) {
	const player = client?.player;
	if (!player) return message.reply(embeds.videoNotPlaying);
	player.skip();
	return message.reply(embeds.videoNext);
}
