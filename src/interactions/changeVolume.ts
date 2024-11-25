import { embeds } from '../embeds';
import { client } from '../index';
import { ChatInputCommandInteraction } from 'discord.js';

export async function changeVolumeCommand(interaction: ChatInputCommandInteraction) {
	const player = client.getPlayer(interaction.guildId!);
	if (!player) return interaction.reply(embeds.videoNotPlaying);

	const vol = interaction.options.getInteger('volume');
	if (!vol) return interaction.reply({ content: `現在の音量は${player.volume * 10}です。` });
	if (vol >= 100) {
		player.changeVolume(100 / 10);
		return interaction.reply({ content: 'ボリュームを最大に設定しました。' });
	}

	if (vol <= 0) {
		player.changeVolume(0);
		return interaction.reply({ content: 'ミュートに設定しました。' });
	}

	player.changeVolume(vol / 10);
	return interaction.reply({ content: `ボリュームを${vol}に変更しました。` });
}
