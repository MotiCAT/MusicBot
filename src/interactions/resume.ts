import { embeds } from '../embeds';
import { client } from '../index';
import { AudioPlayerStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

export async function resumeCommand(interaction: ChatInputCommandInteraction) {
	const player = client.getPlayer(interaction.guildId!);
	if (!player) return interaction.reply(embeds.videoNotPlaying);
	if (player.player.state.status === AudioPlayerStatus.Paused) {
		player.resume();
		interaction.reply(embeds.videoResumed);
	} else if (player.player.state.status === AudioPlayerStatus.Playing) {
		interaction.reply(embeds.videoNotPaused);
	} else interaction.reply(embeds.videoNotPlaying);
}
