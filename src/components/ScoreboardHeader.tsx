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

        // 强行锁定为横屏模式 (Lock to Landscape)
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
          console.info('Screen orientation lock not supported or permitted on this platform:', orientationErr);
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
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 sm:px-5 py-2.5 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: App Brand & Period Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-slate-950 font-black text-sm">
              🏀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white tracking-wide leading-tight">
                  电子篮球记分板
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  大屏专业版
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {scoreDiff > 0
                    ? `${homeTeam.shortName || homeTeam.name} 领先 ${scoreDiff} 分`
                    : scoreDiff < 0
                    ? `${awayTeam.shortName || awayTeam.name} 领先 ${Math.abs(scoreDiff)} 分`
                    : '双方目前战平'}
                </span>
              </div>
            </div>
          </div>

          {/* Period Selector Pills */}
          <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            {periodsList.map((p) => {
              const isActive = p === period;
              return (
                <button
                  key={p}
                  onClick={() => onSetPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {p <= totalRegularPeriods ? `Q${p}` : `OT${p - totalRegularPeriods}`}
                </button>
              );
            })}
            <button
              onClick={onNextPeriod}
              title="进入下一节"
              className="ml-1 px-2 py-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold hover:bg-amber-500/10 rounded transition-colors"
            >
              + 下一节
            </button>
          </div>
        </div>

        {/* Center: Quarter Scores Breakdown */}
        <div className="hidden lg:flex items-center bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-1.5 text-xs font-digital">
          <div className="flex items-center gap-2.5">
            <span className="w-14 truncate text-right font-bold text-amber-400">
              {homeTeam.shortName || homeTeam.name}
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              {periodsList.map((p, idx) => (
                <span
                  key={p}
                  className={`w-5 text-center ${
                    p === period ? 'text-amber-400 font-bold' : ''
                  }`}
                >
                  {homeTeam.quarterScores[idx] ?? 0}
                </span>
              ))}
            </div>
            <span className="text-amber-400 font-black text-sm w-7 text-right">
              {homeTeam.score}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-3" />

          <div className="flex items-center gap-2.5">
            <span className="w-14 truncate text-right font-bold text-cyan-400">
              {awayTeam.shortName || awayTeam.name}
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              {periodsList.map((p, idx) => (
                <span
                  key={p}
                  className={`w-5 text-center ${
                    p === period ? 'text-cyan-400 font-bold' : ''
                  }`}
                >
                  {awayTeam.quarterScores[idx] ?? 0}
                </span>
              ))}
            </div>
            <span className="text-cyan-400 font-black text-sm w-7 text-right">
              {awayTeam.score}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Whistle sound */}
          <button
            onClick={onPlayWhistle}
            title="吹哨音效"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-slate-700"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">鸣哨</span>
          </button>

          {/* Stadium horn */}
          <button
            onClick={onPlayHorn}
            title="节末蜂鸣器"
            className="px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">蜂鸣器</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '音效已开启' : '音效已静音'}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clean Stage / TV View Mode */}
          {onToggleStageMode && (
            <button
              onClick={onToggleStageMode}
              title={isStageMode ? '切换回技术台控制模式' : '切换至大屏纯净投屏模式'}
              className={`px-2 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                isStageMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isStageMode ? '控制台' : '大屏模式'}</span>
            </button>
          )}

          {/* Roster / Boxscore */}
          <button
            onClick={onOpenRoster}
            title="球员名单与数据统计"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-slate-700"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">球员</span>
          </button>

          {/* Summary / Report */}
          <button
            onClick={onOpenSummary}
            title="终场战报与数据分析"
            className="px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">战报</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="比赛规则与参数设置"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Reset Game */}
          <button
            onClick={onResetGame}
            title="重新开始比赛"
            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen & Force Landscape */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? '退出全屏' : '全屏并锁定横屏模式 (大屏投屏)'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isFullscreen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
