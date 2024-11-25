import { embeds } from '../embeds';
import { client } from '../index';
import { Message } from 'discord.js';

export async function changeVolumeCommand(message: Message) {
	const player = client.getPlayer(message.guildId!);
	if (!player) return message.reply(embeds.videoNotPlaying);

	const content = message.content.split(' ');
	const vol = parseFloat(content[1]);

	if (isNaN(vol)) return message.reply({ content: `現在の音量は${player.volume * 10}です。` });

	if (vol > 100) {
		player.changeVolume(100 / 10);
		return message.reply({ content: 'ボリュームを最大に設定しました。' });
	} else if (vol < 0) {
		player.changeVolume(0);
		return message.reply({ content: 'ミュートに設定しました。' });
	}

	player.changeVolume(vol / 10);
	return message.reply({ content: `ボリュームを${vol}に変更しました。` });
}
