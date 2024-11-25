import { Queue, queueManager } from '../classes/queue';
import { VoiceState } from 'discord.js';

export async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
		const oldchannel = oldState.channel;
		const newchannel = newState.channel;

		console.log(`[INFO] Old Channel: ${oldchannel?.name} | New Channel: ${newchannel?.name}
        `);
	if (!queueManager.getQueue(newState.guild.id)) queueManager.setQueue(newState.guild.id, new Queue());
}
