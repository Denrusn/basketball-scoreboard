import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  SlidersHorizontal, 
  RotateCcw, 
  Trophy, 
  Maximize, 
  Minimize, 
  Users, 
  Megaphone,
  Radio,
  Tv
} from 'lucide-react';
import { Team } from '../types';

interface ScoreboardHeaderProps {
  period: number;
  totalRegularPeriods: number;
  homeTeam: Team;
  awayTeam: Team;
  soundEnabled: boolean;
  isStageMode?: boolean;
  onToggleStageMode?: () => void;
  onToggleSound: () => void;
  onPlayHorn: () => void;
  onPlayWhistle: () => void;
  onOpenSettings: () => void;
  onOpenSummary: () => void;
  onOpenRoster: () => void;
  onResetGame: () => void;
  onSetPeriod: (period: number) => void;
  onNextPeriod: () => void;
}

export const ScoreboardHeader: React.FC<ScoreboardHeaderProps> = ({
  period,
  totalRegularPeriods,
  homeTeam,
  awayTeam,
  soundEnabled,
  isStageMode = false,
  onToggleStageMode,
  onToggleSound,
  onPlayHorn,
  onPlayWhistle,
  onOpenSettings,
  onOpenSummary,
  onOpenRoster,
  onResetGame,
  onSetPeriod,
  onNextPeriod,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen) {
        try {
          const screenObj = screen as any;
          if (screenObj.orientation && typeof screenObj.orientation.unlock === 'function') {
            screenObj.orientation.unlock();
          } else if (typeof screenObj.unlockOrientation === 'function') {
            screenObj.unlockOrientation();
          }
        } catch {
          // Ignore orientation unlock failure
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        const rootEl = document.documentElement;
        if (rootEl.requestFullscreen) {
          await rootEl.requestFullscreen();
        } else if ((rootEl as any).webkitRequestFullscreen) {
          await (rootEl as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);

        try {
          const screenObj = screen as any;
          if (screenObj.orientation && typeof screenObj.orientation.lock === 'function') {
            await screenObj.orientation.lock('landscape');
          } else if (typeof screenObj.lockOrientation === 'function') {
            screenObj.lockOrientation('landscape');
          } else if (typeof screenObj.mozLockOrientation === 'function') {
            screenObj.mozLockOrientation('landscape');
          } else if (typeof screenObj.msLockOrientation === 'function') {
            screenObj.msLockOrientation('landscape');
          }
        } catch (orientationErr) {
          console.info('Screen orientation lock not supported or permitted:', orientationErr);
        }
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);

        try {
          const screenObj = screen as any;
          if (screenObj.orientation && typeof screenObj.orientation.unlock === 'function') {
            screenObj.orientation.unlock();
          } else if (typeof screenObj.unlockOrientation === 'function') {
            screenObj.unlockOrientation();
          }
        } catch {
          // Ignore
        }
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    }
  };

  const periodsList = Array.from(
    { length: Math.max(totalRegularPeriods, period) },
    (_, i) => i + 1
  );

  const scoreDiff = homeTeam.score - awayTeam.score;

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-2 sm:px-4 lg:px-5 py-1 sm:py-2 landscape:py-1 sticky top-0 z-30 shadow-md">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-1.5 sm:gap-2.5">
        {/* Left: App Brand & Period Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs sm:text-sm shadow-md shrink-0">
              🏀
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-base font-black text-white tracking-wide leading-tight truncate">
                  篮球记分板
                </h1>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
                  专业版
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">
                  {scoreDiff > 0
                    ? `${homeTeam.shortName || homeTeam.name} +${scoreDiff}`
                    : scoreDiff < 0
                    ? `${awayTeam.shortName || awayTeam.name} +${Math.abs(scoreDiff)}`
                    : '平局'}
                </span>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-lg p-0.5 ml-1 sm:ml-2 shrink-0">
            {periodsList.map((p) => {
              const isActive = p === period;
              return (
                <button
                  key={p}
                  onClick={() => onSetPeriod(p)}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p <= totalRegularPeriods ? `Q${p}` : `OT${p - totalRegularPeriods}`}
                </button>
              );
            })}
            <button
              onClick={onNextPeriod}
              title="进入下一节"
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              +节
            </button>
          </div>
        </div>

        {/* Center: Quarter Scores Breakdown (Clean minimal table) */}
        <div className="hidden xl:flex items-center bg-slate-900/70 border border-white/5 rounded-lg px-3 py-1 text-xs font-digital">
          <div className="flex items-center gap-2">
            <span className="w-12 truncate text-right font-bold text-amber-400">
              {homeTeam.shortName || homeTeam.name}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              {periodsList.map((p, idx) => (
                <span
                  key={p}
                  className={`w-4 text-center ${
                    p === period ? 'text-amber-400 font-bold' : ''
                  }`}
                >
                  {homeTeam.quarterScores[idx] ?? 0}
                </span>
              ))}
            </div>
            <span className="text-amber-400 font-black text-sm w-6 text-right">
              {homeTeam.score}
            </span>
          </div>

          <div className="h-3 w-px bg-white/10 mx-2.5" />

          <div className="flex items-center gap-2">
            <span className="w-12 truncate text-right font-bold text-cyan-400">
              {awayTeam.shortName || awayTeam.name}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              {periodsList.map((p, idx) => (
                <span
                  key={p}
                  className={`w-4 text-center ${
                    p === period ? 'text-cyan-400 font-bold' : ''
                  }`}
                >
                  {awayTeam.quarterScores[idx] ?? 0}
                </span>
              ))}
            </div>
            <span className="text-cyan-400 font-black text-sm w-6 text-right">
              {awayTeam.score}
            </span>
          </div>
        </div>

        {/* Right: Action Controls (Unified minimal dark buttons) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Whistle sound */}
          <button
            onClick={onPlayWhistle}
            title="吹哨"
            className="p-1 sm:px-2.5 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-white/5"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">鸣哨</span>
          </button>

          {/* Stadium horn */}
          <button
            onClick={onPlayHorn}
            title="球馆蜂鸣器"
            className="p-1 sm:px-2.5 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-white/5"
          >
            <Megaphone className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">蜂鸣器</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '音效已开启' : '音效已静音'}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-white/10'
                : 'bg-slate-900 text-slate-500 border-white/5'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Clean Stage / TV View Mode */}
          {onToggleStageMode && (
            <button
              onClick={onToggleStageMode}
              title={isStageMode ? '切换回技术台控制' : '大屏纯净投屏'}
              className={`p-1 sm:px-2 sm:py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                isStageMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/5'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isStageMode ? '控制台' : '大屏模式'}</span>
            </button>
          )}

          {/* Roster / Boxscore */}
          <button
            onClick={onOpenRoster}
            title="球员名单统计"
            className="p-1 sm:px-2.5 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-white/5"
          >
            <Users className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden lg:inline">球员</span>
          </button>

          {/* Summary / Report */}
          <button
            onClick={onOpenSummary}
            title="终场战报"
            className="p-1 sm:px-2.5 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-white/5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">战报</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="规则设置"
            className="p-1 sm:p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Reset Game */}
          <button
            onClick={onResetGame}
            title="重新开局"
            className="p-1 sm:p-1.5 bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg border border-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Fullscreen & Force Landscape */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? '退出全屏' : '全屏并锁定横屏'}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors ${
              isFullscreen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-white/5'
            }`}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
