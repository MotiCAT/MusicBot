import { YTPlayer } from '../classes/player';
import { ClientOptions, Client } from 'discord.js';

export class extendedClient extends Client {
	player: Map<string, YTPlayer>;
	constructor(options: ClientOptions) {
		super(options);
		this.player = new Map();
	}

	public setPlayer(serverId: string, player: YTPlayer): void {
		this.player.set(serverId, player);
	}

	public getPlayer(serverId: string): YTPlayer | undefined {
		return this.player.get(serverId);
	}

	public deletePlayer(serverId: string): boolean {
		return this.player.delete(serverId);
	}
}
