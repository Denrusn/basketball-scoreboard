import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Team, 
  GameSettings, 
  GameEvent 
} from './types';
import { 
  playStadiumHorn, 
  playShotClockBuzzer, 
  playWhistle, 
  playScoreBeep 
} from './utils/audio';
import { ScoreboardHeader } from './components/ScoreboardHeader';
import { TeamCard } from './components/TeamCard';
import { GameClock } from './components/GameClock';
import { ShotClock } from './components/ShotClock';
import { EventLog } from './components/EventLog';
import { RosterStatsModal } from './components/RosterStatsModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { GameSummaryModal } from './components/GameSummaryModal';
import { BasketballCourtBackground } from './components/BasketballCourtBackground';
import { RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';

const INITIAL_SETTINGS: GameSettings = {
  periodMinutes: 10,
  overtimeMinutes: 5,
  totalRegularPeriods: 4,
  shotClockSeconds: 24,
  shotClockOffensiveReboundSeconds: 14,
  foulsForBonus: 5,
  foulsForDoubleBonus: 7,
  maxTimeouts: 5,
  soundEnabled: true,
};

const INITIAL_HOME_TEAM: Team = {
  id: 'home',
  name: '湖人队 (LAL)',
  shortName: 'LAL',
  color: '#F59E0B',
  accentColor: '#78350F',
  score: 0,
  fouls: 0,
  timeoutsLeft: 5,
  quarterScores: [0, 0, 0, 0],
  players: [
    { id: 'h1', number: 23, name: '勒布朗·詹姆斯', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h2', number: 3, name: '安东尼·戴维斯', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h3', number: 15, name: '奥斯汀·里夫斯', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h4', number: 1, name: '德安吉洛·拉塞尔', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'h5', number: 28, name: '八村垒', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
  ],
};

const INITIAL_AWAY_TEAM: Team = {
  id: 'away',
  name: '勇士队 (GSW)',
  shortName: 'GSW',
  color: '#06B6D4',
  accentColor: '#164E63',
  score: 0,
  fouls: 0,
  timeoutsLeft: 5,
  quarterScores: [0, 0, 0, 0],
  players: [
    { id: 'a1', number: 30, name: '斯蒂芬·库里', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a2', number: 11, name: '克莱·汤普森', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a3', number: 23, name: '德雷蒙德·格林', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a4', number: 22, name: '安德鲁·维金斯', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
    { id: 'a5', number: 0, name: '乔纳森·库明加', points: 0, fouls: 0, isOnCourt: true, twoPointers: 0, threePointers: 0, freeThrows: 0 },
  ],
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [period, setPeriod] = useState<number>(1);
  const [homeTeam, setHomeTeam] = useState<Team>(INITIAL_HOME_TEAM);
  const [awayTeam, setAwayTeam] = useState<Team>(INITIAL_AWAY_TEAM);

  // Clocks in tenths (10 tenths = 1 second)
  const [gameClockTenths, setGameClockTenths] = useState<number>(settings.periodMinutes * 60 * 10);
  const [shotClockTenths, setShotClockTenths] = useState<number>(settings.shotClockSeconds * 10);
  const [isGameClockRunning, setIsGameClockRunning] = useState<boolean>(false);
  const [isShotClockRunning, setIsShotClockRunning] = useState<boolean>(false);

  // Big screen / Stage mode toggle
  const [isStageMode, setIsStageMode] = useState<boolean>(false);

  // Events History & Undo Stack
  const [events, setEvents] = useState<GameEvent[]>([]);

  // Modals
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Format clock for history log
  const formatGameClockDisplay = (tenthsLeft: number) => {
    const totalSeconds = Math.floor(tenthsLeft / 10);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Helper to record an event with full snapshot for undo
  const recordEvent = useCallback(
    (
      type: GameEvent['type'],
      description: string,
      teamId?: 'home' | 'away',
      points?: number,
      playerName?: string,
      playerNumber?: number
    ) => {
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

        // Decrement Shot Clock if running
        if (isShotClockRunning) {
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
  }, [isGameClockRunning, isShotClockRunning, period, triggerHorn, triggerShotBuzzer, recordEvent]);

  // Handle Game Clock Play / Pause
  const handleToggleGameClock = () => {
    if (!isGameClockRunning && gameClockTenths === 0) {
      const minutes = period > settings.totalRegularPeriods ? settings.overtimeMinutes : settings.periodMinutes;
      setGameClockTenths(minutes * 60 * 10);
      setShotClockTenths(settings.shotClockSeconds * 10);
      setIsGameClockRunning(true);
      setIsShotClockRunning(true);
      return;
    }

    const nextState = !isGameClockRunning;
    setIsGameClockRunning(nextState);
    setIsShotClockRunning(nextState);

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
  const handleResetShotClock24 = () => {
    setShotClockTenths(settings.shotClockSeconds * 10);
    if (isGameClockRunning) {
      setIsShotClockRunning(true);
    }
  };

  const handleResetShotClock14 = () => {
    setShotClockTenths(settings.shotClockOffensiveReboundSeconds * 10);
    if (isGameClockRunning) {
      setIsShotClockRunning(true);
    }
  };

  const handleToggleShotClock = () => {
    setIsShotClockRunning((prev) => !prev);
  };

  const handleAdjustShotClock = (deltaSeconds: number) => {
    setShotClockTenths((prev) => Math.max(0, prev + deltaSeconds * 10));
  };

  // Scoring Logic
  const handleScore = (teamId: 'home' | 'away', deltaPoints: number, playerId?: string) => {
    const targetTeam = teamId === 'home' ? homeTeam : awayTeam;
    const setTargetTeam = teamId === 'home' ? setHomeTeam : setAwayTeam;

    const currentScore = targetTeam.score;
    const newScore = Math.max(0, currentScore + deltaPoints);

    // Update Quarter Breakdown
    const qIndex = period - 1;
    const updatedQuarterScores = [...targetTeam.quarterScores];
    while (updatedQuarterScores.length <= qIndex) {
      updatedQuarterScores.push(0);
    }
    updatedQuarterScores[qIndex] = Math.max(0, (updatedQuarterScores[qIndex] || 0) + deltaPoints);

    let playerNameText = '';
    let playerNumberText: number | undefined;

    // Update Player stats if player selected
    let updatedPlayers = [...targetTeam.players];
    if (playerId) {
      updatedPlayers = targetTeam.players.map((p) => {
        if (p.id === playerId) {
          playerNameText = p.name;
          playerNumberText = p.number;
          const newPts = Math.max(0, p.points + deltaPoints);
          let new2 = p.twoPointers;
          let new3 = p.threePointers;
          let newFt = p.freeThrows;

          if (deltaPoints === 3) new3 += 1;
          else if (deltaPoints === 2) new2 += 1;
          else if (deltaPoints === 1) newFt += 1;
          else if (deltaPoints === -1 && p.points > 0) {
            if (newFt > 0) newFt -= 1;
            else if (new2 > 0) new2 -= 1;
          }

          return {
            ...p,
            points: newPts,
            twoPointers: Math.max(0, new2),
            threePointers: Math.max(0, new3),
            freeThrows: Math.max(0, newFt),
          };
        }
        return p;
      });
    }

    setTargetTeam({
      ...targetTeam,
      score: newScore,
      quarterScores: updatedQuarterScores,
      players: updatedPlayers,
    });

    if (deltaPoints > 0) {
      triggerScoreBeep(deltaPoints);
      handleResetShotClock24();
    }

    const desc = playerNameText
      ? `#${playerNumberText} ${playerNameText} ${deltaPoints > 0 ? `+${deltaPoints}分` : `${deltaPoints}分`}`
      : `${deltaPoints > 0 ? `+${deltaPoints}分` : `${deltaPoints}分修正`}`;

    recordEvent('score', desc, teamId, deltaPoints, playerNameText, playerNumberText);
  };

  // Foul Logic
  const handleFoul = (teamId: 'home' | 'away', delta: number, playerId?: string) => {
    const targetTeam = teamId === 'home' ? homeTeam : awayTeam;
    const setTargetTeam = teamId === 'home' ? setHomeTeam : setAwayTeam;

    const newFouls = Math.max(0, targetTeam.fouls + delta);

    let playerNameText = '';
    let playerNumberText: number | undefined;

    let updatedPlayers = [...targetTeam.players];
    if (playerId) {
      updatedPlayers = targetTeam.players.map((p) => {
        if (p.id === playerId) {
          playerNameText = p.name;
          playerNumberText = p.number;
          return {
            ...p,
            fouls: Math.max(0, p.fouls + delta),
          };
        }
        return p;
      });
    }

    setTargetTeam({
      ...targetTeam,
      fouls: newFouls,
      players: updatedPlayers,
    });

    if (delta > 0) {
      triggerWhistle();
    }

    const desc = playerNameText
      ? `#${playerNumberText} ${playerNameText} 个人犯规 (全队第 ${newFouls} 次)`
      : `全队犯规 +1 (累计 ${newFouls} 次)`;

    recordEvent('foul', desc, teamId, undefined, playerNameText, playerNumberText);
  };

  // Timeout Logic
  const handleTimeout = (teamId: 'home' | 'away') => {
    const targetTeam = teamId === 'home' ? homeTeam : awayTeam;
    const setTargetTeam = teamId === 'home' ? setHomeTeam : setAwayTeam;

    if (targetTeam.timeoutsLeft <= 0) return;

    setTargetTeam({
      ...targetTeam,
      timeoutsLeft: targetTeam.timeoutsLeft - 1,
    });

    setIsGameClockRunning(false);
    setIsShotClockRunning(false);
    triggerWhistle();

    recordEvent('timeout', `请求暂停 (剩余 ${targetTeam.timeoutsLeft - 1} 次)`, teamId);
  };

  const handleAddTimeoutBack = (teamId: 'home' | 'away') => {
    const targetTeam = teamId === 'home' ? homeTeam : awayTeam;
    const setTargetTeam = teamId === 'home' ? setHomeTeam : setAwayTeam;

    if (targetTeam.timeoutsLeft >= settings.maxTimeouts) return;

    setTargetTeam({
      ...targetTeam,
      timeoutsLeft: targetTeam.timeoutsLeft + 1,
    });
  };

  // Period Navigation
  const handleSetPeriod = (newPeriod: number) => {
    setPeriod(newPeriod);
    setHomeTeam((prev) => ({ ...prev, fouls: 0 }));
    setAwayTeam((prev) => ({ ...prev, fouls: 0 }));
    const minutes = newPeriod > settings.totalRegularPeriods ? settings.overtimeMinutes : settings.periodMinutes;
    setGameClockTenths(minutes * 60 * 10);
    setShotClockTenths(settings.shotClockSeconds * 10);
    setIsGameClockRunning(false);
    setIsShotClockRunning(false);

    recordEvent('period_start', `进入第 ${newPeriod} 节比赛`);
  };

  const handleNextPeriod = () => {
    handleSetPeriod(period + 1);
  };

  // Undo Last Action
  const handleUndo = () => {
    if (events.length === 0) return;
    const [lastEvent, ...remainingEvents] = events;

    if (lastEvent.undoState) {
      const state = lastEvent.undoState;
      setHomeTeam((prev) => ({
        ...prev,
        score: state.homeScore,
        fouls: state.homeFouls,
        timeoutsLeft: state.homeTimeouts,
        quarterScores: state.homeQuarterScores,
      }));
      setAwayTeam((prev) => ({
        ...prev,
        score: state.awayScore,
        fouls: state.awayFouls,
        timeoutsLeft: state.awayTimeouts,
        quarterScores: state.awayQuarterScores,
      }));
      setPeriod(state.period);
      setGameClockTenths(state.gameClockTenths);
      setShotClockTenths(state.shotClockTenths);
    }

    setEvents(remainingEvents);
  };

  const handleClearEvents = () => {
    setEvents([]);
  };

  // Update Team Names
  const handleUpdateTeamName = (teamId: 'home' | 'away', name: string, shortName: string) => {
    if (teamId === 'home') {
      setHomeTeam((prev) => ({ ...prev, name, shortName }));
    } else {
      setAwayTeam((prev) => ({ ...prev, name, shortName }));
    }
  };

  // Save Settings from Modal
  const handleSaveSettings = (newSettings: GameSettings, newHomeName?: string, newAwayName?: string) => {
    setSettings(newSettings);
    if (newHomeName) {
      setHomeTeam((prev) => ({ ...prev, name: newHomeName, shortName: newHomeName.slice(0, 4).toUpperCase() }));
    }
    if (newAwayName) {
      setAwayTeam((prev) => ({ ...prev, name: newAwayName, shortName: newAwayName.slice(0, 4).toUpperCase() }));
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
    setPeriod(1);
    setHomeTeam({
      ...INITIAL_HOME_TEAM,
      name: homeTeam.name,
      shortName: homeTeam.shortName,
      players: homeTeam.players.map((p) => ({ ...p, points: 0, fouls: 0, twoPointers: 0, threePointers: 0, freeThrows: 0 })),
    });
    setAwayTeam({
      ...INITIAL_AWAY_TEAM,
      name: awayTeam.name,
      shortName: awayTeam.shortName,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Authentic Basketball Court Floor & Markings Background */}
      <BasketballCourtBackground />

      {/* Top Fixed Scoreboard Bar */}
      <ScoreboardHeader
        period={period}
        totalRegularPeriods={settings.totalRegularPeriods}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        soundEnabled={settings.soundEnabled}
        isStageMode={isStageMode}
        onToggleStageMode={() => setIsStageMode(!isStageMode)}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onPlayHorn={triggerHorn}
        onPlayWhistle={triggerWhistle}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onResetGame={() => setIsResetConfirmOpen(true)}
        onSetPeriod={handleSetPeriod}
        onNextPeriod={handleNextPeriod}
      />

      {/* Main Scoreboard Arena - Optimized for Mobile Landscape & Large Screen Viewing */}
      <main className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-4 lg:p-6 landscape:p-1.5 landscape:sm:p-3 flex flex-col justify-between gap-2 sm:gap-4 landscape:gap-2">
        {/* Top Arena Row: Home Team (Large) | Center Balanced Timers | Away Team (Large) */}
        <div className="grid grid-cols-1 landscape:grid-cols-12 lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-6 landscape:gap-1.5 landscape:sm:gap-2.5 items-stretch flex-1">
          {/* Home Team Card (5 Cols in Landscape) */}
          <div className="landscape:col-span-5 lg:col-span-5 flex flex-col h-full">
            <TeamCard
              team={homeTeam}
              side="home"
              isLeading={isHomeLeading}
              leadMargin={leadMargin}
              foulsForBonus={settings.foulsForBonus}
              foulsForDoubleBonus={settings.foulsForDoubleBonus}
              maxTimeouts={settings.maxTimeouts}
              onScore={handleScore}
              onFoul={handleFoul}
              onTimeout={handleTimeout}
              onAddTimeoutBack={handleAddTimeoutBack}
              onUpdateTeamName={handleUpdateTeamName}
            />
          </div>

          {/* Center Digital Timers Column (2 Cols in Landscape - Compact & Balanced) */}
          <div className="landscape:col-span-2 lg:col-span-2 flex flex-col justify-between gap-2 sm:gap-4 landscape:gap-1.5 h-full">
            <GameClock
              tenthsLeft={gameClockTenths}
              isRunning={isGameClockRunning}
              onToggleRun={handleToggleGameClock}
              onResetClock={handleResetGameClock}
              onAdjustTime={handleAdjustGameClock}
              onSetExactTime={handleSetExactGameClock}
            />

            <ShotClock
              tenthsLeft={shotClockTenths}
              isRunning={isShotClockRunning}
              onToggleRun={handleToggleShotClock}
              onReset24={handleResetShotClock24}
              onReset14={handleResetShotClock14}
              onAdjustTime={handleAdjustShotClock}
              defaultShotSeconds={settings.shotClockSeconds}
              reboundShotSeconds={settings.shotClockOffensiveReboundSeconds}
            />
          </div>

          {/* Away Team Card (5 Cols in Landscape) */}
          <div className="landscape:col-span-5 lg:col-span-5 flex flex-col h-full">
            <TeamCard
              team={awayTeam}
              side="away"
              isLeading={isAwayLeading}
              leadMargin={leadMargin}
              foulsForBonus={settings.foulsForBonus}
              foulsForDoubleBonus={settings.foulsForDoubleBonus}
              maxTimeouts={settings.maxTimeouts}
              onScore={handleScore}
              onFoul={handleFoul}
              onTimeout={handleTimeout}
              onAddTimeoutBack={handleAddTimeoutBack}
              onUpdateTeamName={handleUpdateTeamName}
            />
          </div>
        </div>

        {/* Bottom Section: Play-by-Play Events & Quick Technical Table Tips (Hidden in Clean Stage Mode) */}
        {!isStageMode && (
          <div className="grid grid-cols-1 landscape:grid-cols-12 lg:grid-cols-12 gap-2 sm:gap-4">
            <div className="landscape:col-span-8 lg:col-span-8">
              <EventLog
                events={events}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                canUndo={events.length > 0}
                onUndo={handleUndo}
                onClearEvents={handleClearEvents}
              />
            </div>

            {/* Quick Scorekeeper Guide */}
            <div className="landscape:col-span-4 lg:col-span-4 bg-slate-900/85 backdrop-blur-md rounded-2xl p-3 sm:p-4 lg:p-5 landscape:p-2.5 border border-white/10 flex flex-col justify-between shadow-2xl shadow-black/50">
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>技术台快捷操作指引</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>快捷记分：</strong>点击 +1 / +2 / +3 快速记分并自动重置 24 秒进攻时钟。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>时钟控制：</strong>按键盘 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-amber-300 border border-white/10">空格 Space</kbd> 启停，按 <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-amber-300 border border-white/10">R</kbd> 键重置 24s，按 <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-amber-300 border border-white/10">E</kbd> 键重置 14s。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>误操作撤销：</strong>随时点击流水栏“撤销”或按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-amber-300 border border-white/10">Ctrl+Z</kbd> 秒级回退。</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>大屏投屏：</strong>点击右上角“全屏”或“大屏模式”，比分将以超大高对比度数字完美呈现。</span>
                  </li>
                </ul>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-digital">
                <span>单节: {settings.periodMinutes}分钟</span>
                <span>BONUS: {settings.foulsForBonus}犯</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-amber-400 hover:text-amber-300 underline font-sans text-xs"
                >
                  规则设置 &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {!isStageMode && (
        <footer className="relative z-10 bg-slate-950/80 backdrop-blur border-t border-white/5 px-4 py-2 text-center text-xs text-slate-500">
          <span>篮球比赛专业记分系统 • 横屏大屏优化版 • 快捷键 Space 启停 / R 24s / E 14s / Ctrl+Z 撤销</span>
        </footer>
      )}

      {/* Modals */}
      <RosterStatsModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onTogglePlayerCourt={handleTogglePlayerCourt}
        onScorePlayer={handleScore}
        onFoulPlayer={(teamId, playerId) => handleFoul(teamId, 1, playerId)}
      />

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onSaveSettings={handleSaveSettings}
      />

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
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">重置比赛确认</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              确定要清空当前比赛比分、倒计时与流水记录并重新开始新的一场比赛吗？
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmResetGame}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-rose-600/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
