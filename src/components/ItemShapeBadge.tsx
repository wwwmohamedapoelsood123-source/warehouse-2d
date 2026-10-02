import React from 'react';
import { getItemVisual, ItemVisualConfig } from '../utils/itemVisuals';

interface ItemShapeBadgeProps {
  itemCode?: string | null;
  description?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showShapeName?: boolean;
  showItemCode?: boolean;
  showIcon?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  interactive?: boolean;
  isSelected?: boolean;
  shapeOnly?: boolean;
}

export const ItemShapeBadge: React.FC<ItemShapeBadgeProps> = ({
  itemCode,
  description,
  size = 'sm',
  showShapeName = false,
  showItemCode = false,
  showIcon = true,
  className = '',
  onClick,
  interactive = false,
  isSelected = false,
  shapeOnly = false,
}) => {
  if (!itemCode || itemCode.trim() === '') {
    return null;
  }

  const visual = getItemVisual(itemCode, description);
  const IconComponent = visual.icon;

  // Dimensions configuration
  const dimensions = {
    xs: { px: 18, iconSize: 10, strokeWidth: 1.5, textClass: 'text-[9px]' },
    sm: { px: 24, iconSize: 13, strokeWidth: 1.8, textClass: 'text-[10px]' },
    md: { px: 32, iconSize: 16, strokeWidth: 2, textClass: 'text-xs' },
    lg: { px: 42, iconSize: 22, strokeWidth: 2.2, textClass: 'text-sm' },
    xl: { px: 56, iconSize: 28, strokeWidth: 2.5, textClass: 'text-base' },
  }[size];

  const badgeContent = (
    <div
      onClick={onClick}
      role={interactive || onClick ? 'button' : undefined}
      tabIndex={interactive || onClick ? 0 : undefined}
      title={`صنف: ${itemCode} | شكل الصنف: ${visual.shapeNameAr} (${visual.colorNameAr})`}
      className={`inline-flex items-center gap-1.5 select-none transition-all ${
        interactive || onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${isSelected ? 'ring-2 ring-emerald-500 rounded-lg bg-emerald-50/50 p-0.5' : ''} ${className}`}
    >
      {/* 1. Geometric SVG Shape Container */}
      <div 
        className="relative flex items-center justify-center shrink-0 drop-shadow-xs"
        style={{ width: dimensions.px, height: dimensions.px }}
      >
        <svg
          viewBox="0 0 28 28"
          width={dimensions.px}
          height={dimensions.px}
          className="overflow-visible"
        >
          <defs>
            {/* Unique gradient per item */}
            <linearGradient id={`grad-${visual.shapeType}-${itemCode}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={visual.secondaryColor} />
              <stop offset="100%" stopColor={visual.primaryColor} />
            </linearGradient>
            <filter id={`shadow-${itemCode}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* SVG Shape Path with custom gradient fill and crisp border */}
          <path
            d={visual.shapeSvgPath}
            fill={`url(#grad-${visual.shapeType}-${itemCode})`}
            stroke="#ffffff"
            strokeWidth={dimensions.strokeWidth}
            strokeLinejoin="round"
            filter={`url(#shadow-${itemCode})`}
          />

          {/* Subtle interior highlight */}
          <path
            d={visual.shapeSvgPath}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={0.8}
            transform="scale(0.85) translate(2.5, 2.5)"
          />
        </svg>

        {/* Embedded Icon / Monogram inside the geometric shape */}
        {showIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white drop-shadow-xs">
            <IconComponent 
              style={{ width: dimensions.iconSize, height: dimensions.iconSize }} 
            />
          </div>
        )}
      </div>

      {/* 2. Optional Shape Name and Color Badge */}
      {!shapeOnly && (showShapeName || showItemCode) && (
        <div className="flex flex-col text-right leading-none">
          {showItemCode && (
            <span className={`font-mono font-black text-slate-900 ${dimensions.textClass}`}>
              {itemCode}
            </span>
          )}
          {showShapeName && (
            <span 
              className="text-[10px] font-semibold mt-0.5 px-1 rounded flex items-center gap-1"
              style={{ color: visual.primaryColor }}
            >
              <span className="text-xs">{visual.shapeSymbol}</span>
              <span>{visual.shapeNameAr}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );

  return badgeContent;
};
