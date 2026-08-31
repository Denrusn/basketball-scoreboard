import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameSettings, Team, GameEvent } from './types';
import { ScoreboardHeader } from './components/ScoreboardHeader';
import { TeamCard } from './components/TeamCard';
import { GameClock } from './components/GameClock';
import { ShotClock } from './components/ShotClock';
import { EventLog } from './components/EventLog';
import { RosterStatsModal } from './components/RosterStatsModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { GameSummaryModal } from './components/GameSummaryModal';
import { BasketballCourtBackground } from './components/BasketballCourtBackground';
import { RotateCcw, AlertCircle, HelpCircle, ShieldCheck, Check } from 'lucide-react';
import { playStadiumHorn, playWhistle, playShotClockBuzzer, playScoreBeep } from './utils/audio';

const STORAGE_KEY = 'basketball_live_match_state_v1';

interface SavedState {
  settings: GameSettings;
  period: number;
  homeTeam: Team;
  awayTeam: Team;
  gameClockTenths: number;
  shotClockTenths: number;
  events: GameEvent[];
  lastSavedAt: number;
}

const loadSavedState = (): SavedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.homeTeam && parsed.awayTeam) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load saved scoreboard state', err);
  }
  return null;
};

const INITIAL_SETTINGS: GameSettings = {
  periodMinutes: 10,
  overtimeMinutes: 5,
  totalRegularPeriods: 4,
  useShotClock: true,
  shotClockSeconds: 24,
  shotClockOffensiveReboundSeconds: 14,
  foulsForBonus: 5,
  foulsForDoubleBonus: 7,
  maxTimeouts: 5,
  soundEnabled: true,
  panelOpacity: 75,
};

