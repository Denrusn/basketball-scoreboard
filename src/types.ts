export interface Player {
  id: string;
  number: number;
  name: string;
  points: number;
  fouls: number;
  isOnCourt: boolean;
  twoPointers: number;
  threePointers: number;
  freeThrows: number;
}

export interface Team {
  id: 'home' | 'away';
  name: string;
  shortName: string;
  color: string;
  accentColor: string;
  score: number;
  fouls: number;
  timeoutsLeft: number;
  quarterScores: number[];
  players: Player[];
}

export type GameStatus = 'ready' | 'live' | 'paused' | 'period_break' | 'final';

export interface GameSettings {
  periodMinutes: number;
  overtimeMinutes: number;
  totalRegularPeriods: number;
  shotClockSeconds: number;
  shotClockOffensiveReboundSeconds: number;
  foulsForBonus: number;
  foulsForDoubleBonus: number;
  maxTimeouts: number;
  soundEnabled: boolean;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  period: number;
  gameClockDisplay: string;
  teamId?: 'home' | 'away';
  type: 'score' | 'foul' | 'timeout' | 'period_start' | 'period_end' | 'substitution' | 'edit';
  points?: number;
  playerName?: string;
  playerNumber?: number;
  description: string;
  undoState?: {
    homeScore: number;
    awayScore: number;
    homeFouls: number;
    awayFouls: number;
    homeTimeouts: number;
    awayTimeouts: number;
    homeQuarterScores: number[];
    awayQuarterScores: number[];
    period: number;
    gameClockTenths: number;
    shotClockTenths: number;
  };
}
