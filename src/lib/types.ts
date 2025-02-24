export type Player = {
  id: string;
  userName: string;
  isCaptain: boolean;
  team: 'Team1' | 'Team2';
}

export type GameState = {
  status: "Waiting" | "Drafting" | "Results";
  team1: string[];
  team2: string[];
  currentPick: 'Team1' | 'Team2';
  timer: number;
  players: Player[];
}

export type PartyMessage = "syncGameState" | "syncPlayerState" | "resetGame" | "pickClass"; 