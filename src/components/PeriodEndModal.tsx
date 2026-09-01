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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl w-full max-w-xl md:max-w-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Glowing Top Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-b border-amber-500/30 px-4 py-3 sm:py-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isTargetScoreMode ? '🎯 目标得分达成' : '⏱ 节次时间已到'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>第 {endedPeriod} 节比赛结束</span>
          </h2>
          {isTargetScoreMode && winnerTeamName && (
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold mt-1">
              🎉 <strong className="text-white underline">{winnerTeamName}</strong> 率先斩获本节 {settings.targetScorePerPeriod} 分目标！
            </p>
          )}
        </div>

        {/* Scores Summary Display */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Main Scoreboard VS Card */}
          <div className="grid grid-cols-3 items-center bg-slate-950/80 rounded-2xl p-3 sm:p-4 border border-white/10 shadow-inner">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center">
              <span
                style={{ color: homeTeam.color }}
                className="text-xs sm:text-sm md:text-base font-bold truncate max-w-[120px] sm:max-w-[160px]"
              >
                {homeTeam.name}
              </span>
              <span
                style={{ color: homeTeam.color }}
                className="font-digital text-4xl sm:text-5xl md:text-6xl font-black tabular-nums leading-tight mt-1"
              >
                {homeTeam.score}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                本节得分: <strong className="text-white font-digital">{homePeriodScore}</strong>
              </span>
            </div>

            {/* Middle Divider */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-widest">
                VS
              </span>
              <div className="h-px w-10 sm:w-16 bg-white/10 my-1" />
              <span className="text-[10px] sm:text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {isHomeLeadingOverall ? `${homeTeam.shortName || '主队'} 领先` : isAwayLeadingOverall ? `${awayTeam.shortName || '客队'} 领先` : '双方战平'}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center">
              <span
                style={{ color: awayTeam.color }}
                className="text-xs sm:text-sm md:text-base font-bold truncate max-w-[120px] sm:max-w-[160px]"
              >
                {awayTeam.name}
              </span>
              <span
                style={{ color: awayTeam.color }}
                className="font-digital text-4xl sm:text-5xl md:text-6xl font-black tabular-nums leading-tight mt-1"
              >
                {awayTeam.score}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                本节得分: <strong className="text-white font-digital">{awayPeriodScore}</strong>
              </span>
            </div>
          </div>

          {/* Mode Rules Information Pill */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              比赛模式:{' '}
              <strong className="text-slate-200">
                {isTargetScoreMode
                  ? `抢分目标制 (${settings.targetScorePerPeriod}分/节)`
                  : `常规计时制 (${settings.periodMinutes}分钟/节)`}
              </strong>
            </span>
            <span>
              已完成:{' '}
              <strong className="text-amber-400 font-digital">
                {endedPeriod} / {settings.totalRegularPeriods} 节
              </strong>
            </span>
          </div>

          {/* HUGE CALL-TO-ACTION BUTTON - The main user requirement */}
          <div className="pt-2">
            <button
              id="btn-confirm-start-next-period"
              onClick={onStartNextPeriod}
              className="group relative w-full py-4 sm:py-5 md:py-6 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black text-lg sm:text-xl md:text-2xl shadow-xl shadow-amber-500/25 border-2 border-amber-300 transition-all flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isOvertimeNeeded ? (
                <>
                  <FastForward className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-slate-950" />
                  <span>平局！进入加时赛 (OT 1)</span>
                </>
              ) : isFinalPeriod ? (
                <>
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-slate-950" />
                  <span>常规时间已完赛！开启下一节 / 加时</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-slate-950" />
                  <span>开始第 {nextPeriod} 节比赛</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Action Options */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={onCloseLater}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>稍后准备 (暂不开始)</span>
            </button>
            <button
              onClick={onOpenSummary}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>本节技术简报</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>规则/分数调整</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
