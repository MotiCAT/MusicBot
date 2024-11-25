import { embeds } from '../embeds';
import { client } from '../index';
import { AudioPlayerStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

export async function pauseCommand(interaction: ChatInputCommandInteraction) {
	const player = client.getPlayer(interaction.guildId!);
	if (!player) return interaction.reply(embeds.videoNotPlaying);

	if (player.player.state.status === AudioPlayerStatus.Playing) {
		player.pause();
		interaction.reply(embeds.videoPaused);
	} else if (player.player.state.status === AudioPlayerStatus.Paused) {
		player.resume();
		interaction.reply(embeds.videoResumed);
	} else interaction.reply(embeds.videoNotPlaying);
}
