import { embeds } from '../embeds';
import { client } from '../index';
import { Message } from 'discord.js';

export async function stopCommand(message: Message): Promise<void> {
	if (message.guild?.members.me?.voice.channel) {
		const player = client.getPlayer(message.guildId!);
		message.reply(embeds.videoStopped);
		player?.stop();
	} else message.reply(embeds.videoNotPlaying);
}