const INITIAL_HOME_TEAM: Team = {
  id: 'home',
  name: '主队 (HOME)',
  shortName: '主队',
  color: '#EF4444',
  accentColor: '#991B1B',
  score: 0,
  fouls: 0,
  timeoutsLeft: 5,
  quarterScores: [0, 0, 0, 0],
  players: [
    { id: 'h1', number: 7, name: '1号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h2', number: 11, name: '2号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h3', number: 23, name: '3号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h4', number: 30, name: '4号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h5', number: 35, name: '5号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
  ],
};

const INITIAL_AWAY_TEAM: Team = {
  id: 'away',
  name: '客队 (AWAY)',
  shortName: '客队',
  color: '#3B82F6',
  accentColor: '#1D4ED8',
  score: 0,
  fouls: 0,
  timeoutsLeft: 5,
  quarterScores: [0, 0, 0, 0],
  players: [
    { id: 'a1', number: 1, name: '1号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a2', number: 3, name: '2号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a3', number: 8, name: '3号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a4', number: 13, name: '4号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a5', number: 24, name: '5号球员', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
  ],
};

export default function App() {
  const initialSaved = useMemo(() => loadSavedState(), []);

  const [settings, setSettings] = useState<GameSettings>(initialSaved?.settings ?? INITIAL_SETTINGS);
  const [period, setPeriod] = useState<number>(initialSaved?.period ?? 1);
  const [homeTeam, setHomeTeam] = useState<Team>(initialSaved?.homeTeam ?? INITIAL_HOME_TEAM);
  const [awayTeam, setAwayTeam] = useState<Team>(initialSaved?.awayTeam ?? INITIAL_AWAY_TEAM);

  // Clocks in tenths (10 tenths = 1 second)
  const [gameClockTenths, setGameClockTenths] = useState<number>(
    initialSaved?.gameClockTenths ?? (initialSaved?.settings ?? INITIAL_SETTINGS).periodMinutes * 60 * 10
  );
  const [shotClockTenths, setShotClockTenths] = useState<number>(
    initialSaved?.shotClockTenths ?? (initialSaved?.settings ?? INITIAL_SETTINGS).shotClockSeconds * 10
  );
  const [isGameClockRunning, setIsGameClockRunning] = useState<boolean>(false);
  const [isShotClockRunning, setIsShotClockRunning] = useState<boolean>(false);

  // Big screen / Stage mode toggle
  const [isStageMode, setIsStageMode] = useState<boolean>(false);

  // Events History & Undo Stack
  const [events, setEvents] = useState<GameEvent[]>(initialSaved?.events ?? []);

  // Notice for restored session
  const [showRestoreToast, setShowRestoreToast] = useState<boolean>(
    Boolean(initialSaved && (initialSaved.homeTeam.score > 0 || initialSaved.awayTeam.score > 0 || initialSaved.events.length > 0))
  );

  // Modals
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);

  // Anti-Refresh & Accidental Leave Protection (Browser Dialog)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isGameActive =
        homeTeam.score > 0 ||
        awayTeam.score > 0 ||
        homeTeam.fouls > 0 ||
        awayTeam.fouls > 0 ||
        events.length > 0 ||
        isGameClockRunning ||
        period > 1 ||
        gameClockTenths !== settings.periodMinutes * 60 * 10;

      if (isGameActive) {
        e.preventDefault();
        // Modern browser standard for showing confirmation before reload/close
        const confirmationMessage = '比赛正在进行中，刷新页面可能导致当前比分与计时数据丢失，是否确认刷新？';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [homeTeam, awayTeam, events, isGameClockRunning, period, gameClockTenths, settings.periodMinutes]);

  // Automatic LocalStorage Persistence Protection
  useEffect(() => {
    const isGameModified =
      homeTeam.score > 0 ||
      awayTeam.score > 0 ||
      homeTeam.fouls > 0 ||
      awayTeam.fouls > 0 ||
      events.length > 0 ||
      period > 1 ||
      gameClockTenths !== settings.periodMinutes * 60 * 10;

    if (isGameModified) {
      try {
        const stateToSave: SavedState = {
          settings,
          period,
          homeTeam,
          awayTeam,
          gameClockTenths,
          shotClockTenths,
          events,
          lastSavedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        // Silently catch quota or privacy restriction errors
      }
    }
  }, [settings, period, homeTeam, awayTeam, gameClockTenths, shotClockTenths, events]);

  // Format clock for history log
  const formatGameClockDisplay = (tenthsLeft: number) => {
    const totalSeconds = Math.floor(tenthsLeft / 10);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Helper to record an event with full snapshot for undo and score trend
  const recordEvent = useCallback(
    (
      type: GameEvent['type'],
      description: string,
      teamId?: 'home' | 'away',
      points?: number,
      playerName?: string,
      playerNumber?: number,
      exactScores?: { home: number; away: number }
    ) => {
      const curHome = exactScores ? exactScores.home : homeTeam.score;
      const curAway = exactScores ? exactScores.away : awayTeam.score;

      const newEvent: GameEvent = {
        id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
        period,
        gameClockDisplay: formatGameClockDisplay(gameClockTenths),
        teamId,
        type,
        points,
        playerName,
        playerNumber,
        description,
        homeScore: curHome,
        awayScore: curAway,
        undoState: {
          homeScore: homeTeam.score,
          awayScore: awayTeam.score,
          homeFouls: homeTeam.fouls,
          awayFouls: awayTeam.fouls,
          homeTimeouts: homeTeam.timeoutsLeft,
          awayTimeouts: awayTeam.timeoutsLeft,
          homeQuarterScores: [...homeTeam.quarterScores],
          awayQuarterScores: [...awayTeam.quarterScores],
          period,
          gameClockTenths,
          shotClockTenths,
        },
      };

      setEvents((prev) => [newEvent, ...prev]);
    },
    [period, gameClockTenths, homeTeam, awayTeam, shotClockTenths]
  );

  // Sound triggers
  const triggerHorn = useCallback(() => {
    if (settings.soundEnabled) {
      playStadiumHorn();
    }
  }, [settings.soundEnabled]);

  const triggerWhistle = useCallback(() => {
    if (settings.soundEnabled) {
      playWhistle();
    }
  }, [settings.soundEnabled]);

  const triggerShotBuzzer = useCallback(() => {
    if (settings.soundEnabled) {
      playShotClockBuzzer();
    }
  }, [settings.soundEnabled]);

  const triggerScoreBeep = useCallback((pts: number) => {
    if (settings.soundEnabled) {
      playScoreBeep(pts);
    }
  }, [settings.soundEnabled]);

  // Main Timer Interval Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isGameClockRunning) {
      interval = setInterval(() => {
        // Decrement Game Clock
        setGameClockTenths((prevGame) => {
          if (prevGame <= 1) {
            setIsGameClockRunning(false);
            setIsShotClockRunning(false);
            triggerHorn();
            recordEvent('period_end', `第 ${period} 节比赛结束！`);
            return 0;
          }
          return prevGame - 1;
        });

        // Decrement Shot Clock if running and enabled
        if (settings.useShotClock && isShotClockRunning) {
          setShotClockTenths((prevShot) => {
            if (prevShot <= 1) {
              setIsShotClockRunning(false);
              triggerShotBuzzer();
              recordEvent('period_end', `24秒进攻时间到 (Shot Clock Violation)`);
              return 0;
            }
            return prevShot - 1;
          });
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameClockRunning, isShotClockRunning, period, settings.useShotClock, triggerHorn, triggerShotBuzzer, recordEvent]);

  // Handle Game Clock Play / Pause
  const handleToggleGameClock = () => {
    if (!isGameClockRunning && gameClockTenths === 0) {
      const minutes = period > settings.totalRegularPeriods ? settings.overtimeMinutes : settings.periodMinutes;
      setGameClockTenths(minutes * 60 * 10);
      if (settings.useShotClock) {
        setShotClockTenths(settings.shotClockSeconds * 10);
      }
      setIsGameClockRunning(true);
      setIsShotClockRunning(settings.useShotClock);
      return;
    }

    const nextState = !isGameClockRunning;
    setIsGameClockRunning(nextState);
    if (settings.useShotClock) {
      setIsShotClockRunning(nextState);
    } else {
      setIsShotClockRunning(false);
    }

    if (nextState) {
      triggerWhistle();
    }
  };

  const handleResetGameClock = () => {
    const minutes = period > settings.totalRegularPeriods ? settings.overtimeMinutes : settings.periodMinutes;
    setGameClockTenths(minutes * 60 * 10);
    setIsGameClockRunning(false);
  };

  const handleAdjustGameClock = (deltaSeconds: number) => {
    setGameClockTenths((prev) => Math.max(0, prev + deltaSeconds * 10));
  };

  const handleSetExactGameClock = (minutes: number, seconds: number, tenths = 0) => {
    setGameClockTenths((minutes * 60 + seconds) * 10 + tenths);
  };

  // Handle Shot Clock
  const handleToggleShotClockEnabled = () => {
    setSettings((prev) => {
      const nextUseShotClock = !prev.useShotClock;
      if (!nextUseShotClock) {
        setIsShotClockRunning(false);
      } else {
        setShotClockTenths(prev.shotClockSeconds * 10);
        if (isGameClockRunning) {
          setIsShotClockRunning(true);
        }
      }
      return {
        ...prev,
        useShotClock: nextUseShotClock,
      };
    });
  };

  const handleResetShotClock24 = () => {
    if (!settings.useShotClock) {
      setSettings((prev) => ({ ...prev, useShotClock: true }));
    }
    setShotClockTenths(settings.shotClockSeconds * 10);
    if (isGameClockRunning) {
      setIsShotClockRunning(true);
    }
  };

  const handleResetShotClock14 = () => {
    if (!settings.useShotClock) {
      setSettings((prev) => ({ ...prev, useShotClock: true }));
    }
    setShotClockTenths(settings.shotClockOffensiveReboundSeconds * 10);
    if (isGameClockRunning) {
      setIsShotClockRunning(true);
    }
  };

  const handleToggleShotClock = () => {
    if (!settings.useShotClock) return;
    setIsShotClockRunning((prev) => !prev);
  };

  const handleAdjustShotClock = (deltaSeconds: number) => {
    if (!settings.useShotClock) return;
    setShotClockTenths((prev) => Math.max(0, prev + deltaSeconds * 10));
  };

  // Period management
  const handleSetPeriod = (newPeriod: number) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);

    // Expand quarter scores array if needed
    if (newPeriod > homeTeam.quarterScores.length) {
      setHomeTeam((prev) => ({
        ...prev,
        quarterScores: [...prev.quarterScores, 0],
      }));
      setAwayTeam((prev) => ({
        ...prev,
        quarterScores: [...prev.quarterScores, 0],
      }));
    }

    const minutes = newPeriod > settings.totalRegularPeriods ? settings.overtimeMinutes : settings.periodMinutes;
    setGameClockTenths(minutes * 60 * 10);
    if (settings.useShotClock) {
      setShotClockTenths(settings.shotClockSeconds * 10);
    }
    setIsGameClockRunning(false);
    setIsShotClockRunning(false);

    // Reset team fouls for new period
    setHomeTeam((prev) => ({ ...prev, fouls: 0 }));
    setAwayTeam((prev) => ({ ...prev, fouls: 0 }));

    recordEvent('period_start', `进入第 ${newPeriod} 节比赛`);
  };

  const handleNextPeriod = () => {
    handleSetPeriod(period + 1);
  };

  // Scoring Handler
  const handleScore = (teamId: 'home' | 'away', points: number, playerId?: string) => {
    const isHome = teamId === 'home';
    const targetTeam = isHome ? homeTeam : awayTeam;
    const newScore = Math.max(0, targetTeam.score + points);

    // Update quarter score breakdown
    const qIndex = period - 1;
    const currentQScore = targetTeam.quarterScores[qIndex] || 0;
    const newQScore = Math.max(0, currentQScore + points);

    const newQuarterScores = [...targetTeam.quarterScores];
    while (newQuarterScores.length <= qIndex) {
      newQuarterScores.push(0);
    }
    newQuarterScores[qIndex] = newQScore;

    // Update Player stats if specified
    let updatedPlayers = [...targetTeam.players];
    let scoredPlayerName: string | undefined = undefined;
    let scoredPlayerNumber: number | undefined = undefined;

    if (playerId) {
      updatedPlayers = updatedPlayers.map((p) => {
        if (p.id === playerId) {
          scoredPlayerName = p.name;
          scoredPlayerNumber = p.number;
          return {
            ...p,
            points: Math.max(0, p.points + points),
            threePointers: points === 3 ? p.threePointers + 1 : p.threePointers,
            twoPointers: points === 2 ? p.twoPointers + 1 : p.twoPointers,
            freeThrows: points === 1 ? p.freeThrows + 1 : p.freeThrows,
          };
        }
        return p;
      });
    }

    if (isHome) {
      setHomeTeam((prev) => ({
        ...prev,
        score: newScore,
        quarterScores: newQuarterScores,
        players: updatedPlayers,
      }));
    } else {
      setAwayTeam((prev) => ({
        ...prev,
        score: newScore,
        quarterScores: newQuarterScores,
        players: updatedPlayers,
      }));
    }

    if (points > 0) {
      triggerScoreBeep(points);
      // Auto reset 24s shot clock after score if enabled
      if (settings.useShotClock) {
        setShotClockTenths(settings.shotClockSeconds * 10);
      }
    }

    const desc = playerId
      ? `#${scoredPlayerNumber} ${scoredPlayerName} ${points > 0 ? `+${points}分` : `${points}分`} (${points === 3 ? '三分命中' : points === 2 ? '两分投进' : '罚球得分'})`
      : `${points > 0 ? `+${points}分` : `${points}分`} 得分`;

    const updatedHomeScore = isHome ? newScore : homeTeam.score;
    const updatedAwayScore = !isHome ? newScore : awayTeam.score;

    recordEvent('score', desc, teamId, points, scoredPlayerName, scoredPlayerNumber, {
      home: updatedHomeScore,
      away: updatedAwayScore,
    });
  };

  // Foul Handler
  const handleFoul = (teamId: 'home' | 'away', delta: number, playerId?: string) => {
    const isHome = teamId === 'home';
    const targetTeam = isHome ? homeTeam : awayTeam;
    const newFouls = Math.max(0, targetTeam.fouls + delta);

    let updatedPlayers = [...targetTeam.players];
    let fouledPlayerName: string | undefined = undefined;
    let fouledPlayerNumber: number | undefined = undefined;

    if (playerId) {
      updatedPlayers = updatedPlayers.map((p) => {
        if (p.id === playerId) {
          fouledPlayerName = p.name;
          fouledPlayerNumber = p.number;
          return {
            ...p,
            fouls: Math.max(0, p.fouls + delta),
          };
        }
        return p;
      });
    }

    if (isHome) {
      setHomeTeam((prev) => ({ ...prev, fouls: newFouls, players: updatedPlayers }));
    } else {
      setAwayTeam((prev) => ({ ...prev, fouls: newFouls, players: updatedPlayers }));
    }

    if (delta > 0) {
      triggerWhistle();
    }

    const desc = playerId
      ? `#${fouledPlayerNumber} ${fouledPlayerName} 累计犯规 (${delta > 0 ? '+1' : '-1'})`
      : `球队犯规 (${delta > 0 ? '+1' : '-1'})`;

    recordEvent('foul', desc, teamId, undefined, fouledPlayerName, fouledPlayerNumber);
  };

  // Timeout Handlers
  const handleTimeout = (teamId: 'home' | 'away') => {
    const isHome = teamId === 'home';
    const targetTeam = isHome ? homeTeam : awayTeam;
    if (targetTeam.timeoutsLeft <= 0) return;

    const newTimeouts = targetTeam.timeoutsLeft - 1;
    if (isHome) {
      setHomeTeam((prev) => ({ ...prev, timeoutsLeft: newTimeouts }));
    } else {
      setAwayTeam((prev) => ({ ...prev, timeoutsLeft: newTimeouts }));
    }

    setIsGameClockRunning(false);
    setIsShotClockRunning(false);
    triggerHorn();

    recordEvent('timeout', `请求暂停 (剩余 ${newTimeouts} 次)`, teamId);
  };

  const handleAddTimeoutBack = (teamId: 'home' | 'away') => {
    const isHome = teamId === 'home';
    const targetTeam = isHome ? homeTeam : awayTeam;
    if (targetTeam.timeoutsLeft >= settings.maxTimeouts) return;

    const newTimeouts = targetTeam.timeoutsLeft + 1;
    if (isHome) {
      setHomeTeam((prev) => ({ ...prev, timeoutsLeft: newTimeouts }));
    } else {
      setAwayTeam((prev) => ({ ...prev, timeoutsLeft: newTimeouts }));
    }
  };

  // Undo Handler
  const handleUndo = () => {
    if (events.length === 0) return;
    const [lastEvent, ...remainingEvents] = events;
    if (lastEvent && lastEvent.undoState) {
      const {
        homeScore,
        awayScore,
        homeFouls,
        awayFouls,
        homeTimeouts,
        awayTimeouts,
        homeQuarterScores,
        awayQuarterScores,
        period: snapPeriod,
        gameClockTenths: snapGameClock,
        shotClockTenths: snapShotClock,
      } = lastEvent.undoState;

      setHomeTeam((prev) => ({
        ...prev,
        score: homeScore,
        fouls: homeFouls,
        timeoutsLeft: homeTimeouts,
        quarterScores: homeQuarterScores,
      }));

      setAwayTeam((prev) => ({
        ...prev,
        score: awayScore,
        fouls: awayFouls,
        timeoutsLeft: awayTimeouts,
        quarterScores: awayQuarterScores,
      }));

      setPeriod(snapPeriod);
      setGameClockTenths(snapGameClock);
      setShotClockTenths(snapShotClock);
    }
    setEvents(remainingEvents);
  };

  const handleClearEvents = () => {
    setEvents([]);
  };

  // Update Team Names and Colors
  const handleUpdateTeamName = (teamId: 'home' | 'away', name: string, shortName: string) => {
    if (teamId === 'home') {
      setHomeTeam((prev) => ({ ...prev, name, shortName }));
    } else {
      setAwayTeam((prev) => ({ ...prev, name, shortName }));
    }
  };

  const handleUpdateTeamColor = (teamId: 'home' | 'away', color: string, accentColor?: string) => {
    if (teamId === 'home') {
      setHomeTeam((prev) => ({
        ...prev,
        color,
        accentColor: accentColor || color,
      }));
    } else {
      setAwayTeam((prev) => ({
        ...prev,
        color,
        accentColor: accentColor || color,
      }));
    }
  };

  // Save Settings from Modal
  const handleSaveSettings = (
    newSettings: GameSettings,
    newHomeName: string,
    newHomeShort: string,
    newAwayName: string,
    newAwayShort: string,
    newHomeColor?: string,
    newAwayColor?: string
  ) => {
    setSettings(newSettings);
    if (newHomeName) {
      setHomeTeam((prev) => ({
        ...prev,
        name: newHomeName,
        shortName: newHomeShort || newHomeName.slice(0, 4).toUpperCase(),
        color: newHomeColor || prev.color,
      }));
    }
    if (newAwayName) {
      setAwayTeam((prev) => ({
        ...prev,
        name: newAwayName,
        shortName: newAwayShort || newAwayName.slice(0, 4).toUpperCase(),
        color: newAwayColor || prev.color,
      }));
    }
  };

  // Roster handlers
  const handleAddPlayer = (
    teamId: 'home' | 'away',
    playerData: { number: number; name: string; isOnCourt: boolean }
  ) => {
    const newPlayer = {
      ...playerData,
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      points: 0,
      fouls: 0,
      twoPointers: 0,
      threePointers: 0,
      freeThrows: 0,
    };

    if (teamId === 'home') {
      setHomeTeam((prev) => ({ ...prev, players: [...prev.players, newPlayer] }));
    } else {
      setAwayTeam((prev) => ({ ...prev, players: [...prev.players, newPlayer] }));
    }
  };

  const handleRemovePlayer = (teamId: 'home' | 'away', playerId: string) => {
    if (teamId === 'home') {
      setHomeTeam((prev) => ({ ...prev, players: prev.players.filter((p) => p.id !== playerId) }));
    } else {
      setAwayTeam((prev) => ({ ...prev, players: prev.players.filter((p) => p.id !== playerId) }));
    }
  };

  const handleTogglePlayerCourt = (teamId: 'home' | 'away', playerId: string) => {
    const updater = (prev: Team) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, isOnCourt: !p.isOnCourt } : p)),
    });
    if (teamId === 'home') setHomeTeam(updater);
    else setAwayTeam(updater);
  };

  // Reset Game
  const handleConfirmResetGame = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setShowRestoreToast(false);
    setPeriod(1);
    setHomeTeam({
      ...INITIAL_HOME_TEAM,
      name: homeTeam.name,
      shortName: homeTeam.shortName,
      color: homeTeam.color,
      players: homeTeam.players.map((p) => ({ ...p, points: 0, fouls: 0, twoPointers: 0, threePointers: 0, freeThrows: 0 })),
    });
    setAwayTeam({
      ...INITIAL_AWAY_TEAM,
      name: awayTeam.name,
      shortName: awayTeam.shortName,
      color: awayTeam.color,
      players: awayTeam.players.map((p) => ({ ...p, points: 0, fouls: 0, twoPointers: 0, threePointers: 0, freeThrows: 0 })),
    });
    setGameClockTenths(settings.periodMinutes * 60 * 10);
    setShotClockTenths(settings.shotClockSeconds * 10);
    setIsGameClockRunning(false);
    setIsShotClockRunning(false);
    setEvents([]);
    setIsResetConfirmOpen(false);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleGameClock();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetShotClock24();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleResetShotClock14();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const isHomeLeading = homeTeam.score > awayTeam.score;
  const isAwayLeading = awayTeam.score > homeTeam.score;
  const leadMargin = Math.abs(homeTeam.score - awayTeam.score);
  const currentOpacity = settings.panelOpacity ?? 75;

  return (
    <div className="min-h-screen landscape:h-screen landscape:max-h-screen landscape:overflow-hidden lg:h-screen lg:max-h-screen lg:overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Authentic Basketball Court Floor & Markings Background */}
      <BasketballCourtBackground homeColor={homeTeam.color} awayColor={awayTeam.color} />

      {/* Top Fixed Scoreboard Bar */}
      <ScoreboardHeader
        period={period}
        totalRegularPeriods={settings.totalRegularPeriods}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        soundEnabled={settings.soundEnabled}
        useShotClock={settings.useShotClock}
        panelOpacity={currentOpacity}
        onToggleShotClock={handleToggleShotClockEnabled}
        onChangeOpacity={(newOpacity) => setSettings((prev) => ({ ...prev, panelOpacity: newOpacity }))}
        isStageMode={isStageMode}
        onToggleStageMode={() => setIsStageMode(!isStageMode)}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onPlayHorn={triggerHorn}
        onPlayWhistle={triggerWhistle}
        onOpenEvents={() => setIsEventsOpen(true)}
        eventsCount={events.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onResetGame={() => setIsResetConfirmOpen(true)}
        onSetPeriod={handleSetPeriod}
        onNextPeriod={handleNextPeriod}
      />

      {/* Main Scoreboard Arena - Balanced responsive layout */}
      <main className="relative z-10 flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-1.5 sm:py-3 landscape:py-1.5 flex flex-col justify-between gap-2 sm:gap-3 min-h-0">
        {/* Top Arena Row: Home Team | Center Timers | Away Team */}
        <div className="flex flex-col landscape:flex-row lg:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 items-stretch flex-1 min-h-0 w-full">
          {/* Home Team Card */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <TeamCard
              team={homeTeam}
              side="home"
              isLeading={isHomeLeading}
              leadMargin={leadMargin}
              foulsForBonus={settings.foulsForBonus}
              foulsForDoubleBonus={settings.foulsForDoubleBonus}
              maxTimeouts={settings.maxTimeouts}
              panelOpacity={currentOpacity}
              onScore={handleScore}
              onFoul={handleFoul}
              onTimeout={handleTimeout}
              onAddTimeoutBack={handleAddTimeoutBack}
              onUpdateTeamName={handleUpdateTeamName}
              onUpdateTeamColor={handleUpdateTeamColor}
            />
          </div>

          {/* Center Digital Timers Column */}
          <div className="w-full landscape:w-60 landscape:sm:w-72 landscape:md:w-80 landscape:lg:w-96 landscape:xl:w-[420px] landscape:2xl:w-[480px] lg:w-96 xl:w-[420px] 2xl:w-[480px] shrink-0 flex flex-col justify-between gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 h-full min-h-0">
            <GameClock
              tenthsLeft={gameClockTenths}
              isRunning={isGameClockRunning}
              panelOpacity={currentOpacity}
              onToggleRun={handleToggleGameClock}
              onResetClock={handleResetGameClock}
              onAdjustTime={handleAdjustGameClock}
              onSetExactTime={handleSetExactGameClock}
            />

            <ShotClock
              tenthsLeft={shotClockTenths}
              isRunning={isShotClockRunning}
              enabled={settings.useShotClock}
              onToggleEnabled={handleToggleShotClockEnabled}
              panelOpacity={currentOpacity}
              onToggleRun={handleToggleShotClock}
              onReset24={handleResetShotClock24}
              onReset14={handleResetShotClock14}
              onAdjustTime={handleAdjustShotClock}
              defaultShotSeconds={settings.shotClockSeconds}
              reboundShotSeconds={settings.shotClockOffensiveReboundSeconds}
            />
          </div>

          {/* Away Team Card */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <TeamCard
              team={awayTeam}
              side="away"
              isLeading={isAwayLeading}
              leadMargin={leadMargin}
              foulsForBonus={settings.foulsForBonus}
              foulsForDoubleBonus={settings.foulsForDoubleBonus}
              maxTimeouts={settings.maxTimeouts}
              panelOpacity={currentOpacity}
              onScore={handleScore}
              onFoul={handleFoul}
              onTimeout={handleTimeout}
              onAddTimeoutBack={handleAddTimeoutBack}
              onUpdateTeamName={handleUpdateTeamName}
              onUpdateTeamColor={handleUpdateTeamColor}
            />
          </div>
        </div>

        {/* Portrait Mode Bottom Section: Play-by-Play Events & Quick Technical Table Tips */}
        {!isStageMode && (
          <div className="portrait:grid grid-cols-1 landscape:hidden lg:hidden gap-3 sm:gap-4 mt-2">
            <div>
              <EventLog
                events={events}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                panelOpacity={currentOpacity}
                canUndo={events.length > 0}
                onUndo={handleUndo}
                onClearEvents={handleClearEvents}
                period={period}
                totalRegularPeriods={settings.totalRegularPeriods}
              />
            </div>

            {/* Quick Scorekeeper Guide */}
            <div
              style={{
                backgroundColor: `rgba(15, 23, 42, ${Math.max(0.15, currentOpacity / 100)})`,
                backdropFilter: currentOpacity < 95 ? 'blur(8px)' : 'none',
              }}
              className="rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col justify-between shadow-2xl shadow-black/50 transition-colors duration-200"
            >
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>技术台快捷操作指引</span>
                </div>
                <ul className="text-[11px] sm:text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>快捷记分：</strong>点击 +1 / +2 / +3 快速记分，并自动记录得分球员数据。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>时钟控制：</strong>按键盘 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-amber-300 border border-white/10">空格</kbd> 启停，按 <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-amber-300 border border-white/10">R</kbd> 重置 24s，按 <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-amber-300 border border-white/10">E</kbd> 重置 14s。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>24s 进攻时钟：</strong>支持随时一键禁用/启用 24s 进攻时钟（符合 FIBA 规则，适合比赛终场最后进攻或特殊判例）。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>透明度与球衣：</strong>点击右上角眼睛图标滑动调节透明度，点击队名旁调色板更换球衣配色。</span>
                  </li>
                </ul>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-digital">
                <span>单节: {settings.periodMinutes}分钟</span>
                <span>BONUS: {settings.foulsForBonus}犯</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors underline"
                >
                  更多规则设置 &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Play-by-Play Event Log Modal / Drawer */}
      {isEventsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">比赛实时流水记录</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-digital px-2 py-0.5 rounded-full border border-amber-500/30">
                  {events.length}条记录
                </span>
              </div>
              <button
                onClick={() => setIsEventsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              <EventLog
                events={events}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                panelOpacity={100}
                canUndo={events.length > 0}
                onUndo={handleUndo}
                onClearEvents={handleClearEvents}
                period={period}
                totalRegularPeriods={settings.totalRegularPeriods}
              />
            </div>
          </div>
        </div>
      )}

      {/* Roster & Player Stats Modal */}
      <RosterStatsModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onToggleOnCourt={handleTogglePlayerCourt}
        onQuickScore={handleScore}
        onQuickFoul={handleFoul}
      />

      {/* Settings Modal */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onSaveSettings={handleSaveSettings}
      />

      {/* Game Summary Report Modal */}
      <GameSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        period={period}
        totalRegularPeriods={settings.totalRegularPeriods}
        settings={settings}
        events={events}
      />

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">确定重新开局？</h3>
              <p className="text-xs text-slate-400">
                此操作将重置比赛比分、犯规数、暂停数、节次与全部比赛流水，但将保留球队名称与球员名单。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmResetGame}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-lg shadow-rose-600/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>确认重置</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restored Session Toast */}
      {showRestoreToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900/95 border border-emerald-500/40 text-slate-200 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-emerald-400">已自动恢复比赛数据</h4>
              <button
                onClick={() => setShowRestoreToast(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              已为您恢复上一次比赛的比分与流水，防误触刷新保护已就绪。
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={() => setShowRestoreToast(false)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
              >
                继续比赛
              </button>
              <button
                onClick={() => {
                  setShowRestoreToast(false);
                  setIsResetConfirmOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
              >
                重新开局
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
