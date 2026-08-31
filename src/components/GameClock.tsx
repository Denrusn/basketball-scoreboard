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

  const totalSeconds = Math.floor(tenthsLeft / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = tenthsLeft % 10;

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
    <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 lg:p-5 landscape:p-2 landscape:sm:p-3 border border-white/10 flex flex-col items-center justify-between shadow-2xl shadow-black/50">
      {/* Title */}
      <div className="w-full flex items-center justify-between text-[10px] sm:text-xs text-slate-400 pb-1 sm:pb-1.5 border-b border-white/5">
        <span className="font-bold tracking-wider flex items-center gap-1 sm:gap-1.5 text-slate-300">
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          比赛时钟
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-400">
          空格 启停
        </span>
      </div>

      {/* Clock Display */}
      <div className="py-1 sm:py-3 lg:py-4 landscape:py-0.5 flex items-center justify-center select-none">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex items-center gap-1 font-digital text-xl sm:text-3xl py-0.5">
            <input
              type="number"
              min="0"
              max="99"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              className="w-10 sm:w-12 bg-slate-950 border border-amber-400 rounded px-1 text-center text-amber-400 focus:outline-none text-sm sm:text-base font-bold"
            />
            <span className="text-slate-400 font-bold">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={editSeconds}
              onChange={(e) => setEditSeconds(e.target.value)}
              className="w-10 sm:w-12 bg-slate-950 border border-amber-400 rounded px-1 text-center text-amber-400 focus:outline-none text-sm sm:text-base font-bold"
            />
            <button
              type="submit"
              className="ml-1 p-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              title="保存"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-baseline font-digital font-black tracking-tight">
            <span
              className={`text-2xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl landscape:text-xl landscape:sm:text-3xl landscape:md:text-4xl landscape:lg:text-5xl leading-none ${
                tenthsLeft === 0
                  ? 'text-rose-500 animate-pulse'
                  : tenthsLeft <= 100
                  ? 'text-rose-400'
                  : 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              }`}
            >
              {formattedMinutes}:{formattedSeconds}
            </span>
            {showTenths && (
              <span className="text-base sm:text-2xl text-amber-400/80 ml-0.5">
                .{tenths}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Start / Pause Controls */}
      <div className="w-full flex items-center gap-1 sm:gap-2">
        <button
          onClick={onToggleRun}
          className={`flex-1 py-1.5 sm:py-2.5 px-2 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-1 transition-all text-xs sm:text-sm shadow-md active:scale-95 landscape:py-1 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              <span>暂停</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              <span>开始</span>
            </>
          )}
        </button>

        <button
          onClick={onResetClock}
          title="重置本节"
          className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors landscape:p-1"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={handleStartEdit}
          title="编辑时间"
          className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors landscape:p-1"
        >
          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Quick Trim Buttons */}
      <div className="w-full grid grid-cols-4 gap-0.5 sm:gap-1 mt-1.5 sm:mt-2.5 pt-1 sm:pt-2 border-t border-white/5 landscape:mt-1 landscape:pt-1">
        <button
          onClick={() => onAdjustTime(-10)}
          className="py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          -10s
        </button>
        <button
          onClick={() => onAdjustTime(-1)}
          className="py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          -1s
        </button>
        <button
          onClick={() => onAdjustTime(1)}
          className="py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          +1s
        </button>
        <button
          onClick={() => onAdjustTime(10)}
          className="py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          +10s
        </button>
      </div>
    </div>
  );
};
