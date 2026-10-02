import React from 'react';
import {
  Box,
  Package,
  Layers,
  Shield,
  Wrench,
  Sparkles,
  Battery,
  Disc,
  Droplet,
  Zap,
  Tag,
  Cpu,
  Flame,
  Cog,
  Gauge,
  Circle,
  Gem,
  Hexagon,
  Anchor,
  Compass
} from 'lucide-react';

export type ItemShapeType =
  | 'hexagon'
  | 'diamond'
  | 'circle'
  | 'shield'
  | 'star'
  | 'triangle'
  | 'octagon'
  | 'pentagon'
  | 'pill'
  | 'cube'
  | 'barrel'
  | 'cross'
  | 'gem'
  | 'gear'
  | 'arch'
  | 'trapezoid'
  | 'rhombus'
  | 'clover';

export interface ItemVisualConfig {
  shapeType: ItemShapeType;
  shapeNameAr: string;
  shapeSymbol: string;
  colorNameAr: string;
  primaryColor: string; // Hex for svg
  secondaryColor: string;
  textColor: string;
  bgLightClass: string;
  borderClass: string;
  badgeClass: string;
  glowClass: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// 18 Distinct Shapes with precise SVG rendering definitions
const SHAPE_DEFINITIONS: {
  type: ItemShapeType;
  nameAr: string;
  symbol: string;
  svgPath: string; // path or polygon coordinates inside 0 0 28 28
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    type: 'hexagon',
    nameAr: 'سداسي هندسي',
    symbol: '⬢',
    svgPath: 'M14 2 L25 8.3 L25 19.7 L14 26 L3 19.7 L3 8.3 Z',
    icon: Box,
  },
  {
    type: 'diamond',
    nameAr: 'معين ألماسي',
    symbol: '◆',
    svgPath: 'M14 2 L26 14 L14 26 L2 14 Z',
    icon: Gem,
  },
  {
    type: 'shield',
    nameAr: 'درع حماية',
    symbol: '🛡️',
    svgPath: 'M14 2 L25 5.5 L25 15 C25 21 19.5 25.5 14 26.5 C8.5 25.5 3 21 3 15 L3 5.5 Z',
    icon: Shield,
  },
  {
    type: 'circle',
    nameAr: 'دائرة قرصية',
    symbol: '●',
    svgPath: 'M14 2 A12 12 0 1 0 14 26 A12 12 0 1 0 14 2 Z',
    icon: Disc,
  },
  {
    type: 'star',
    nameAr: 'نجمة خماسية',
    symbol: '★',
    svgPath: 'M14 2 L17.5 9.5 L25.5 10.3 L19.5 15.7 L21.2 23.6 L14 19.5 L6.8 23.6 L8.5 15.7 L2.5 10.3 L10.5 9.5 Z',
    icon: Sparkles,
  },
  {
    type: 'triangle',
    nameAr: 'مثلث هرمي',
    symbol: '▲',
    svgPath: 'M14 2.5 L26 24.5 L2 24.5 Z',
    icon: Compass,
  },
  {
    type: 'octagon',
    nameAr: 'مثمن صناعي',
    symbol: '🛑',
    svgPath: 'M9.5 2 L18.5 2 L26 9.5 L26 18.5 L18.5 26 L9.5 26 L2 18.5 L2 9.5 Z',
    icon: Gauge,
  },
  {
    type: 'pentagon',
    nameAr: 'خماسي أضلاع',
    symbol: '⬟',
    svgPath: 'M14 2 L25.5 10.5 L21 24.5 L7 24.5 L2.5 10.5 Z',
    icon: Layers,
  },
  {
    type: 'pill',
    nameAr: 'كبسولة دائرية',
    symbol: '💊',
    svgPath: 'M8 4 L20 4 C24 4 26 8 26 14 C26 20 24 24 20 24 L8 24 C4 24 2 20 2 14 C2 8 4 4 8 4 Z',
    icon: Battery,
  },
  {
    type: 'cube',
    nameAr: 'مكعب 3D مائل',
    symbol: '🧊',
    svgPath: 'M14 2 L25 8 L25 20 L14 26 L3 20 L3 8 Z M14 2 L14 14 L25 8 M14 14 L3 8 M14 14 L14 26',
    icon: Package,
  },
  {
    type: 'barrel',
    nameAr: 'برميل أسطواني',
    symbol: '🛢️',
    svgPath: 'M5 6 C5 3 9 2 14 2 C19 2 23 3 23 6 L23 22 C23 25 19 26 14 26 C9 26 5 25 5 22 Z M5 6 C5 9 9 10 14 10 C19 10 23 9 23 6 M5 14 C5 17 9 18 14 18 C19 18 23 17 23 14',
    icon: Droplet,
  },
  {
    type: 'cross',
    nameAr: 'صليب هندسي +',
    symbol: '✚',
    svgPath: 'M10 2 L18 2 L18 10 L26 10 L26 18 L18 18 L18 26 L10 26 L10 18 L2 18 L2 10 L10 10 Z',
    icon: Zap,
  },
  {
    type: 'gem',
    nameAr: 'جوهرة مشطوفة',
    symbol: '💎',
    svgPath: 'M7 2 L21 2 L26 10 L14 26 L2 10 Z M2 10 L26 10 M7 2 L14 10 L21 2 M14 10 L14 26',
    icon: Gem,
  },
  {
    type: 'gear',
    nameAr: 'ترس مسنن',
    symbol: '⚙️',
    svgPath: 'M12 2 L16 2 L16.8 5 L19.8 6.2 L22.4 4.4 L25.2 7.2 L23.4 9.8 L24.6 12.8 L27.6 13.6 L27.6 17.6 L24.6 18.4 L23.4 21.4 L25.2 24 L22.4 26.8 L19.8 25 L16.8 26.2 L16 29.2 L12 29.2 L11.2 26.2 L8.2 25 L5.6 26.8 L2.8 24 L4.6 21.4 L3.4 18.4 L0.4 17.6 L0.4 13.6 L3.4 12.8 L4.6 9.8 L2.8 7.2 L5.6 4.4 L8.2 6.2 L11.2 5 Z',
    icon: Cog,
  },
  {
    type: 'arch',
    nameAr: 'قوس بوابة',
    symbol: '⋂',
    svgPath: 'M3 26 L3 13 C3 7 8 2 14 2 C20 2 25 7 25 13 L25 26 L19 26 L19 14 C19 11 17 9 14 9 C11 9 9 11 9 14 L9 26 Z',
    icon: Wrench,
  },
  {
    type: 'trapezoid',
    nameAr: 'شبه منحرف',
    symbol: '⏢',
    svgPath: 'M6 3 L22 3 L26 25 L2 25 Z',
    icon: Tag,
  },
  {
    type: 'rhombus',
    nameAr: 'متوازي مائل',
    symbol: '▱',
    svgPath: 'M7 3 L26 3 L21 25 L2 25 Z',
    icon: Cpu,
  },
  {
    type: 'clover',
    nameAr: 'شارة رباعية',
    symbol: '✤',
    svgPath: 'M14 2 C16 6 18 6 22 6 C22 10 22 12 26 14 C22 16 22 18 22 22 C18 22 16 22 14 26 C12 22 10 22 6 22 C6 18 6 16 2 14 C6 12 6 10 6 6 C10 6 12 6 14 2 Z',
    icon: Flame,
  },
];

