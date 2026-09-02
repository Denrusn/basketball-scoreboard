import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Tv,
  Eye,
  Timer,
  TimerOff,
  History,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Target,
  HelpCircle
} from 'lucide-react';
import { Team, GameSettings } from '../types';
import { requestAppFullScreen, exitAppFullScreen, isCapacitorNative } from '../utils/capacitorUtils';

interface ScoreboardHeaderProps {
  period: number;
  totalRegularPeriods: number;
  homeTeam: Team;
  awayTeam: Team;
  soundEnabled: boolean;
  voiceAnnouncementsEnabled?: boolean;
  onToggleVoiceAnnouncements?: () => void;
  onTestVoiceAnnouncement?: () => void;
  settings?: GameSettings;
  useShotClock?: boolean;
  panelOpacity?: number;
  onToggleShotClock?: () => void;
  onChangeOpacity?: (opacity: number) => void;
  isStageMode?: boolean;
  onToggleStageMode?: () => void;
  onToggleSound: () => void;
  onPlayHorn: () => void;
  onPlayWhistle: () => void;
  onOpenEvents?: () => void;
  onOpenHelp?: () => void;
  eventsCount?: number;
  onOpenSettings: () => void;
  onOpenSummary: (initialTab?: 'summary' | 'trend' | 'events') => void;
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
  voiceAnnouncementsEnabled = true,
  onToggleVoiceAnnouncements,
  onTestVoiceAnnouncement,
  settings,
  useShotClock = true,
  panelOpacity = 75,
  onToggleShotClock,
  onChangeOpacity,
  isStageMode = false,
  onToggleStageMode,
  onToggleSound,
  onPlayHorn,
  onPlayWhistle,
  onOpenEvents,
  onOpenHelp,
  eventsCount = 0,
  onOpenSettings,
  onOpenSummary,
  onOpenRoster,
  onResetGame,
  onSetPeriod,
  onNextPeriod,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'period' | 'sound' | 'stats' | 'display' | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const wakeLockRef = useRef<any>(null);

