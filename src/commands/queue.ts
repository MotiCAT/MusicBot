import { songResolver } from '../Utils/songResolver';
import { Queue, queueManager } from '../classes/queue';
import { embeds } from '../embeds';
import { client } from '../index';
import ytdl from '@distube/ytdl-core';
import { Message } from 'discord.js';

export async function queueCommand(message: Message) {
	const player = client.getPlayer(message.guildId!);
	if (!player) return message.reply(embeds.videoNotPlaying);
	const queue = queueManager.getQueue(message.guildId!) as Queue;

	const embed = new embeds.embed().setTitle('Queue').setColor('Blue').setTimestamp();
	for (let i = 0; i < queue.length; i++) {
		const url = queue.store[i];
		const info = await ytdl.getInfo(url);
		const song = songResolver(info, message.author.username, message.author.displayAvatarURL()!);
		embed.addFields({
			name: `${i + 1}. ${song.title}`,
			value: `[${song.author}](${song.authorUrl})`
		});
		embed.setFooter({
			text: `Queue: ${queue.store.length} songs`
		});
	}
	message.reply(embed.build());
}
