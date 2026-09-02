export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  accentHex: string;
  glowRgba: string;
  badgeBg: string;
  badgeText: string;
}

export const JERSEY_COLOR_PRESETS: ColorPreset[] = [
  // Row 1: Reds & Oranges & Yellows
  {
    id: 'flame-red',
    name: '烈焰红',
    hex: '#ef4444',
    accentHex: '#dc2626',
    glowRgba: 'rgba(239, 68, 68, 0.45)',
    badgeBg: 'rgba(239, 68, 68, 0.2)',
    badgeText: '#fca5a5',
  },
  {
    id: 'deep-crimson',
    name: '深酒红',
    hex: '#b91c1c',
    accentHex: '#991b1b',
    glowRgba: 'rgba(185, 28, 28, 0.45)',
    badgeBg: 'rgba(185, 28, 28, 0.2)',
    badgeText: '#fecaca',
  },
  {
    id: 'vibrant-orange',
    name: '活力橙',
    hex: '#f97316',
    accentHex: '#ea580c',
    glowRgba: 'rgba(249, 115, 22, 0.45)',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    badgeText: '#fdba74',
  },
  {
    id: 'amber-gold',
    name: '琥珀金',
    hex: '#f59e0b',
    accentHex: '#d97706',
    glowRgba: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeText: '#fcd34d',
  },
  {
    id: 'lemon-yellow',
    name: '柠檬黄',
    hex: '#eab308',
    accentHex: '#ca8a04',
    glowRgba: 'rgba(234, 179, 8, 0.45)',
    badgeBg: 'rgba(234, 179, 8, 0.2)',
    badgeText: '#fef08a',
  },
  {
    id: 'neon-lime',
    name: '荧光黄绿',
    hex: '#84cc16',
    accentHex: '#65a30d',
    glowRgba: 'rgba(132, 204, 22, 0.45)',
    badgeBg: 'rgba(132, 204, 22, 0.2)',
    badgeText: '#bef264',
  },

  // Row 2: Greens & Teals
  {
    id: 'vibrant-green',
    name: '亮草绿',
    hex: '#22c55e',
    accentHex: '#16a34a',
    glowRgba: 'rgba(34, 197, 94, 0.45)',
    badgeBg: 'rgba(34, 197, 94, 0.2)',
    badgeText: '#86efac',
  },
  {
    id: 'emerald-green',
    name: '翡翠绿',
    hex: '#10b981',
    accentHex: '#059669',
    glowRgba: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeText: '#6ee7b7',
  },
  {
    id: 'forest-green',
    name: '森林绿',
    hex: '#15803d',
    accentHex: '#166534',
    glowRgba: 'rgba(21, 128, 61, 0.45)',
    badgeBg: 'rgba(21, 128, 61, 0.2)',
    badgeText: '#bbf7d0',
  },
  {
    id: 'dark-emerald',
    name: '墨绿',
    hex: '#065f46',
    accentHex: '#064e3b',
    glowRgba: 'rgba(6, 95, 70, 0.45)',
    badgeBg: 'rgba(6, 95, 70, 0.2)',
    badgeText: '#a7f3d0',
  },
  {
    id: 'mint-teal',
    name: '薄荷青',
    hex: '#14b8a6',
    accentHex: '#0d9488',
    glowRgba: 'rgba(20, 184, 166, 0.45)',
    badgeBg: 'rgba(20, 184, 166, 0.2)',
    badgeText: '#99f6e4',
  },
  {
    id: 'cyan-teal',
    name: '冰川青',
    hex: '#06b6d4',
    accentHex: '#0891b2',
    glowRgba: 'rgba(6, 182, 212, 0.45)',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    badgeText: '#67e8f9',
  },

  // Row 3: Blues & Purples
  {
    id: 'sky-blue',
    name: '天空蓝',
    hex: '#0ea5e9',
    accentHex: '#0284c7',
    glowRgba: 'rgba(14, 165, 233, 0.45)',
    badgeBg: 'rgba(14, 165, 233, 0.2)',
    badgeText: '#7dd3fc',
  },
  {
    id: 'royal-blue',
    name: '宝蓝',
    hex: '#3b82f6',
    accentHex: '#2563eb',
    glowRgba: 'rgba(59, 130, 246, 0.45)',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    badgeText: '#93c5fd',
  },
  {
    id: 'deep-blue',
    name: '皇室深蓝',
    hex: '#1d4ed8',
    accentHex: '#1e40af',
    glowRgba: 'rgba(29, 78, 216, 0.45)',
    badgeBg: 'rgba(29, 78, 216, 0.2)',
    badgeText: '#bfdbfe',
  },
  {
    id: 'navy-blue',
    name: '藏青/海军蓝',
    hex: '#1e3a8a',
    accentHex: '#172554',
    glowRgba: 'rgba(30, 58, 138, 0.45)',
    badgeBg: 'rgba(30, 58, 138, 0.2)',
    badgeText: '#dbeafe',
  },
  {
    id: 'indigo-violet',
    name: '靛青蓝',
    hex: '#6366f1',
    accentHex: '#4f46e5',
    glowRgba: 'rgba(99, 102, 241, 0.45)',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    badgeText: '#c7d2fe',
  },
  {
    id: 'purple-violet',
    name: '魅影紫',
    hex: '#a855f7',
    accentHex: '#9333ea',
    glowRgba: 'rgba(168, 85, 247, 0.45)',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    badgeText: '#d8b4fe',
  },

  // Row 4: Pinks & Neutrals
  {
    id: 'vibrant-pink',
    name: '霓虹粉',
    hex: '#ec4899',
    accentHex: '#db2777',
    glowRgba: 'rgba(236, 72, 153, 0.45)',
    badgeBg: 'rgba(236, 72, 153, 0.2)',
    badgeText: '#fbcfe8',
  },
  {
    id: 'rose-red',
    name: '玫瑰红',
    hex: '#f43f5e',
    accentHex: '#e11d48',
    glowRgba: 'rgba(244, 63, 94, 0.45)',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    badgeText: '#fda4af',
  },
  {
    id: 'pure-white',
    name: '纯洁白',
    hex: '#f8fafc',
    accentHex: '#e2e8f0',
    glowRgba: 'rgba(248, 250, 252, 0.45)',
    badgeBg: 'rgba(248, 250, 252, 0.15)',
    badgeText: '#ffffff',
  },
  {
    id: 'silver-gray',
    name: '银灰色',
    hex: '#94a3b8',
    accentHex: '#64748b',
    glowRgba: 'rgba(148, 163, 184, 0.45)',
    badgeBg: 'rgba(148, 163, 184, 0.2)',
    badgeText: '#e2e8f0',
  },
  {
    id: 'slate-dark',
    name: '深灰/钛金',
    hex: '#475569',
    accentHex: '#334155',
    glowRgba: 'rgba(71, 85, 105, 0.45)',
    badgeBg: 'rgba(71, 85, 105, 0.2)',
    badgeText: '#cbd5e1',
  },
  {
    id: 'obsidian-black',
    name: '曜石黑',
    hex: '#1e293b',
    accentHex: '#0f172a',
    glowRgba: 'rgba(30, 41, 59, 0.45)',
    badgeBg: 'rgba(30, 41, 59, 0.3)',
    badgeText: '#94a3b8',
  },
];

// Helper to convert hex to rgba
export function hexToRgba(hex: string, alpha: number = 1): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  if (c.length !== 6) {
    return `rgba(245, 158, 11, ${alpha})`;
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getColorPresetByHex(hex: string): ColorPreset | undefined {
  return JERSEY_COLOR_PRESETS.find((p) => p.hex.toLowerCase() === hex.toLowerCase());
}
