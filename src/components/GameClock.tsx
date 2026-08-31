import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Edit3, Check } from 'lucide-react';

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
  const showTenths = minutes === 0 && seconds < 60;

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
    <div className="bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-1.5">
        <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? 'bg-emerald-400 animate-ping'
                : tenthsLeft === 0
                ? 'bg-rose-500'
                : 'bg-amber-400'
            }`}
          />
          比赛时钟 (GAME CLOCK)
        </span>
        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
          空格键 启停
        </span>
      </div>

      {/* Balanced Digital Clock Display */}
      <div className="bg-slate-950 rounded-xl px-4 py-2.5 sm:py-3 border border-slate-800/90 w-full flex items-center justify-center relative my-1.5">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex items-center gap-1.5 font-digital text-3xl sm:text-4xl py-1">
            <input
              type="number"
              min="0"
              max="99"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              className="w-14 bg-slate-900 border border-amber-500/80 rounded px-1.5 py-0.5 text-center text-amber-400 focus:outline-none"
            />
            <span className="text-slate-400 font-bold">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={editSeconds}
              onChange={(e) => setEditSeconds(e.target.value)}
              className="w-14 bg-slate-900 border border-amber-500/80 rounded px-1.5 py-0.5 text-center text-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="ml-1.5 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
              title="保存"
            >
              <Check className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex items-baseline font-digital font-black tracking-tight select-none">
            <span
              className={`text-4xl sm:text-5xl md:text-5xl lg:text-6xl leading-none ${
                tenthsLeft === 0
                  ? 'text-rose-500 animate-pulse'
                  : tenthsLeft <= 100
                  ? 'text-rose-400'
                  : 'text-amber-400'
              } drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]`}
            >
              {formattedMinutes}:{formattedSeconds}
            </span>
            {showTenths && (
              <span className="text-2xl sm:text-3xl text-amber-500/80 ml-1">
                .{tenths}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Clock Primary Actions */}
      <div className="w-full flex items-center gap-2 mt-1.5">
        {/* Play / Pause main button */}
        <button
          onClick={onToggleRun}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 text-sm ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>暂停</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>开始比赛</span>
            </>
          )}
        </button>

        {/* Reset & Quick Edit */}
        <button
          onClick={onResetClock}
          title="重置本节时间"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleStartEdit}
          title="手动修改时间"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-colors shrink-0"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Micro adjustments (+10s, -10s, +1s, -1s) */}
      <div className="w-full grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onAdjustTime(-10)}
          className="py-1 text-[11px] font-semibold rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          -10s
        </button>
        <button
          onClick={() => onAdjustTime(-1)}
          className="py-1 text-[11px] font-semibold rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          -1s
        </button>
        <button
          onClick={() => onAdjustTime(1)}
          className="py-1 text-[11px] font-semibold rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          +1s
        </button>
        <button
          onClick={() => onAdjustTime(10)}
          className="py-1 text-[11px] font-semibold rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          +10s
        </button>
      </div>
    </div>
  );
};