// 18 Rich palettes for distinct color separation
const COLOR_PALETTES = [
  {
    nameAr: 'أزرق كحلي ملكي',
    primary: '#1d4ed8', // blue-700
    secondary: '#3b82f6',
    text: '#1e40af',
    bgLight: 'bg-blue-50',
    border: 'border-blue-500',
    badge: 'bg-blue-600 text-white',
    glow: 'ring-blue-400',
  },
  {
    nameAr: 'عنبري ذهبي دافئ',
    primary: '#d97706', // amber-600
    secondary: '#f59e0b',
    text: '#92400e',
    bgLight: 'bg-amber-50',
    border: 'border-amber-500',
    badge: 'bg-amber-600 text-white',
    glow: 'ring-amber-400',
  },
  {
    nameAr: 'أخضر زمردي ناصع',
    primary: '#059669', // emerald-600
    secondary: '#10b981',
    text: '#065f46',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-500',
    badge: 'bg-emerald-600 text-white',
    glow: 'ring-emerald-400',
  },
  {
    nameAr: 'بنفسجي ملكي أرجواني',
    primary: '#7c3aed', // violet-600
    secondary: '#8b5cf6',
    text: '#5b21b6',
    bgLight: 'bg-purple-50',
    border: 'border-purple-500',
    badge: 'bg-purple-600 text-white',
    glow: 'ring-purple-400',
  },
  {
    nameAr: 'أحمر ياقوتي قرمزي',
    primary: '#dc2626', // red-600
    secondary: '#ef4444',
    text: '#991b1b',
    bgLight: 'bg-rose-50',
    border: 'border-rose-500',
    badge: 'bg-rose-600 text-white',
    glow: 'ring-rose-400',
  },
  {
    nameAr: 'سماوي بحري تركواز',
    primary: '#0891b2', // cyan-600
    secondary: '#06b6d4',
    text: '#155e75',
    bgLight: 'bg-cyan-50',
    border: 'border-cyan-500',
    badge: 'bg-cyan-600 text-white',
    glow: 'ring-cyan-400',
  },
  {
    nameAr: 'برتقالي ناري مشرق',
    primary: '#ea580c', // orange-600
    secondary: '#f97316',
    text: '#9a3412',
    bgLight: 'bg-orange-50',
    border: 'border-orange-500',
    badge: 'bg-orange-600 text-white',
    glow: 'ring-orange-400',
  },
  {
    nameAr: 'وردي فوشيا زهري',
    primary: '#c026d3', // fuchsia-600
    secondary: '#d946ef',
    text: '#86198f',
    bgLight: 'bg-fuchsia-50',
    border: 'border-fuchsia-500',
    badge: 'bg-fuchsia-600 text-white',
    glow: 'ring-fuchsia-400',
  },
  {
    nameAr: 'أزرق نيلي غامق',
    primary: '#4338ca', // indigo-700
    secondary: '#6366f1',
    text: '#3730a3',
    bgLight: 'bg-indigo-50',
    border: 'border-indigo-500',
    badge: 'bg-indigo-600 text-white',
    glow: 'ring-indigo-400',
  },
  {
    nameAr: 'أخضر ليموني زيتوني',
    primary: '#65a30d', // lime-600
    secondary: '#84cc16',
    text: '#3f6212',
    bgLight: 'bg-lime-50',
    border: 'border-lime-500',
    badge: 'bg-lime-600 text-white',
    glow: 'ring-lime-400',
  },
  {
    nameAr: 'فيروزي تيل مائي',
    primary: '#0d9488', // teal-600
    secondary: '#14b8a6',
    text: '#115e59',
    bgLight: 'bg-teal-50',
    border: 'border-teal-500',
    badge: 'bg-teal-600 text-white',
    glow: 'ring-teal-400',
  },
  {
    nameAr: 'بني برونزي نحاسي',
    primary: '#b45309', // amber-700
    secondary: '#d97706',
    text: '#78350f',
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-600',
    badge: 'bg-yellow-700 text-white',
    glow: 'ring-yellow-500',
  },
  {
    nameAr: 'رمادي فحمي فولاذي',
    primary: '#475569', // slate-600
    secondary: '#64748b',
    text: '#1e293b',
    bgLight: 'bg-slate-100',
    border: 'border-slate-500',
    badge: 'bg-slate-700 text-white',
    glow: 'ring-slate-400',
  },
  {
    nameAr: 'أزرق سماوي سحابي',
    primary: '#0284c7', // sky-600
    secondary: '#38bdf8',
    text: '#075985',
    bgLight: 'bg-sky-50',
    border: 'border-sky-500',
    badge: 'bg-sky-600 text-white',
    glow: 'ring-sky-400',
  },
  {
    nameAr: 'أرجواني ماجنتا عميق',
    primary: '#be185d', // pink-700
    secondary: '#ec4899',
    text: '#831843',
    bgLight: 'bg-pink-50',
    border: 'border-pink-500',
    badge: 'bg-pink-600 text-white',
    glow: 'ring-pink-400',
  },
  {
    nameAr: 'أخضر غابات داكن',
    primary: '#15803d', // green-700
    secondary: '#22c55e',
    text: '#14532d',
    bgLight: 'bg-green-50',
    border: 'border-green-600',
    badge: 'bg-green-700 text-white',
    glow: 'ring-green-400',
  },
  {
    nameAr: 'مرجاني قرميدي دافئ',
    primary: '#c2410c', // orange-700
    secondary: '#ea580c',
    text: '#7c2d12',
    bgLight: 'bg-amber-50',
    border: 'border-orange-600',
    badge: 'bg-orange-700 text-white',
    glow: 'ring-orange-400',
  },
  {
    nameAr: 'بنفسجي ديب بيربل',
    primary: '#6b21a8', // purple-800
    secondary: '#9333ea',
    text: '#581c87',
    bgLight: 'bg-purple-100',
    border: 'border-purple-600',
    badge: 'bg-purple-800 text-white',
    glow: 'ring-purple-400',
  },
];

