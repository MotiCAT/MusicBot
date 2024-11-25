import { format_count, seconds_to_time } from '../Utils/NumberUtil';
import { YTPlayer } from '../classes/player';
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

export function formatProgressBar(current: number, total: number, barLength: number = 20): string {
	const progress = Math.round((current / total) * barLength);
	const empty = Math.max(barLength - progress, 0); // `empty` が負にならないように修正
	const filled = '█'.repeat(progress); // 進行中部分（█）
	const unfilled = '░'.repeat(empty); // 残り部分（░）

	return `${seconds_to_time(current)} [${filled}${unfilled}] ${seconds_to_time(total)} (${Math.round((current / total) * 100)}%)`;
}

export async function getSongInfo(url: string, serverId: string) {
	const info = await ytdl.getInfo(url);
	const song = songResolver(info);
	const player = client.getPlayer(serverId) as YTPlayer;

	// currentDuration が undefined または NaN の場合、デフォルトで 0 を設定
	const currentDuration = Number(player.resource?.playbackDuration)
		? Math.round(Number(player.resource?.playbackDuration) / 1000)
		: 0;
	const totalDuration = Number(info.videoDetails.lengthSeconds);

	const progressBar = formatProgressBar(currentDuration, totalDuration);

	// 次の曲がキューにあるか確認
	const nextSong = (await ytdl.validateURL(player?.queue.store[1] as string))
		? await ytdl.getInfo(player.queue.store[1] as string)
		: null;

	let footerText = '次の曲はありません';
	if (nextSong) {
		const nextSongInfo = songResolver(nextSong);
		footerText = `次の曲: ${nextSongInfo.title}`;
	}

	const embed = new Builder()
		.setTitle(song.title)
		.setURL(song.url)
		.setThumbnail(song.thumbnail)
		.addFields(
			{ name: '投稿者', value: `[${song.author}](${song.authorUrl})` },
			{ name: '再生時間', value: song.duration, inline: true },
			{ name: '再生回数', value: song.views, inline: true },
			{ name: '再生位置', value: progressBar, inline: false }
		)
		.setColor('Green')
		.setFooter({ text: footerText });

	return embed.build();
}
