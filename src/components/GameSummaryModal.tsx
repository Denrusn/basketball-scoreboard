import React, { useEffect, useState } from 'react';
import { X, Trophy, Award, Copy, Check, Printer, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, GameSettings, GameEvent } from '../types';

interface GameSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeam: Team;
  awayTeam: Team;
  period: number;
  totalRegularPeriods: number;
  settings: GameSettings;
  events: GameEvent[];
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  isOpen,
  onClose,
  homeTeam,
  awayTeam,
  period,
  totalRegularPeriods,
  settings,
  events,
}) => {
  const [copied, setCopied] = useState(false);

  const periodsList = Array.from(
    { length: Math.max(totalRegularPeriods, period) },
    (_, i) => i + 1
  );

  const isHomeWinner = homeTeam.score > awayTeam.score;
  const isAwayWinner = awayTeam.score > homeTeam.score;
  const isTie = homeTeam.score === awayTeam.score;

  // Trigger celebration confetti on open if there is a leader
  useEffect(() => {
    if (isOpen && (isHomeWinner || isAwayWinner)) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback safe
      }
    }
  }, [isOpen, isHomeWinner, isAwayWinner]);

  if (!isOpen) return null;

  // Find top scoring player overall
  const allPlayers = [
    ...homeTeam.players.map((p) => ({ ...p, teamName: homeTeam.name, teamSide: 'home' as const })),
    ...awayTeam.players.map((p) => ({ ...p, teamName: awayTeam.name, teamSide: 'away' as const })),
  ];
  const topScorer = allPlayers.sort((a, b) => b.points - a.points)[0];

  const handleCopyReport = () => {
    const lines = [
      `🏀 【篮球比赛技术统计与终场战报】`,
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      `比分：${homeTeam.name} ${homeTeam.score} : ${awayTeam.score} ${awayTeam.name}`,
      `胜方：${isHomeWinner ? homeTeam.name : isAwayWinner ? awayTeam.name : '平局'}`,
      ``,
      `【分节比分统计】`,
      periodsList.map((p, i) => `第${p}节: ${homeTeam.shortName || homeTeam.name} ${homeTeam.quarterScores[i] || 0} - ${awayTeam.quarterScores[i] || 0} ${awayTeam.shortName || awayTeam.name}`).join('\n'),
      ``,
      `【全队犯规 & 暂停】`,
      `${homeTeam.name}: 犯规 ${homeTeam.fouls} 次 / 剩余暂停 ${homeTeam.timeoutsLeft}`,
      `${awayTeam.name}: 犯规 ${awayTeam.fouls} 次 / 剩余暂停 ${awayTeam.timeoutsLeft}`,
      ``,
      topScorer && topScorer.points > 0 ? `【全场得分王 MVP】\n#${topScorer.number} ${topScorer.name} (${topScorer.teamName}) - 独得 ${topScorer.points} 分 (三分球: ${topScorer.threePointers}个, 罚球: ${topScorer.freeThrows}分)` : '',
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      `技术台流水事件数：共 ${events.length} 条记录`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">比赛统计与战报总览</h2>
              <p className="text-xs text-slate-400">完整记分卡、单节得分走势、全队犯规与个人MVP评选</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Winner Matchup Box */}
          <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800/80 text-center relative overflow-hidden print:border print:border-gray-300 print:bg-white">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>当前比分与胜负</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            <div className="grid grid-cols-3 items-center gap-4 my-3">
              {/* Home Team */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-amber-400 print:text-black">
                  [主队]
                </span>
                <span className="text-xl font-black text-white print:text-black truncate max-w-[140px]">
                  {homeTeam.name}
                </span>
                {isHomeWinner && (
                  <span className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" /> 领先/获胜
                  </span>
                )}
              </div>

              {/* Center Big Score */}
              <div className="flex flex-col items-center justify-center">
                <div className="font-digital text-5xl sm:text-6xl font-black tracking-tight flex items-center gap-3">
                  <span className="text-amber-400 print:text-black">{homeTeam.score}</span>
                  <span className="text-slate-600 print:text-gray-400">:</span>
                  <span className="text-cyan-400 print:text-black">{awayTeam.score}</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 font-digital">
                  {period <= totalRegularPeriods ? `Q${period}` : `OT${period - totalRegularPeriods}`}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-cyan-400 print:text-black">
                  [客队]
                </span>
                <span className="text-xl font-black text-white print:text-black truncate max-w-[140px]">
                  {awayTeam.name}
                </span>
                {isAwayWinner && (
                  <span className="mt-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-cyan-400" /> 领先/获胜
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quarter Breakdown Table */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 print:border-gray-300">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              分节得分走势表
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-digital border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-2 px-3 text-left font-sans">球队</th>
                    {periodsList.map((p) => (
                      <th key={p} className="py-2 px-3">
                        {p <= totalRegularPeriods ? `第${p}节` : `加时${p - totalRegularPeriods}`}
                      </th>
                    ))}
                    <th className="py-2 px-3 text-right font-sans font-bold text-white">总分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-2.5 px-3 text-left font-sans font-bold text-amber-400">
                      {homeTeam.name}
                    </td>
                    {periodsList.map((p, idx) => (
                      <td key={p} className="py-2.5 px-3 text-slate-200">
                        {homeTeam.quarterScores[idx] || 0}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right font-black text-sm text-amber-400">
                      {homeTeam.score}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-left font-sans font-bold text-cyan-400">
                      {awayTeam.name}
                    </td>
                    {periodsList.map((p, idx) => (
                      <td key={p} className="py-2.5 px-3 text-slate-200">
                        {awayTeam.quarterScores[idx] || 0}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right font-black text-sm text-cyan-400">
                      {awayTeam.score}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Scorer / MVP Highlight */}
          {topScorer && topScorer.points > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
                  👑
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                    全场最具价值球员 (MVP)
                  </div>
                  <div className="text-base font-extrabold text-white">
                    #{topScorer.number} {topScorer.name}{' '}
                    <span className="text-xs font-normal text-slate-400">({topScorer.teamName})</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-3 font-digital">
                    <span>总得分: <strong className="text-amber-300">{topScorer.points}</strong> 分</span>
                    <span>三分球: {topScorer.threePointers} 记</span>
                    <span>罚球: {topScorer.freeThrows} 分</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-digital hidden sm:block">
                <div className="text-3xl font-black text-amber-400">{topScorer.points}</div>
                <div className="text-[10px] text-slate-400 uppercase">POINTS</div>
              </div>
            </div>
          )}

          {/* Team Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Stats */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/20">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">
                {homeTeam.name} 团队数据
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span>全队累计犯规</span>
                  <span className="font-digital font-bold text-rose-400">{homeTeam.fouls} 次</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span>剩余暂停次数</span>
                  <span className="font-digital font-bold text-sky-400">{homeTeam.timeoutsLeft} 次</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>参赛球员人数</span>
                  <span className="font-digital text-slate-200">{homeTeam.players.length} 人</span>
                </div>
              </div>
            </div>

            {/* Away Stats */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20">
              <h4 className="font-bold text-cyan-400 text-xs uppercase tracking-wider mb-2">
                {awayTeam.name} 团队数据
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span>全队累计犯规</span>
                  <span className="font-digital font-bold text-rose-400">{awayTeam.fouls} 次</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span>剩余暂停次数</span>
                  <span className="font-digital font-bold text-sky-400">{awayTeam.timeoutsLeft} 次</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>参赛球员人数</span>
                  <span className="font-digital text-slate-200">{awayTeam.players.length} 人</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>打印战报</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '战报已复制' : '复制文字战报'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
