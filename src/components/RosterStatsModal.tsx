import React, { useState } from 'react';
import { X, UserPlus, Trash2, Plus, Flame, ShieldAlert, Award, Pencil, Check, AlertTriangle } from 'lucide-react';
import { Team, Player } from '../types';

interface RosterStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeam: Team;
  awayTeam: Team;
  onAddPlayer: (teamId: 'home' | 'away', player: { number: number; name: string }) => void;
  onRemovePlayer: (teamId: 'home' | 'away', playerId: string) => void;
  onUpdatePlayer?: (teamId: 'home' | 'away', playerId: string, updates: { number: number; name: string }) => void;
  onTogglePlayerCourt?: (teamId: 'home' | 'away', playerId: string) => void;
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
  onUpdatePlayer,
  onScorePlayer,
  onFoulPlayer,
  onReboundPlayer,
  onAssistPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');

  // Editing player state
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Deleting player secondary confirmation state
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  if (!isOpen) return null;

  const currentTeam = activeTab === 'home' ? homeTeam : awayTeam;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newPlayerNumber, 10);
    if (isNaN(num) || num < 0 || num > 100) return;

    onAddPlayer(activeTab, {
      number: num,
      name: newPlayerName.trim(),
    });

    setNewPlayerNumber('');
    setNewPlayerName('');
  };

  const handleStartEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditNumber(player.number.toString());
    setEditName(player.name || '');
    setEditError(null);
  };

  const handleSaveEdit = (playerId: string) => {
    const num = parseInt(editNumber, 10);
    if (isNaN(num) || num < 0 || num > 100) {
      setEditError('球衣号码须在 0-100 之间');
      return;
    }

    if (onUpdatePlayer) {
      onUpdatePlayer(activeTab, playerId, {
        number: num,
        name: editName.trim(),
      });
    }

    setEditingPlayerId(null);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditError(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingPlayer) return;
    onRemovePlayer(activeTab, deletingPlayer.id);
    if (editingPlayerId === deletingPlayer.id) {
      setEditingPlayerId(null);
    }
    setDeletingPlayer(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[96vh] landscape:max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 landscape:py-1.5 landscape:px-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 landscape:w-5 landscape:h-5 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 font-bold shrink-0 text-xs sm:text-sm">
              👥
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white truncate">球员名单与实时数据统计</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block landscape:hidden md:landscape:block">
                管理双方球队出场球员、编辑球员信息与技术统计
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 landscape:p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
          </button>
        </div>

        {/* Team Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 sm:p-2 landscape:py-1 gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('home');
              setEditingPlayerId(null);
            }}
            className={`flex-1 py-1.5 sm:py-2.5 landscape:py-1 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="truncate">主队: {homeTeam.name}</span>
            <span className="font-digital text-sm sm:text-base font-black">({homeTeam.score}分)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('away');
              setEditingPlayerId(null);
            }}
            className={`flex-1 py-1.5 sm:py-2.5 landscape:py-1 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'away'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="truncate">客队: {awayTeam.name}</span>
            <span className="font-digital text-sm sm:text-base font-black">({awayTeam.score}分)</span>
          </button>
        </div>

        {/* Modal Body: Player Table & Add Form */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 landscape:p-2.5 space-y-2.5 sm:space-y-3.5">
          {/* Add New Player Form */}
          <form
            onSubmit={handleAddPlayer}
            className="bg-slate-950/80 p-2 sm:p-3 landscape:py-1.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs"
          >
            <span className="text-slate-300 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              添加球员:
            </span>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="球衣号 (0-100)"
              value={newPlayerNumber}
              onChange={(e) => setNewPlayerNumber(e.target.value)}
              className="w-24 sm:w-28 bg-slate-900 border border-slate-700 px-2 py-1 sm:py-1.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
            />
            <input
              type="text"
              placeholder="球员姓名 (选填，如 詹姆斯)"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 min-w-[120px] bg-slate-900 border border-slate-700 px-2 py-1 sm:py-1.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
            />
            <button
              type="submit"
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1 transition-colors text-xs cursor-pointer"
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
                  <th className="py-3 px-2 text-center">2分</th>
                  <th className="py-3 px-2 text-center">3分</th>
                  <th className="py-3 px-2 text-center">罚球</th>
                  <th className="py-3 px-2.5 text-center">总得分</th>
                  <th className="py-3 px-2 text-center text-amber-400 font-bold">篮板</th>
                  <th className="py-3 px-2 text-center text-cyan-400 font-bold">助攻</th>
                  <th className="py-3 px-2.5 text-center">犯规</th>
                  <th className="py-3 px-3 text-center">快速技术操作</th>
                  <th className="py-3 px-2.5 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-digital">
                {currentTeam.players.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                      暂无球员，请在上方添加球员名单
                    </td>
                  </tr>
                ) : (
                  currentTeam.players.map((player) => {
                    const isFouledOut = player.fouls >= 5;
                    const isEditing = editingPlayerId === player.id;

                    return (
                      <tr
                        key={player.id}
                        className={`hover:bg-slate-900/50 transition-colors ${
                          isFouledOut ? 'bg-rose-950/20' : ''
                        } ${isEditing ? 'bg-amber-500/10' : ''}`}
                      >
                        {/* Jersey Number */}
                        <td className="py-2.5 px-3 font-bold text-amber-400 text-sm">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold">#</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editNumber}
                                onChange={(e) => setEditNumber(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(player.id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                                className="w-14 bg-slate-900 border border-amber-400 rounded px-1.5 py-0.5 text-amber-300 font-digital font-bold text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                              />
                            </div>
                          ) : (
                            <span>#{player.number}</span>
                          )}
                        </td>

                        {/* Player Name */}
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">
                          {isEditing ? (
                            <div className="flex flex-col">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(player.id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                placeholder="姓名 (选填)"
                                className="w-full min-w-[100px] max-w-[150px] bg-slate-900 border border-amber-400 rounded px-2 py-0.5 text-white text-xs font-sans focus:outline-none focus:ring-1 focus:ring-amber-400"
                              />
                              {editError && (
                                <span className="text-[10px] text-rose-400 mt-0.5 font-normal">
                                  {editError}
                                </span>
                              )}
                            </div>
                          ) : (
                            player.name || <span className="text-slate-500 font-normal italic text-[11px]">未命名</span>
                          )}
                        </td>

                        {/* 2-Pointers */}
                        <td className="py-2.5 px-2 text-center text-slate-300">
                          {player.twoPointers}
                        </td>

                        {/* 3-Pointers */}
                        <td className="py-2.5 px-2 text-center text-slate-300">
                          {player.threePointers}
                        </td>

                        {/* Free Throws */}
                        <td className="py-2.5 px-2 text-center text-slate-300">
                          {player.freeThrows}
                        </td>

                        {/* Total Points */}
                        <td className="py-2.5 px-2.5 text-center font-black text-sm text-amber-300">
                          {player.points}
                        </td>

                        {/* Rebounds */}
                        <td className="py-2.5 px-2 text-center font-black text-sm text-amber-400">
                          {player.rebounds || 0}
                        </td>

                        {/* Assists */}
                        <td className="py-2.5 px-2 text-center font-black text-sm text-cyan-400">
                          {player.assists || 0}
                        </td>

                        {/* Fouls */}
                        <td className="py-2.5 px-2.5 text-center">
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

                        {/* Fast Stats Controls */}
                        <td className="py-2.5 px-3 text-center font-sans">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <button
                              onClick={() => onScorePlayer(activeTab, 1, player.id)}
                              className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 cursor-pointer active:scale-95"
                              title="罚球+1分"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => onScorePlayer(activeTab, 2, player.id)}
                              className="px-1.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 cursor-pointer active:scale-95"
                              title="进球+2分"
                            >
                              +2
                            </button>
                            <button
                              onClick={() => onScorePlayer(activeTab, 3, player.id)}
                              className="px-1.5 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[11px] font-bold border border-orange-500/30 flex items-center gap-0.5 cursor-pointer active:scale-95"
                              title="三分+3分"
                            >
                              +3
                              <Flame className="w-2.5 h-2.5" />
                            </button>
                            {onReboundPlayer && (
                              <button
                                onClick={() => onReboundPlayer(activeTab, player.id)}
                                className="px-1.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 cursor-pointer active:scale-95"
                                title="记录篮板+1"
                              >
                                +板
                              </button>
                            )}
                            {onAssistPlayer && (
                              <button
                                onClick={() => onAssistPlayer(activeTab, player.id)}
                                className="px-1.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 cursor-pointer active:scale-95"
                                title="记录助攻+1"
                              >
                                +助
                              </button>
                            )}
                            <button
                              onClick={() => onFoulPlayer(activeTab, player.id)}
                              className="px-1.5 py-1 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-[11px] font-bold border border-rose-800/80 cursor-pointer active:scale-95"
                              title="记录犯规+1"
                            >
                              +犯
                            </button>
                          </div>
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td className="py-2.5 px-2.5 text-center font-sans">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleSaveEdit(player.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
                                title="保存修改 (Enter)"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="取消修改 (Esc)"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleStartEdit(player)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="修改球员号码与姓名"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingPlayer(player)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="删除球员 (需二次确认)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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
        <div className="p-2 sm:p-3 md:p-4 landscape:py-1.5 landscape:px-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="truncate text-[10px] sm:text-xs">提示：点击铅笔图标可直接修改号码与姓名；点击删除会弹出二次确认。</span>
          <button
            onClick={onClose}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 ml-2"
          >
            完成
          </button>
        </div>

        {/* Delete Secondary Confirmation Modal Overlay */}
        {deletingPlayer && (
          <div className="absolute inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">确认删除该球员？</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    从【{currentTeam.name}】名单中移除此球员
                  </p>
                </div>
              </div>

              {/* Player Info Summary Card */}
              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">球衣号码:</span>
                  <span className="font-bold text-amber-400 font-digital text-sm">#{deletingPlayer.number}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">球员姓名:</span>
                  <span className="font-bold text-white font-sans">{deletingPlayer.name || '未命名'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">累计数据:</span>
                  <span className="text-slate-200 font-digital">
                    {deletingPlayer.points}分 · {deletingPlayer.rebounds || 0}板 · {deletingPlayer.assists || 0}助 · {deletingPlayer.fouls}犯
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDeletingPlayer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

