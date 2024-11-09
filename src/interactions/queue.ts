import { songResolver } from '../Utils/songResolver';
import { Queue, queueManager } from '../classes/queue';
import { embeds } from '../embeds';
import { client } from '../index';
import ytdl from '@distube/ytdl-core';
import {
	ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder
} from 'discord.js';

const SONGS_PER_PAGE = 5;

export async function queueCommand(interaction: ChatInputCommandInteraction) {
	const player = client?.player;
	await interaction.deferReply();
	if (!player) return interaction.followUp(embeds.videoNotPlaying);

	const queue = queueManager.getQueue(interaction.guildId!) as Queue;
	const totalPages = Math.ceil(queue.length / SONGS_PER_PAGE);
	let currentPage = 0;

	// Helper function to build the queue embed for a specific page
	async function buildQueueEmbed(page: number): Promise<EmbedBuilder> {
		const embed = new EmbedBuilder()
			.setTitle('Queue')
			.setColor('Blue')
			.setTimestamp()
			.setFooter({
				text: `Page ${page + 1} of ${totalPages} | Queue: ${queue.length} songs`
			});

		const start = page * SONGS_PER_PAGE;
		const end = start + SONGS_PER_PAGE;
		for (let i = start; i < Math.min(end, queue.length); i++) {
			const url = queue.store[i];
			const info = await ytdl.getInfo(url);
			const song = songResolver(info, interaction.user.username, interaction.user.displayAvatarURL()!);
			embed.addFields({
				name: `${i + 1}. ${song.title}`,
				value: `[${song.author}](${song.authorUrl})`
			});
		}
		return embed;
	}

	// Initial message with the first page
	let queueEmbed = await buildQueueEmbed(currentPage);
	const prevButton = new ButtonBuilder()
		.setCustomId('prev')
		.setLabel('Previous')
		.setStyle(ButtonStyle.Primary)
		.setDisabled(currentPage === 0);
	const nextButton = new ButtonBuilder()
		.setCustomId('next')
		.setLabel('Next')
		.setStyle(ButtonStyle.Primary)
		.setDisabled(currentPage === totalPages - 1);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton);
	const message = await interaction.followUp({ embeds: [queueEmbed], components: [row] });

	// Button interaction collector
	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 120000 //2min timeout
	});

	collector.on('collect', async (buttonInteraction) => {
		try {
			// Ensure that the user who clicked the button is the same as the original user
			if (buttonInteraction.user.id !== interaction.user.id) {
				return buttonInteraction.reply({ content: "You can't use this button.", ephemeral: true });
			}

			await buttonInteraction.deferUpdate();

			// Pagination
			if (buttonInteraction.customId === 'prev') currentPage = Math.max(currentPage - 1, 0);
			else if (buttonInteraction.customId === 'next') currentPage = Math.min(currentPage + 1, totalPages - 1);

			queueEmbed = await buildQueueEmbed(currentPage);
			prevButton.setDisabled(currentPage === 0);
			nextButton.setDisabled(currentPage === totalPages - 1);

			await message.edit({ embeds: [queueEmbed], components: [row] });
		} catch (error) {
			console.error('Error updating interaction:', error);
			// Optionally, send a message to the user if something goes wrong
			if (buttonInteraction.deferred) {
				await buttonInteraction.editReply({
					content: 'An error occurred while updating the interaction.',
					components: []
				});
			}
		}
	});

	collector.on('end', () => {
		prevButton.setDisabled(true);
		nextButton.setDisabled(true);
		interaction.editReply({ components: [row] });
	});
}
