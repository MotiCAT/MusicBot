import { getSongInfo } from '../Utils/songResolver';
import { queueManager, Queue } from '../classes/queue';
import { embeds } from '../embeds';
import { client } from '../index';
import { ChatInputCommandInteraction } from 'discord.js';

export async function nowplayingCommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();
	const player = client.getPlayer(interaction.guildId!);
	if (!player) return interaction.followUp(embeds.videoNotPlaying);
	const queue = queueManager.getQueue(interaction.guild!.id) as Queue;
	const info = await getSongInfo(queue.currentSong, interaction.guildId!);
	return interaction.followUp(info);
}
