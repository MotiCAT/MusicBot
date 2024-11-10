import { songResolver } from '../Utils/songResolver';
import { embeds } from '../embeds';
import ytdl from '@distube/ytdl-core';
import { Message } from 'discord.js';

export async function debugCommand(message: Message) {
	const url = message.content.split(' ')[1];
	if (!url) return message.reply(embeds.noUrl);
	if (!ytdl.validateURL(url)) return message.reply(embeds.invaildUrl);
	const info = await ytdl.getInfo(url);
	console.table(songResolver(info));
}
