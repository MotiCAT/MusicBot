import { embeds } from '../embeds';
import { client } from '../index';
import { ChatInputCommandInteraction } from 'discord.js';

export async function skipCommand(interaction: ChatInputCommandInteraction) {
	const player = client.getPlayer(interaction.guildId!);
	if (!player) return interaction.reply(embeds.videoNotPlaying);
	player.skip();
	return interaction.reply(embeds.videoNext);
}
