import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ShieldAlert, 
  Clock, 
  Flame, 
  UserCheck
} from 'lucide-react';
import { Team } from '../types';

interface TeamCardProps {
  team: Team;
  side: 'home' | 'away';
  foulsForBonus: number;
  foulsForDoubleBonus: number;
  maxTimeouts: number;
  isLeading?: boolean;
  leadMargin?: number;
  onScore: (teamId: 'home' | 'away', points: number, playerId?: string) => void;
  onFoul: (teamId: 'home' | 'away', delta: number, playerId?: string) => void;
  onTimeout: (teamId: 'home' | 'away') => void;
  onAddTimeoutBack: (teamId: 'home' | 'away') => void;
  onUpdateTeamName: (teamId: 'home' | 'away', name: string, shortName: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  side,
  foulsForBonus,
  foulsForDoubleBonus,
  maxTimeouts,
  isLeading = false,
  leadMargin = 0,
  onScore,
  onFoul,
  onTimeout,
  onAddTimeoutBack,
  onUpdateTeamName,
}) => {
  const isHome = side === 'home';
  const isBonus = team.fouls >= foulsForBonus && team.fouls < foulsForDoubleBonus;
  const isDoubleBonus = team.fouls >= foulsForDoubleBonus;

  const [isEditingName, setIsEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState(team.name);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamNameInput.trim()) {
      const short = teamNameInput.trim().slice(0, 4).toUpperCase();
      onUpdateTeamName(side, teamNameInput.trim(), short);
    }
    setIsEditingName(false);
  };

  const handleQuickScore = (points: number) => {
    onScore(side, points, selectedPlayerId || undefined);
  };

  const handleQuickFoul = () => {
    onFoul(side, 1, selectedPlayerId || undefined);
  };

  return (
    <div
      className={`relative rounded-2xl p-4 sm:p-5 lg:p-6 border transition-all duration-300 flex flex-col justify-between h-full ${
        isHome
          ? 'bg-slate-900/95 border-amber-500/40 shadow-2xl shadow-amber-950/30'
          : 'bg-slate-900/95 border-cyan-500/40 shadow-2xl shadow-cyan-950/30'
      }`}
    >
      {/* Top Banner: Role Badge, Team Name, and Lead Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md shadow-sm ${
              isHome ? 'bg-amber-500 text-slate-950 shadow-amber-500/30' : 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            {isHome ? '主队 HOME' : '客队 AWAY'}
          </span>

          {isEditingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                className="bg-slate-950 border border-amber-400/80 px-2.5 py-1 rounded-lg text-base font-bold text-white focus:outline-none w-44"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTeamNameInput(team.name);
                setIsEditingName(true);
              }}
              title="点击修改队伍名称"
              className="text-lg sm:text-xl md:text-2xl font-black text-white truncate hover:underline hover:text-amber-200 transition-colors text-left tracking-tight"
            >
              {team.name}
            </button>
          )}
        </div>

        {/* Lead status badge */}
        {isLeading && leadMargin > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse shrink-0">
            领先 +{leadMargin}分
          </span>
        )}
      </div>

      {/* Main Massive Score Display */}
      <div
        className={`rounded-2xl p-4 sm:p-6 lg:p-7 border flex flex-col items-center justify-center my-2 sm:my-3 relative overflow-hidden transition-all ${
          isHome
            ? 'bg-gradient-to-b from-slate-950 via-slate-950 to-amber-950/20 border-amber-500/30'
            : 'bg-gradient-to-b from-slate-950 via-slate-950 to-cyan-950/20 border-cyan-500/30'
        }`}
      >
        {/* Score Header Label */}
        <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
          <span className={isHome ? 'text-amber-400/80 font-mono' : 'text-cyan-400/80 font-mono'}>
            TEAM SCORE
          </span>
          <span className="text-slate-400 font-medium">比分</span>
        </div>

        {/* Gigantic Digits for Big Screen / Landscape Visibility */}
        <div className="py-1 sm:py-2 select-none">
          <div
            className={`font-digital font-black text-8xl sm:text-9xl md:text-[8.5rem] lg:text-[9.5rem] xl:text-[11rem] leading-none tracking-tight ${
              isHome
                ? 'text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.45)]'
                : 'text-cyan-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.45)]'
            }`}
          >
            {String(team.score).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Scoring Action Buttons (+1, +2, +3, -1) */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <button
          onClick={() => handleQuickScore(1)}
          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold border border-slate-700/80 transition-all group shadow-md"
        >
          <span className="text-xl sm:text-2xl font-black leading-tight text-white group-hover:text-amber-300">
            +1
          </span>
          <span className="text-[11px] text-slate-400 font-medium">罚球</span>
        </button>

        <button
          onClick={() => handleQuickScore(2)}
          className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl active:scale-95 text-slate-950 font-bold border transition-all shadow-lg group ${
            isHome
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-400/90 shadow-amber-500/25'
              : 'bg-cyan-500 hover:bg-cyan-400 border-cyan-400/90 shadow-cyan-500/25'
          }`}
        >
          <span className="text-2xl sm:text-3xl font-black leading-tight">+2</span>
          <span className="text-[11px] font-bold opacity-90">进球</span>
        </button>

        <button
          onClick={() => handleQuickScore(3)}
          className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl active:scale-95 font-bold border transition-all shadow-lg group ${
            isHome
              ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 border-orange-400/90 shadow-orange-500/25'
              : 'bg-blue-500 hover:bg-blue-400 text-white border-blue-400/90 shadow-blue-500/25'
          }`}
        >
          <span className="text-2xl sm:text-3xl font-black leading-tight flex items-center gap-0.5">
            +3
            <Flame className="w-4 h-4 fill-current" />
          </span>
          <span className="text-[11px] font-bold opacity-90">三分球</span>
        </button>

        <button
          onClick={() => handleQuickScore(-1)}
          title="回退1分 (误操作修正)"
          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl bg-slate-950/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 font-bold border border-slate-800 hover:border-rose-900/60 transition-all active:scale-95"
        >
          <span className="text-xl sm:text-2xl font-black leading-tight">-1</span>
          <span className="text-[11px] text-slate-400 font-medium">修正</span>
        </button>
      </div>

      {/* Player Specific Quick Attribution */}
      {team.players.length > 0 && (
        <div className="mb-3 bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium">记分球员:</span>
          </div>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 flex-1 focus:outline-none focus:border-amber-400"
          >
            <option value="">全队通用 (不指定球员)</option>
            {team.players.map((player) => (
              <option key={player.id} value={player.id}>
                #{player.number} {player.name} ({player.points}分 / {player.fouls}犯)
                {player.isOnCourt ? ' [在场]' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bottom Fouls & Timeouts Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2.5 border-t border-slate-800/80">
        {/* Team Fouls */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              全队犯规
            </span>
            {isDoubleBonus ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white animate-pulse">
                2次罚球
              </span>
            ) : isBonus ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                BONUS
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="font-digital text-3xl sm:text-4xl font-black text-rose-400">
              {team.fouls}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onFoul(side, -1, selectedPlayerId || undefined)}
                disabled={team.fouls <= 0}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
                title="减少犯规"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleQuickFoul}
                className="px-2.5 h-7 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 flex items-center justify-center text-xs font-bold transition-colors shadow-sm"
                title="记录1次犯规"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                犯规
              </button>
            </div>
          </div>
        </div>

        {/* Team Timeouts */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              剩余暂停
            </span>
            <span className="text-xs font-digital font-bold text-sky-400">
              {team.timeoutsLeft} / {maxTimeouts}
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1 my-1">
            {Array.from({ length: maxTimeouts }).map((_, idx) => {
              const isAvailable = idx < team.timeoutsLeft;
              return (
                <span
                  key={idx}
                  className={`h-2 flex-1 rounded-sm transition-colors ${
                    isAvailable
                      ? isHome
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                      : 'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-1">
            <button
              onClick={() => onAddTimeoutBack(side)}
              disabled={team.timeoutsLeft >= maxTimeouts}
              className="text-[10px] text-slate-400 hover:text-slate-200 disabled:opacity-30 underline transition-colors"
              title="补回暂停次数"
            >
              +补回
            </button>
            <button
              onClick={() => onTimeout(side)}
              disabled={team.timeoutsLeft <= 0}
              className="px-2.5 h-7 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-800 disabled:opacity-30 flex items-center justify-center text-xs font-bold transition-colors"
              title="叫暂停"
            >
              叫暂停
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
