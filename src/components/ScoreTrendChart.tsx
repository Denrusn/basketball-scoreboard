import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Team, GameEvent } from '../types';
import { TrendingUp, BarChart2, Zap, Trophy, Flame, Layers } from 'lucide-react';
import { hexToRgba } from '../utils/teamColors';

interface ScoreTrendChartProps {
  events: GameEvent[];
  homeTeam: Team;
  awayTeam: Team;
  period: number;
  totalRegularPeriods: number;
  height?: number;
  isCompact?: boolean;
  defaultView?: 'score' | 'diff' | 'both';
  showControls?: boolean;
  showBothStacked?: boolean;
}

export interface TrendDataPoint {
  index: number;
  timeLabel: string;
  period: number;
  clock: string;
  homeScore: number;
  awayScore: number;
  diff: number; // positive = home lead, negative = away lead
  eventDesc?: string;
  teamId?: 'home' | 'away';
  points?: number;
  isLeadChange?: boolean;
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  events,
  homeTeam,
  awayTeam,
  period,
  totalRegularPeriods,
  height = 280,
  isCompact = false,
  defaultView = 'score',
  showControls = true,
  showBothStacked = false,
}) => {
  const [viewMode, setViewMode] = useState<'score' | 'diff' | 'both'>(
    showBothStacked ? 'both' : defaultView
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync viewMode when showBothStacked or defaultView changes
  useEffect(() => {
    if (showBothStacked) {
      setViewMode('both');
    } else if (defaultView) {
      setViewMode(defaultView);
    }
  }, [showBothStacked, defaultView]);

  const homeColor = homeTeam.color || '#ef4444';
  const awayColor = awayTeam.color || '#3b82f6';

  // Compute trend data chronologically
  const trendData = useMemo<TrendDataPoint[]>(() => {
    const points: TrendDataPoint[] = [
      {
        index: 0,
        timeLabel: '开场',
        period: 1,
        clock: '10:00',
        homeScore: 0,
        awayScore: 0,
        diff: 0,
        eventDesc: '比赛开始 (0 - 0)',
      },
    ];

    // Get all events sorted chronologically (oldest to newest)
    const chronologicalEvents = [...events].reverse();
    let currentHome = 0;
    let currentAway = 0;
    let lastLeader: 'home' | 'away' | 'tie' = 'tie';

    chronologicalEvents.forEach((ev) => {
      let scoreChanged = false;

      if (ev.type === 'score' && typeof ev.points === 'number') {
        if (ev.teamId === 'home') {
          currentHome = Math.max(0, currentHome + ev.points);
          scoreChanged = true;
        } else if (ev.teamId === 'away') {
          currentAway = Math.max(0, currentAway + ev.points);
          scoreChanged = true;
        }
      } else if (ev.homeScore !== undefined && ev.awayScore !== undefined) {
        if (ev.homeScore !== currentHome || ev.awayScore !== currentAway) {
          currentHome = ev.homeScore;
          currentAway = ev.awayScore;
          scoreChanged = true;
        }
      }

      if (scoreChanged || ev.type === 'period_end' || ev.type === 'period_start') {
        const diff = currentHome - currentAway;
        const currentLeader: 'home' | 'away' | 'tie' = diff > 0 ? 'home' : diff < 0 ? 'away' : 'tie';
        const isLeadChange =
          lastLeader !== 'tie' && currentLeader !== 'tie' && lastLeader !== currentLeader;

        if (currentLeader !== 'tie') {
          lastLeader = currentLeader;
        }

        const periodPrefix =
          ev.period <= totalRegularPeriods ? `Q${ev.period}` : `OT${ev.period - totalRegularPeriods}`;
        const timeLabel = `${periodPrefix} ${ev.gameClockDisplay}`;

        points.push({
          index: points.length,
          timeLabel,
          period: ev.period,
          clock: ev.gameClockDisplay,
          homeScore: currentHome,
          awayScore: currentAway,
          diff,
          eventDesc: ev.description,
          teamId: ev.teamId,
          points: ev.points,
          isLeadChange,
        });
      }
    });

    // Fallback: If no event logs exist or total score doesn't match current score, synthesize from quarter scores
    if (points.length <= 1 && (homeTeam.score > 0 || awayTeam.score > 0)) {
      let accumHome = 0;
      let accumAway = 0;
      const maxP = Math.max(period, totalRegularPeriods, homeTeam.quarterScores.length);
      for (let i = 0; i < maxP; i++) {
        const pNum = i + 1;
        const pHome = homeTeam.quarterScores[i] || 0;
        const pAway = awayTeam.quarterScores[i] || 0;
        if (pHome > 0 || pAway > 0 || pNum <= period) {
          accumHome += pHome;
          accumAway += pAway;
          const label = pNum <= totalRegularPeriods ? `第${pNum}节末` : `OT${pNum - totalRegularPeriods}末`;
          points.push({
            index: points.length,
            timeLabel: label,
            period: pNum,
            clock: '00:00',
            homeScore: accumHome,
            awayScore: accumAway,
            diff: accumHome - accumAway,
            eventDesc: `${label} 比分`,
          });
        }
      }
    }

    // Ensure last point reflects current final scores
    const lastPoint = points[points.length - 1];
    if (
      lastPoint &&
      (lastPoint.homeScore !== homeTeam.score || lastPoint.awayScore !== awayTeam.score)
    ) {
      const periodPrefix =
        period <= totalRegularPeriods ? `Q${period}` : `OT${period - totalRegularPeriods}`;
      points.push({
        index: points.length,
        timeLabel: `当前 ${periodPrefix}`,
        period,
        clock: '现在',
        homeScore: homeTeam.score,
        awayScore: awayTeam.score,
        diff: homeTeam.score - awayTeam.score,
        eventDesc: '最新比分',
      });
    }

    return points;
  }, [events, homeTeam, awayTeam, period, totalRegularPeriods]);

  // Key Statistics
  const maxHomeLead = useMemo(() => {
    let max = 0;
    trendData.forEach((p) => {
      if (p.diff > max) max = p.diff;
    });
    return max;
  }, [trendData]);

  const maxAwayLead = useMemo(() => {
    let max = 0;
    trendData.forEach((p) => {
      if (p.diff < -max) max = Math.abs(p.diff);
    });
    return max;
  }, [trendData]);

  const leadChangesCount = useMemo(() => {
    let count = 0;
    trendData.forEach((p) => {
      if (p.isLeadChange) count++;
    });
    return count;
  }, [trendData]);

  const tieCount = useMemo(() => {
    let count = 0;
    trendData.forEach((p, idx) => {
      if (idx > 0 && p.diff === 0) count++;
    });
    return count;
  }, [trendData]);

  // Max score for SVG Y-scale
  const maxScore = useMemo(() => {
    let max = Math.max(homeTeam.score, awayTeam.score, 10);
    trendData.forEach((p) => {
      if (p.homeScore > max) max = p.homeScore;
      if (p.awayScore > max) max = p.awayScore;
    });
    return Math.ceil(max * 1.15); // Add 15% headroom
  }, [homeTeam.score, awayTeam.score, trendData]);

  // Max Diff for Diff Chart Y-scale
  const maxAbsDiff = useMemo(() => {
    let max = Math.max(maxHomeLead, maxAwayLead, 6);
    return Math.ceil(max * 1.25);
  }, [maxHomeLead, maxAwayLead]);

  // SVG Dimension Metrics
  const svgWidth = 800;
  const svgHeight = 240;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 20;
  const padBottom = 30;

  const chartAreaWidth = svgWidth - padLeft - padRight;
  const chartAreaHeight = svgHeight - padTop - padBottom;

  // Calculate coordinates for points in Score Chart
  const getScoreCoordinates = (point: TrendDataPoint, index: number, total: number) => {
    const x = total <= 1 ? padLeft + chartAreaWidth / 2 : padLeft + (index / (total - 1)) * chartAreaWidth;
    const yHome = padTop + chartAreaHeight - (point.homeScore / maxScore) * chartAreaHeight;
    const yAway = padTop + chartAreaHeight - (point.awayScore / maxScore) * chartAreaHeight;
    return { x, yHome, yAway };
  };

  // Calculate coordinates for points in Diff Chart
  const getDiffCoordinates = (point: TrendDataPoint, index: number, total: number) => {
    const x = total <= 1 ? padLeft + chartAreaWidth / 2 : padLeft + (index / (total - 1)) * chartAreaWidth;
    const yZero = padTop + chartAreaHeight / 2;
    // diff > 0 goes UP (y < yZero), diff < 0 goes DOWN (y > yZero)
    const yDiff = yZero - (point.diff / maxAbsDiff) * (chartAreaHeight / 2);
    return { x, yDiff, yZero };
  };

  // Generate Score Line Paths
  const { homePath, awayPath, homeAreaPath, awayAreaPath } = useMemo(() => {
    if (trendData.length === 0) return { homePath: '', awayPath: '', homeAreaPath: '', awayAreaPath: '' };

    const total = trendData.length;
    let hPath = '';
    let aPath = '';

    trendData.forEach((p, i) => {
      const { x, yHome, yAway } = getScoreCoordinates(p, i, total);
      if (i === 0) {
        hPath += `M ${x.toFixed(1)} ${yHome.toFixed(1)}`;
        aPath += `M ${x.toFixed(1)} ${yAway.toFixed(1)}`;
      } else {
        hPath += ` L ${x.toFixed(1)} ${yHome.toFixed(1)}`;
        aPath += ` L ${x.toFixed(1)} ${yAway.toFixed(1)}`;
      }
    });

    const firstCoord = getScoreCoordinates(trendData[0], 0, total);
    const lastCoord = getScoreCoordinates(trendData[total - 1], total - 1, total);
    const bottomY = padTop + chartAreaHeight;

    const hArea = `${hPath} L ${lastCoord.x.toFixed(1)} ${bottomY} L ${firstCoord.x.toFixed(1)} ${bottomY} Z`;
    const aArea = `${aPath} L ${lastCoord.x.toFixed(1)} ${bottomY} L ${firstCoord.x.toFixed(1)} ${bottomY} Z`;

    return {
      homePath: hPath,
      awayPath: aPath,
      homeAreaPath: hArea,
      awayAreaPath: aArea,
    };
  }, [trendData, maxScore, chartAreaWidth, chartAreaHeight]);

  // Generate Diff Line Path & Area Paths
  const { diffLinePath, diffAreaHome, diffAreaAway } = useMemo(() => {
    if (trendData.length === 0) return { diffLinePath: '', diffAreaHome: '', diffAreaAway: '' };

    const total = trendData.length;
    const yZero = padTop + chartAreaHeight / 2;
    let dPath = '';

    trendData.forEach((p, i) => {
      const { x, yDiff } = getDiffCoordinates(p, i, total);
      if (i === 0) {
        dPath += `M ${x.toFixed(1)} ${yDiff.toFixed(1)}`;
      } else {
        dPath += ` L ${x.toFixed(1)} ${yDiff.toFixed(1)}`;
      }
    });

    const firstCoord = getDiffCoordinates(trendData[0], 0, total);
    const lastCoord = getDiffCoordinates(trendData[total - 1], total - 1, total);

    // Baseline closed area
    const fullArea = `${dPath} L ${lastCoord.x.toFixed(1)} ${yZero} L ${firstCoord.x.toFixed(1)} ${yZero} Z`;

    return {
      diffLinePath: dPath,
      diffAreaHome: fullArea,
      diffAreaAway: fullArea,
    };
  }, [trendData, maxAbsDiff, chartAreaWidth, chartAreaHeight]);

  const activePoint = hoveredIndex !== null && trendData[hoveredIndex] ? trendData[hoveredIndex] : null;

  return (
    <div
      ref={containerRef}
      className="w-full bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col shadow-2xl space-y-3"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>比赛比分趋势与分差走势分析</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-digital px-2 py-0.5 rounded-full border border-amber-500/30">
                {trendData.length} 个节点
              </span>
            </h4>
          </div>
        </div>

        {/* View Mode Toggle */}
        {showControls && (
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setViewMode('score')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'score'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>📈 比分走势</span>
            </button>

            <button
              onClick={() => setViewMode('diff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'diff'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>📊 分差波动</span>
            </button>

            <button
              onClick={() => setViewMode('both')}
              className={`hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>⚡ 综合对比</span>
            </button>
          </div>
        )}
      </div>

      {/* Key Stats Cards Grid */}
      {!isCompact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Home Max Lead */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 truncate">
              {homeTeam.shortName || homeTeam.name} 最大领先
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-digital text-lg sm:text-xl font-black" style={{ color: homeColor }}>
                +{maxHomeLead}
              </span>
              <span className="text-[10px] text-slate-400">分</span>
            </div>
          </div>

          {/* Away Max Lead */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 truncate">
              {awayTeam.shortName || awayTeam.name} 最大领先
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-digital text-lg sm:text-xl font-black" style={{ color: awayColor }}>
                +{maxAwayLead}
              </span>
              <span className="text-[10px] text-slate-400">分</span>
            </div>
          </div>

          {/* Lead Changes */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              交替领先
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-digital text-lg sm:text-xl font-black text-amber-400">
                {leadChangesCount}
              </span>
              <span className="text-[10px] text-slate-400">次</span>
            </div>
          </div>

          {/* Ties */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-cyan-400" />
              战平次数
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-digital text-lg sm:text-xl font-black text-cyan-400">
                {tieCount}
              </span>
              <span className="text-[10px] text-slate-400">次</span>
            </div>
          </div>
        </div>
      )}

      {/* CHART 1: 比分走势图 (Score Trend Line Chart) */}
      {(viewMode === 'score' || viewMode === 'both') && (
        <div className="bg-slate-900/90 rounded-xl p-3 border border-white/5 flex flex-col">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              比分爬升曲线 (两队全场累计得分)
            </span>
            {/* Legend */}
            <div className="flex items-center gap-3 font-bold text-xs">
              <span className="flex items-center gap-1" style={{ color: homeColor }}>
                <span className="w-3 h-1 rounded" style={{ backgroundColor: homeColor }} />
                {homeTeam.name} ({homeTeam.score}分)
              </span>
              <span className="flex items-center gap-1" style={{ color: awayColor }}>
                <span className="w-3 h-1 rounded" style={{ backgroundColor: awayColor }} />
                {awayTeam.name} ({awayTeam.score}分)
              </span>
            </div>
          </div>

          {/* SVG Canvas for Score Trend */}
          <div className="relative w-full overflow-hidden" style={{ minHeight: isCompact ? 160 : height }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="scoreHomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={homeColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={homeColor} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="scoreAwayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={awayColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={awayColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y-Axis Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padTop + chartAreaHeight * (1 - ratio);
                const val = Math.round(maxScore * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              <path d={homeAreaPath} fill="url(#scoreHomeGrad)" />
              <path d={awayAreaPath} fill="url(#scoreAwayGrad)" />

              {/* Lines */}
              <path
                d={homePath}
                fill="none"
                stroke={homeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={awayPath}
                fill="none"
                stroke={awayColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points / Node Dots */}
              {trendData.map((p, idx) => {
                const { x, yHome, yAway } = getScoreCoordinates(p, idx, trendData.length);
                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx}>
                    {/* Hover vertical rule */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + chartAreaHeight}
                        stroke="rgba(251, 191, 36, 0.6)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Home Dot */}
                    <circle
                      cx={x}
                      cy={yHome}
                      r={isHovered ? 5 : 2.5}
                      fill={homeColor}
                      stroke="#fff"
                      strokeWidth={isHovered ? 2 : 1}
                      className="transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onTouchStart={() => setHoveredIndex(idx)}
                    />

                    {/* Away Dot */}
                    <circle
                      cx={x}
                      cy={yAway}
                      r={isHovered ? 5 : 2.5}
                      fill={awayColor}
                      stroke="#fff"
                      strokeWidth={isHovered ? 2 : 1}
                      className="transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onTouchStart={() => setHoveredIndex(idx)}
                    />

                    {/* X-axis labels on certain intervals */}
                    {(idx === 0 ||
                      idx === trendData.length - 1 ||
                      (trendData.length > 6 && idx % Math.ceil(trendData.length / 5) === 0)) && (
                      <text
                        x={x}
                        y={svgHeight - 8}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {p.timeLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* CHART 2: 分差波动图 (Lead Margin Differential Wave Chart) */}
      {(viewMode === 'diff' || viewMode === 'both') && (
        <div className="bg-slate-900/90 rounded-xl p-3 border border-white/5 flex flex-col">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              分差波动曲线 (平分线上为主队领先，线下为客队领先)
            </span>
            {/* Diff Legend */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1" style={{ color: homeColor }}>
                ▲ 主队领先 (+{maxHomeLead} max)
              </span>
              <span className="flex items-center gap-1" style={{ color: awayColor }}>
                ▼ 客队领先 (+{maxAwayLead} max)
              </span>
            </div>
          </div>

          {/* SVG Canvas for Point Differential Wave */}
          <div className="relative w-full overflow-hidden" style={{ minHeight: isCompact ? 160 : height }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="diffHomeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={homeColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={homeColor} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="diffAwayArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={awayColor} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={awayColor} stopOpacity={0.45} />
                </linearGradient>
              </defs>

              {/* Zero Baseline (平分基准线) */}
              {(() => {
                const yZero = padTop + chartAreaHeight / 2;
                return (
                  <g>
                    {/* Background bands */}
                    <rect
                      x={padLeft}
                      y={padTop}
                      width={chartAreaWidth}
                      height={chartAreaHeight / 2}
                      fill={hexToRgba(homeColor, 0.05)}
                    />
                    <rect
                      x={padLeft}
                      y={yZero}
                      width={chartAreaWidth}
                      height={chartAreaHeight / 2}
                      fill={hexToRgba(awayColor, 0.05)}
                    />

                    {/* Zero Line */}
                    <line
                      x1={padLeft}
                      y1={yZero}
                      x2={svgWidth - padRight}
                      y2={yZero}
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <text
                      x={padLeft - 8}
                      y={yZero + 3}
                      textAnchor="end"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      平(0)
                    </text>
                    <text
                      x={svgWidth - padRight + 5}
                      y={yZero + 3}
                      textAnchor="start"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      平分线
                    </text>

                    {/* Top Max & Bottom Max Grid Lines */}
                    <line
                      x1={padLeft}
                      y1={padTop}
                      x2={svgWidth - padRight}
                      y2={padTop}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={padTop + 4}
                      textAnchor="end"
                      fill={homeColor}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      +{maxAbsDiff}
                    </text>

                    <line
                      x1={padLeft}
                      y1={padTop + chartAreaHeight}
                      x2={svgWidth - padRight}
                      y2={padTop + chartAreaHeight}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={padTop + chartAreaHeight + 2}
                      textAnchor="end"
                      fill={awayColor}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      -{maxAbsDiff}
                    </text>
                  </g>
                );
              })()}

              {/* Area under wave */}
              <path d={diffAreaHome} fill="url(#diffHomeArea)" />

              {/* Differential Line Path */}
              <path
                d={diffLinePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Diff Points & Interactive Markers */}
              {trendData.map((p, idx) => {
                const { x, yDiff, yZero } = getDiffCoordinates(p, idx, trendData.length);
                const isHovered = hoveredIndex === idx;
                const isHomeLead = p.diff > 0;
                const isAwayLead = p.diff < 0;
                const dotColor = isHomeLead ? homeColor : isAwayLead ? awayColor : '#cbd5e1';

                return (
                  <g key={idx}>
                    {/* Vertical guideline */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + chartAreaHeight}
                        stroke="rgba(251, 191, 36, 0.6)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Diff Stem from zero line to point */}
                    <line
                      x1={x}
                      y1={yZero}
                      x2={x}
                      y2={yDiff}
                      stroke={dotColor}
                      strokeWidth="1"
                      opacity={isHovered ? 0.9 : 0.3}
                    />

                    {/* Diff Dot */}
                    <circle
                      cx={x}
                      cy={yDiff}
                      r={isHovered ? 5.5 : p.isLeadChange ? 4 : 2.5}
                      fill={dotColor}
                      stroke="#fff"
                      strokeWidth={isHovered || p.isLeadChange ? 2 : 1}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onTouchStart={() => setHoveredIndex(idx)}
                    />

                    {/* X-axis labels */}
                    {(idx === 0 ||
                      idx === trendData.length - 1 ||
                      (trendData.length > 6 && idx % Math.ceil(trendData.length / 5) === 0)) && (
                      <text
                        x={x}
                        y={svgHeight - 8}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {p.timeLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Interactive Tooltip Callout Box */}
      {activePoint ? (
        <div className="bg-slate-900 border border-amber-500/40 p-2.5 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-digital text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {activePoint.timeLabel}
            </span>
            <span className="text-slate-300 font-medium">
              {activePoint.eventDesc || '比赛进程'}
            </span>
          </div>

          <div className="flex items-center gap-4 font-digital font-bold">
            <span className="flex items-center gap-1.5" style={{ color: homeColor }}>
              <span>{homeTeam.name}:</span>
              <span className="text-sm">{activePoint.homeScore}分</span>
            </span>

            <span className="text-slate-500">:</span>

            <span className="flex items-center gap-1.5" style={{ color: awayColor }}>
              <span>{awayTeam.name}:</span>
              <span className="text-sm">{activePoint.awayScore}分</span>
            </span>

            <span className="bg-slate-950 px-2 py-0.5 rounded text-white border border-white/10 ml-1">
              分差:{' '}
              {activePoint.diff > 0
                ? `${homeTeam.shortName || homeTeam.name} +${activePoint.diff}`
                : activePoint.diff < 0
                ? `${awayTeam.shortName || awayTeam.name} +${Math.abs(activePoint.diff)}`
                : '双方战平 (0)'}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center text-[11px] text-slate-400 py-1 bg-slate-900/40 rounded-xl border border-white/5">
          💡 提示：鼠标悬停或手指触摸图表中的圆点节点，可查看任意时刻的具体比分与分差变动
        </div>
      )}
    </div>
  );
};
