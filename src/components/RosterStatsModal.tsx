import React, { useState } from 'react';
import { X, UserPlus, Trash2, Plus, Flame, ShieldAlert, Award } from 'lucide-react';
import { Team, Player } from '../types';

interface RosterStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeam: Team;
  awayTeam: Team;
  onAddPlayer: (teamId: 'home' | 'away', player: Omit<Player, 'id' | 'points' | 'fouls' | 'twoPointers' | 'threePointers' | 'freeThrows' | 'rebounds' | 'assists'>) => void;
  onRemovePlayer: (teamId: 'home' | 'away', playerId: string) => void;
  onTogglePlayerCourt: (teamId: 'home' | 'away', playerId: string) => void;
  onScorePlayer: (teamId: 'home' | 'away', points: number, playerId: string) => void;
  onFoulPlayer: (teamId: 'home' | 'away', playerId: string) => void;
  onReboundPlayer?: (teamId: 'home' | 'away', playerId: string) => void;
  onAssistPlayer?: (teamId: 'home' | 'away', playerId: string) => void;
}

export const RosterStatsModal: React.FC<RosterStatsModalProps> = ({
  isOpen,
  onClose,
  homeTeam,
  awayTeam,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerCourt,
  onScorePlayer,
  onFoulPlayer,
  onReboundPlayer,
  onAssistPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');

  if (!isOpen) return null;

  const currentTeam = activeTab === 'home' ? homeTeam : awayTeam;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newPlayerNumber, 10);
    if (isNaN(num) || !newPlayerName.trim()) return;

    onAddPlayer(activeTab, {
      number: num,
      name: newPlayerName.trim(),
      isOnCourt: currentTeam.players.filter((p) => p.isOnCourt).length < 5,
    });

    setNewPlayerNumber('');
    setNewPlayerName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 font-bold">
              👥
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">球员名单与实时数据统计</h2>
              <p className="text-xs text-slate-400">管理双方球队出场球员、个人得分与犯规数据</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>主队: {homeTeam.name}</span>
            <span className="font-digital text-base font-black">({homeTeam.score}分)</span>
          </button>
          <button
            onClick={() => setActiveTab('away')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'away'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>客队: {awayTeam.name}</span>
            <span className="font-digital text-base font-black">({awayTeam.score}分)</span>
          </button>
        </div>

        {/* Modal Body: Player Table & Add Form */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Add New Player Form */}
          <form
            onSubmit={handleAddPlayer}
            className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-2 text-xs"
          >
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              添加球员:
            </span>
            <input
              type="number"
              min="0"
              max="99"
              placeholder="球衣号 (如 23)"
              value={newPlayerNumber}
              onChange={(e) => setNewPlayerNumber(e.target.value)}
              className="w-24 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              placeholder="球员姓名 (如 詹姆斯)"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 min-w-[140px] bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              添加
            </button>
          </form>

          {/* Roster Table */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-3">球衣号</th>
                  <th className="py-3 px-3">姓名</th>
                  <th className="py-3 px-2 text-center">状态</th>
                  <th className="py-3 px-2 text-center">2分</th>
                  <th className="py-3 px-2 text-center">3分</th>
                  <th className="py-3 px-2 text-center">罚球</th>
                  <th className="py-3 px-2.5 text-center">总得分</th>
                  <th className="py-3 px-2 text-center text-amber-400 font-bold">篮板</th>
                  <th className="py-3 px-2 text-center text-cyan-400 font-bold">助攻</th>
                  <th className="py-3 px-2.5 text-center">犯规</th>
                  <th className="py-3 px-3 text-center">快速技术操作</th>
                  <th className="py-3 px-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-digital">
                {currentTeam.players.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-slate-500 font-sans">
                      暂无球员，请在上方添加球员名单
                    </td>
                  </tr>
                ) : (
                  currentTeam.players.map((player) => {
                    const isFouledOut = player.fouls >= 5;
                    return (
                      <tr
                        key={player.id}
                        className={`hover:bg-slate-900/50 transition-colors ${
                          isFouledOut ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-amber-400 text-sm">
                          #{player.number}
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-white">
                          {player.name}
                        </td>
                        <td className="py-3 px-2 text-center font-sans">
                          <button
                            onClick={() => onTogglePlayerCourt(activeTab, player.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              player.isOnCourt
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {player.isOnCourt ? '场上' : '替补'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300">
                          {player.twoPointers}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300">
                          {player.threePointers}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300">
                          {player.freeThrows}
                        </td>
                        <td className="py-3 px-2.5 text-center font-black text-sm text-amber-300">
                          {player.points}
                        </td>
                        <td className="py-3 px-2 text-center font-black text-sm text-amber-400">
                          {player.rebounds || 0}
                        </td>
                        <td className="py-3 px-2 text-center font-black text-sm text-cyan-400">
                          {player.assists || 0}
                        </td>
                        <td className="py-3 px-2.5 text-center">
                          <span
                            className={`font-black px-1.5 py-0.5 rounded ${
                              isFouledOut
                                ? 'bg-rose-600 text-white animate-pulse'
                                : player.fouls >= 4
                                ? 'bg-amber-600 text-white'
                                : 'text-slate-300'
                            }`}
                          >
                            {player.fouls}
                            {isFouledOut && ' (满犯)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-sans">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <button
                              onClick={() => onScorePlayer(activeTab, 1, player.id)}
                              className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 cursor-pointer"
                              title="罚球+1分"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => onScorePlayer(activeTab, 2, player.id)}
                              className="px-1.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 cursor-pointer"
                              title="进球+2分"
                            >
                              +2
                            </button>
                            <button
                              onClick={() => onScorePlayer(activeTab, 3, player.id)}
                              className="px-1.5 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[11px] font-bold border border-orange-500/30 flex items-center gap-0.5 cursor-pointer"
                              title="三分+3分"
                            >
                              +3
                              <Flame className="w-2.5 h-2.5" />
                            </button>
                            {onReboundPlayer && (
                              <button
                                onClick={() => onReboundPlayer(activeTab, player.id)}
                                className="px-1.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 cursor-pointer"
                                title="记录篮板+1"
                              >
                                +板
                              </button>
                            )}
                            {onAssistPlayer && (
                              <button
                                onClick={() => onAssistPlayer(activeTab, player.id)}
                                className="px-1.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 cursor-pointer"
                                title="记录助攻+1"
                              >
                                +助
                              </button>
                            )}
                            <button
                              onClick={() => onFoulPlayer(activeTab, player.id)}
                              className="px-1.5 py-1 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-[11px] font-bold border border-rose-800/80 cursor-pointer"
                              title="记录犯规+1"
                            >
                              +犯
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-sans">
                          <button
                            onClick={() => onRemovePlayer(activeTab, player.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="删除球员"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>提示：在此处点击记分按钮将同步累加至比分板与流水日志。</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
