import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ShieldAlert, 
  Clock, 
  Flame, 
  ChevronDown, 
  UserCheck,
  Disc
} from 'lucide-react';
import { Team, Player, Possession } from '../types';

interface TeamCardProps {
  team: Team;
  side: 'home' | 'away';
  possession: Possession;
  foulsForBonus: number;
  foulsForDoubleBonus: number;
  maxTimeouts: number;
  onScore: (teamId: 'home' | 'away', points: number, playerId?: string) => void;
  onFoul: (teamId: 'home' | 'away', delta: number, playerId?: string) => void;
  onTimeout: (teamId: 'home' | 'away') => void;
  onAddTimeoutBack: (teamId: 'home' | 'away') => void;
  onTogglePossession: (teamId: 'home' | 'away') => void;
  onUpdateTeamName: (teamId: 'home' | 'away', name: string, shortName: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  side,
  possession,
  foulsForBonus,
  foulsForDoubleBonus,
  maxTimeouts,
  onScore,
  onFoul,
  onTimeout,
  onAddTimeoutBack,
  onTogglePossession,
  onUpdateTeamName,
}) => {
  const isHome = side === 'home';
  const hasPossession = possession === side;
  const isBonus = team.fouls >= foulsForBonus && team.fouls < foulsForDoubleBonus;
  const isDoubleBonus = team.fouls >= foulsForDoubleBonus;

  const [isEditingName, setIsEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState(team.name);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const activePlayers = team.players.filter((p) => p.isOnCourt);

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
      className={`relative rounded-2xl p-5 border transition-all duration-300 ${
        isHome
          ? 'bg-slate-900/90 border-amber-500/30 shadow-xl shadow-amber-950/20'
          : 'bg-slate-900/90 border-cyan-500/30 shadow-xl shadow-cyan-950/20'
      } ${hasPossession ? 'ring-2 ' + (isHome ? 'ring-amber-400' : 'ring-cyan-400') : ''}`}
    >
      {/* Top Banner: Team Label, Edit Name & Possession Arrow */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Team Role & Name */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded ${
              isHome ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-slate-950'
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
                className="bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-sm text-white focus:outline-none focus:border-amber-400 w-32"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTeamNameInput(team.name);
                setIsEditingName(true);
              }}
              title="点击修改队名"
              className="text-lg sm:text-xl font-bold text-white truncate hover:underline hover:text-slate-200 transition-colors text-left"
            >
              {team.name}
            </button>
          )}
        </div>

        {/* Possession Arrow Button */}
        <button
          onClick={() => onTogglePossession(side)}
          title={hasPossession ? '当前持球方 (点击切换)' : '设为持球方 (球权)'}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            hasPossession
              ? isHome
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
                : 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-400/30 animate-pulse'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Disc className={`w-3.5 h-3.5 ${hasPossession ? 'fill-current' : ''}`} />
          <span>{hasPossession ? '持球中' : '争球权'}</span>
        </button>
      </div>

      {/* Main Score Display */}
      <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/90 flex flex-col items-center justify-center my-3 relative overflow-hidden">
        {/* Glow effect in background */}
        <div
          className={`absolute inset-0 opacity-10 pointer-events-none ${
            isHome ? 'bg-amber-500' : 'bg-cyan-500'
          }`}
        />

        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          得分 SCORE
        </div>

        <div
          className={`font-digital text-7xl sm:text-8xl font-black tracking-tight leading-none ${
            isHome ? 'text-amber-400' : 'text-cyan-400'
          } drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]`}
        >
          {String(team.score).padStart(2, '0')}
        </div>
      </div>

      {/* Scoring Controls: +1, +2, +3, -1 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => handleQuickScore(1)}
          className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold border border-slate-700/70 transition-all group"
        >
          <span className="text-lg font-black leading-tight text-white group-hover:text-amber-300">
            +1
          </span>
          <span className="text-[10px] text-slate-400 font-normal">罚球</span>
        </button>

        <button
          onClick={() => handleQuickScore(2)}
          className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl active:scale-95 text-slate-950 font-bold border transition-all shadow-md group ${
            isHome
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-400/80 shadow-amber-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 border-cyan-400/80 shadow-cyan-500/20'
          }`}
        >
          <span className="text-xl font-black leading-tight">+2</span>
          <span className="text-[10px] font-semibold opacity-90">进球</span>
        </button>

        <button
          onClick={() => handleQuickScore(3)}
          className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl active:scale-95 font-bold border transition-all shadow-md group ${
            isHome
              ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 border-orange-400/80 shadow-orange-500/20'
              : 'bg-blue-500 hover:bg-blue-400 text-white border-blue-400/80 shadow-blue-500/20'
          }`}
        >
          <span className="text-xl font-black leading-tight flex items-center gap-0.5">
            +3
            <Flame className="w-3.5 h-3.5 fill-current" />
          </span>
          <span className="text-[10px] font-semibold opacity-90">三分球</span>
        </button>

        <button
          onClick={() => handleQuickScore(-1)}
          title="回退1分修正"
          className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-950/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 font-bold border border-slate-800 hover:border-rose-900/60 transition-all active:scale-95"
        >
          <span className="text-lg font-black leading-tight">-1</span>
          <span className="text-[10px] opacity-75 font-normal">修正</span>
        </button>
      </div>

      {/* Player Quick Attribution Selector */}
      {team.players.length > 0 && (
        <div className="mb-4 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">记到球员:</span>
          </div>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 flex-1 focus:outline-none focus:border-amber-400"
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

      {/* Bottom Row: Fouls & Timeouts */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/70">
        {/* Fouls Section */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              全队犯规
            </span>
            {/* Bonus Indicator */}
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
            <div className="font-digital text-3xl font-black text-rose-400">
              {team.fouls}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onFoul(side, -1, selectedPlayerId || undefined)}
                disabled={team.fouls <= 0}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
                title="减少犯规"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleQuickFoul}
                className="px-2.5 h-7 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/80 flex items-center justify-center text-xs font-bold transition-colors"
                title="记录1次犯规"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                犯规
              </button>
            </div>
          </div>
        </div>

        {/* Timeouts Section */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              剩余暂停
            </span>
            <span className="text-[11px] font-digital font-bold text-sky-400">
              {team.timeoutsLeft} / {maxTimeouts}
            </span>
          </div>

          {/* Timeouts Dot Indicators */}
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
              className="px-2.5 h-7 rounded-lg bg-sky-950/70 hover:bg-sky-900 text-sky-200 border border-sky-800/80 disabled:opacity-40 disabled:hover:bg-sky-950 flex items-center justify-center text-xs font-bold transition-colors"
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
