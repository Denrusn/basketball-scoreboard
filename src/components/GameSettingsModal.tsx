import React, { useState } from 'react';
import { X, Sliders, Keyboard, Check, Volume2 } from 'lucide-react';
import { GameSettings, Team } from '../types';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  homeTeam: Team;
  awayTeam: Team;
  onSaveSettings: (newSettings: GameSettings, homeName: string, homeShort: string, awayName: string, awayShort: string) => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  homeTeam,
  awayTeam,
  onSaveSettings,
}) => {
  const [periodMinutes, setPeriodMinutes] = useState(settings.periodMinutes);
  const [overtimeMinutes, setOvertimeMinutes] = useState(settings.overtimeMinutes);
  const [shotClockSeconds, setShotClockSeconds] = useState(settings.shotClockSeconds);
  const [shotClockOffensiveReboundSeconds, setShotClockOffensiveReboundSeconds] = useState(settings.shotClockOffensiveReboundSeconds);
  const [foulsForBonus, setFoulsForBonus] = useState(settings.foulsForBonus);
  const [maxTimeouts, setMaxTimeouts] = useState(settings.maxTimeouts);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  const [homeName, setHomeName] = useState(homeTeam.name);
  const [homeShort, setHomeShort] = useState(homeTeam.shortName || 'HOME');
  const [awayName, setAwayName] = useState(awayTeam.name);
  const [awayShort, setAwayShort] = useState(awayTeam.shortName || 'AWAY');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(
      {
        ...settings,
        periodMinutes,
        overtimeMinutes,
        shotClockSeconds,
        shotClockOffensiveReboundSeconds,
        foulsForBonus,
        foulsForDoubleBonus: foulsForBonus + 2,
        maxTimeouts,
        soundEnabled,
      },
      homeName,
      homeShort,
      awayName,
      awayShort
    );
    onClose();
  };

  const presetFiba = () => {
    setPeriodMinutes(10);
    setOvertimeMinutes(5);
    setShotClockSeconds(24);
    setShotClockOffensiveReboundSeconds(14);
    setFoulsForBonus(5);
  };

  const presetNba = () => {
    setPeriodMinutes(12);
    setOvertimeMinutes(5);
    setShotClockSeconds(24);
    setShotClockOffensiveReboundSeconds(14);
    setFoulsForBonus(5);
  };

  const presetYouth = () => {
    setPeriodMinutes(8);
    setOvertimeMinutes(3);
    setShotClockSeconds(24);
    setShotClockOffensiveReboundSeconds(14);
    setFoulsForBonus(5);
  };

  const preset3x3 = () => {
    setPeriodMinutes(10);
    setOvertimeMinutes(0);
    setShotClockSeconds(12);
    setShotClockOffensiveReboundSeconds(12);
    setFoulsForBonus(7);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">比赛规则与参数设置</h2>
              <p className="text-xs text-slate-400">自定义单节时长、24秒/14秒规则、犯规加罚线与队伍名称</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-sm">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              快速赛事预设:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={presetFiba}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all text-center"
              >
                FIBA 国际篮联 (10分钟)
              </button>
              <button
                type="button"
                onClick={presetNba}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all text-center"
              >
                NBA / CBA (12分钟)
              </button>
              <button
                type="button"
                onClick={presetYouth}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all text-center"
              >
                青少年 / 校园赛 (8分钟)
              </button>
              <button
                type="button"
                onClick={preset3x3}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all text-center"
              >
                三人篮球 3x3 (12秒进攻)
              </button>
            </div>
          </div>

          {/* Time Rules */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              计时器规则
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  单节比赛时长 (分钟)
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
                  加时赛时长 (分钟)
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
          </div>

          {/* Fouls & Timeouts */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              犯规与暂停规则
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  单节犯规加罚线 (BONUS 犯规数)
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

          {/* Team Names */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              球队信息
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-amber-400 mb-1 font-semibold">
                  主队名称 (HOME)
                </label>
                <input
                  type="text"
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white focus:border-amber-400 focus:outline-none mb-2"
                />
                <input
                  type="text"
                  placeholder="主队简称 (如 湖人 / LAL)"
                  value={homeShort}
                  onChange={(e) => setHomeShort(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-cyan-400 mb-1 font-semibold">
                  客队名称 (AWAY)
                </label>
                <input
                  type="text"
                  value={awayName}
                  onChange={(e) => setAwayName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white focus:border-cyan-400 focus:outline-none mb-2"
                />
                <input
                  type="text"
                  placeholder="客队简称 (如 勇士 / GSW)"
                  value={awayShort}
                  onChange={(e) => setAwayShort(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Cheat Sheet */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-amber-400" />
              常用记分员键盘快捷键
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold mr-1">
                  [空格 Space]
                </span>
                <span className="text-slate-300">比赛计时 启/停</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold mr-1">
                  [R]
                </span>
                <span className="text-slate-300">重置 24秒</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold mr-1">
                  [E]
                </span>
                <span className="text-slate-300">重置 14秒</span>
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
