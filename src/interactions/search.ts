import { embeds } from '../embeds';
import {
	ChatInputCommandInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder
} from 'discord.js';
import ytsr from 'youtube-sr';

export async function searchCommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();
	const videos = await ytsr.search(interaction.options.getString('query') as string, {
		type: 'video'
	});

	if (!videos.length) return interaction.followUp(embeds.noResult);

	const menu = new StringSelectMenuBuilder()
		.setCustomId('search')
		.setPlaceholder('Select a video')
		.addOptions(
			videos.map((video, index) => {
				let label = `${index + 1}. ${video.title}`;
				if (label.length > 100) {
					label = label.substring(0, 100);
				}
				return new StringSelectMenuOptionBuilder()
					.setLabel(label)
					.setValue(video.url)
					.setDescription(`${video.channel?.name} | ${video.durationFormatted}`)
					.setEmoji('🎵');
			})
		);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

	interaction.followUp({ content: 'Select a video', components: [row] });
}
