import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Flame, 
  User,
  Shield,
  Clock
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

  const handleQuickFoul = (delta: number) => {
    onFoul(side, delta, selectedPlayerId || undefined);
  };

  return (
    <div
      className={`relative rounded-2xl p-2.5 sm:p-4 lg:p-6 landscape:p-2 landscape:sm:p-3.5 backdrop-blur-md border transition-all duration-300 flex flex-col justify-between h-full ${
        isHome
          ? 'bg-slate-900/85 border-amber-500/30 shadow-2xl shadow-black/50'
          : 'bg-slate-900/85 border-cyan-500/30 shadow-2xl shadow-black/50'
      }`}
    >
      {/* Top Header: Team Name & Status */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1 sm:pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <span
            className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded ${
              isHome 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
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
                className="bg-slate-950/90 border border-amber-400 px-1.5 py-0.5 rounded text-sm sm:text-lg font-bold text-white focus:outline-none w-28 sm:w-48"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTeamNameInput(team.name);
                setIsEditingName(true);
              }}
              title="点击修改队名"
              className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-white truncate hover:text-amber-200 transition-colors text-left"
            >
              {team.name}
            </button>
          )}
        </div>

        {/* Lead status badge */}
        {isLeading && leadMargin > 0 && (
          <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            领先 +{leadMargin}
          </span>
        )}
      </div>

      {/* Main Ultra-Clean Gigantic Score Display - Smooth scaling in mobile landscape */}
      <div className="flex flex-col items-center justify-center py-1 sm:py-3 lg:py-5 landscape:py-0.5 select-none my-auto">
        <div
          className={`font-digital font-black text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[11.5rem] landscape:text-4xl landscape:sm:text-6xl landscape:md:text-7xl landscape:lg:text-9xl leading-none tracking-tight ${
            isHome
              ? 'text-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]'
              : 'text-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]'
          }`}
        >
          {String(team.score).padStart(2, '0')}
        </div>
      </div>

      {/* Scoring Action Buttons (+1, +2, +3, -1) - Clean & Unified Style */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-1.5 sm:mb-3 landscape:gap-1 landscape:mb-1">
        <button
          onClick={() => handleQuickScore(1)}
          className="py-1.5 sm:py-2.5 lg:py-3 px-1 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold border border-white/10 transition-all flex flex-col items-center justify-center landscape:py-1"
        >
          <span className="text-base sm:text-xl lg:text-2xl font-black leading-tight text-white">+1</span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">罚球</span>
        </button>

        <button
          onClick={() => handleQuickScore(2)}
          className={`py-1.5 sm:py-2.5 lg:py-3 px-1 rounded-lg sm:rounded-xl active:scale-95 text-slate-950 font-bold transition-all shadow-md flex flex-col items-center justify-center landscape:py-1 ${
            isHome
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          <span className="text-lg sm:text-2xl lg:text-3xl font-black leading-tight">+2</span>
          <span className="text-[9px] sm:text-[10px] font-bold opacity-90">进球</span>
        </button>

        <button
          onClick={() => handleQuickScore(3)}
          className={`py-1.5 sm:py-2.5 lg:py-3 px-1 rounded-lg sm:rounded-xl active:scale-95 text-white font-bold transition-all shadow-md flex flex-col items-center justify-center landscape:py-1 ${
            isHome
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
          }`}
        >
          <span className="text-lg sm:text-2xl lg:text-3xl font-black leading-tight flex items-center gap-0.5">
            +3
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold opacity-90">三分球</span>
        </button>

        <button
          onClick={() => handleQuickScore(-1)}
          title="回退1分 (误操作修正)"
          className="py-1.5 sm:py-2.5 lg:py-3 px-1 rounded-lg sm:rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold border border-white/5 transition-all flex flex-col items-center justify-center active:scale-95 landscape:py-1"
        >
          <span className="text-base sm:text-xl lg:text-2xl font-black leading-tight">-1</span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">修正</span>
        </button>
      </div>

      {/* Player Assignment (Optional / Compact) */}
      {team.players.length > 0 && (
        <div className="mb-1.5 sm:mb-2.5 bg-slate-950/40 px-2 sm:px-3 py-1 rounded-lg border border-white/5 flex items-center justify-between gap-1.5 text-xs landscape:mb-1 landscape:py-0.5">
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <User className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] sm:text-[11px]">球员:</span>
          </div>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-transparent border-0 text-slate-300 text-[10px] sm:text-xs rounded py-0.5 flex-1 focus:outline-none cursor-pointer truncate"
          >
            <option value="" className="bg-slate-900 text-slate-200">全队通用</option>
            {team.players.map((player) => (
              <option key={player.id} value={player.id} className="bg-slate-900 text-slate-200">
                #{player.number} {player.name} ({player.points}分 / {player.fouls}犯)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bottom Fouls & Timeouts - Clean Minimal Row */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3 pt-1.5 sm:pt-3 border-t border-white/10 landscape:gap-1.5 landscape:pt-1">
        {/* Fouls */}
        <div className="flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 border border-white/5">
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
              <Shield className="w-3 h-3 text-amber-400/80 shrink-0" />
              <span className="truncate">犯规</span>
              {isDoubleBonus ? (
                <span className="text-[8px] sm:text-[9px] font-bold px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">加罚</span>
              ) : isBonus ? (
                <span className="text-[8px] sm:text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">BONUS</span>
              ) : null}
            </div>
            <div className="font-digital text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight mt-0.5">
              {team.fouls}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={() => handleQuickFoul(-1)}
              disabled={team.fouls <= 0}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 transition-colors text-xs"
              title="减少犯规"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleQuickFoul(1)}
              className="px-1.5 sm:px-2.5 h-6 sm:h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-xs font-bold transition-colors flex items-center gap-0.5"
              title="增加1次犯规"
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">犯规</span>
            </button>
          </div>
        </div>

        {/* Timeouts */}
        <div className="flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 border border-white/5">
          <div className="flex-1 pr-1 sm:pr-2 min-w-0">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-cyan-400/80 shrink-0" />
                暂停
              </span>
              <span className="font-digital text-[10px] sm:text-xs text-slate-300">
                {team.timeoutsLeft}/{maxTimeouts}
              </span>
            </div>
            {/* Dots */}
            <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-2">
              {Array.from({ length: maxTimeouts }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 sm:h-1.5 flex-1 rounded-full transition-colors ${
                    idx < team.timeoutsLeft
                      ? isHome ? 'bg-amber-400' : 'bg-cyan-400'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={() => onAddTimeoutBack(side)}
              disabled={team.timeoutsLeft >= maxTimeouts}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 text-xs font-bold transition-colors"
              title="补回暂停"
            >
              +
            </button>
            <button
              onClick={() => onTimeout(side)}
              disabled={team.timeoutsLeft <= 0}
              className="px-1.5 sm:px-2.5 h-6 sm:h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-200 text-[10px] sm:text-xs font-bold transition-colors"
              title="叫暂停"
            >
              暂停
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