// Hash function to deterministically assign shape & color index from itemCode
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns complete visual configuration for an item:
 * Specific unique shape geometry, Arabic name, distinctive palette, and icon!
 */
export function getItemVisual(itemCode?: string | null, description?: string | null): ItemVisualConfig & {
  shapeSvgPath: string;
} {
  const code = (itemCode || '').trim();
  if (!code) {
    // Empty default fallback
    const defShape = SHAPE_DEFINITIONS[0];
    const defCol = COLOR_PALETTES[0];
    return {
      shapeType: 'circle',
      shapeNameAr: 'شاغر',
      shapeSymbol: '○',
      colorNameAr: 'رمادي',
      primaryColor: '#94a3b8',
      secondaryColor: '#cbd5e1',
      textColor: '#64748b',
      bgLightClass: 'bg-slate-50',
      borderClass: 'border-slate-300',
      badgeClass: 'bg-slate-300 text-slate-700',
      glowClass: 'ring-slate-300',
      icon: Circle,
      shapeSvgPath: defShape.svgPath,
    };
  }

  // Pure numeric codes or alpha codes
  const numHash = hashString(code);
  const shapeIndex = numHash % SHAPE_DEFINITIONS.length;
  // Use a secondary hash offset for color so same shape won't always have same color
  const colorIndex = (numHash + Math.floor(numHash / SHAPE_DEFINITIONS.length)) % COLOR_PALETTES.length;

  const shape = SHAPE_DEFINITIONS[shapeIndex];
  const color = COLOR_PALETTES[colorIndex];

  return {
    shapeType: shape.type,
    shapeNameAr: shape.nameAr,
    shapeSymbol: shape.symbol,
    colorNameAr: color.nameAr,
    primaryColor: color.primary,
    secondaryColor: color.secondary,
    textColor: color.text,
    bgLightClass: color.bgLight,
    borderClass: color.border,
    badgeClass: color.badge,
    glowClass: color.glow,
    icon: shape.icon,
    shapeSvgPath: shape.svgPath,
  };
}

export { SHAPE_DEFINITIONS, COLOR_PALETTES };
