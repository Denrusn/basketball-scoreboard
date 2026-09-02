import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Trophy,
  Award,
  Copy,
  Check,
  Printer,
  Sparkles,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Image as ImageIcon,
  Loader2,
  ListOrdered,
  ChevronDown,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, GameSettings, GameEvent } from '../types';
import { ScoreTrendChart } from './ScoreTrendChart';
import {
  exportElementAsPNG,
  exportPlayByPlayCSV,
  exportPlayByPlayText,
  exportGameDataJSON,
} from '../utils/exportUtils';

interface GameSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeam: Team;
  awayTeam: Team;
  period: number;
  totalRegularPeriods: number;
  settings: GameSettings;
  events: GameEvent[];
  initialTab?: 'summary' | 'trend' | 'events';
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
  initialTab = 'summary',
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'trend' | 'events'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const summaryPosterRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Sync activeTab when modal is reopened with a specific initialTab
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const periodsList = Array.from(
    { length: Math.max(totalRegularPeriods, period, homeTeam.quarterScores.length) },
    (_, i) => i + 1
  );

  const isHomeWinner = homeTeam.score > awayTeam.score;
  const isAwayWinner = awayTeam.score > homeTeam.score;

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

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      periodsList
        .map(
          (p, i) =>
            `第${p}节: ${homeTeam.shortName || homeTeam.name} ${homeTeam.quarterScores[i] || 0} - ${
              awayTeam.quarterScores[i] || 0
            } ${awayTeam.shortName || awayTeam.name}`
        )
        .join('\n'),
      ``,
      `【全队犯规 & 暂停】`,
      `${homeTeam.name}: 犯规 ${homeTeam.fouls} 次 / 剩余暂停 ${homeTeam.timeoutsLeft}`,
      `${awayTeam.name}: 犯规 ${awayTeam.fouls} 次 / 剩余暂停 ${awayTeam.timeoutsLeft}`,
      ``,
      topScorer && topScorer.points > 0
        ? `【全场得分王 MVP】\n#${topScorer.number} ${topScorer.name} (${topScorer.teamName}) - 独得 ${topScorer.points} 分 (三分球: ${topScorer.threePointers}个, 罚球: ${topScorer.freeThrows}分)`
        : '',
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

  // Export summary poster as high-res PNG
  const handleExportPosterImage = async () => {
    if (!summaryPosterRef.current) return;
    setIsExportingImage(true);
    setIsExportDropdownOpen(false);

    const filename = `篮球比赛战报_${homeTeam.shortName || homeTeam.name}_vs_${awayTeam.shortName || awayTeam.name}_${new Date().toISOString().slice(0, 10)}.png`;
    const success = await exportElementAsPNG(summaryPosterRef.current, filename);
    setIsExportingImage(false);

    if (success) {
      setExportSuccessMsg('战报图片已成功生成并下载！');
      setTimeout(() => setExportSuccessMsg(null), 3000);
    }
  };

  // Export Play-by-Play CSV
  const handleExportCSV = () => {
    exportPlayByPlayCSV(events, homeTeam, awayTeam, period, totalRegularPeriods);
    setIsExportDropdownOpen(false);
    setExportSuccessMsg('详细比赛流水表格 (.csv) 已导出！');
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  // Export Play-by-Play Text
  const handleExportText = () => {
    exportPlayByPlayText(events, homeTeam, awayTeam, period, totalRegularPeriods);
    setIsExportDropdownOpen(false);
    setExportSuccessMsg('详细比赛进程文本 (.txt) 已导出！');
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  // Export JSON Data
  const handleExportJSON = () => {
    exportGameDataJSON(events, homeTeam, awayTeam, period, settings);
    setIsExportDropdownOpen(false);
    setExportSuccessMsg('比赛完整结构化数据 (.json) 已导出！');
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[96vh] landscape:max-h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
        {/* Modal Top Header */}
        <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 landscape:py-1.5 landscape:px-3 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0 print:hidden bg-slate-950/50">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 landscape:w-5 landscape:h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 landscape:w-3 landscape:h-3" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white truncate flex items-center gap-2">
                <span>比赛战报与统计总览</span>
                {exportSuccessMsg && (
                  <span className="text-[10px] sm:text-xs font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-in fade-in">
                    {exportSuccessMsg}
                  </span>
                )}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block landscape:hidden md:landscape:block">
                实时记分卡、比分走势图表、分节统计与完整进程导出
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                id="btn-export-dropdown"
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
              >
                {isExportingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>导出数据</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 text-xs">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 mb-1">
                    导出战报与数据
                  </div>

                  <button
                    onClick={handleExportPosterImage}
                    disabled={isExportingImage}
                    className="w-full px-2.5 py-2 text-left rounded-lg text-slate-200 hover:bg-slate-800 hover:text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">导出比赛总结图片 (PNG)</div>
                      <div className="text-[10px] text-slate-400">生成高清战报长图海报</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full px-2.5 py-2 text-left rounded-lg text-slate-200 hover:bg-slate-800 hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">导出详细进程流水 (Excel / CSV)</div>
                      <div className="text-[10px] text-slate-400">逐回合得分与犯规表格</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportText}
                    className="w-full px-2.5 py-2 text-left rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">导出文本战报 (.txt)</div>
                      <div className="text-[10px] text-slate-400">标准排版战报文本</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="w-full px-2.5 py-2 text-left rounded-lg text-slate-200 hover:bg-slate-800 hover:text-purple-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="p-1 rounded bg-purple-500/20 text-purple-400">
                      <FileCode className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">导出完整结构化数据 (.json)</div>
                      <div className="text-[10px] text-slate-400">适合数据分析与存档</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 landscape:p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <X className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 landscape:py-1 border-b border-slate-800 bg-slate-950/30 flex items-center gap-1.5 sm:gap-2 shrink-0 print:hidden text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'summary'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>比赛综述海报</span>
          </button>

          <button
            onClick={() => setActiveTab('trend')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'trend'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>比分趋势走势图</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'events'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>详细进程流水 ({events.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* TAB 1: SUMMARY / POSTER */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Poster Container (Will be captured as image) */}
              <div
                ref={summaryPosterRef}
                className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden"
              >
                {/* Poster Watermark & Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-black text-sm sm:text-base tracking-wider">
                      🏀 BASKETBALL MATCH REPORT
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-digital">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Score Banner */}
                <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800/80 text-center relative overflow-hidden">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>终场比分 & 胜负裁决</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-3 my-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs sm:text-sm font-semibold text-amber-400">
                        [主队]
                      </span>
                      <span className="text-base sm:text-2xl font-black text-white truncate max-w-[180px]">
                        {homeTeam.name}
                      </span>
                      {isHomeWinner && (
                        <span className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-400" /> 胜方 WINNER
                        </span>
                      )}
                    </div>

                    {/* Center Score */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="font-digital text-4xl sm:text-6xl font-black tracking-tight flex items-center gap-2 sm:gap-4">
                        <span className="text-amber-400">{homeTeam.score}</span>
                        <span className="text-slate-600">:</span>
                        <span className="text-cyan-400">{awayTeam.score}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 font-digital">
                        {period <= totalRegularPeriods ? `全场 Q${period}` : `全场 OT${period - totalRegularPeriods}`}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs sm:text-sm font-semibold text-cyan-400">
                        [客队]
                      </span>
                      <span className="text-base sm:text-2xl font-black text-white truncate max-w-[180px]">
                        {awayTeam.name}
                      </span>
                      {isAwayWinner && (
                        <span className="mt-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/40 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-cyan-400" /> 胜方 WINNER
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quarter Breakdown Table */}
                <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>分节得分走势表</span>
                    <span className="text-[10px] text-slate-400 font-normal font-sans">各节比分明细</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs font-digital border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                          <th className="py-1.5 px-2.5 text-left font-sans">球队</th>
                          {periodsList.map((p) => (
                            <th key={p} className="py-1.5 px-2">
                              {p <= totalRegularPeriods ? `第${p}节` : `加时${p - totalRegularPeriods}`}
                            </th>
                          ))}
                          <th className="py-1.5 px-2.5 text-right font-sans font-bold text-white">总分</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr>
                          <td className="py-2 px-2.5 text-left font-sans font-bold text-amber-400 truncate max-w-[120px]">
                            {homeTeam.name}
                          </td>
                          {periodsList.map((p, idx) => (
                            <td key={p} className="py-2 px-2 text-slate-200">
                              {homeTeam.quarterScores[idx] || 0}
                            </td>
                          ))}
                          <td className="py-2 px-2.5 text-right font-black text-sm text-amber-400">
                            {homeTeam.score}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2.5 text-left font-sans font-bold text-cyan-400 truncate max-w-[120px]">
                            {awayTeam.name}
                          </td>
                          {periodsList.map((p, idx) => (
                            <td key={p} className="py-2 px-2 text-slate-200">
                              {awayTeam.quarterScores[idx] || 0}
                            </td>
                          ))}
                          <td className="py-2 px-2.5 text-right font-black text-sm text-cyan-400">
                            {awayTeam.score}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Score Trend Mini Chart embedded inside poster */}
                <div className="pt-1">
                  <ScoreTrendChart
                    events={events}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    period={period}
                    totalRegularPeriods={totalRegularPeriods}
                    height={200}
                    isCompact={true}
                  />
                </div>

                {/* MVP & Key Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Top Scorer / MVP Highlight */}
                  {topScorer && topScorer.points > 0 ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20 shrink-0">
                          👑
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                            全场最佳球员 (MVP)
                          </div>
                          <div className="text-sm font-extrabold text-white truncate">
                            #{topScorer.number} {topScorer.name}{' '}
                            <span className="text-[11px] font-normal text-slate-400">({topScorer.teamName})</span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-0.5 font-digital">
                            三分: {topScorer.threePointers} 记 · 罚球: {topScorer.freeThrows} 分
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-digital shrink-0">
                        <div className="text-2xl font-black text-amber-400">{topScorer.points}</div>
                        <div className="text-[9px] text-slate-400 uppercase">得分 PTS</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-center">
                      比赛进行中，得分数据将生成 MVP
                    </div>
                  )}

                  {/* Team Stats Summary */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div className="border-r border-slate-800/80 pr-2">
                      <div className="text-amber-400 font-bold text-[11px] truncate mb-1">
                        {homeTeam.shortName || homeTeam.name}
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">篮板 / 助攻:</span>
                          <span className="font-digital font-bold text-amber-300">
                            {homeTeam.rebounds || 0}板 / {homeTeam.assists || 0}助
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">犯规 / 剩暂停:</span>
                          <span className="font-digital font-bold text-rose-400">
                            {homeTeam.fouls}犯 / {homeTeam.timeoutsLeft}停
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pl-1">
                      <div className="text-cyan-400 font-bold text-[11px] truncate mb-1">
                        {awayTeam.shortName || awayTeam.name}
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">篮板 / 助攻:</span>
                          <span className="font-digital font-bold text-cyan-300">
                            {awayTeam.rebounds || 0}板 / {awayTeam.assists || 0}助
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">犯规 / 剩暂停:</span>
                          <span className="font-digital font-bold text-rose-400">
                            {awayTeam.fouls}犯 / {awayTeam.timeoutsLeft}停
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Watermark */}
                <div className="text-center text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                  专业篮球记分板系统 · 实时技术台数据报告
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCORE TREND CHART FULL VIEW */}
          {activeTab === 'trend' && (
            <div className="space-y-4">
              <ScoreTrendChart
                events={events}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                period={period}
                totalRegularPeriods={totalRegularPeriods}
                height={340}
                isCompact={false}
              />

              {/* Trend summary tips */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 比分走势说明
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>得分走势</strong>：展示双方球队在全场各个时钟节点与各节次的累计得分爬升情况。
                </p>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>分差波动</strong>：展示两队领先优势的交替与最大反超幅度。平分线（0）以上代表主队领先，以下代表客队领先。
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PLAY-BY-PLAY PROCESS TIMELINE */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>逐回合比赛详细流水 (共 {events.length} 条记录)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>导出 CSV</span>
                  </button>
                  <button
                    onClick={handleExportText}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>导出 TXT</span>
                  </button>
                </div>
              </div>

              {/* Events Table / Timeline */}
              {events.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <History className="w-8 h-8 stroke-1 mx-auto mb-2 text-slate-600" />
                  <span>暂无事件记录。当比赛进行得分、犯规或暂停时，此处将生成逐回合流水。</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {[...events].map((ev, index) => {
                    const isHome = ev.teamId === 'home';
                    const isAway = ev.teamId === 'away';
                    return (
                      <div
                        key={ev.id}
                        className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-3 border transition-all ${
                          isHome
                            ? 'bg-amber-950/20 border-amber-500/20 text-slate-200'
                            : isAway
                            ? 'bg-cyan-950/20 border-cyan-500/20 text-slate-200'
                            : 'bg-slate-950/60 border-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-digital text-[11px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                            #{events.length - index}
                          </span>
                          <span className="font-digital text-xs text-amber-300/90 font-bold shrink-0">
                            Q{ev.period} {ev.gameClockDisplay}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-white mr-1.5">
                              {isHome ? `[${homeTeam.name}]` : isAway ? `[${awayTeam.name}]` : '[技术台]'}
                            </span>
                            <span className="text-slate-300">{ev.description}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-digital text-[11px]">
                          {ev.points && (
                            <span
                              className={`font-black px-1.5 py-0.5 rounded ${
                                isHome ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-slate-950'
                              }`}
                            >
                              +{ev.points}分
                            </span>
                          )}
                          {ev.homeScore !== undefined && ev.awayScore !== undefined && (
                            <span className="text-slate-400 font-bold">
                              ({ev.homeScore}:{ev.awayScore})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>打印战报</span>
            </button>

            <button
              onClick={handleExportPosterImage}
              disabled={isExportingImage}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExportingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isExportingImage ? '正在生成长图...' : '导出总结图片'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '战报已复制' : '复制文字战报'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
