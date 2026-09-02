import React from 'react';
import { Trophy, Play, FastForward, FileText, Settings, Sparkles, CheckCircle2 } from 'lucide-react';
import { Team, GameSettings } from '../types';

interface PeriodEndModalProps {
  isOpen: boolean;
  endedPeriod: number;
  homeTeam: Team;
  awayTeam: Team;
  settings: GameSettings;
  winnerTeamName?: string;
  onStartNextPeriod: () => void;
  onCloseLater: () => void;
  onOpenSummary: () => void;
  onOpenSettings: () => void;
}

export const PeriodEndModal: React.FC<PeriodEndModalProps> = ({
  isOpen,
  endedPeriod,
  homeTeam,
  awayTeam,
  settings,
  winnerTeamName,
  onStartNextPeriod,
  onCloseLater,
  onOpenSummary,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const isFinalPeriod = endedPeriod >= settings.totalRegularPeriods && homeTeam.score !== awayTeam.score;
  const isOvertimeNeeded = endedPeriod >= settings.totalRegularPeriods && homeTeam.score === awayTeam.score;
  const nextPeriod = endedPeriod + 1;
  const isTargetScoreMode = settings.matchMode === 'target_score';

  const periodIndex = endedPeriod - 1;
  const homePeriodScore = homeTeam.quarterScores[periodIndex] || 0;
  const awayPeriodScore = awayTeam.quarterScores[periodIndex] || 0;

  const isHomeLeadingOverall = homeTeam.score > awayTeam.score;
  const isAwayLeadingOverall = awayTeam.score > homeTeam.score;

  return (
    <div
      id="modal-period-end-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl sm:rounded-3xl w-full max-w-xl md:max-w-2xl max-h-[96vh] landscape:max-h-[95vh] sm:max-h-[90vh] shadow-2xl shadow-black/80 overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        {/* Glowing Top Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-b border-amber-500/30 px-3 sm:px-4 py-2 sm:py-3 landscape:py-1.5 text-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{isTargetScoreMode ? '🎯 目标得分达成' : '⏱ 节次时间已到'}</span>
          </div>
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>第 {endedPeriod} 节比赛结束</span>
          </h2>
          {isTargetScoreMode && winnerTeamName && (
            <p className="text-[11px] sm:text-xs text-emerald-400 font-semibold mt-0.5">
              🎉 <strong className="text-white underline">{winnerTeamName}</strong> 率先斩获本节 {settings.targetScorePerPeriod} 分目标！
            </p>
          )}
        </div>

        {/* Scores Summary Display */}
        <div className="p-2.5 sm:p-4 landscape:p-2.5 space-y-2.5 sm:space-y-3.5 flex-1 overflow-y-auto">
          {/* Main Scoreboard VS Card */}
          <div className="grid grid-cols-3 items-center bg-slate-950/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 landscape:p-2 border border-white/10 shadow-inner">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center min-w-0">
              <span
                style={{ color: homeTeam.color }}
                className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[140px]"
              >
                {homeTeam.name}
              </span>
              <span
                style={{ color: homeTeam.color }}
                className="font-digital text-3xl sm:text-4xl md:text-5xl font-black tabular-nums leading-tight mt-0.5"
              >
                {homeTeam.score}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">
                本节: <strong className="text-white font-digital">{homePeriodScore}</strong>
              </span>
            </div>

            {/* Middle Divider */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-widest">
                VS
              </span>
              <div className="h-px w-8 sm:w-12 bg-white/10 my-0.5" />
              <span className="text-[9px] sm:text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 text-center truncate max-w-[100px]">
                {isHomeLeadingOverall ? `${homeTeam.shortName || '主队'} 领先` : isAwayLeadingOverall ? `${awayTeam.shortName || '客队'} 领先` : '双方战平'}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center min-w-0">
              <span
                style={{ color: awayTeam.color }}
                className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[140px]"
              >
                {awayTeam.name}
              </span>
              <span
                style={{ color: awayTeam.color }}
                className="font-digital text-3xl sm:text-4xl md:text-5xl font-black tabular-nums leading-tight mt-0.5"
              >
                {awayTeam.score}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">
                本节: <strong className="text-white font-digital">{awayPeriodScore}</strong>
              </span>
            </div>
          </div>

          {/* Mode Rules Information Pill */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 px-1">
            <span className="truncate mr-2">
              模式:{' '}
              <strong className="text-slate-200">
                {isTargetScoreMode
                  ? `抢分目标 (${settings.targetScorePerPeriod}分/节)`
                  : `常规计时 (${settings.periodMinutes}分/节)`}
              </strong>
            </span>
            <span className="shrink-0">
              进度:{' '}
              <strong className="text-amber-400 font-digital">
                {endedPeriod} / {settings.totalRegularPeriods} 节
              </strong>
            </span>
          </div>

          {/* HUGE CALL-TO-ACTION BUTTON */}
          <div>
            {isOvertimeNeeded ? (
              <button
                id="btn-confirm-start-next-period"
                onClick={onStartNextPeriod}
                className="group relative w-full py-2.5 sm:py-3.5 landscape:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black text-sm sm:text-base md:text-lg shadow-xl shadow-amber-500/25 border-2 border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
              >
                <FastForward className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                <span>比分持平！进入加时赛 (OT 1)</span>
              </button>
            ) : isFinalPeriod ? (
              <button
                id="btn-confirm-open-summary"
                onClick={onOpenSummary}
                className="group relative w-full py-2.5 sm:py-3.5 landscape:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black text-sm sm:text-base md:text-lg shadow-xl shadow-amber-500/25 border-2 border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                <span>🎉 比赛完赛！查看比赛综述海报</span>
              </button>
            ) : (
              <button
                id="btn-confirm-start-next-period"
                onClick={onStartNextPeriod}
                className="group relative w-full py-2.5 sm:py-3.5 landscape:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black text-sm sm:text-base md:text-lg shadow-xl shadow-amber-500/25 border-2 border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                <span>开始第 {nextPeriod} 节比赛</span>
              </button>
            )}
          </div>

          {/* Secondary Action Options */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              onClick={onCloseLater}
              className="py-1.5 sm:py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer truncate"
            >
              <span>稍后准备</span>
            </button>
            <button
              onClick={onOpenSummary}
              className="py-1.5 sm:py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer truncate"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>全场海报</span>
            </button>
            {isFinalPeriod ? (
              <button
                onClick={onStartNextPeriod}
                className="py-1.5 sm:py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-semibold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer border border-amber-500/30 truncate"
              >
                <FastForward className="w-3.5 h-3.5 shrink-0" />
                <span>开启加时/下节</span>
              </button>
            ) : (
              <button
                onClick={onOpenSettings}
                className="py-1.5 sm:py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer truncate"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>调整参数</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