  // Screen Wake Lock API helpers to prevent device from sleeping in fullscreen
  const requestScreenWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        if (wakeLockRef.current && !wakeLockRef.current.released) {
          return;
        }
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        console.warn('Screen wakeLock request failed:', err);
      }
    }
  }, []);

  const releaseScreenWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignore
      }
      wakeLockRef.current = null;
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isNowFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isNowFullscreen);

      if (isNowFullscreen) {
        // Request wake lock to prevent display from sleeping
        await requestScreenWakeLock();
      } else {
        // Release wake lock when leaving fullscreen
        await releaseScreenWakeLock();
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
      }
    };

    // Re-acquire wake lock if tab becomes visible again while still in fullscreen
    const handleVisibilityChange = async () => {
      const isNowFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (document.visibilityState === 'visible' && isNowFullscreen) {
        await requestScreenWakeLock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseScreenWakeLock();
    };
  }, [requestScreenWakeLock, releaseScreenWakeLock]);

  const toggleFullscreen = async () => {
    if (!isFullscreen && !document.fullscreenElement) {
      await requestAppFullScreen();
      setIsFullscreen(true);
      await requestScreenWakeLock();
    } else {
      await exitAppFullScreen();
      setIsFullscreen(false);
      await releaseScreenWakeLock();
    }
  };


  const periodsList = Array.from(
    { length: Math.max(totalRegularPeriods, period) },
    (_, i) => i + 1
  );

  const scoreDiff = homeTeam.score - awayTeam.score;

  return (
    <header ref={headerRef} className="bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 md:py-2.5 sticky top-0 z-40 shadow-md shrink-0 select-none w-full">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3">
        {/* Left: App Brand & Period Dropdown Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-lg md:rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs sm:text-sm md:text-base shadow-md shrink-0">
              🏀
            </div>
            <div className="hidden md:block min-w-0 shrink-0">
              <h1 className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide leading-none whitespace-nowrap">
                篮球记分板
              </h1>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5 whitespace-nowrap">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="tabular-nums">
                  {scoreDiff > 0
                    ? `${homeTeam.shortName || homeTeam.name} +${scoreDiff}`
                    : scoreDiff < 0
                    ? `${awayTeam.shortName || awayTeam.name} +${Math.abs(scoreDiff)}`
                    : '比分持平'}
                </span>
              </div>
            </div>
          </div>

          {/* Period Selector Secondary Menu */}
          <div className="relative shrink-0 flex items-center gap-1.5">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'period' ? null : 'period')}
              title="切换比赛节次与加时赛"
              className={`h-7 sm:h-8 md:h-9 lg:h-10 px-2 sm:px-2.5 md:px-3.5 rounded-lg md:rounded-xl border text-[11px] sm:text-xs md:text-sm font-black flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                activeDropdown === 'period'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
            >
              <span>{period <= totalRegularPeriods ? `第 ${period} 节` : `加时 OT${period - totalRegularPeriods}`}</span>
              <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-80" />
            </button>

            {/* Match Mode Badge (Target Score vs Standard Time) */}
            {settings?.matchMode === 'target_score' ? (
              <button
                onClick={onOpenSettings}
                title="当前为单节抢分目标制，点击可调整目标分"
                className="hidden sm:flex items-center gap-1 h-7 sm:h-8 md:h-9 px-2 sm:px-2.5 rounded-lg md:rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400" />
                <span>目标 {settings.targetScorePerPeriod || 30}分/节</span>
              </button>
            ) : null}

            {activeDropdown === 'period' && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-slate-400 px-1 py-1 mb-1.5 border-b border-white/5 flex items-center justify-between">
                  <span>节次与加时赛选择</span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    {period <= totalRegularPeriods ? `当前第 ${period} 节` : `加时赛 OT${period - totalRegularPeriods}`}
                  </span>
                </div>

                {/* Quarter selection buttons grid */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {periodsList.map((p) => {
                    const isActive = p === period;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          onSetPeriod(p);
                          setActiveDropdown(null);
                        }}
                        className={`py-1.5 text-xs font-bold rounded-xl text-center transition-all ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {p <= totalRegularPeriods ? `第${p}节` : `OT${p - totalRegularPeriods}`}
                      </button>
                    );
                  })}
                </div>

                {/* Next Period Action */}
                <button
                  onClick={() => {
                    onNextPeriod();
                    setActiveDropdown(null);
                  }}
                  className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1 mb-2.5"
                >
                  <span>+ 进入下一节 / 加时赛</span>
                </button>

                {/* Quarter Scores Breakdown Table */}
                <div className="bg-slate-950/60 rounded-xl p-2 border border-white/5 text-[11px]">
                  <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
                    <span>各节得分明细</span>
                    <span className="text-[9px] text-slate-500">总分</span>
                  </div>
                  <div className="flex justify-between items-center py-1 text-slate-300">
                    <span className="font-bold truncate max-w-[70px]" style={{ color: homeTeam.color || '#ef4444' }}>
                      {homeTeam.shortName || homeTeam.name}
                    </span>
                    <div className="flex gap-1.5 font-digital tabular-nums">
                      {periodsList.map((p, idx) => (
                        <span key={p} className={`w-4 text-center ${p === period ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                          {homeTeam.quarterScores[idx] ?? 0}
                        </span>
                      ))}
                    </div>
                    <span className="font-bold font-digital tabular-nums text-white w-6 text-right">{homeTeam.score}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 text-slate-300 border-t border-white/5">
                    <span className="font-bold truncate max-w-[70px]" style={{ color: awayTeam.color || '#3b82f6' }}>
                      {awayTeam.shortName || awayTeam.name}
                    </span>
                    <div className="flex gap-1.5 font-digital tabular-nums">
                      {periodsList.map((p, idx) => (
                        <span key={p} className={`w-4 text-center ${p === period ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                          {awayTeam.quarterScores[idx] ?? 0}
                        </span>
                      ))}
                    </div>
                    <span className="font-bold font-digital tabular-nums text-white w-6 text-right">{awayTeam.score}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Aggregated Secondary Menus (No overflow, fully responsive) */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          {/* 1. Direct Quick Whistle */}
          <button
            onClick={onPlayWhistle}
            title="吹哨 (响亮裁判哨音)"
            className="h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 sm:px-2.5 md:px-3 lg:px-3.5 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 rounded-lg md:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center gap-1 transition-all border border-amber-500/30 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="whitespace-nowrap">鸣哨</span>
          </button>

          {/* 2. Audio & Referee Secondary Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'sound' ? null : 'sound')}
              title="裁判音响与 24s 控制"
              className={`h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 sm:px-2 md:px-3 lg:px-3.5 rounded-lg md:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center gap-1 transition-colors border shrink-0 cursor-pointer ${
                activeDropdown === 'sound'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-400 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">裁判台</span>
              <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-70" />
            </button>

            {activeDropdown === 'sound' && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 mb-1 border-b border-white/5 flex items-center justify-between">
                  <span>裁判台与音效控制</span>
                  <span className="text-[10px] text-amber-400">{soundEnabled ? '音效开启' : '已静音'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      onPlayHorn();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-rose-400" />
                      <span>球馆蜂鸣器</span>
                    </span>
                    <span className="text-[10px] text-slate-400">终场鸣响</span>
                  </button>

                  <button
                    onClick={() => {
                      onPlayWhistle();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span>裁判鸣哨</span>
                    </span>
                    <span className="text-[10px] text-slate-400">高亮哨音</span>
                  </button>

                  {onToggleShotClock && (
                    <button
                      onClick={() => {
                        onToggleShotClock();
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {useShotClock ? <Timer className="w-4 h-4 text-amber-400" /> : <TimerOff className="w-4 h-4 text-slate-400" />}
                        <span>24s 进攻时钟</span>
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${useShotClock ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
                        {useShotClock ? '已开启' : '已禁用'}
                      </span>
                    </button>
                  )}

                  {onToggleVoiceAnnouncements && (
                    <button
                      onClick={onToggleVoiceAnnouncements}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        <span>关键节点语音播报</span>
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${voiceAnnouncementsEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                        {voiceAnnouncementsEnabled ? '剩余2分/1分' : '已关闭'}
                      </span>
                    </button>
                  )}

                  {onTestVoiceAnnouncement && (
                    <button
                      onClick={() => {
                        onTestVoiceAnnouncement();
                        setActiveDropdown(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-between transition-colors border border-amber-500/20 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>试听本节语音播报</span>
                      </span>
                      <span className="text-[10px] text-amber-400/80">试听</span>
                    </button>
                  )}

                  <button
                    onClick={onToggleSound}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors mt-0.5 border-t border-white/5 pt-2 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                      <span>系统音效开关</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{soundEnabled ? '开' : '静音'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Direct Play-by-Play Events Quick Button */}
          {onOpenEvents && (
            <button
              onClick={onOpenEvents}
              title="查看实时比赛流水记录"
              className="h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 sm:px-2 md:px-2.5 lg:px-3 rounded-lg md:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center gap-1 transition-colors border shrink-0 cursor-pointer bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10 hover:border-amber-400/40"
            >
              <History className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">流水</span>
              {eventsCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[9px] md:text-[10px] font-digital font-black px-1 rounded-full">
                  {eventsCount}
                </span>
              )}
            </button>
          )}

          {/* 3.5 Direct Score Trend & Lead Diff Chart Button (Top Level Instant Access) */}
          <button
            onClick={() => onOpenSummary('trend')}
            title="查看比赛比分趋势图与分差走势波动图"
            className="h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 sm:px-2 md:px-2.5 lg:px-3 rounded-lg md:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center gap-1 transition-colors border shrink-0 cursor-pointer bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10 hover:border-emerald-400/40"
          >
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">走势图</span>
          </button>

          {/* 4. Match Stats & Events Secondary Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'stats' ? null : 'stats')}
              title="比赛统计与记录"
              className={`h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 sm:px-2 md:px-3 lg:px-3.5 rounded-lg md:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center gap-1 transition-colors border shrink-0 cursor-pointer ${
                activeDropdown === 'stats'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">数据</span>
              <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-70" />
            </button>

            {activeDropdown === 'stats' && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 mb-1 border-b border-white/5">
                  比赛数据与报告
                </div>
                <div className="flex flex-col gap-1">
                  {onOpenEvents && (
                    <button
                      onClick={() => {
                        onOpenEvents();
                        setActiveDropdown(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-400" />
                        <span>实时流水记录</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-digital px-1.5 py-0.2 rounded">
                        {eventsCount}条
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenRoster();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      <span>球员名单与数据</span>
                    </span>
                    <span className="text-[10px] text-slate-400">得分/犯规</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSummary('trend');
                      setActiveDropdown(null);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>比分趋势图与战报</span>
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-normal">走势/导出</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Display, Settings & Reset Secondary Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'display' ? null : 'display')}
              title="设置与外观"
              className={`h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 sm:px-2 md:px-3 lg:px-3.5 rounded-lg md:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center gap-1 transition-colors border shrink-0 cursor-pointer ${
                activeDropdown === 'display'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">设置</span>
              <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-70" />
            </button>

            {activeDropdown === 'display' && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-slate-400 px-1 py-1 mb-1 border-b border-white/5 flex items-center justify-between">
                  <span>系统与外观设置</span>
                  <span className="text-[10px] text-amber-400 font-digital">{panelOpacity}%透明</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {/* Opacity slider */}
                  {onChangeOpacity && (
                    <div className="bg-slate-800/60 p-2 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>面板透明度</span>
                        </span>
                        <span className="text-amber-400 font-digital tabular-nums">{panelOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={panelOpacity}
                        onChange={(e) => onChangeOpacity(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  )}

                  {/* Stage Mode Toggle */}
                  {onToggleStageMode && (
                    <button
                      onClick={() => {
                        onToggleStageMode();
                        setActiveDropdown(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Tv className="w-4 h-4 text-emerald-400" />
                        <span>{isStageMode ? '切换为控制台模式' : '大屏投屏模式'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{isStageMode ? '纯净' : '完整'}</span>
                    </button>
                  )}

                  {/* Settings Modal */}
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span>比赛规则与外观设置</span>
                    </span>
                  </button>

                  {/* 1. Event Log in Settings */}
                  {onOpenEvents && (
                    <button
                      onClick={() => {
                        onOpenEvents();
                        setActiveDropdown(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-400" />
                        <span>比赛实时流水记录</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-digital px-1.5 py-0.2 rounded">
                        {eventsCount}条
                      </span>
                    </button>
                  )}

                  {/* 2. Operation Guide & Shortcuts in Settings */}
                  {onOpenHelp && (
                    <button
                      onClick={() => {
                        onOpenHelp();
                        setActiveDropdown(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-sky-400" />
                        <span>技术台操作指引与快捷键</span>
                      </span>
                      <span className="text-[10px] text-sky-300 font-semibold">手册</span>
                    </button>
                  )}

                  {/* Reset Game */}
                  <button
                    onClick={() => {
                      onResetGame();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-950 text-rose-300 text-xs font-bold flex items-center justify-between transition-colors border border-rose-500/20 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <span>重新开局 (重置)</span>
                    </span>
                    <span className="text-[10px] text-rose-400">清空比分</span>
                  </button>

                  {/* Data Safety & Anti-refresh indicator */}
                  <div className="mt-1 pt-1.5 border-t border-white/5 px-1 flex items-center justify-between text-[10px] text-emerald-400/90">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>防刷新与数据保护已开启</span>
                    </span>
                    <span className="text-slate-400">本地自动存档</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Fullscreen Direct Action */}
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? '退出全屏 (恢复系统息屏设置)' : '全屏显示 (已启用屏幕常亮防息屏 & 锁定横屏)'}
            className={`h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 p-0 rounded-lg md:rounded-xl border transition-all shrink-0 flex items-center justify-center cursor-pointer active:scale-95 shadow-sm ${
              isFullscreen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-white/10'
            }`}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
