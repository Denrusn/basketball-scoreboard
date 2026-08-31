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
  color: string; // Hex or tailwind color class
  accentColor: string;
  score: number;
  fouls: number;
  timeoutsLeft: number;
  quarterScores: number[]; // Index 0: Q1, Index 1: Q2, ...
  players: Player[];
}

export type Possession = 'home' | 'away' | 'none';

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
  type: 'score' | 'foul' | 'timeout' | 'period_start' | 'period_end' | 'possession' | 'substitution' | 'edit';
  points?: number;
  playerName?: string;
  playerNumber?: number;
  description: string;
  // Snapshot for undo
  undoState?: {
    homeScore: number;
    awayScore: number;
    homeFouls: number;
    awayFouls: number;
    homeTimeouts: number;
    awayTimeouts: number;
    homeQuarterScores: number[];
    awayQuarterScores: number[];
    possession: Possession;
    period: number;
    gameClockTenths: number;
    shotClockTenths: number;
  };
}
