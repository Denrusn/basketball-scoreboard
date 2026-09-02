import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Check, Pipette, X } from 'lucide-react';
import { JERSEY_COLOR_PRESETS, ColorPreset, hexToRgba } from '../utils/teamColors';

interface TeamColorPickerProps {
  currentColor: string;
  onSelectColor: (hex: string, accentHex?: string) => void;
  teamLabel: string;
}

export const TeamColorPicker: React.FC<TeamColorPickerProps> = ({
  currentColor,
  onSelectColor,
  teamLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customHexInput, setCustomHexInput] = useState(currentColor);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Sync internal hex input with prop changes
  useEffect(() => {
    setCustomHexInput(currentColor);
  }, [currentColor]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Select preset and immediately close modal as requested
  const handleSelectPreset = (preset: ColorPreset) => {
    onSelectColor(preset.hex, preset.accentHex);
    setCustomHexInput(preset.hex);
    setIsOpen(false);
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onSelectColor(val);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHexInput(val);
    onSelectColor(val);
  };

  const handleApplyAndClose = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customHexInput)) {
      onSelectColor(customHexInput);
    }
    setIsOpen(false);
  };

  // Render modal via Portal to document.body
  const renderModal = () => {
    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black flex flex-col gap-2.5 sm:gap-3 max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Compact */}
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center border shadow-inner shrink-0"
                style={{
                  backgroundColor: hexToRgba(currentColor, 0.25),
                  borderColor: hexToRgba(currentColor, 0.6),
                  color: currentColor,
                }}
              >
                <Palette className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  选择{teamLabel}球衣/主题颜色
                </h3>
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border"
                  style={{
                    backgroundColor: hexToRgba(currentColor, 0.2),
                    color: currentColor,
                    borderColor: hexToRgba(currentColor, 0.4),
                  }}
                >
                  {currentColor}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 24 Preset Colors Grid (6 cols on mobile, 8 cols on tablet/landscape) - Click to apply and close */}
          <div className="shrink-0">
            <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>预设球衣颜色 (点击即选即用)</span>
              <span className="text-[10px] text-amber-400 font-normal">24 色精选</span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {JERSEY_COLOR_PRESETS.map((preset) => {
                const isSelected = preset.hex.toLowerCase() === currentColor.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    title={preset.name}
                    className={`group relative flex flex-col items-center p-1 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-white ring-2 ring-amber-400 scale-105 shadow-lg'
                        : 'bg-slate-950/60 border-white/10 hover:border-amber-400/60 hover:bg-slate-800/90 hover:scale-105'
                    }`}
                  >
                    <div
                      className="w-full aspect-square rounded-lg flex items-center justify-center border border-white/25 shadow-sm relative transition-transform"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-300 font-medium text-center truncate max-w-full leading-tight mt-1">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Input & Actions in Single Compact Row */}
          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              {/* Native Color Picker Trigger */}
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                title="打开系统调色盘"
                className="w-8 h-8 rounded-lg border-2 border-white/40 shadow-inner flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer hover:border-white"
                style={{ backgroundColor: currentColor }}
              >
                <Pipette className="w-3.5 h-3.5 text-white drop-shadow-md" />
              </button>
              <input
                ref={colorInputRef}
                type="color"
                value={currentColor.startsWith('#') ? currentColor : '#ef4444'}
                onChange={handleNativeColorChange}
                className="w-0 h-0 opacity-0 absolute pointer-events-none"
              />

              {/* Hex Text Input */}
              <input
                type="text"
                placeholder="#EF4444"
                value={customHexInput}
                onChange={handleCustomHexChange}
                maxLength={7}
                className="w-24 sm:w-28 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-xs font-mono font-bold text-white uppercase focus:border-amber-400 focus:outline-none placeholder:text-slate-600 text-center"
              />

              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-white/10 transition-colors shrink-0 cursor-pointer"
              >
                调色盘
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleApplyAndClose}
                className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>确认</span>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={`自定义${teamLabel}球衣与记分牌颜色`}
        className="p-1 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
      >
        <span
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/40 shadow-inner block shrink-0"
          style={{ backgroundColor: currentColor }}
        />
        <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
      </button>

      {/* Full-Screen Centered Modal mounted via Portal at document.body */}
      {renderModal()}
    </>
  );
};

