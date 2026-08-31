import React from 'react';
import { RotateCcw, RefreshCw, Play, Pause } from 'lucide-react';

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
      className={`bg-slate-900/85 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 lg:p-5 landscape:p-2 landscape:sm:p-3 border transition-all duration-300 flex flex-col items-center justify-between shadow-2xl shadow-black/50 ${
        isExpired
          ? 'border-red-500 ring-2 ring-red-500 bg-red-950/40'
          : isUrgent
          ? 'border-rose-500/80 bg-slate-900/85'
          : 'border-white/10'
      }`}
    >
      {/* Title */}
      <div className="w-full flex items-center justify-between text-[10px] sm:text-xs text-slate-400 pb-1 sm:pb-1.5 border-b border-white/5">
        <span className="font-bold tracking-wider flex items-center gap-1 sm:gap-1.5 text-slate-300">
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isExpired ? 'bg-red-500 animate-ping' : isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'
            }`}
          />
          进攻时限
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-400">
          [R] 24s / [E] 14s
        </span>
      </div>

      {/* Clock Display */}
      <div className="py-1 sm:py-3 lg:py-4 landscape:py-0.5 flex items-center justify-center select-none">
        <div className="flex items-baseline font-digital font-black tracking-tight">
          <span
            className={`text-2xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl landscape:text-xl landscape:sm:text-3xl landscape:md:text-4xl landscape:lg:text-5xl leading-none ${
              isExpired
                ? 'text-red-500 animate-pulse'
                : isUrgent
                ? 'text-rose-500 animate-pulse'
                : 'text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            }`}
          >
            {String(seconds).padStart(2, '0')}
          </span>
          {seconds < 5 && (
            <span className="text-base sm:text-2xl text-rose-400 ml-0.5">
              .{tenths}
            </span>
          )}
        </div>
      </div>

      {/* Primary Reset Actions */}
      <div className="w-full grid grid-cols-2 gap-1 sm:gap-2">
        <button
          onClick={onReset24}
          className="py-1 sm:py-2 px-1.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 border border-white/10 transition-all shadow-sm landscape:py-1"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>{defaultShotSeconds}s</span>
        </button>

        <button
          onClick={onReset14}
          className="py-1 sm:py-2 px-1.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 border border-white/10 transition-all shadow-sm landscape:py-1"
        >
          <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>{reboundShotSeconds}s</span>
        </button>
      </div>

      {/* Minor Adjustments */}
      <div className="w-full flex items-center justify-between gap-1 mt-1.5 sm:mt-2.5 pt-1 sm:pt-2 border-t border-white/5 landscape:mt-1 landscape:pt-1">
        <button
          onClick={() => onAdjustTime(-1)}
          className="flex-1 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          -1s
        </button>
        <button
          onClick={onToggleRun}
          className="flex-1 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold rounded bg-slate-950/40 hover:bg-slate-800 text-slate-300 transition-colors flex items-center justify-center gap-1"
        >
          {isRunning ? <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          <span>{isRunning ? '暂停' : '启动'}</span>
        </button>
        <button
          onClick={() => onAdjustTime(1)}
          className="flex-1 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          +1s
        </button>
      </div>
    </div>
  );
};
