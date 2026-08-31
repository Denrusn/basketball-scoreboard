import React from 'react';
import { RotateCcw, RefreshCw, Play, Pause, AlertTriangle } from 'lucide-react';

interface ShotClockProps {
  tenthsLeft: number; // 10 tenths = 1 second
  isRunning: boolean;
  onToggleRun: () => void;
  onReset24: () => void;
  onReset14: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  defaultShotSeconds?: number;
  reboundShotSeconds?: number;
}

export const ShotClock: React.FC<ShotClockProps> = ({
  tenthsLeft,
  isRunning,
  onToggleRun,
  onReset24,
  onReset14,
  onAdjustTime,
  defaultShotSeconds = 24,
  reboundShotSeconds = 14,
}) => {
  const seconds = Math.floor(tenthsLeft / 10);
  const tenths = tenthsLeft % 10;
  const isUrgent = tenthsLeft <= 50 && tenthsLeft > 0;
  const isExpired = tenthsLeft === 0;

  return (
    <div
      className={`bg-slate-900/95 rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col items-center justify-between shadow-xl relative ${
        isExpired
          ? 'border-red-500 ring-2 ring-red-500 bg-red-950/25'
          : isUrgent
          ? 'border-rose-500/70 shadow-rose-950/40 bg-slate-900/95'
          : 'border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-1.5">
        <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
          <AlertTriangle
            className={`w-3.5 h-3.5 ${
              isExpired ? 'text-red-500 animate-bounce' : isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400'
            }`}
          />
          进攻时限 (SHOT CLOCK)
        </span>
        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
          [R] 24s / [E] 14s
        </span>
      </div>

      {/* Balanced Digital Display */}
      <div className="bg-slate-950 rounded-xl px-4 py-2.5 sm:py-3 border border-slate-800/90 w-full flex items-center justify-center relative my-1.5">
        <div className="flex items-baseline font-digital font-black tracking-tight select-none">
          <span
            className={`text-4xl sm:text-5xl md:text-5xl lg:text-6xl leading-none ${
              isExpired
                ? 'text-red-500 animate-pulse'
                : isUrgent
                ? 'text-rose-500 animate-pulse'
                : 'text-amber-500'
            } drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]`}
          >
            {String(seconds).padStart(2, '0')}
          </span>
          {seconds < 5 && (
            <span className="text-2xl sm:text-3xl text-rose-400 ml-1">
              .{tenths}
            </span>
          )}
        </div>
      </div>

      {/* Primary Reset Actions */}
      <div className="w-full grid grid-cols-2 gap-2 mt-1.5">
        <button
          onClick={onReset24}
          className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置 {defaultShotSeconds}s</span>
        </button>

        <button
          onClick={onReset14}
          className="py-2.5 px-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-600/20 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>前场板 {reboundShotSeconds}s</span>
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="w-full flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onAdjustTime(-1)}
          className="flex-1 py-1 text-[11px] font-semibold rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          -1s
        </button>
        <button
          onClick={onToggleRun}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
            isRunning
              ? 'bg-slate-800 text-amber-400 border-slate-700'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isRunning ? '暂停' : '启动'}</span>
        </button>
        <button
          onClick={() => onAdjustTime(1)}
          className="flex-1 py-1 text-[11px] font-semibold rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          +1s
        </button>
      </div>
    </div>
  );
};
