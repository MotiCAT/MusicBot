import { embeds } from '../embeds';
import { interactions } from '../interactions';
import { BaseInteraction, Awaitable, ChannelType, GuildMember } from 'discord.js';

export async function onInteractionCreate(interaction: BaseInteraction): Promise<Awaitable<void>> {
	if (interaction.isStringSelectMenu()) {
		switch (interaction.customId) {
			case 'help':
				interactions.helpmenu(interaction);
				break;
			case 'search':
				interactions.searchplay(interaction);
				break;
			default:
				interaction.reply(embeds.unknownCommand);
				break;
		}
	}
	if (!interaction.isChatInputCommand()) return;
	if (!interaction.guild) {
		interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
		return;
	}
	const commandName = interaction.commandName;
	if (commandName === 'help') {
		interactions.help(interaction);
		return;
	}
	if (!(interaction.member instanceof GuildMember)) return;
	const channel = interaction.member?.voice.channel;
	if (!channel) {
		interaction.reply(embeds.voiceChannelJoin);
		return;
	}
	if (channel.type !== ChannelType.GuildVoice) return;
	if (!channel.speakable) {
		interaction.reply(embeds.voiceChannnelPermission);
		return;
	}

	switch (commandName) {
		case 'play':
			interactions.play(interaction);
			break;
		case 'stop':
			interactions.stop(interaction);
			break;
		case 'pause':
			interactions.pause(interaction);
			break;
		case 'resume':
			interactions.resume(interaction);
			break;
		case 'loop':
			interactions.loop(interaction);
			break;
		case 'skip':
			interactions.skip(interaction);
			break;
		case 'queue':
			interactions.queue(interaction);
			break;
		case 'volume':
			interactions.changeVolume(interaction);
			break;
		case 'nowplaying':
			interactions.nowplaying(interaction);
			break;
		case 'search':
			interactions.search(interaction);
			break;
		default:
			interaction.reply(embeds.unknownCommand);
			break;
	}
}
