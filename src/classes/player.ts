import { getSongInfo } from '../Utils/songResolver';
import { client } from '../index';
import type { Queue } from './queue';
import { queueManager } from './queue';
import { joinVoiceChannel, createAudioPlayer } from '@discordjs/voice';
import { createAudioResource, StreamType, AudioPlayerStatus, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import ytdl from '@distube/ytdl-core';
import { Snowflake, VoiceBasedChannel } from 'discord.js';

export class YTPlayer {
	private connection: import('@discordjs/voice').VoiceConnection;
	public player: import('@discordjs/voice').AudioPlayer;
	public serverId: Snowflake;
	public messageChannelId: Snowflake;
	public queue: Queue;
	public volume: number;
	public isPlaying: boolean;
	public resource: import('@discordjs/voice').AudioResource | null;
	constructor(serverId: Snowflake, voiceChannel: VoiceBasedChannel, messageChannelId: Snowflake) {
		this.isPlaying = false;
		this.serverId = serverId;
		this.messageChannelId = messageChannelId;
		this.connection = joinVoiceChannel({
			adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
			channelId: voiceChannel.id,
			guildId: serverId,
			selfDeaf: true,
			selfMute: false
		});
		this.player = createAudioPlayer();
		this.queue = queueManager.getQueue(serverId) as Queue;
		this.volume = 0.1;
		this.player
			.on('subscribe', () => {
				this.isPlaying = true;
			})
			.on('unsubscribe', () => {
				this.isPlaying = false;
			})
			.on(AudioPlayerStatus.Idle, () => this.playNextSong());
		this.resource = null;
	}

	public play() {
		const queue = queueManager.getQueue(this.serverId);
		const stream = ytdl(ytdl.getURLVideoID(queue?.currentSong as string), {
			filter: (format) => format.audioCodec === 'opus' && format.container === 'webm',
			quality: 'highest',
			highWaterMark: 32 * 1024 * 1024
		});
		this.resource = createAudioResource(stream, {
			inputType: StreamType.WebmOpus,
			inlineVolume: true
		});
		this.resource.volume?.setVolume(this.volume);
		this.connection.subscribe(this.player);
		this.player.play(this.resource);
	}

	public pause(): void {
		this.player.pause();
	}

	public resume(): void {
		this.player.unpause();
	}

	public stop(): void {
		this.connection.destroy();
		queueManager.deleteQueue(this.serverId);
		client.player = undefined;
	}

	public skip(): void {
		this.playNextSong();
	}

	public changeVolume(volume: number): void {
		if (!this.resource) return;
		this.volume = volume;
		this.resource.volume?.setVolume(volume / 10);
	}

	private async playNextSong(): Promise<void> {
		if (this.queue.loop === 'none') {
			if (!this.queue.store.length) return;
			else {
				if (this.queue.store.length >= 1) this.queue.removeSong(0);
				if (!this.queue.store.length) return this.stop();
				await this.fetchSongData();
				return this.play();
			}
		}
		if (this.queue.loop === 'queue') this.queue.loopQueue();
		if (this.queue.loop === 'track') this.queue.loopTrack();
		this.play();
		await this.fetchSongData();
	}

	private async fetchSongData() {
		const channel = client.channels.cache.get(this.messageChannelId);
		if (!channel || !channel.isTextBased()) return;
		if (channel.isTextBased() && 'send' in channel) {
			await channel.send(await getSongInfo(this.queue.currentSong!));
		}
	}
}
