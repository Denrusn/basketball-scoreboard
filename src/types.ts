export interface Player {
  id: string;
  number: number;
  name: string;
  points: number;
  fouls: number;
  rebounds: number;
  assists: number;
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
  rebounds: number;
  assists: number;
  timeoutsLeft: number;
  quarterScores: number[];
  players: Player[];
}

export type GameStatus = 'ready' | 'live' | 'paused' | 'period_break' | 'final';

export type MatchMode = 'time' | 'target_score';

export interface GameSettings {
  matchMode: MatchMode; // 'time' or 'target_score'
  targetScorePerPeriod: number; // target points for a single period (e.g. 20, 25, 30 or custom, default 30)
  periodMinutes: number;
  overtimeMinutes: number;
  totalRegularPeriods: number;
  useShotClock: boolean; // Whether shot clock (24s/14s) is enabled (amateur friendly)
  shotClockSeconds: number;
  shotClockOffensiveReboundSeconds: number;
  foulsForBonus: number;
  foulsForDoubleBonus: number;
  maxTimeouts: number;
  soundEnabled: boolean;
  voiceAnnouncementsEnabled?: boolean; // 关键节点语音播报 (每节最后2分钟和1分钟)
  panelOpacity: number; // 0 to 100 percentage
}

export interface GameEvent {
  id: string;
  timestamp: number;
  period: number;
  gameClockDisplay: string;
  teamId?: 'home' | 'away';
  type: 'score' | 'foul' | 'timeout' | 'period_start' | 'period_end' | 'substitution' | 'edit' | 'rebound' | 'assist' | 'time_announcement';
  points?: number;
  playerName?: string;
  playerNumber?: number;
  description: string;
  homeScore?: number;
  awayScore?: number;
  undoState?: {
    homeScore: number;
    awayScore: number;
    homeFouls: number;
    awayFouls: number;
    homeRebounds?: number;
    awayRebounds?: number;
    homeAssists?: number;
    awayAssists?: number;
    homeTimeouts: number;
    awayTimeouts: number;
    homeQuarterScores: number[];
    awayQuarterScores: number[];
    homePlayers?: Player[];
    awayPlayers?: Player[];
    period: number;
    gameClockTenths: number;
    shotClockTenths: number;
  };
}
