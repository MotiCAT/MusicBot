import { extendedClient } from '../Utils/extendedClient';
import { version as voiceVersion } from '@discordjs/voice';
import { version as djsVersion } from 'discord.js';

export function onReady(client: extendedClient): void {
	console.log(`Logged in as ${client.user?.tag}`);
	client.user?.setActivity('CatHouse Products');
	console.table({
		'Bot User': client.user?.tag,
		'Guild(s)': client.guilds.cache.size + ' Servers',
		Watching: client.guilds.cache.reduce((a, b) => a + b.memberCount, 0) + ' Members',
		'Discord.js': djsVersion,
		'@discordjs/voice': voiceVersion,
		Proxy: client.useProxy ? client.getURI() : 'No Proxy',
		'Node.js': process.version,
		Plattform: process.platform + ' | ' + process.arch,
		Memory:
			(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) +
			'MB | ' +
			(process.memoryUsage().rss / 1024 / 1024).toFixed(2) +
			'MB'
		// Quote from: https://github.com/Nich87/Faith
	});
}
