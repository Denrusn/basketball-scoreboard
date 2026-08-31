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
  Radio
} from 'lucide-react';
import { Team } from '../types';

interface ScoreboardHeaderProps {
  period: number;
  totalRegularPeriods: number;
  homeTeam: Team;
  awayTeam: Team;
  soundEnabled: boolean;
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const getPeriodLabel = (p: number) => {
    if (p <= totalRegularPeriods) {
      return `第 ${p} 节 (Q${p})`;
    }
    return `加时赛 OT${p - totalRegularPeriods}`;
  };

  const periodsList = Array.from(
    { length: Math.max(totalRegularPeriods, period) },
    (_, i) => i + 1
  );

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Title & Period Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-black text-sm">
              🏀
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide leading-tight">
                篮球比赛专业记分板
              </h1>
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>实时比分系统</span>
              </div>
            </div>
          </div>

          {/* Current Period Dropdown / Pills */}
          <div className="hidden sm:flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1">
            {periodsList.map((p) => {
              const isActive = p === period;
              return (
                <button
                  key={p}
                  onClick={() => onSetPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
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
              className="ml-1 px-2 py-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium hover:bg-amber-500/10 rounded transition-colors"
            >
              + 下一节
            </button>
          </div>
        </div>

        {/* Center: Quarter Scores Quick Table */}
        <div className="hidden lg:flex items-center bg-slate-950/90 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs font-digital">
          <div className="flex items-center gap-3">
            <div className="w-16 truncate text-right font-medium text-slate-300">
              {homeTeam.shortName || homeTeam.name}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {periodsList.map((p, idx) => (
                <span
                  key={p}
                  className={`w-6 text-center ${
                    p === period ? 'text-amber-400 font-bold' : ''
                  }`}
                >
                  {homeTeam.quarterScores[idx] ?? 0}
                </span>
              ))}
            </div>
            <span className="text-amber-500 font-bold text-sm w-7 text-right">
              {homeTeam.score}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-3" />

          <div className="flex items-center gap-3">
            <div className="w-16 truncate text-right font-medium text-slate-300">
              {awayTeam.shortName || awayTeam.name}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {periodsList.map((p, idx) => (
                <span
                  key={p}
                  className={`w-6 text-center ${
                    p === period ? 'text-cyan-400 font-bold' : ''
                  }`}
                >
                  {awayTeam.quarterScores[idx] ?? 0}
                </span>
              ))}
            </div>
            <span className="text-cyan-400 font-bold text-sm w-7 text-right">
              {awayTeam.score}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Whistle sound button */}
          <button
            onClick={onPlayWhistle}
            title="吹哨音效 (Referee Whistle)"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700/60"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">哨音</span>
          </button>

          {/* Stadium horn buzzer */}
          <button
            onClick={onPlayHorn}
            title="节末蜂鸣器 (Stadium Horn)"
            className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/70 text-red-300 border border-red-800/60 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
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

          {/* Roster / Boxscore */}
          <button
            onClick={onOpenRoster}
            title="球员名单与数据统计"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700/60"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">球员统计</span>
          </button>

          {/* Summary / Report */}
          <button
            onClick={onOpenSummary}
            title="比赛战报与统计详情"
            className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
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
            className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="全屏模式 (适合大屏投屏)"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
