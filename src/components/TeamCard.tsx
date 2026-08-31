import React, { useState } from 'react';
import { 
  Flame, 
  User, 
  Shield, 
  Clock, 
  Plus, 
  Minus 
} from 'lucide-react';
import { Team } from '../types';
import { TeamColorPicker } from './TeamColorPicker';
import { hexToRgba } from '../utils/teamColors';

interface TeamCardProps {
  team: Team;
  side: 'home' | 'away';
  foulsForBonus: number;
  foulsForDoubleBonus: number;
  maxTimeouts: number;
  panelOpacity?: number;
  isLeading?: boolean;
  leadMargin?: number;
  onScore: (teamId: 'home' | 'away', points: number, playerId?: string) => void;
  onFoul: (teamId: 'home' | 'away', delta: number, playerId?: string) => void;
  onTimeout: (teamId: 'home' | 'away') => void;
  onAddTimeoutBack: (teamId: 'home' | 'away') => void;
  onUpdateTeamName: (teamId: 'home' | 'away', name: string, shortName: string) => void;
  onUpdateTeamColor?: (teamId: 'home' | 'away', color: string, accentColor?: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  side,
  foulsForBonus,
  foulsForDoubleBonus,
  maxTimeouts,
  panelOpacity = 75,
  isLeading = false,
  leadMargin = 0,
  onScore,
  onFoul,
  onTimeout,
  onAddTimeoutBack,
  onUpdateTeamName,
  onUpdateTeamColor,
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

  const primaryColor = team.color || (isHome ? '#ef4444' : '#3b82f6');
  const opacityRatio = Math.max(0.15, Math.min(1, (panelOpacity ?? 75) / 100));

  return (
    <div
      style={{
        backgroundColor: `rgba(15, 23, 42, ${opacityRatio})`,
        borderColor: hexToRgba(primaryColor, 0.45),
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px ${hexToRgba(primaryColor, 0.2)}`,
        backdropFilter: opacityRatio < 0.95 ? 'blur(8px)' : 'none',
      }}
      className="mobile-compact-card relative rounded-xl sm:rounded-2xl lg:rounded-3xl p-2 sm:p-3.5 md:p-4 lg:p-5 xl:p-6 border transition-colors duration-200 flex flex-col justify-between h-full min-h-0"
    >
      {/* Top Header: Fixed height to prevent layout shift */}
      <div className="h-7 sm:h-9 md:h-10 lg:h-12 flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3 pb-1 md:pb-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
          <span
            style={{
              backgroundColor: hexToRgba(primaryColor, 0.2),
              color: primaryColor,
              borderColor: hexToRgba(primaryColor, 0.4),
            }}
            className="px-1.5 sm:px-2 md:px-2.5 py-0.5 md:py-1 text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-wider rounded md:rounded-lg border shrink-0 whitespace-nowrap"
          >
            {isHome ? '主队 HOME' : '客队 AWAY'}
          </span>

          {isEditingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-1 flex-1 min-w-0">
              <input
                type="text"
                autoFocus
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                className="bg-slate-950 border border-amber-400 px-1.5 py-0.5 md:px-2 md:py-1 rounded md:rounded-lg text-xs sm:text-base md:text-lg font-bold text-white focus:outline-none w-24 sm:w-36 md:w-48"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTeamNameInput(team.name);
                setIsEditingName(true);
              }}
              title="点击修改队名"
              className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black text-white truncate hover:opacity-80 transition-opacity text-left max-w-[110px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[320px] whitespace-nowrap cursor-pointer"
            >
              {team.name}
            </button>
          )}

          {/* Quick Color Picker Trigger */}
          {onUpdateTeamColor && (
            <TeamColorPicker
              currentColor={primaryColor}
              onSelectColor={(hex, accentHex) => onUpdateTeamColor(side, hex, accentHex)}
              teamLabel={isHome ? '主队' : '客队'}
            />
          )}
        </div>

        {/* Lead status badge (Fixed slot width to avoid jumping) */}
        <div className="w-14 sm:w-20 md:w-24 flex justify-end shrink-0">
          {isLeading && leadMargin > 0 ? (
            <span
              style={{
                backgroundColor: hexToRgba(primaryColor, 0.25),
                color: primaryColor,
                borderColor: hexToRgba(primaryColor, 0.6),
              }}
              className="px-1.5 sm:px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] sm:text-xs md:text-sm font-bold border truncate text-center tabular-nums shadow-sm whitespace-nowrap"
            >
              +{leadMargin}
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Score Display (Flex container height, tabular digits) */}
      <div className="flex-1 min-h-0 flex items-center justify-center select-none my-auto py-1 sm:py-2 md:py-3 shrink-0">
        <span
          style={{
            color: primaryColor,
            textShadow: `0 0 45px ${hexToRgba(primaryColor, 0.5)}`,
          }}
          className="mobile-compact-score font-digital font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10.5rem] tabular-nums leading-none tracking-normal"
        >
          {String(team.score).padStart(2, '0')}
        </span>
      </div>

      {/* Scoring Action Deck (+1, +2, +3, -1) */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2.5 shrink-0">
        {/* +1 Free Throw */}
        <button
          onClick={() => handleQuickScore(1)}
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-18 rounded-lg sm:rounded-xl md:rounded-2xl bg-slate-900/90 hover:bg-slate-800/95 border border-white/10 hover:border-white/20 active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg shadow-black/40 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black font-digital text-emerald-400 group-hover:text-emerald-300 tabular-nums leading-none">
            +1
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-bold text-slate-400 group-hover:text-slate-300 mt-0.5 whitespace-nowrap">
            罚球
          </span>
        </button>

        {/* +2 Field Goal */}
        <button
          onClick={() => handleQuickScore(2)}
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.95)}, ${hexToRgba(primaryColor, 0.75)})`,
            boxShadow: `0 4px 16px ${hexToRgba(primaryColor, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            borderColor: hexToRgba(primaryColor, 0.8),
          }}
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-18 rounded-lg sm:rounded-xl md:rounded-2xl border active:scale-95 hover:brightness-110 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black font-digital text-slate-950 tabular-nums leading-none">
            +2
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-black text-slate-950/90 mt-0.5 whitespace-nowrap">
            2分进球
          </span>
        </button>

        {/* +3 Three Pointer */}
        <button
          onClick={() => handleQuickScore(3)}
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.95)}, ${hexToRgba(primaryColor, 0.75)})`,
            boxShadow: `0 4px 16px ${hexToRgba(primaryColor, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            borderColor: hexToRgba(primaryColor, 0.8),
          }}
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-18 rounded-lg sm:rounded-xl md:rounded-2xl border active:scale-95 hover:brightness-110 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black font-digital text-slate-950 flex items-center gap-0.5 tabular-nums leading-none">
            +3
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 fill-amber-400 text-amber-300 drop-shadow" />
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-black text-slate-950/90 mt-0.5 whitespace-nowrap">
            三分远投
          </span>
        </button>

        {/* -1 Correction / Undo */}
        <button
          onClick={() => handleQuickScore(-1)}
          title="回退1分 (误操作修正)"
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-18 rounded-lg sm:rounded-xl md:rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg shadow-black/40 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black font-digital text-slate-400 group-hover:text-rose-400 tabular-nums leading-none">
            -1
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-bold text-slate-400 group-hover:text-rose-300/80 mt-0.5 whitespace-nowrap">
            修正
          </span>
        </button>
      </div>

      {/* Player Assignment (Optional / Compact) */}
      {team.players.length > 0 && (
        <div className="h-5 sm:h-6 md:h-7 lg:h-8 mb-1 md:mb-1.5 bg-slate-950/40 px-2 rounded-lg border border-white/5 flex items-center justify-between gap-1.5 text-xs md:text-sm shrink-0">
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-slate-400" />
            <span className="text-[8px] sm:text-[9px] md:text-xs whitespace-nowrap">球员:</span>
          </div>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-transparent border-0 text-slate-300 text-[8px] sm:text-[10px] md:text-xs lg:text-sm rounded py-0 flex-1 focus:outline-none cursor-pointer truncate"
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

      {/* Bottom Fouls & Timeouts Row */}
      <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3 pt-1 sm:pt-1.5 md:pt-2 border-t border-white/10 shrink-0">
        {/* Fouls Box */}
        <div className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-15 flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl md:rounded-2xl px-1.5 sm:px-2.5 md:px-3.5 border border-white/5">
          <div className="min-w-0 pr-1 flex-1">
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400 truncate">
              <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 shrink-0" style={{ color: primaryColor }} />
              <span className="truncate">犯规</span>
              {isDoubleBonus ? (
                <span className="text-[7px] md:text-[10px] font-bold px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">加罚</span>
              ) : isBonus ? (
                <span
                  style={{
                    backgroundColor: hexToRgba(primaryColor, 0.2),
                    color: primaryColor,
                    borderColor: hexToRgba(primaryColor, 0.4),
                  }}
                  className="text-[7px] md:text-[10px] font-bold px-1 rounded border shrink-0"
                >
                  BONUS
                </span>
              ) : null}
            </div>
            <div className="font-digital text-sm sm:text-lg md:text-2xl lg:text-3xl font-black text-white leading-none mt-0.5 tabular-nums">
              {team.fouls}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0">
            <button
              onClick={() => handleQuickFoul(-1)}
              disabled={team.fouls <= 0}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded md:rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 transition-colors text-xs md:text-sm shrink-0 cursor-pointer"
              title="减少犯规"
            >
              <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5" />
            </button>
            <button
              onClick={() => handleQuickFoul(1)}
              className="px-1 md:px-2 h-4 sm:h-5 md:h-7 lg:h-8 rounded md:rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-bold transition-colors flex items-center gap-0.5 shrink-0 whitespace-nowrap cursor-pointer"
              title="增加1次犯规"
            >
              <Plus className="w-2 h-2 md:w-3 md:h-3" />
              <span>+犯</span>
            </button>
          </div>
        </div>

        {/* Timeouts Box */}
        <div className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-15 flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl md:rounded-2xl px-1.5 sm:px-2.5 md:px-3.5 border border-white/5">
          <div className="flex-1 pr-1 min-w-0">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400">
              <span className="flex items-center gap-0.5 truncate">
                <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 shrink-0" style={{ color: primaryColor }} />
                暂停
              </span>
              <span className="font-digital text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-slate-300 tabular-nums">
                {team.timeoutsLeft}/{maxTimeouts}
              </span>
            </div>
            {/* Dots */}
            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 md:mt-1">
              {Array.from({ length: maxTimeouts }).map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: idx < team.timeoutsLeft ? primaryColor : 'rgb(30, 41, 59)',
                  }}
                  className="h-0.5 sm:h-1 md:h-1.5 flex-1 rounded-full transition-colors"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0">
            <button
              onClick={() => onAddTimeoutBack(side)}
              disabled={team.timeoutsLeft >= maxTimeouts}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded md:rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 text-xs md:text-sm font-bold transition-colors shrink-0 cursor-pointer"
              title="补回暂停"
            >
              +
            </button>
            <button
              onClick={() => onTimeout(side)}
              disabled={team.timeoutsLeft <= 0}
              className="px-1 md:px-2 h-4 sm:h-5 md:h-7 lg:h-8 rounded md:rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-200 text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer"
              title="叫暂停"
            >
              叫停
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
