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
  {
    id: 'crimson-red',
    name: '公牛/火箭红',
    hex: '#ef4444',
    accentHex: '#dc2626',
    glowRgba: 'rgba(239, 68, 68, 0.45)',
    badgeBg: 'rgba(239, 68, 68, 0.2)',
    badgeText: '#fca5a5',
  },
  {
    id: 'royal-blue',
    name: '独行侠/快船蓝',
    hex: '#3b82f6',
    accentHex: '#2563eb',
    glowRgba: 'rgba(59, 130, 246, 0.45)',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    badgeText: '#93c5fd',
  },
  {
    id: 'emerald-green',
    name: '凯尔特人格林',
    hex: '#10b981',
    accentHex: '#059669',
    glowRgba: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeText: '#6ee7b7',
  },
  {
    id: 'amber-gold',
    name: '经典冠军金',
    hex: '#f59e0b',
    accentHex: '#d97706',
    glowRgba: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeText: '#fcd34d',
  },
  {
    id: 'purple-violet',
    name: '猛龙/紫金魅影',
    hex: '#a855f7',
    accentHex: '#9333ea',
    glowRgba: 'rgba(168, 85, 247, 0.45)',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    badgeText: '#d8b4fe',
  },
  {
    id: 'cyan-teal',
    name: '黄蜂/冰川青',
    hex: '#06b6d4',
    accentHex: '#0891b2',
    glowRgba: 'rgba(6, 182, 212, 0.45)',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    badgeText: '#67e8f9',
  },
  {
    id: 'sunset-orange',
    name: '太阳/雷霆橙',
    hex: '#f97316',
    accentHex: '#ea580c',
    glowRgba: 'rgba(249, 115, 22, 0.45)',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    badgeText: '#fdba74',
  },
  {
    id: 'rose-pink',
    name: '迈阿密都市粉',
    hex: '#f43f5e',
    accentHex: '#e11d48',
    glowRgba: 'rgba(244, 63, 94, 0.45)',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    badgeText: '#fda4af',
  },
  {
    id: 'silver-white',
    name: '马刺纯银白',
    hex: '#e2e8f0',
    accentHex: '#cbd5e1',
    glowRgba: 'rgba(226, 232, 240, 0.45)',
    badgeBg: 'rgba(226, 232, 240, 0.15)',
    badgeText: '#f8fafc',
  },
  {
    id: 'neon-lime',
    name: '超音速荧光绿',
    hex: '#84cc16',
    accentHex: '#65a30d',
    glowRgba: 'rgba(132, 204, 22, 0.45)',
    badgeBg: 'rgba(132, 204, 22, 0.2)',
    badgeText: '#bef264',
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
