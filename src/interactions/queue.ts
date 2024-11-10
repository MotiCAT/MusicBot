import { songResolver } from '../Utils/songResolver';
import { Queue, queueManager } from '../classes/queue';
import { embeds } from '../embeds';
import { client } from '../index';
import ytdl, { videoInfo } from '@distube/ytdl-core';
import {
	ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder
} from 'discord.js';
import NodeCache from 'node-cache';

const SONGS_PER_PAGE = 5;
const infoCache = new NodeCache({ stdTTL: 600 }); // 10分のキャッシュ

// キャッシュされてればキャッシュより動画情報を返す
async function getCachedInfo(url: string): Promise<videoInfo> {
	const cached = infoCache.get<videoInfo>(url);
	if (cached) return cached;

	const info = await ytdl.getInfo(url);
	infoCache.set(url, info);
	return info;
}

export async function queueCommand(interaction: ChatInputCommandInteraction) {
	const player = client?.player;
	await interaction.deferReply();
	if (!player) return interaction.followUp(embeds.videoNotPlaying);

	const queue = queueManager.getQueue(interaction.guildId!) as Queue;
	const totalPages = Math.ceil(queue.length / SONGS_PER_PAGE);
	let currentPage = 0;

	async function buildQueueEmbed(page: number): Promise<EmbedBuilder> {
		const embed = new EmbedBuilder()
			.setTitle('Queue')
			.setColor('Blue')
			.setTimestamp()
			.setFooter({
				text: `Page ${page + 1} of ${totalPages} | Queue: ${queue.length} songs`
			});

		const start = page * SONGS_PER_PAGE;
		const end = Math.min(start + SONGS_PER_PAGE, queue.length);

		// 並列で動画情報を取得
		const songPromises = queue.store.slice(start, end).map((url) => getCachedInfo(url));
		const songsInfo = await Promise.all(songPromises);

		songsInfo.forEach((info: videoInfo, i: number) => {
			const song = songResolver(info, interaction.user.username, interaction.user.displayAvatarURL()!);
			embed.addFields({
				name: `${start + i + 1}. ${song.title}`,
				value: `[${song.author}](${song.authorUrl})`
			});
		});

		return embed;
	}

	// 未キャッシュのキューをバックグラウンドで読み込む
	async function preloadNextPage(page: number) {
		const start = page * SONGS_PER_PAGE;
		const end = Math.min(start + SONGS_PER_PAGE, queue.length);
		const urls = queue.store.slice(start, end);
		await Promise.all(urls.map((url) => getCachedInfo(url))); // キャッシュされていない場合のみ取得
	}

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

	// 次ページと次々ページをバックグラウンドで事前読み込み
	preloadNextPage(currentPage + 1).catch(console.error);
	if (currentPage + 2 < totalPages) preloadNextPage(currentPage + 2).catch(console.error);

	// Button interaction collector
	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 120000 //2min timeout
	});

	collector.on('collect', async (buttonInteraction) => {
		try {
			// Ensure that the user who clicked the button is the same as the original user
			if (buttonInteraction.user.id !== interaction.user.id)
				return buttonInteraction.reply({ content: 'このボタンは使用できません。', ephemeral: true });

			await buttonInteraction.deferUpdate();

			// Pagination
			if (buttonInteraction.customId === 'prev') currentPage = Math.max(currentPage - 1, 0);
			else if (buttonInteraction.customId === 'next') {
				// Nextボタンが押されたら、ラベルを「Loading...」に変更し、ボタンを無効化
				nextButton.setLabel('Loading...');
				nextButton.setDisabled(true);
				await message.edit({ components: [row] });

				// 次ページを読み込む
				await preloadNextPage(currentPage + 1).catch(console.error);
				currentPage = Math.min(currentPage + 1, totalPages - 1);
			}

			queueEmbed = await buildQueueEmbed(currentPage);
			prevButton.setDisabled(currentPage === 0);
			nextButton.setDisabled(currentPage === totalPages - 1);
			nextButton.setLabel('Next'); // 読み込みが完了したら「Next」に戻す

			await message.edit({ embeds: [queueEmbed], components: [row] });

			// 事前読み込みのページ更新
			if (currentPage + 1 < totalPages) preloadNextPage(currentPage + 1).catch(console.error);
			if (currentPage + 2 < totalPages) preloadNextPage(currentPage + 2).catch(console.error);
		} catch (error) {
			console.error('Error updating interaction:', error);
			// エラーが発生した場合、ユーザーにメッセージを送信
			if (buttonInteraction.deferred) {
				await buttonInteraction.editReply({
					content: 'インタラクションの更新中にエラーが発生しました。',
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
