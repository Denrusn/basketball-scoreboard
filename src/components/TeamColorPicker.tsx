import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Pipette } from 'lucide-react';
import { JERSEY_COLOR_PRESETS, ColorPreset } from '../utils/teamColors';

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
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectPreset = (preset: ColorPreset) => {
    onSelectColor(preset.hex, preset.accentHex);
    setIsOpen(false);
  };

  const handleCustomHex = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectColor(e.target.value);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`自定义${teamLabel}球衣颜色`}
        className="p-1 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
      >
        <span
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/40 shadow-inner block"
          style={{ backgroundColor: currentColor }}
        />
        <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 sm:left-auto z-50 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-3 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
            <span className="text-xs font-bold text-slate-200">
              {teamLabel} 球衣颜色定制
            </span>
            <div className="flex items-center gap-1">
              <label
                htmlFor={`color-input-${teamLabel}`}
                className="cursor-pointer p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                title="调色板自定义"
              >
                <Pipette className="w-3 h-3 text-amber-400" />
                <span>自定义</span>
              </label>
              <input
                id={`color-input-${teamLabel}`}
                type="color"
                value={currentColor.startsWith('#') ? currentColor : '#ef4444'}
                onChange={handleCustomHex}
                className="w-0 h-0 opacity-0 absolute pointer-events-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-3">
            {JERSEY_COLOR_PRESETS.map((preset) => {
              const isSelected = preset.hex.toLowerCase() === currentColor.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  title={preset.name}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative border ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105 border-white'
                      : 'border-white/20 hover:scale-110 hover:border-white/60'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 text-center bg-slate-950/60 py-1 px-2 rounded-lg border border-white/5">
            提供多种经典球衣配色，支持吸色自定义
          </div>
        </div>
      )}
    </div>
  );
};
