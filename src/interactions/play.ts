import { YTPlayer } from '../classes/player';
import { Queue, queueManager } from '../classes/queue';
import { embeds } from '../embeds';
import { client } from '../index';
import ytdl from '@distube/ytdl-core';
import { ChannelType, VoiceBasedChannel, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import ytpl from 'ytpl';

let url: string;

export async function playCommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();
	let player = client?.player;
	if (!queueManager.getQueue(interaction.guild?.id as string)) {
		queueManager.setQueue(interaction.guild?.id as string, new Queue());
	}
	const queue = queueManager.getQueue(interaction.guild?.id as string) as Queue;
	if (!interaction.channel) return;
	if (!(interaction.member instanceof GuildMember)) return;
	if (!player) {
		client.player = new YTPlayer(
			interaction.guild?.id as string,
			interaction.member?.voice.channel as VoiceBasedChannel,
			interaction.channel?.id
		);
		player = client.player;
	}
	url = interaction.options.getString('url') as string;
	const channel = interaction.member?.voice.channel;
	if (!url) return interaction.reply(embeds.noUrl);
	if (!channel) return interaction.reply(embeds.voiceChannelJoin);
	if (channel.type !== ChannelType.GuildVoice) return;
	if (!channel.speakable) return interaction.reply(embeds.voiceChannnelPermission);

	// Check if URL is a playlist
	if (ytpl.validateID(url)) {
		const playlist = await ytpl(url, {
			limit: Infinity
		});
		for (const video of playlist.items) queue.addSong(video.url);

		interaction.editReply(
			new embeds.embed()
				.setTitle('Playlist Added')
				.setDescription(`**${playlist.title}** を再生キューに追加しました。`)
				.setColor('Green')
				.build()
		);
		if (!player.isPlaying) return player.play();
	} else if (ytdl.validateURL(url)) {
		if (!queue.length || !player.isPlaying) {
			queue.addSong(url);
			const info = await ytdl.getInfo(url);
			interaction.reply(
				new embeds.embed()
					.setTitle('Success')
					.setDescription(`**[${info.videoDetails.title}](${info.videoDetails.video_url})を再生します。**`)
					.addFields({
						name: info.videoDetails.title,
						value: `投稿者: [${info.videoDetails.author.name}](${info.videoDetails.author.channel_url})`
					})
					.setImage(info.videoDetails.thumbnails[0].url.split('?')[0])
					.setColor('Green')
					.build()
			);
			if (queue.length === 1) return player.play();
		} else {
			queue.addSong(url);
			const info = await ytdl.getInfo(url);
			interaction.reply(
				new embeds.embed()
					.setTitle('Info')
					.setDescription(`**[${info.videoDetails.title}](${info.videoDetails.video_url})をキューに追加しました。**`)
					.addFields({
						name: info.videoDetails.title,
						value: `投稿者: [${info.videoDetails.author.name}](${info.videoDetails.author.channel_url})`
					})
					.setImage(info.videoDetails.thumbnails[0].url.split('?')[0])
					.setColor('Yellow')
					.build()
			);
		}
	} else {
		interaction.reply(embeds.invaildUrl);
	}
}
