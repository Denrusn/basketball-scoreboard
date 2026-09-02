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
    currentPeriodScore?: number;
    currentScore?: number;
    targetScore: number;
    period?: number;
    step?: number;
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
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center select-none my-auto py-0.5 sm:py-1 md:py-1.5 shrink-0">
        <span
          style={{
            color: primaryColor,
            textShadow: `0 0 45px ${hexToRgba(primaryColor, 0.5)}`,
          }}
          className="score-fluid-text font-digital font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[12rem] tabular-nums leading-none tracking-normal"
        >
          {String(team.score).padStart(2, '0')}
        </span>

        {/* Target Score Mode - Current Quarter Cumulative Progress */}
        {targetScoreProgress ? (
          <div className="w-full max-w-[190px] sm:max-w-[230px] md:max-w-[270px] mt-0.5 sm:mt-1 px-1 sm:px-2">
            {(() => {
              const current = targetScoreProgress.currentScore ?? targetScoreProgress.currentPeriodScore ?? team.score;
              const target = targetScoreProgress.targetScore;
              const percent = Math.min(100, Math.max(0, (current / target) * 100));
              const remaining = Math.max(0, target - current);
              return (
                <>
                  <div className="flex items-center justify-between text-[9px] sm:text-xs font-bold mb-0.5">
                    <span className="text-slate-400">
                      {targetScoreProgress.period ? `第${targetScoreProgress.period}节目标` : '抢分目标'}
                    </span>
                    <span style={{ color: primaryColor }} className="tabular-nums font-mono font-black">
                      {current} / {target} 分
                    </span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-slate-800/90 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: primaryColor,
                        boxShadow: `0 0 8px ${hexToRgba(primaryColor, 0.6)}`,
                      }}
                    />
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-right mt-0.5 font-medium">
                    {current >= target ? (
                      <span className="text-emerald-400 font-bold">🎯 率先达标！</span>
                    ) : (
                      <span className="text-slate-400">
                        还差 <strong className="text-amber-300 tabular-nums">{remaining}</strong> 分达标
                      </span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : null}
      </div>

      {/* Streamlined Single-Row Player Selection Strip (Ultra-compact, horizontal scroll, no score intrusion) */}
      <div className="my-0.5 sm:my-1 bg-slate-950/60 px-1.5 py-1 rounded-lg border border-white/5 flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0 py-0.5">
          {/* Team General Button */}
          <button
            type="button"
            onClick={() => setSelectedPlayerId('')}
            title="记入全队总分 (不指定具体个人)"
            className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold transition-all flex items-center gap-0.5 shrink-0 cursor-pointer border ${
              selectedPlayerId === ''
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm font-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-white/10'
            }`}
          >
            <Users className="w-2.5 h-2.5 shrink-0" />
            <span>全队</span>
          </button>

          {/* Players Jersey Number Pills (Single Row Horizontal) */}
          {team.players.map((player) => {
            const isSelected = selectedPlayerId === player.id;
            const playerNameText = player.name ? ` (${player.name})` : '';
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(isSelected ? '' : player.id)}
                title={`#${player.number}号${playerNameText} - ${player.points}分 | ${player.rebounds || 0}板 | ${player.assists || 0}助 | ${player.fouls}犯`}
                style={
                  isSelected
                    ? {
                        backgroundColor: primaryColor,
                        color: '#020617',
                        borderColor: '#ffffff',
                        boxShadow: `0 0 8px ${hexToRgba(primaryColor, 0.6)}`,
                      }
                    : undefined
                }
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'font-black ring-1 ring-white/90 scale-105 z-10'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border-white/10'
                }`}
              >
                <span className="font-digital font-black">#{player.number}</span>
                <span
                  className={`text-[8px] sm:text-[9px] font-digital tabular-nums px-0.5 rounded ${
                    isSelected ? 'bg-slate-950/30 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  {player.points}p
                </span>
              </button>
            );
          })}
        </div>

        {onOpenRoster && (
          <button
            type="button"
            onClick={onOpenRoster}
            title="名单与球员管理"
            className="text-[10px] text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-0.5 shrink-0 pl-1 border-l border-white/10 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">名单</span>
          </button>
        )}
      </div>

      {/* Scoring Action Deck (+1, +2, +3, -1) - Pure Numbers Only */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 shrink-0">
        {/* +1 */}
        <button
          onClick={() => handleQuickScore(1)}
          title="加1分 (罚球)"
          className="mobile-compact-btn group relative h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-slate-800/95 border border-white/10 hover:border-emerald-500/40 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-black/40 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-sm sm:text-base md:text-xl lg:text-2xl font-black font-digital text-emerald-400 group-hover:text-emerald-300 tabular-nums leading-none">
            +1
          </span>
        </button>

        {/* +2 */}
        <button
          onClick={() => handleQuickScore(2)}
          title="加2分 (常规投篮)"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.95)}, ${hexToRgba(primaryColor, 0.8)})`,
            boxShadow: `0 2px 10px ${hexToRgba(primaryColor, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            borderColor: hexToRgba(primaryColor, 0.8),
          }}
          className="mobile-compact-btn group relative h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 rounded-lg sm:rounded-xl border active:scale-95 hover:brightness-110 transition-all flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-sm sm:text-base md:text-xl lg:text-2xl font-black font-digital text-slate-950 tabular-nums leading-none">
            +2
          </span>
        </button>

        {/* +3 */}
        <button
          onClick={() => handleQuickScore(3)}
          title="加3分 (三分远投)"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.95)}, ${hexToRgba(primaryColor, 0.8)})`,
            boxShadow: `0 2px 10px ${hexToRgba(primaryColor, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            borderColor: hexToRgba(primaryColor, 0.8),
          }}
          className="mobile-compact-btn group relative h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 rounded-lg sm:rounded-xl border active:scale-95 hover:brightness-110 transition-all flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-sm sm:text-base md:text-xl lg:text-2xl font-black font-digital text-slate-950 flex items-center gap-0.5 tabular-nums leading-none">
            +3
          </span>
        </button>

        {/* -1 */}
        <button
          onClick={() => handleQuickScore(-1)}
          title="扣减1分 (误操作修正)"
          className="mobile-compact-btn group relative h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 rounded-lg sm:rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-black/40 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="deck-number-fluid text-sm sm:text-base md:text-xl lg:text-2xl font-black font-digital text-slate-400 group-hover:text-rose-400 tabular-nums leading-none">
            -1
          </span>
        </button>
      </div>

      {/* Rebounds & Assists Stats Action Deck (Spacious Number Layout, Never Covered) */}
      <div className="grid grid-cols-2 gap-1 sm:gap-2 my-0.5 sm:my-1 shrink-0">
        {/* Rebounds (篮板) Box */}
        <div className="h-7 sm:h-8 md:h-10 bg-slate-950/60 rounded-lg sm:rounded-xl px-1.5 sm:px-2 border border-white/5 flex items-center justify-between gap-1 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-slate-400 leading-none">
                <Shield className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>板</span>
              </div>
              {selectedPlayer && (
                <span className="text-[7px] text-amber-400 font-mono leading-tight truncate max-w-[45px]">
                  #{selectedPlayer.number}:{selectedPlayer.rebounds || 0}
                </span>
              )}
            </div>
            <div className="font-digital text-sm sm:text-base md:text-xl font-black text-amber-300 leading-none tabular-nums shrink-0">
              {team.rebounds || 0}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickRebound(-1)}
              disabled={(team.rebounds || 0) <= 0}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 text-xs shrink-0 cursor-pointer"
              title={selectedPlayer ? `为 #${selectedPlayer.number} 扣减1个篮板` : '扣减全队1个篮板'}
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickRebound(1)}
              className="w-5 h-4 sm:w-6 sm:h-5 md:w-7 md:h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer active:scale-95"
              title={selectedPlayer ? `为 #${selectedPlayer.number} ${selectedPlayer.name || ''} 记1个篮板`.trim() : '记全队1个篮板'}
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>

        {/* Assists (助攻) Box */}
        <div className="h-7 sm:h-8 md:h-10 bg-slate-950/60 rounded-lg sm:rounded-xl px-1.5 sm:px-2 border border-white/5 flex items-center justify-between gap-1 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-slate-400 leading-none">
                <Flame className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span>助</span>
              </div>
              {selectedPlayer && (
                <span className="text-[7px] text-cyan-400 font-mono leading-tight truncate max-w-[45px]">
                  #{selectedPlayer.number}:{selectedPlayer.assists || 0}
                </span>
              )}
            </div>
            <div className="font-digital text-sm sm:text-base md:text-xl font-black text-cyan-300 leading-none tabular-nums shrink-0">
              {team.assists || 0}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickAssist(-1)}
              disabled={(team.assists || 0) <= 0}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 text-xs shrink-0 cursor-pointer"
              title={selectedPlayer ? `为 #${selectedPlayer.number} 扣减1次助攻` : '扣减全队1次助攻'}
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickAssist(1)}
              className="w-5 h-4 sm:w-6 sm:h-5 md:w-7 md:h-6 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer active:scale-95"
              title={selectedPlayer ? `为 #${selectedPlayer.number} ${selectedPlayer.name || ''} 记1次助攻`.trim() : '记全队1次助攻'}
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Fouls & Timeouts Row */}
      <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-0.5 sm:pt-1 border-t border-white/10 shrink-0">
        {/* Fouls Box */}
        <div className="h-7 sm:h-8 md:h-10 bg-slate-950/60 rounded-lg sm:rounded-xl px-1.5 sm:px-2 border border-white/5 flex items-center justify-between gap-1 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-slate-400 leading-none">
                <Shield className="w-2.5 h-2.5 shrink-0" style={{ color: primaryColor }} />
                <span>犯</span>
                {isDoubleBonus ? (
                  <span className="text-[7px] font-bold px-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">双罚</span>
                ) : isBonus ? (
                  <span
                    style={{
                      backgroundColor: hexToRgba(primaryColor, 0.2),
                      color: primaryColor,
                      borderColor: hexToRgba(primaryColor, 0.4),
                    }}
                    className="text-[7px] font-bold px-0.5 rounded border shrink-0"
                  >
                    加罚
                  </span>
                ) : null}
              </div>
              {selectedPlayer && (
                <span className="text-[7px] text-rose-400 font-mono leading-tight truncate max-w-[45px]">
                  #{selectedPlayer.number}:{selectedPlayer.fouls}犯
                </span>
              )}
            </div>
            <div className="font-digital text-sm sm:text-base md:text-xl font-black text-white leading-none tabular-nums shrink-0">
              {team.fouls}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => handleQuickFoul(-1)}
              disabled={team.fouls <= 0}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 transition-colors text-xs shrink-0 cursor-pointer"
              title="减少犯规"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => handleQuickFoul(1)}
              className="w-5 h-4 sm:w-6 sm:h-5 md:w-7 md:h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="增加1次犯规"
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>

        {/* Timeouts Box */}
        <div className="h-7 sm:h-8 md:h-10 bg-slate-950/60 rounded-lg sm:rounded-xl px-1.5 sm:px-2 border border-white/5 flex items-center justify-between gap-1 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <div className="flex flex-col justify-center shrink-0 min-w-0">
              <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-slate-400 leading-none">
                <Clock className="w-2.5 h-2.5 shrink-0" style={{ color: primaryColor }} />
                <span>停</span>
              </div>
              <div className="flex items-center gap-0.5 mt-0.5 w-7 sm:w-10">
                {Array.from({ length: maxTimeouts }).map((_, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: idx < team.timeoutsLeft ? primaryColor : 'rgb(30, 41, 59)',
                    }}
                    className="h-0.5 sm:h-1 flex-1 rounded-full transition-colors"
                  />
                ))}
              </div>
            </div>
            <div className="font-digital text-sm sm:text-base md:text-xl font-black text-slate-200 leading-none tabular-nums shrink-0">
              {team.timeoutsLeft}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onAddTimeoutBack(side)}
              disabled={team.timeoutsLeft >= maxTimeouts}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-slate-300 text-xs font-bold transition-colors shrink-0 cursor-pointer"
              title="补回暂停"
            >
              +
            </button>
            <button
              onClick={() => onTimeout(side)}
              disabled={team.timeoutsLeft <= 0}
              className="px-1.5 sm:px-2 h-4 sm:h-5 md:h-6 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 disabled:opacity-20 text-[8px] sm:text-[10px] font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer"
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
