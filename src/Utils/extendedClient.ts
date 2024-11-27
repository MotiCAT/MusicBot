import { YTPlayer } from '../classes/player';
import { ClientOptions, Client } from 'discord.js';

interface ProxyOptions {
	host: string;
	port: number;
}

export class extendedClient extends Client {
	player: Map<string, YTPlayer>;
	useProxy: boolean;
	proxySettings?: ProxyOptions;

	constructor(options: ClientOptions, proxyOptions?: ProxyOptions) {
		super(options);
		this.player = new Map();
		this.useProxy = Boolean(proxyOptions);
		this.proxySettings = proxyOptions ?? undefined;
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

	public getURI(): string {
		if (this.useProxy && this.proxySettings) {
			const { host, port } = this.proxySettings;
			return `http://${host}:${port}/`;
		}
		return '';
	}
}
