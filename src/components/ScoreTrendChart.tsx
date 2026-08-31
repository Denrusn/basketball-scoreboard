import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { Team, GameEvent } from '../types';
import { TrendingUp, BarChart2, Zap } from 'lucide-react';

interface ScoreTrendChartProps {
  events: GameEvent[];
  homeTeam: Team;
  awayTeam: Team;
  period: number;
  totalRegularPeriods: number;
  height?: number;
  isCompact?: boolean;
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
  height = 260,
  isCompact = false,
}) => {
  const [chartType, setChartType] = useState<'score' | 'margin'>('score');

  // Compute trend data chronologically
  const trendData = useMemo<TrendDataPoint[]>(() => {
    // Start with initial 0 - 0 point
    const points: TrendDataPoint[] = [
      {
        index: 0,
        timeLabel: '开场',
        period: 1,
        clock: '10:00',
        homeScore: 0,
        awayScore: 0,
        diff: 0,
        eventDesc: '比赛开始',
      },
    ];

    // Get all events sorted chronologically (oldest to newest)
    const chronologicalEvents = [...events].reverse();
    let currentHome = 0;
    let currentAway = 0;
    let lastLeader: 'home' | 'away' | 'tie' = 'tie';

    chronologicalEvents.forEach((ev) => {
      let scoreChanged = false;

      if (ev.type === 'score' && ev.points) {
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

        const periodPrefix = ev.period <= totalRegularPeriods ? `Q${ev.period}` : `OT${ev.period - totalRegularPeriods}`;
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

    // Fallback: If no event scoring logs exist yet or score doesn't match total score,
    // synthesize from quarter scores so the chart is always valid and truthful!
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

    // Ensure last point reflects current final scores if they differ
    const lastPoint = points[points.length - 1];
    if (lastPoint && (lastPoint.homeScore !== homeTeam.score || lastPoint.awayScore !== awayTeam.score)) {
      const periodPrefix = period <= totalRegularPeriods ? `Q${period}` : `OT${period - totalRegularPeriods}`;
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

  const homeColor = homeTeam.color || '#EF4444';
  const awayColor = awayTeam.color || '#3B82F6';

  return (
    <div className="w-full bg-slate-950/80 rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>比赛比分趋势图</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                (实时得分曲线 & 领先分差波动)
              </span>
            </h4>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setChartType('score')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              chartType === 'score'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>得分走势</span>
          </button>
          <button
            onClick={() => setChartType('margin')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              chartType === 'margin'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>分差波动</span>
          </button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      {!isCompact && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">{homeTeam.shortName || homeTeam.name} 最大领先</span>
            <span className="font-digital text-sm sm:text-base font-bold" style={{ color: homeColor }}>
              +{maxHomeLead} 分
            </span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" /> 交替领先次数
            </span>
            <span className="font-digital text-sm sm:text-base font-bold text-amber-400">
              {leadChangesCount} 次
            </span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">{awayTeam.shortName || awayTeam.name} 最大领先</span>
            <span className="font-digital text-sm sm:text-base font-bold" style={{ color: awayColor }}>
              +{maxAwayLead} 分
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full flex-1 min-h-[180px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'score' ? (
            <LineChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                domain={[0, 'dataMax + 5']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TrendDataPoint;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs text-slate-200">
                        <div className="text-[10px] font-bold text-amber-400 mb-1 border-b border-white/10 pb-0.5">
                          {data.timeLabel} {data.eventDesc ? `· ${data.eventDesc}` : ''}
                        </div>
                        <div className="flex items-center justify-between gap-4 py-0.5">
                          <span className="flex items-center gap-1.5 font-bold" style={{ color: homeColor }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: homeColor }} />
                            {homeTeam.name}:
                          </span>
                          <span className="font-digital font-bold text-sm">{data.homeScore}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-0.5">
                          <span className="flex items-center gap-1.5 font-bold" style={{ color: awayColor }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: awayColor }} />
                            {awayTeam.name}:
                          </span>
                          <span className="font-digital font-bold text-sm">{data.awayScore}</span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-white/5 text-[10px] text-slate-400 flex justify-between">
                          <span>分差:</span>
                          <span className="font-bold font-digital text-white">
                            {data.diff > 0
                              ? `${homeTeam.shortName || homeTeam.name} +${data.diff}`
                              : data.diff < 0
                              ? `${awayTeam.shortName || awayTeam.name} +${Math.abs(data.diff)}`
                              : '双方平局 0'}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                formatter={(value) => (
                  <span className="text-slate-300 font-bold">
                    {value === 'homeScore' ? homeTeam.name : awayTeam.name}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="homeScore"
                name="homeScore"
                stroke={homeColor}
                strokeWidth={2.5}
                dot={{ r: 2, fill: homeColor }}
                activeDot={{ r: 5, fill: homeColor, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="awayScore"
                name="awayScore"
                stroke={awayColor}
                strokeWidth={2.5}
                dot={{ r: 2, fill: awayColor }}
                activeDot={{ r: 5, fill: awayColor, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={homeColor} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={homeColor} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="awayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={awayColor} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={awayColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '平分线 (0)', fill: '#64748b', fontSize: 10, position: 'right' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TrendDataPoint;
                    const isHomeLead = data.diff > 0;
                    const isAwayLead = data.diff < 0;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs text-slate-200">
                        <div className="text-[10px] font-bold text-amber-400 mb-1 border-b border-white/10 pb-0.5">
                          {data.timeLabel}
                        </div>
                        <div className="py-0.5 font-bold flex items-center justify-between gap-3">
                          <span>领先球队:</span>
                          <span
                            style={{
                              color: isHomeLead ? homeColor : isAwayLead ? awayColor : '#fff',
                            }}
                          >
                            {isHomeLead
                              ? `${homeTeam.name} (+${data.diff}分)`
                              : isAwayLead
                              ? `${awayTeam.name} (+${Math.abs(data.diff)}分)`
                              : '双方平局 (0)'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>即时比分:</span>
                          <span className="font-digital text-slate-200">
                            {data.homeScore} : {data.awayScore}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="diff"
                name="领先分差"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#homeGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
