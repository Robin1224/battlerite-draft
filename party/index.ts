import type * as Party from "partykit/server";
import { getName } from './utils';

type Player = {
  id: string
  userName: string,
  results: Number[]
}

type GameState = {
  status: "Waiting" | "Playing" | "Results";
  players: Player[]
}

export default class Server implements Party.Server {
  gameState: GameState = {
    status: "Waiting",
    players: []
  }
  constructor(readonly party: Party.Room) { }

  onConnect(connection: Party.Connection) {
    const player = {
      id: connection.id,
      userName: getName(),
      results: []
    }
    this.gameState.players.push(player);

    const envelope = JSON.stringify(this.gameState);
    this.party.broadcast(envelope);
  }

  async onClose(connection: Party.Connection) {
    this.gameState.players = this.gameState.players.filter(player => player.id !== connection.id);
    this.party.broadcast(JSON.stringify(this.gameState));
  }

  onMessage(message: string, sender: Party.Connection) {
    let isReadyToBroadcast = false;
    const parcel = JSON.parse(message);

    switch (parcel.message.type) {
      case "syncGameState":
        this.gameState = parcel.message.data;
        isReadyToBroadcast = true;
        break;
      case "syncPlayerState":
        let me = this.gameState.players.find(player => player.id === sender.id);
        if (me) me.results = [...parcel.message.data.results]
        const allDone = this.gameState.players.every((p) => p.results.length === 4);
        if (allDone) {
          this.gameState.status = 'Results';
          isReadyToBroadcast = true;
        }
        break;

      default:
        break;
    }

    if (isReadyToBroadcast) {
      const envelope = JSON.stringify(this.gameState);
      this.party.broadcast(envelope);
      console.log('broadcast', envelope);
    }
  }
}

Server satisfies Party.Worker;