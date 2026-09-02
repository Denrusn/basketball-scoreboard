import React, { useState } from 'react';
import { 
  Flame, 
  User, 
  Users,
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
  targetScoreProgress?: {
    currentPeriodScore: number;
    targetScore: number;
  };
  onScore: (teamId: 'home' | 'away', points: number, playerId?: string) => void;
  onFoul: (teamId: 'home' | 'away', delta: number, playerId?: string) => void;
  onRebound?: (teamId: 'home' | 'away', delta: number, playerId?: string) => void;
  onAssist?: (teamId: 'home' | 'away', delta: number, playerId?: string) => void;
  onTimeout: (teamId: 'home' | 'away') => void;
  onAddTimeoutBack: (teamId: 'home' | 'away') => void;
  onUpdateTeamName: (teamId: 'home' | 'away', name: string, shortName: string) => void;
  onUpdateTeamColor?: (teamId: 'home' | 'away', color: string, accentColor?: string) => void;
  onOpenRoster?: () => void;
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
  targetScoreProgress,
  onScore,
  onFoul,
  onRebound,
  onAssist,
  onTimeout,
  onAddTimeoutBack,
  onUpdateTeamName,
  onUpdateTeamColor,
  onOpenRoster,
}) => {
  const isHome = side === 'home';
  const isBonus = team.fouls >= foulsForBonus && team.fouls < foulsForDoubleBonus;
  const isDoubleBonus = team.fouls >= foulsForDoubleBonus;

  const [isEditingName, setIsEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState(team.name);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const selectedPlayer = team.players.find((p) => p.id === selectedPlayerId);

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

  const handleQuickRebound = (delta: number) => {
    if (onRebound) {
      onRebound(side, delta, selectedPlayerId || undefined);
    }
  };

  const handleQuickAssist = (delta: number) => {
    if (onAssist) {
      onAssist(side, delta, selectedPlayerId || undefined);
    }
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
      <div className="h-7 sm:h-9 md:h-11 lg:h-14 xl:h-16 flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3 pb-1 md:pb-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
          <span
            style={{
              backgroundColor: hexToRgba(primaryColor, 0.2),
              color: primaryColor,
              borderColor: hexToRgba(primaryColor, 0.4),
            }}
            className="px-1.5 sm:px-2 md:px-3 lg:px-3.5 py-0.5 md:py-1 lg:py-1.5 text-[9px] sm:text-xs md:text-sm lg:text-base font-black uppercase tracking-wider rounded md:rounded-lg lg:rounded-xl border shrink-0 whitespace-nowrap"
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
                className="bg-slate-950 border border-amber-400 px-1.5 py-0.5 md:px-2 md:py-1 lg:px-3 lg:py-1.5 rounded md:rounded-lg text-xs sm:text-base md:text-lg lg:text-2xl font-bold text-white focus:outline-none w-24 sm:w-36 md:w-48 lg:w-64"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTeamNameInput(team.name);
                setIsEditingName(true);
              }}
              title="点击修改队名"
              className="team-name-fluid text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black text-white truncate hover:opacity-80 transition-opacity text-left max-w-[100px] sm:max-w-[160px] md:max-w-[240px] lg:max-w-[360px] xl:max-w-[480px] whitespace-nowrap cursor-pointer"
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
        <div className="w-12 sm:w-16 md:w-20 lg:w-28 flex justify-end shrink-0">
          {isLeading && leadMargin > 0 ? (
            <span
              style={{
                backgroundColor: hexToRgba(primaryColor, 0.25),
                color: primaryColor,
                borderColor: hexToRgba(primaryColor, 0.6),
              }}
              className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-0.5 md:py-1 lg:py-1.5 rounded-full text-[9px] sm:text-xs md:text-sm lg:text-base font-bold border truncate text-center tabular-nums shadow-sm whitespace-nowrap"
            >
              +{leadMargin}
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Score Display (Flex container height, tabular digits) */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center select-none my-auto py-0.5 sm:py-1 md:py-2 lg:py-3 shrink-0">
        <span
          style={{
            color: primaryColor,
            textShadow: `0 0 45px ${hexToRgba(primaryColor, 0.5)}`,
          }}
          className="score-fluid-text font-digital font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[12rem] tabular-nums leading-none tracking-normal"
        >
          {String(team.score).padStart(2, '0')}
        </span>

        {/* Target Score Mode - Current Quarter Progress */}
        {targetScoreProgress ? (
          <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] mt-1 sm:mt-1.5 px-2">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold mb-1">
              <span className="text-slate-400">本节抢分</span>
              <span style={{ color: primaryColor }} className="tabular-nums font-mono">
                {targetScoreProgress.currentPeriodScore} / {targetScoreProgress.targetScore} 分
              </span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-slate-800/90 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (targetScoreProgress.currentPeriodScore / targetScoreProgress.targetScore) * 100)}%`,
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 8px ${hexToRgba(primaryColor, 0.6)}`,
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Scoring Action Deck (+1, +2, +3, -1) */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-4 mb-1 sm:mb-1.5 md:mb-2 lg:mb-3 shrink-0">
        {/* +1 Free Throw */}
        <button
          onClick={() => handleQuickScore(1)}
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 2xl:h-22 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl bg-slate-900/90 hover:bg-slate-800/95 border border-white/10 hover:border-white/20 active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg shadow-black/40 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black font-digital text-emerald-400 group-hover:text-emerald-300 tabular-nums leading-none">
            +1
          </span>
          <span className="deck-label-fluid text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-bold text-slate-400 group-hover:text-slate-300 mt-0.5 whitespace-nowrap">
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
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 2xl:h-22 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl border active:scale-95 hover:brightness-110 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black font-digital text-slate-950 tabular-nums leading-none">
            +2
          </span>
          <span className="deck-label-fluid text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-black text-slate-950/90 mt-0.5 whitespace-nowrap">
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
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 2xl:h-22 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl border active:scale-95 hover:brightness-110 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black font-digital text-slate-950 flex items-center gap-0.5 tabular-nums leading-none">
            +3
            <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 fill-amber-400 text-amber-300 drop-shadow" />
          </span>
          <span className="deck-label-fluid text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-black text-slate-950/90 mt-0.5 whitespace-nowrap">
            三分远投
          </span>
        </button>

        {/* -1 Correction / Undo */}
        <button
          onClick={() => handleQuickScore(-1)}
          title="回退1分 (误操作修正)"
          className="mobile-compact-btn group relative h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 2xl:h-22 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg shadow-black/40 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black font-digital text-slate-400 group-hover:text-rose-400 tabular-nums leading-none">
            -1
          </span>
          <span className="deck-label-fluid text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-bold text-slate-400 group-hover:text-rose-300/80 mt-0.5 whitespace-nowrap">
            修正
          </span>
        </button>
      </div>

      {/* Direct Player Selection Bar (Flat Tiled Jersey Numbers, No Scrollbar, Zero Names) */}
      <div className="my-1 sm:my-1.5 bg-slate-950/70 p-1.5 sm:p-2 rounded-lg md:rounded-xl border border-white/10 flex flex-col gap-1 shrink-0 shadow-inner">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-0.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-300">球员选择 (记分/犯规归属):</span>
            {selectedPlayer ? (
              <span 
                style={{ color: primaryColor }}
                className="font-digital font-black bg-white/5 px-1.5 py-0.2 rounded border border-white/10"
              >
                已选 #{selectedPlayer.number} 号
              </span>
            ) : (
              <span className="text-slate-400 font-normal">(全队通用)</span>
            )}
          </div>

          {onOpenRoster && (
            <button
              type="button"
              onClick={onOpenRoster}
              className="text-[10px] text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>名单管理</span>
            </button>
          )}
        </div>

        {/* Flat Tiled Jersey Numbers: NO scrollbar, wraps neatly */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5">
          {/* Team General Button */}
          <button
            type="button"
            onClick={() => setSelectedPlayerId('')}
            title="记入全队总分 (不指定具体个人)"
            className={`px-2 sm:px-2.5 py-1 rounded-md md:rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              selectedPlayerId === ''
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 font-black ring-1 ring-amber-300'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-white/10'
            }`}
          >
            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>全队</span>
          </button>

          {/* All Players Flatly Tiled - Pure Numbers Only */}
          {team.players.map((player) => {
            const isSelected = selectedPlayerId === player.id;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(isSelected ? '' : player.id)}
                title={`#${player.number}号 (得分 ${player.points} | 篮板 ${player.rebounds || 0} | 助攻 ${player.assists || 0} | 犯规 ${player.fouls})`}
                style={
                  isSelected
                    ? {
                        backgroundColor: primaryColor,
                        color: '#020617',
                        boxShadow: `0 0 12px ${hexToRgba(primaryColor, 0.7)}`,
                        borderColor: '#ffffff',
                      }
                    : undefined
                }
                className={`px-2 sm:px-2.5 py-1 rounded-md md:rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                  isSelected
                    ? 'font-black ring-2 ring-white/90 scale-105 z-10'
                    : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:border-white/30 border-white/10'
                }`}
              >
                <span className="font-digital text-xs sm:text-sm font-black">
                  #{player.number}
                </span>
                <span
                  className={`text-[9px] font-digital tabular-nums px-1 py-0.2 rounded ${
                    isSelected
                      ? 'bg-slate-950/30 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {player.points}分
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rebounds & Assists Stats Action Deck */}
      <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3 lg:gap-4 my-1 sm:my-1.5 shrink-0">
        {/* Rebounds (篮板) Box */}
        <div className="h-7 sm:h-9 md:h-11 lg:h-14 xl:h-16 flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl px-1.5 sm:px-2.5 md:px-3.5 lg:px-4.5 border border-white/5">
          <div className="min-w-0 pr-1 flex-1">
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-bold text-slate-400 truncate">
              <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 shrink-0 text-amber-400" />
              <span className="truncate">篮板</span>
              {selectedPlayer && (
                <span className="text-[7px] md:text-[9px] lg:text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20 truncate">
                  #{selectedPlayer.number}:{selectedPlayer.rebounds || 0}
                </span>
              )}
            </div>
            <div className="font-digital text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-black text-amber-300 leading-none mt-0.5 tabular-nums">
              {team.rebounds || 0}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickRebound(-1)}
              disabled={(team.rebounds || 0) <= 0}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 rounded md:rounded-lg lg:rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 transition-colors text-xs md:text-sm shrink-0 cursor-pointer"
              title={selectedPlayer ? `为 #${selectedPlayer.number} 扣减1个篮板` : '扣减全队1个篮板'}
            >
              <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickRebound(1)}
              className="px-1 md:px-2 lg:px-3 h-4 sm:h-5 md:h-7 lg:h-9 rounded md:rounded-lg lg:rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base font-bold transition-colors flex items-center gap-0.5 md:gap-1 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
              title={selectedPlayer ? `为 #${selectedPlayer.number} ${selectedPlayer.name} 记1个篮板` : '记全队1个篮板'}
            >
              <Plus className="w-2 h-2 md:w-3 md:h-3" />
              <span>+板</span>
            </button>
          </div>
        </div>

        {/* Assists (助攻) Box */}
        <div className="h-7 sm:h-9 md:h-11 lg:h-14 xl:h-16 flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl px-1.5 sm:px-2.5 md:px-3.5 lg:px-4.5 border border-white/5">
          <div className="min-w-0 pr-1 flex-1">
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-bold text-slate-400 truncate">
              <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 shrink-0 text-cyan-400" />
              <span className="truncate">助攻</span>
              {selectedPlayer && (
                <span className="text-[7px] md:text-[9px] lg:text-[10px] text-cyan-300 font-bold bg-cyan-500/10 px-1 py-0.2 rounded border border-cyan-500/20 truncate">
                  #{selectedPlayer.number}:{selectedPlayer.assists || 0}
                </span>
              )}
            </div>
            <div className="font-digital text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-black text-cyan-300 leading-none mt-0.5 tabular-nums">
              {team.assists || 0}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickAssist(-1)}
              disabled={(team.assists || 0) <= 0}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 rounded md:rounded-lg lg:rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 transition-colors text-xs md:text-sm shrink-0 cursor-pointer"
              title={selectedPlayer ? `为 #${selectedPlayer.number} 扣减1次助攻` : '扣减全队1次助攻'}
            >
              <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickAssist(1)}
              className="px-1 md:px-2 lg:px-3 h-4 sm:h-5 md:h-7 lg:h-9 rounded md:rounded-lg lg:rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base font-bold transition-colors flex items-center gap-0.5 md:gap-1 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
              title={selectedPlayer ? `为 #${selectedPlayer.number} ${selectedPlayer.name} 记1次助攻` : '记全队1次助攻'}
            >
              <Plus className="w-2 h-2 md:w-3 md:h-3" />
              <span>+助</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Fouls & Timeouts Row */}
      <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3 lg:gap-4 pt-1 sm:pt-1.5 md:pt-2 lg:pt-3 border-t border-white/10 shrink-0">
        {/* Fouls Box */}
        <div className="h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 2xl:h-22 flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl px-1.5 sm:px-2.5 md:px-3.5 lg:px-4.5 border border-white/5">
          <div className="min-w-0 pr-1 flex-1">
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base font-bold text-slate-400 truncate">
              <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 lg:w-4.5 lg:h-4.5 shrink-0" style={{ color: primaryColor }} />
              <span className="truncate">犯规</span>
              {isDoubleBonus ? (
                <span className="text-[7px] md:text-[10px] lg:text-xs font-bold px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">加罚</span>
              ) : isBonus ? (
                <span
                  style={{
                    backgroundColor: hexToRgba(primaryColor, 0.2),
                    color: primaryColor,
                    borderColor: hexToRgba(primaryColor, 0.4),
                  }}
                  className="text-[7px] md:text-[10px] lg:text-xs font-bold px-1 py-0.5 rounded border shrink-0"
                >
                  BONUS
                </span>
              ) : null}
            </div>
            <div className="font-digital text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-white leading-none mt-0.5 tabular-nums">
              {team.fouls}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 shrink-0">
            <button
              onClick={() => handleQuickFoul(-1)}
              disabled={team.fouls <= 0}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11 rounded md:rounded-lg lg:rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 transition-colors text-xs md:text-sm lg:text-base shrink-0 cursor-pointer"
              title="减少犯规"
            >
              <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 lg:w-4.5 lg:h-4.5" />
            </button>
            <button
              onClick={() => handleQuickFoul(1)}
              className="px-1 md:px-2 lg:px-3 h-4 sm:h-5 md:h-7 lg:h-9 xl:h-11 rounded md:rounded-lg lg:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base font-bold transition-colors flex items-center gap-0.5 md:gap-1 shrink-0 whitespace-nowrap cursor-pointer"
              title="增加1次犯规"
            >
              <Plus className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4" />
              <span>+犯</span>
            </button>
          </div>
        </div>

        {/* Timeouts Box */}
        <div className="h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 2xl:h-22 flex items-center justify-between bg-slate-950/50 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl px-1.5 sm:px-2.5 md:px-3.5 lg:px-4.5 border border-white/5">
          <div className="flex-1 pr-1 min-w-0">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base font-bold text-slate-400">
              <span className="flex items-center gap-0.5 truncate">
                <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 lg:w-4.5 lg:h-4.5 shrink-0" style={{ color: primaryColor }} />
                暂停
              </span>
              <span className="font-digital text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base text-slate-300 tabular-nums">
                {team.timeoutsLeft}/{maxTimeouts}
              </span>
            </div>
            {/* Dots */}
            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 md:mt-1 lg:mt-1.5">
              {Array.from({ length: maxTimeouts }).map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: idx < team.timeoutsLeft ? primaryColor : 'rgb(30, 41, 59)',
                  }}
                  className="h-0.5 sm:h-1 md:h-1.5 lg:h-2 flex-1 rounded-full transition-colors"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 shrink-0">
            <button
              onClick={() => onAddTimeoutBack(side)}
              disabled={team.timeoutsLeft >= maxTimeouts}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11 rounded md:rounded-lg lg:rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 text-xs md:text-sm lg:text-base font-bold transition-colors shrink-0 cursor-pointer"
              title="补回暂停"
            >
              +
            </button>
            <button
              onClick={() => onTimeout(side)}
              disabled={team.timeoutsLeft <= 0}
              className="px-1 md:px-2 lg:px-3 h-4 sm:h-5 md:h-7 lg:h-9 xl:h-11 rounded md:rounded-lg lg:rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-200 text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer"
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
