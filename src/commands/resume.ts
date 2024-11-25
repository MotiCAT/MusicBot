import { embeds } from '../embeds';
import { client } from '../index';
import { AudioPlayerStatus } from '@discordjs/voice';
import { Message } from 'discord.js';

export async function resumeCommand(message: Message) {
	const player = client.getPlayer(message.guildId!);
	if (!player) return message.reply(embeds.videoNotPlaying);
	if (player.player.state.status === AudioPlayerStatus.Paused) {
		player.resume();
		message.reply(embeds.videoResumed);
	} else if (player.player.state.status === AudioPlayerStatus.Playing) {
		message.reply(embeds.videoNotPaused);
	} else message.reply(embeds.videoNotPlaying);
}
