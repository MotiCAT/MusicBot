import { embeds } from '../embeds';
import { client } from '../index';
import { ChatInputCommandInteraction } from 'discord.js';

//TODO: 動画を止めましたではなく終了して退室したのを通知すべきかも
export async function stopCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.guild?.members.me?.voice.channel) {
		const player = client.getPlayer(interaction.guildId!);
		player?.stop();
		interaction.reply(embeds.videoStopped);
	} else interaction.reply(embeds.videoNotPlaying);
}
