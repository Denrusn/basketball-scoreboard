import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Edit3, Check } from 'lucide-react';

interface GameClockProps {
  tenthsLeft: number; // 10 tenths = 1 second
  isRunning: boolean;
  onToggleRun: () => void;
  onResetClock: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  onSetExactTime: (minutes: number, seconds: number, tenths?: number) => void;
  panelOpacity?: number;
}

export const GameClock: React.FC<GameClockProps> = ({
  tenthsLeft,
  isRunning,
  onToggleRun,
  onResetClock,
  onAdjustTime,
  onSetExactTime,
  panelOpacity = 75,
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

  const opacityRatio = Math.max(0.15, Math.min(1, (panelOpacity ?? 75) / 100));

  return (
    <div
      style={{
        backgroundColor: `rgba(15, 23, 42, ${opacityRatio})`,
        backdropFilter: opacityRatio < 0.95 ? 'blur(8px)' : 'none',
      }}
      className="mobile-compact-card flex-1 min-h-0 rounded-xl sm:rounded-2xl lg:rounded-3xl p-1.5 sm:p-2.5 md:p-3.5 lg:p-4 border border-white/10 flex flex-col items-center justify-between shadow-xl shadow-black/50 transition-colors duration-200 w-full"
    >
      {/* Title */}
      <div className="w-full flex items-center justify-between text-xs md:text-sm text-slate-400 pb-1 md:pb-1.5 border-b border-white/5 shrink-0">
        <span className="font-bold tracking-wider flex items-center gap-1.5 text-slate-300 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          比赛时钟
        </span>
        <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-mono whitespace-nowrap">
          [空格] 启停
        </span>
      </div>

      {/* Clock Display (Flex-1 auto fit container, tabular numbers with stable tenths slot) */}
      <div className="flex-1 min-h-0 py-0.5 md:py-1.5 flex items-center justify-center select-none my-auto w-full">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex items-center gap-1.5 font-digital text-lg sm:text-2xl md:text-3xl py-0.5">
            <input
              type="number"
              min="0"
              max="99"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              className="w-10 sm:w-14 md:w-16 bg-slate-950 border border-amber-400 rounded-lg px-1.5 py-0.5 text-center text-amber-400 focus:outline-none text-xs sm:text-base md:text-lg font-bold tabular-nums"
            />
            <span className="text-slate-400 font-bold">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={editSeconds}
              onChange={(e) => setEditSeconds(e.target.value)}
              className="w-10 sm:w-14 md:w-16 bg-slate-950 border border-amber-400 rounded-lg px-1.5 py-0.5 text-center text-amber-400 focus:outline-none text-xs sm:text-base md:text-lg font-bold tabular-nums"
            />
            <button
              type="submit"
              className="ml-1 p-1.5 sm:p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
              title="保存时间"
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </form>
        ) : (
          <div className="flex items-baseline font-digital font-black tracking-tight tabular-nums">
            <span
              className={`mobile-compact-clock text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-none tabular-nums ${
                tenthsLeft === 0
                  ? 'text-rose-500 animate-pulse'
                  : tenthsLeft <= 100
                  ? 'text-rose-400'
                  : 'text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]'
              }`}
            >
              {formattedMinutes}:{formattedSeconds}
            </span>
            <span className="w-3 sm:w-6 md:w-8 text-left text-[10px] sm:text-sm md:text-lg lg:text-xl text-amber-400/80 ml-0.5 tabular-nums">
              {showTenths ? `.${tenths}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Main Start / Pause Controls */}
      <div className="w-full flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
        <button
          onClick={onToggleRun}
          className={`mobile-compact-btn flex-1 h-7 sm:h-8 md:h-10 lg:h-12 xl:h-13 px-2 md:px-3 rounded-lg sm:rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 transition-all text-xs sm:text-sm md:text-base shadow-md active:scale-95 whitespace-nowrap cursor-pointer ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 fill-current shrink-0" />
              <span>暂停</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 fill-current shrink-0" />
              <span>开始</span>
            </>
          )}
        </button>

        <button
          onClick={onResetClock}
          title="重置本节"
          className="mobile-compact-btn h-7 sm:h-8 md:h-10 lg:h-12 xl:h-13 px-1.5 sm:px-2.5 md:px-3 rounded-lg sm:rounded-xl md:rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </button>
        <button
          onClick={handleStartEdit}
          title="编辑时间"
          className="mobile-compact-btn h-7 sm:h-8 md:h-10 lg:h-12 xl:h-13 px-1.5 sm:px-2.5 md:px-3 rounded-lg sm:rounded-xl md:rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </button>
      </div>

      {/* Quick Trim Buttons */}
      <div className="w-full grid grid-cols-4 gap-1 md:gap-1.5 mt-1 md:mt-1.5 pt-1 md:pt-1.5 border-t border-white/5 shrink-0">
        <button
          onClick={() => onAdjustTime(-10)}
          className="h-4.5 sm:h-5 md:h-6 lg:h-7 text-[8px] sm:text-[9px] md:text-xs font-semibold rounded md:rounded-lg bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors tabular-nums whitespace-nowrap cursor-pointer"
        >
          -10s
        </button>
        <button
          onClick={() => onAdjustTime(-1)}
          className="h-4.5 sm:h-5 md:h-6 lg:h-7 text-[8px] sm:text-[9px] md:text-xs font-semibold rounded md:rounded-lg bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors tabular-nums whitespace-nowrap cursor-pointer"
        >
          -1s
        </button>
        <button
          onClick={() => onAdjustTime(1)}
          className="h-4.5 sm:h-5 md:h-6 lg:h-7 text-[8px] sm:text-[9px] md:text-xs font-semibold rounded md:rounded-lg bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors tabular-nums whitespace-nowrap cursor-pointer"
        >
          +1s
        </button>
        <button
          onClick={() => onAdjustTime(10)}
          className="h-4.5 sm:h-5 md:h-6 lg:h-7 text-[8px] sm:text-[9px] md:text-xs font-semibold rounded md:rounded-lg bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors tabular-nums whitespace-nowrap cursor-pointer"
        >
          +10s
        </button>
      </div>
    </div>
  );
};
