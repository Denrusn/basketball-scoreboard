import React from 'react';
import { 
  HelpCircle, 
  Keyboard, 
  User, 
  Timer, 
  ShieldCheck, 
  Target, 
  Megaphone, 
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shrink-0">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-white flex items-center gap-2">
                技术台操作指引与规则手册
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                支持专业 FIBA 比赛规则、球员个人实时统计、单节抢分目标制与全键盘控制
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-slate-200 text-xs sm:text-sm">
          {/* 1. Keyboard Shortcuts */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-400" />
              记分台常用快捷键 (推荐外接键盘/数字小键盘)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">比赛主时钟 启动 / 暂停</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-300 font-mono font-bold text-xs rounded border border-white/10 shadow-inner">
                  空格 Space
                </kbd>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">重置 24 秒进攻时钟</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-300 font-mono font-bold text-xs rounded border border-white/10 shadow-inner">
                  R 键
                </kbd>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">重置 14 秒 (前场篮板)</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-300 font-mono font-bold text-xs rounded border border-white/10 shadow-inner">
                  E 键
                </kbd>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">撤销上一步误操作</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-300 font-mono font-bold text-xs rounded border border-white/10 shadow-inner">
                  Ctrl + Z
                </kbd>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">裁判响亮鸣哨</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-300 font-mono font-bold text-xs rounded border border-white/10 shadow-inner">
                  W 键
                </kbd>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">切换全屏 (防息屏模式)</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-300 font-mono font-bold text-xs rounded border border-white/10 shadow-inner">
                  F 键
                </kbd>
              </div>
            </div>
          </div>

          {/* 2. Player Scoring & Attribution */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              球员个人号码直接选定与得分归属
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>
                  <strong>号码直接展示：</strong>在主客队卡片中，所有录入的球员号码（如 <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-amber-300">#7</span>、<span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-amber-300">#23</span>）直接平铺列出，无需多层菜单展开。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>
                  <strong>点击即刻高亮：</strong>点击任意球员号码即高亮选中，此时点击 <span className="text-emerald-400 font-bold">+1</span>、<span className="text-amber-400 font-bold">+2</span>、<span className="text-rose-400 font-bold">+3</span> 或 <span className="text-sky-400 font-bold">+犯</span>，即可将得分与犯规精确计入该球员个人档案。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>
                  <strong>默认全队通用：</strong>系统默认保持「全队通用」高亮，如无需细化至个人，直接点击得分按键即可正常累加队伍总分。
                </span>
              </li>
            </ul>
          </div>

          {/* 3. Match Rules & Target Score Mode */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              单节抢分目标制 & FIBA 计时制
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>单节抢分目标制：</strong>在设置中开启该模式后，每节率先达到目标分数（如 30 分）的球队立即胜出该节，系统自动鸣响蜂鸣器并弹出「开始下一节」窗口。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>24s / 14s 灵活进攻时钟：</strong>支持随时一键禁用/启用 24 秒进攻时钟，适合业余友谊赛或比赛最后数秒进攻。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>全队犯规加罚 (BONUS)：</strong>单节全队犯规达到 5 次时自动触发 BONUS 提示；加时赛犯规延续第 4 节规则。
                </span>
              </li>
            </ul>
          </div>

          {/* 4. Safety & Persistence */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              断电/误刷新保护与大屏防息屏
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              系统内置本地实时状态镜像。误刷新、误关标签页或网络波动均不会丢失比分、节次和比赛流水。进入全屏模式时，系统会自动请求屏幕常亮权限（Wake Lock），确保大屏与移动端投影不息屏。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2 shrink-0">
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>打开规则与外观设置</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-colors cursor-pointer ml-auto"
          >
            知道了 / 关闭
          </button>
        </div>
      </div>
    </div>
  );
};
