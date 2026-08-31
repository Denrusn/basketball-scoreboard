import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Edit3, Check } from 'lucide-react';

interface GameClockProps {
  tenthsLeft: number; // 10 tenths = 1 second
  isRunning: boolean;
  onToggleRun: () => void;
  onResetClock: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  onSetExactTime: (minutes: number, seconds: number, tenths?: number) => void;
}

export const GameClock: React.FC<GameClockProps> = ({
  tenthsLeft,
  isRunning,
  onToggleRun,
  onResetClock,
  onAdjustTime,
  onSetExactTime,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('10');
  const [editSeconds, setEditSeconds] = useState('00');

  // Convert tenths to MM:SS.t
  const totalSeconds = Math.floor(tenthsLeft / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = tenthsLeft % 10;

  // Format time display
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const showTenths = minutes === 0 && seconds < 60; // Show tenths in final minute

  const handleStartEdit = () => {
    setEditMinutes(String(minutes));
    setEditSeconds(String(seconds));
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Math.max(0, parseInt(editMinutes, 10) || 0);
    const s = Math.min(59, Math.max(0, parseInt(editSeconds, 10) || 0));
    onSetExactTime(m, s, 0);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? 'bg-emerald-400 animate-ping'
                : tenthsLeft === 0
                ? 'bg-rose-500'
                : 'bg-amber-400'
            }`}
          />
          比赛倒计时 (GAME CLOCK)
        </span>
        <span className="text-[11px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
          快捷键 [空格] 启停
        </span>
      </div>

      {/* Main Digital Clock Display */}
      <div className="bg-slate-950 rounded-xl p-4 sm:p-5 border border-slate-800/90 w-full flex items-center justify-center relative my-2">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex items-center gap-2 font-digital text-4xl sm:text-5xl">
            <input
              type="number"
              min="0"
              max="99"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              className="w-16 bg-slate-900 border border-amber-500/60 rounded px-2 py-1 text-center text-amber-400 focus:outline-none"
            />
            <span className="text-slate-400">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={editSeconds}
              onChange={(e) => setEditSeconds(e.target.value)}
              className="w-16 bg-slate-900 border border-amber-500/60 rounded px-2 py-1 text-center text-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="ml-2 p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
              title="保存"
            >
              <Check className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="flex items-baseline font-digital font-black tracking-tight">
            <span
              className={`text-6xl sm:text-7xl md:text-8xl leading-none ${
                tenthsLeft === 0
                  ? 'text-rose-500 animate-pulse'
                  : tenthsLeft <= 100
                  ? 'text-rose-400'
                  : 'text-amber-400'
              } drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]`}
            >
              {formattedMinutes}:{formattedSeconds}
            </span>
            {showTenths && (
              <span className="text-3xl sm:text-4xl text-amber-500/80 ml-1">
                .{tenths}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Clock Primary Actions */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-2 mt-2">
        {/* Play / Pause main button */}
        <button
          onClick={onToggleRun}
          className={`w-full flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span className="text-base tracking-wide">暂停计时 (PAUSE)</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span className="text-base tracking-wide">开始比赛 (START)</span>
            </>
          )}
        </button>

        {/* Reset & Quick Edit */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={onResetClock}
            title="重置本节时间"
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-colors flex-1 sm:flex-none"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleStartEdit}
            title="手动修改时间"
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-colors flex-1 sm:flex-none"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Micro adjustments (+10s, -10s, +1s, -1s) */}
      <div className="w-full grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onAdjustTime(-10)}
          className="py-1.5 text-xs font-semibold rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          -10秒
        </button>
        <button
          onClick={() => onAdjustTime(-1)}
          className="py-1.5 text-xs font-semibold rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          -1秒
        </button>
        <button
          onClick={() => onAdjustTime(1)}
          className="py-1.5 text-xs font-semibold rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          +1秒
        </button>
        <button
          onClick={() => onAdjustTime(10)}
          className="py-1.5 text-xs font-semibold rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          +10秒
        </button>
      </div>
    </div>
  );
};
