import { format_count, seconds_to_time } from '../Utils/NumberUtil';
import { client } from '../index';
import { Builder } from './Builder';
import ytdl from '@distube/ytdl-core';

export function songResolver(info: ytdl.videoInfo, requestedBy?: string, requestedByAvatar?: string) {
	return {
		title: info.videoDetails.title,
		url: info.videoDetails.video_url,
		thumbnail: info.videoDetails.thumbnails[0].url.split('?')[0],
		duration: seconds_to_time(Number(info.videoDetails.lengthSeconds)),
		author: info.videoDetails.author.name,
		authorUrl: info.videoDetails.author.channel_url,
		views: format_count(Number(info.videoDetails.viewCount)),
		requestedBy: requestedBy ?? '',
		requestedByAvatar: requestedByAvatar ?? ''
	};
}

export async function getSongInfo(url: string) {
	const info = await ytdl.getInfo(url);
	const song = songResolver(info);
	const currentDuration = seconds_to_time(Math.round(Number(client.player?.resource?.playbackDuration) / 1000));

	const embed = new Builder()
		.setTitle(song.title)
		.setURL(song.url)
		.setThumbnail(song.thumbnail)
		.addFields(
			{ name: '投稿者', value: `[${song.author}](${song.authorUrl})` },
			{ name: '再生時間', value: song.duration, inline: true },
			{ name: '再生回数', value: song.views, inline: true },
			{ name: '現在の位置', value: currentDuration, inline: false }
		)
		.setColor('Green');

	return embed.build();
}
