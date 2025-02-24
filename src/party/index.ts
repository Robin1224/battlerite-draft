import type * as Party from "partykit/server";
import { getName, randomArrayItem, shuffle } from '$lib/utils';
import type { GameState } from '$lib/types';

export default class Server implements Party.Server {
  gameState: GameState;
  constructor(readonly party: Party.Room) {
    this.gameState = this.resetGame();
  }

  onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    const params = new URLSearchParams(ctx.request.url);
    const player = {
      id: connection.id,
      userName: params.get("playerName") ?? getName(),
      isCaptain: false,
      team: this.gameState.players.length < 3 ? 'Team1' : 'Team2'
    }
    this.gameState.players.push(player);

    if (player.team === 'Team1' && !this.gameState.players.find(p => p.team === 'Team1' && p.isCaptain)) {
      player.isCaptain = true;
    } else if (player.team === 'Team2' && !this.gameState.players.find(p => p.team === 'Team2' && p.isCaptain)) {
      player.isCaptain = true;
    }

    const envelope = JSON.stringify(this.gameState);
    this.party.broadcast(envelope);
  }

  async onClose(connection: Party.Connection) {
    this.gameState.players = this.gameState.players.filter(player => player.id !== connection.id);
    this.party.broadcast(JSON.stringify(this.gameState));
  }

  resetGame(): GameState {
    return {
      status: "Waiting",
      team1: [],
      team2: [],
      currentPick: 'Team1',
      timer: 0,
      players: []
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    let isReadyToBroadcast = false;
    const parcel = JSON.parse(message);

    switch (parcel.message.type) {
      case "resetGame":
        this.gameState = this.resetGame();
        isReadyToBroadcast = true;
        break;
      case "syncGameState":
        this.gameState = parcel.message.data;
        isReadyToBroadcast = true;
        break;
      case "syncPlayerState":
        let me = this.gameState.players.find(player => player.id === sender.id);
        if (me) me.results = [...parcel.message.data.results]
        const allDone = this.gameState.players.every((p) => p.results.length === this.gameState.buttons.length);
        if (allDone) {
          this.gameState.status = 'Results';
          isReadyToBroadcast = true;
        }
        break;
      case "pickClass":
        const className = parcel.message.data;
        if (this.gameState.currentPick === 'Team1') {
          this.gameState.team1.push(className);
        } else {
          this.gameState.team2.push(className);
        }
        isReadyToBroadcast = true;
        break;
      default:
        break;
    }

    if (isReadyToBroadcast) {
      const envelope = JSON.stringify(this.gameState);
      this.party.broadcast(envelope);
    }
  }
}

Server satisfies Party.Worker;
