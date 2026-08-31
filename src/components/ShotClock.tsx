import React from 'react';
import { RotateCcw, RefreshCw, Play, Pause, Timer, TimerOff } from 'lucide-react';

interface ShotClockProps {
  tenthsLeft: number; // 10 tenths = 1 second
  isRunning: boolean;
  enabled?: boolean;
  onToggleEnabled?: () => void;
  onToggleRun: () => void;
  onReset24: () => void;
  onReset14: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  defaultShotSeconds?: number;
  reboundShotSeconds?: number;
  panelOpacity?: number;
}

export const ShotClock: React.FC<ShotClockProps> = ({
  tenthsLeft,
  isRunning,
  enabled = true,
  onToggleEnabled,
  onToggleRun,
  onReset24,
  onReset14,
  onAdjustTime,
  defaultShotSeconds = 24,
  reboundShotSeconds = 14,
  panelOpacity = 75,
}) => {
  const seconds = Math.floor(tenthsLeft / 10);
  const tenths = tenthsLeft % 10;
  const isUrgent = enabled && tenthsLeft <= 50 && tenthsLeft > 0;
  const isExpired = enabled && tenthsLeft === 0;

  const opacityRatio = Math.max(0.15, Math.min(1, (panelOpacity ?? 75) / 100));

  return (
    <div
      style={{
        backgroundColor: !enabled
          ? `rgba(15, 23, 42, ${Math.max(0.2, opacityRatio * 0.8)})`
          : isExpired
          ? `rgba(69, 10, 10, ${Math.max(0.6, opacityRatio)})`
          : `rgba(15, 23, 42, ${opacityRatio})`,
        backdropFilter: opacityRatio < 0.95 ? 'blur(8px)' : 'none',
      }}
      className={`mobile-compact-card flex-1 min-h-0 rounded-xl sm:rounded-2xl lg:rounded-3xl p-1.5 sm:p-2.5 md:p-3.5 lg:p-4 border transition-colors duration-200 flex flex-col items-center justify-between shadow-xl shadow-black/50 w-full ${
        !enabled
          ? 'border-white/5 opacity-90'
          : isExpired
          ? 'border-red-500 ring-2 ring-red-500'
          : isUrgent
          ? 'border-rose-500/80'
          : 'border-white/10'
      }`}
    >
      {/* Title & 24s Disable/Enable Button */}
      <div className="w-full flex items-center justify-between text-xs md:text-sm text-slate-400 pb-1 md:pb-1.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 ${
              !enabled
                ? 'bg-slate-600'
                : isExpired
                ? 'bg-red-500 animate-ping'
                : isUrgent
                ? 'bg-rose-500 animate-pulse'
                : isRunning
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span className="font-bold tracking-wider text-slate-300 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            24s 进攻时钟
          </span>
          {!enabled && (
            <span className="text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400 bg-slate-800 px-1 py-0.2 rounded border border-white/5">
              已停用
            </span>
          )}
        </div>

        {/* Action button to Disable / Enable 24s */}
        {onToggleEnabled && (
          <button
            onClick={onToggleEnabled}
            title={enabled ? '点击禁用 24s 进攻时钟 (终场或特殊情况)' : '点击启用 24s 进攻时钟 (FIBA 规则)'}
            className={`px-1.5 py-0.5 md:px-2.5 md:py-1 rounded md:rounded-lg text-[9px] sm:text-[10px] md:text-xs font-bold flex items-center gap-1 transition-all border shrink-0 cursor-pointer ${
              enabled
                ? 'bg-slate-800/80 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border-white/10'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
            }`}
          >
            {enabled ? (
              <>
                <TimerOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-slate-400 hover:text-rose-400" />
                <span>禁用</span>
              </>
            ) : (
              <>
                <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-slate-950" />
                <span>启用</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Clock Display */}
      <div className="flex-1 min-h-0 py-0.5 md:py-1.5 flex items-center justify-center select-none my-auto w-full">
        {enabled ? (
          <div className="flex items-baseline font-digital font-black tracking-tight tabular-nums">
            <span
              className={`mobile-compact-clock text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-none tabular-nums ${
                isExpired
                  ? 'text-red-500 animate-pulse'
                  : isUrgent
                  ? 'text-rose-500 animate-pulse'
                  : 'text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.4)]'
              }`}
            >
              {String(seconds).padStart(2, '0')}
            </span>
            <span className="w-3 sm:w-6 md:w-8 text-left text-[10px] sm:text-sm md:text-lg lg:text-xl text-rose-400 ml-0.5 tabular-nums">
              {seconds < 5 ? `.${tenths}` : ''}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="font-digital font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-slate-600 leading-none tracking-widest tabular-nums">
              --
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 mt-1">
              进攻时钟已暂停/禁用
            </span>
          </div>
        )}
      </div>

      {/* Primary Reset Actions */}
      <div className="w-full grid grid-cols-2 gap-1 sm:gap-1.5 md:gap-2 shrink-0">
        <button
          onClick={onReset24}
          title="重置为 24 秒 (若已禁用将自动启用)"
          className={`mobile-compact-btn h-7 sm:h-8 md:h-10 lg:h-12 xl:h-13 px-2 md:px-3 rounded-lg sm:rounded-xl md:rounded-2xl active:scale-95 text-white font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 border transition-all shadow-sm whitespace-nowrap cursor-pointer ${
            enabled
              ? 'bg-slate-800 hover:bg-slate-700 border-white/10'
              : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300 border-white/5'
          }`}
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-400 shrink-0" />
          <span>{defaultShotSeconds}s</span>
        </button>

        <button
          onClick={onReset14}
          title="重置为 14 秒 (前场篮板重置，若已禁用将自动启用)"
          className={`mobile-compact-btn h-7 sm:h-8 md:h-10 lg:h-12 xl:h-13 px-2 md:px-3 rounded-lg sm:rounded-xl md:rounded-2xl active:scale-95 text-white font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 border transition-all shadow-sm whitespace-nowrap cursor-pointer ${
            enabled
              ? 'bg-slate-800 hover:bg-slate-700 border-white/10'
              : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300 border-white/5'
          }`}
        >
          <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-400 shrink-0" />
          <span>{reboundShotSeconds}s</span>
        </button>
      </div>

      {/* Minor Adjustments */}
      <div className="w-full flex items-center justify-between gap-1 md:gap-1.5 mt-1 md:mt-1.5 pt-1 md:pt-1.5 border-t border-white/5 shrink-0">
        <button
          onClick={() => onAdjustTime(-1)}
          disabled={!enabled}
          className="flex-1 h-4.5 sm:h-5 md:h-6 lg:h-7 text-[8px] sm:text-[9px] md:text-xs font-semibold rounded md:rounded-lg bg-slate-950/40 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors tabular-nums whitespace-nowrap cursor-pointer"
        >
          -1s
        </button>
        <button
          onClick={() => onToggleRun}
          disabled={!enabled}
          className="flex-1 h-4.5 sm:h-5 md:h-6 lg:h-7 text-[8px] sm:text-[9px] md:text-xs font-bold rounded md:rounded-lg bg-slate-950/40 hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
        >
          {isRunning ? <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" /> : <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />}
          <span>{isRunning ? '暂停' : '启动'}</span>
        </button>
        <button
          onClick={() => onAdjustTime(1)}
          disabled={!enabled}
          className="flex-1 h-4.5 sm:h-5 md:h-6 lg:h-7 text-[8px] sm:text-[9px] md:text-xs font-semibold rounded md:rounded-lg bg-slate-950/40 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors tabular-nums whitespace-nowrap cursor-pointer"
        >
          +1s
        </button>
      </div>
    </div>
  );
};
