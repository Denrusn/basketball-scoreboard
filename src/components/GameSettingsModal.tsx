import React, { useState } from 'react';
import { X, Sliders, Keyboard, Check, Volume2, Eye, Palette, Timer, TimerOff, Target, Clock, Sparkles } from 'lucide-react';
import { GameSettings, Team, MatchMode } from '../types';
import { JERSEY_COLOR_PRESETS } from '../utils/teamColors';
import { TeamColorPicker } from './TeamColorPicker';
import { speakPeriodTimeRemaining } from '../utils/audio';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  homeTeam: Team;
  awayTeam: Team;
  onSaveSettings: (
    newSettings: GameSettings,
    homeName: string,
    homeShort: string,
    awayName: string,
    awayShort: string,
    homeColor?: string,
    awayColor?: string
  ) => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  homeTeam,
  awayTeam,
  onSaveSettings,
}) => {
  const [matchMode, setMatchMode] = useState<MatchMode>(settings.matchMode || 'time');
  const [targetScorePerPeriod, setTargetScorePerPeriod] = useState(settings.targetScorePerPeriod || 30);
  const [customTargetInput, setCustomTargetInput] = useState(String(settings.targetScorePerPeriod || 30));
  const [periodMinutes, setPeriodMinutes] = useState(settings.periodMinutes);
  const [overtimeMinutes, setOvertimeMinutes] = useState(settings.overtimeMinutes);
  const [useShotClock, setUseShotClock] = useState(settings.useShotClock ?? true);
  const [shotClockSeconds, setShotClockSeconds] = useState(settings.shotClockSeconds);
  const [shotClockOffensiveReboundSeconds, setShotClockOffensiveReboundSeconds] = useState(settings.shotClockOffensiveReboundSeconds);
  const [foulsForBonus, setFoulsForBonus] = useState(settings.foulsForBonus);
  const [maxTimeouts, setMaxTimeouts] = useState(settings.maxTimeouts);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [voiceAnnouncementsEnabled, setVoiceAnnouncementsEnabled] = useState(settings.voiceAnnouncementsEnabled ?? true);
  const [panelOpacity, setPanelOpacity] = useState(settings.panelOpacity ?? 30);

  const [homeName, setHomeName] = useState(homeTeam.name);
  const [homeShort, setHomeShort] = useState(homeTeam.shortName || 'HOME');
  const [homeColor, setHomeColor] = useState(homeTeam.color || '#ef4444');

  const [awayName, setAwayName] = useState(awayTeam.name);
  const [awayShort, setAwayShort] = useState(awayTeam.shortName || 'AWAY');
  const [awayColor, setAwayColor] = useState(awayTeam.color || '#3b82f6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTargetScore = parseInt(customTargetInput, 10) || targetScorePerPeriod || 30;

    onSaveSettings(
      {
        ...settings,
        matchMode,
        targetScorePerPeriod: finalTargetScore,
        periodMinutes,
        overtimeMinutes,
        useShotClock,
        shotClockSeconds,
        shotClockOffensiveReboundSeconds,
        foulsForBonus,
        foulsForDoubleBonus: foulsForBonus + 2,
        maxTimeouts,
        soundEnabled,
        voiceAnnouncementsEnabled,
        panelOpacity,
      },
      homeName,
      homeShort,
      awayName,
      awayShort,
      homeColor,
      awayColor
    );
    onClose();
  };

  const presetFiba = () => {
    setMatchMode('time');
    setPeriodMinutes(10);
    setOvertimeMinutes(5);
    setUseShotClock(true);
    setShotClockSeconds(24);
    setShotClockOffensiveReboundSeconds(14);
    setFoulsForBonus(5);
  };

  const presetNba = () => {
    setMatchMode('time');
    setPeriodMinutes(12);
    setOvertimeMinutes(5);
    setUseShotClock(true);
    setShotClockSeconds(24);
    setShotClockOffensiveReboundSeconds(14);
    setFoulsForBonus(5);
  };

  const presetTargetScore30 = () => {
    setMatchMode('target_score');
    setTargetScorePerPeriod(30);
    setCustomTargetInput('30');
    setPeriodMinutes(10);
    setUseShotClock(true);
    setShotClockSeconds(24);
    setShotClockOffensiveReboundSeconds(14);
    setFoulsForBonus(5);
  };

  const preset3x3 = () => {
    setMatchMode('time');
    setPeriodMinutes(10);
    setOvertimeMinutes(0);
    setUseShotClock(true);
    setShotClockSeconds(12);
    setShotClockOffensiveReboundSeconds(12);
    setFoulsForBonus(7);
  };

  const handleSelectPresetTarget = (score: number) => {
    setTargetScorePerPeriod(score);
    setCustomTargetInput(String(score));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[96vh] landscape:max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header - Adaptive compact title bar for mobile landscape & tablet */}
        <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 landscape:py-1.5 landscape:px-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 landscape:w-5 landscape:h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 landscape:w-3 landscape:h-3" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white truncate">比赛规则与模式设置</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block landscape:hidden md:landscape:block">
                支持常规计时制、单节目标分制 (20/25/30分/自定义)、24s进攻时钟及外观调节
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 landscape:p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-2.5 sm:p-4 landscape:p-2.5 space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm">
          {/* Match Mode Selection Section */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                比赛模式设置 (计时制 vs 目标得分制)
              </h3>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                {matchMode === 'target_score' ? `抢分目标制 (${targetScorePerPeriod}分/节)` : '标准计时制'}
              </span>
            </div>

            {/* Mode Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Standard Time Mode */}
              <button
                type="button"
                onClick={() => setMatchMode('time')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  matchMode === 'time'
                    ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    ⏱ 标准计时模式 (Time-Based)
                  </span>
                  {matchMode === 'time' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  每节固定时长（如 10 分钟），倒计时结束该节比赛结束。
                </p>
              </button>

              {/* Option 2: Target Score Mode */}
              <button
                type="button"
                onClick={() => setMatchMode('target_score')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  matchMode === 'target_score'
                    ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    🎯 单节抢分目标制 (Target Score)
                  </span>
                  {matchMode === 'target_score' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  按单节分数设计，任意队伍单节率先达到目标分（如 30 分）该节立即结束。
                </p>
              </button>
            </div>

            {/* Target Score Options if target_score is active */}
            {matchMode === 'target_score' && (
              <div className="pt-3 border-t border-white/10 space-y-2.5 animate-in fade-in">
                <label className="block text-xs font-semibold text-slate-300">
                  单节目标得分设置 (默认 30 分，可快速选择或自定义输入):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 25, 30].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => handleSelectPresetTarget(pts)}
                      className={`py-2 px-3 rounded-xl font-digital text-sm font-black border transition-all cursor-pointer ${
                        targetScorePerPeriod === pts && customTargetInput === String(pts)
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/50 hover:bg-slate-800'
                      }`}
                    >
                      {pts} 分
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const val = parseInt(customTargetInput, 10) || 30;
                      setTargetScorePerPeriod(val);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      ![20, 25, 30].includes(targetScorePerPeriod)
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    自定义
                  </button>
                </div>

                {/* Custom Number Input */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400 whitespace-nowrap">自定义目标分:</span>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={customTargetInput}
                    onChange={(e) => {
                      setCustomTargetInput(e.target.value);
                      const num = parseInt(e.target.value, 10);
                      if (!isNaN(num) && num > 0) {
                        setTargetScorePerPeriod(num);
                      }
                    }}
                    className="w-24 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-digital font-bold text-center text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">分 / 节</span>
                  <span className="text-[11px] text-amber-400 ml-auto">
                    (任一队本节先达到 <strong>{customTargetInput || targetScorePerPeriod}</strong> 分则本节结束)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              快速赛事规则预设:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={presetTargetScore30}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                  matchMode === 'target_score' && targetScorePerPeriod === 30
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
                }`}
              >
                🎯 目标分 30分/节 (默认抢分)
              </button>
              <button
                type="button"
                onClick={presetFiba}
                className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 hover:bg-slate-800/80 text-xs font-bold text-amber-300 transition-all text-center cursor-pointer"
              >
                ★ FIBA 国际标准 (10分+24s)
              </button>
              <button
                type="button"
                onClick={presetNba}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all text-center cursor-pointer"
              >
                NBA / 职业联赛 (12分+24s)
              </button>
              <button
                type="button"
                onClick={preset3x3}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all text-center cursor-pointer"
              >
                三人篮球 3x3 (10分+12s)
              </button>
            </div>
          </div>

          {/* Visual Appearance Section: Opacity & Theme Colors */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                页面视觉与透明度 (透视球场底色)
              </h3>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                当前: {panelOpacity}%
              </span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>高透 20% (清晰透出木地板/球场地线)</span>
                <span>默认 30%</span>
                <span>实色 100%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={panelOpacity}
                onChange={(e) => setPanelOpacity(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPanelOpacity(30)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer font-bold ${
                    panelOpacity === 30
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  ★ 默认 30% (高透视)
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpacity(60)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                    panelOpacity === 60
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  半透 60%
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpacity(90)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                    panelOpacity === 90
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  实色 90%
                </button>
              </div>
            </div>
          </div>

          {/* Shot Clock Master Toggle */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {useShotClock ? <Timer className="w-4 h-4 text-emerald-400" /> : <TimerOff className="w-4 h-4 text-slate-400" />}
                  24秒 / 14秒 进攻时钟 (FIBA 标准)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  符合 FIBA 国际标准 24 秒与前场篮板 14 秒规则。可在比赛中通过记分牌或顶部按钮随时禁用/启用。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseShotClock(!useShotClock)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 cursor-pointer ${
                  useShotClock ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    useShotClock ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {useShotClock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5 animate-in fade-in">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    常规进攻时限 (秒)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={shotClockSeconds}
                    onChange={(e) => setShotClockSeconds(parseInt(e.target.value, 10) || 24)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white font-digital text-base focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    前场篮板重置时限 (秒)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={shotClockOffensiveReboundSeconds}
                    onChange={(e) => setShotClockOffensiveReboundSeconds(parseInt(e.target.value, 10) || 14)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white font-digital text-base focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Team Info & Jersey Colors */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              球队信息与球衣配色
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Home */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold" style={{ color: homeColor }}>
                    主队 (HOME)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">球衣色:</span>
                    <TeamColorPicker
                      currentColor={homeColor}
                      onSelectColor={(hex) => setHomeColor(hex)}
                      teamLabel="主队"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="主队全称"
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-sm focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="主队简称 (如 主队 / RED)"
                  value={homeShort}
                  onChange={(e) => setHomeShort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Away */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold" style={{ color: awayColor }}>
                    客队 (AWAY)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">球衣色:</span>
                    <TeamColorPicker
                      currentColor={awayColor}
                      onSelectColor={(hex) => setAwayColor(hex)}
                      teamLabel="客队"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="客队全称"
                  value={awayName}
                  onChange={(e) => setAwayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="客队简称 (如 客队 / BLUE)"
                  value={awayShort}
                  onChange={(e) => setAwayShort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Time Rules */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              比赛节次与计时时长
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  单节比赛建议时长 (分钟)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={periodMinutes}
                  onChange={(e) => setPeriodMinutes(parseInt(e.target.value, 10) || 10)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white font-digital text-base focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  加时赛单节时长 (分钟)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={overtimeMinutes}
                  onChange={(e) => setOvertimeMinutes(parseInt(e.target.value, 10) || 5)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white font-digital text-base focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fouls & Timeouts */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              犯规与暂停规则
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  单节全队犯规加罚线 (BONUS 犯规数)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={foulsForBonus}
                  onChange={(e) => setFoulsForBonus(parseInt(e.target.value, 10) || 5)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white font-digital text-base focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  每队可用暂停上限 (次)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxTimeouts}
                  onChange={(e) => setMaxTimeouts(parseInt(e.target.value, 10) || 5)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white font-digital text-base focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sound & Voice Broadcast Rules */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              球馆音效与关键时间语音播报
            </h3>

            {/* Sound Master Switch */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white">系统音效总开关</div>
                <div className="text-[11px] text-slate-400">开启球馆终场蜂鸣器、裁判哨音及进球提示音</div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 cursor-pointer ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice Announcement Switch */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>每节最后 2 分钟与 1 分钟语音播报</span>
                  <span className="text-[10px] text-amber-400 font-normal bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    计时赛专用
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  每节比赛倒计时进行至剩余 2:00 和 1:00 时，自动播报：如“第一节比赛剩余两分钟”、“第一节比赛剩余一分钟”。抢分赛不适用。
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoiceAnnouncementsEnabled(!voiceAnnouncementsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 cursor-pointer ${
                  voiceAnnouncementsEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    voiceAnnouncementsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Voice Button */}
            <div className="pt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => speakPeriodTimeRemaining(1, settings.totalRegularPeriods || 4, 2)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>试听语音播报效果 (两分钟)</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Cheat Sheet */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-amber-400" />
              记分台常用快捷键
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold mr-1">
                  [空格]
                </span>
                <span className="text-slate-300">比赛计时 启/停</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold mr-1">
                  [R]
                </span>
                <span className="text-slate-300">重置 24s</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold mr-1">
                  [E]
                </span>
                <span className="text-slate-300">重置 14s</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold mr-1">
                  [Ctrl+Z]
                </span>
                <span className="text-slate-300">撤销上一步</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-2 sm:p-3 md:p-4 landscape:py-2 landscape:px-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 sm:px-5 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
