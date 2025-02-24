import PartySocket from 'partysocket';
import type { PartyMessage, GameState, Player } from '$lib/types';
import { randomArrayItem } from '$lib';
import { dev } from '$app/environment';

class Room {
  socket: PartySocket | undefined = $state();
  gameState: GameState = $state({
    status: 'Waiting',
    buttonCount: 0,
    buttons: [],
    players: []
  });
  me: Player | undefined = $derived(this.gameState?.players.find((p) => p.id === this.socket?.id));
  isHost: boolean = $derived(this.me?.id === this.gameState?.players[0]?.id);

  join(room: string, name: string) {
    this.socket = new PartySocket({
      // @ts-ignore
      host: "http://0.0.0.0:1999",
      room,
      query: {
        playerName: name
      }
    });

    // listen to the server's broadcasts (this.party.broadcast)
    this.socket.addEventListener('message', (event) => {
      this.gameState = JSON.parse(event.data);
    });
  }

  leave() {
    if (!this.socket) return;

    this.socket.removeEventListener('message', () => { });
    this.socket.close();
    this.socket = undefined;
  }

  emitPartyMessage(type: PartyMessage) {
    if (!this.socket) return;

    const data = type === 'syncPlayerState' ? this.me : this.gameState;

    const parcel = JSON.stringify({
      message: {
        type,
        data
      },
      id: this.socket.id
    });
    this.socket.send(parcel);

  }

  startGame() {
    this.gameState.status = 'Playing';
    this.emitPartyMessage('syncGameState');
  }

  endGame() {
    this.emitPartyMessage('syncPlayerState');
  }

  resetGame() {
    this.emitPartyMessage('resetGame');
  }

  startDraft() {
    this.gameState.status = 'Drafting';
    this.gameState.currentPick = 'Team1';
    this.gameState.timer = 30;
    this.emitPartyMessage('syncGameState');
    this.startTimer();
  }

  startTimer() {
    const timerInterval = setInterval(() => {
      this.gameState.timer--;
      this.emitPartyMessage('syncGameState');
      if (this.gameState.timer === 0) {
        clearInterval(timerInterval);
        this.switchTeam();
      }
    }, 1000);
  }

  switchTeam() {
    if (this.gameState.currentPick === 'Team1') {
      this.gameState.currentPick = 'Team2';
    } else {
      this.gameState.currentPick = 'Team1';
    }
    this.gameState.timer = 30;
    this.emitPartyMessage('syncGameState');
    this.startTimer();
  }

  pickClass(className: string) {
    if (this.gameState.currentPick === 'Team1') {
      this.gameState.team1.push(className);
    } else {
      this.gameState.team2.push(className);
    }
    this.emitPartyMessage('pickClass', className);
    if (this.gameState.team1.length + this.gameState.team2.length === 6) {
      this.gameState.status = 'Results';
    } else {
      this.switchTeam();
    }
  }

}

export const room = new Room();