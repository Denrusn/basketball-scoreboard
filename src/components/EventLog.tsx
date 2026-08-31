import React, { useState } from 'react';
import { 
  Undo2, 
  History, 
  Trash2, 
  Filter, 
  Copy, 
  Check, 
  Flame, 
  ShieldAlert, 
  Clock, 
  Award 
} from 'lucide-react';
import { GameEvent, Team } from '../types';

interface EventLogProps {
  events: GameEvent[];
  homeTeam: Team;
  awayTeam: Team;
  canUndo: boolean;
  onUndo: () => void;
  onClearEvents: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({
  events,
  homeTeam,
  awayTeam,
  canUndo,
  onUndo,
  onClearEvents,
}) => {
  const [filter, setFilter] = useState<'all' | 'home' | 'away' | 'score'>('all');
  const [copied, setCopied] = useState(false);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    if (filter === 'home') return ev.teamId === 'home';
    if (filter === 'away') return ev.teamId === 'away';
    if (filter === 'score') return ev.type === 'score';
    return true;
  });

  const handleCopyLog = () => {
    if (events.length === 0) return;
    const text = events
      .map((ev) => {
        const teamName = ev.teamId === 'home' ? homeTeam.name : ev.teamId === 'away' ? awayTeam.name : '系统';
        return `[${ev.gameClockDisplay} - Q${ev.period}] ${teamName}: ${ev.description}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getEventIcon = (event: GameEvent) => {
    if (event.type === 'score') {
      if (event.points === 3) return <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />;
      if (event.points === 1) return <Award className="w-3.5 h-3.5 text-slate-300" />;
      return <Award className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (event.type === 'foul') return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    if (event.type === 'timeout') return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
    return <History className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col h-[320px] shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            比赛流水记录 (Play-by-Play)
          </h3>
          <span className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full font-digital border border-white/5">
            {events.length}
          </span>
        </div>

        {/* Action buttons: Undo, Copy, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="撤销上一步操作 (Ctrl+Z)"
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-20 disabled:pointer-events-none transition-colors shadow-sm"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>撤销</span>
          </button>

          <button
            onClick={handleCopyLog}
            disabled={events.length === 0}
            title="复制流水"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/5 disabled:opacity-20 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClearEvents}
            disabled={events.length === 0}
            title="清空流水"
            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg border border-white/5 disabled:opacity-20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 my-2 text-xs">
        <span className="text-slate-400 mr-1 text-[11px] flex items-center gap-1">
          <Filter className="w-3 h-3" /> 筛选:
        </span>
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('score')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'score' ? 'bg-slate-700 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          仅得分
        </button>
        <button
          onClick={() => setFilter('home')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'home' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {homeTeam.shortName || homeTeam.name}
        </button>
        <button
          onClick={() => setFilter('away')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'away' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {awayTeam.shortName || awayTeam.name}
        </button>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <History className="w-7 h-7 stroke-1 mb-1 text-slate-600" />
            <span>暂无流水记录，得分与犯规将在此处实时显示</span>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isHome = event.teamId === 'home';
            const isAway = event.teamId === 'away';
            return (
              <div
                key={event.id}
                className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 border transition-all ${
                  isHome
                    ? 'bg-amber-950/20 border-amber-500/20 text-slate-200'
                    : isAway
                    ? 'bg-cyan-950/20 border-cyan-500/20 text-slate-200'
                    : 'bg-slate-950/60 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded bg-slate-900 border border-white/5 shrink-0">
                    {getEventIcon(event)}
                  </div>

                  <div className="truncate">
                    <span className="font-semibold text-white mr-1.5">
                      {isHome ? homeTeam.name : isAway ? awayTeam.name : ''}
                    </span>
                    <span className="text-slate-300">{event.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-digital text-[11px] text-slate-400">
                  <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-white/5">
                    Q{event.period} {event.gameClockDisplay}
                  </span>
                  {event.points && (
                    <span
                      className={`font-black px-1.5 py-0.5 rounded text-xs ${
                        event.points > 0
                          ? isHome
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-cyan-500 text-slate-950'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {event.points > 0 ? `+${event.points}` : event.points}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
