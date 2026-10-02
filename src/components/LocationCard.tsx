import React from 'react';
import { WarehouseLocation, MoveModeState } from '../types/warehouse';
import { ArrowDownLeft, Box, Package, Check, Sparkles } from 'lucide-react';

interface LocationCardProps {
  location: WarehouseLocation;
  onClick: (loc: WarehouseLocation) => void;
  isSelected: boolean;
  isItemSearchMatch: boolean;
  isLocationSearchMatch: boolean;
  isDimmedBySearch: boolean;
  moveState: MoveModeState;
  isSameItemInMoveMode: boolean;
  cardSize?: 'compact' | 'normal' | 'large';
  visualStyle?: 'realistic_pallet' | 'standard';
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onClick,
  isSelected,
  isItemSearchMatch,
  isLocationSearchMatch,
  isDimmedBySearch,
  moveState,
  isSameItemInMoveMode,
  cardSize = 'normal',
  visualStyle = 'realistic_pallet',
}) => {
  const isOccupied = Boolean(location.itemCode && location.itemCode.trim() !== '');
  const isMoveActive = moveState.active;
  const isSourceInMove = isMoveActive && moveState.fromLocation === location.location;
  const isValidDestination = isMoveActive && Boolean(moveState.fromLocation) && !isOccupied;

  // Determine dynamic styling based on state
  let cardStyles = '';
  let rackBeams = 'border-blue-900/30'; // simulated industrial rack posts

  if (isSourceInMove) {
    // Current source in move mode
    cardStyles = 'bg-blue-600 text-white border-2 border-blue-700 shadow-lg ring-4 ring-blue-400 scale-[1.03] z-30';
    rackBeams = 'border-white/50';
  } else if (isValidDestination) {
    // Empty valid destination in move mode
    cardStyles = 'bg-emerald-50 text-emerald-950 border-2 border-dashed border-emerald-500 shadow-md ring-4 ring-emerald-300/70 scale-[1.03] z-30 cursor-pointer animate-pulse';
    rackBeams = 'border-emerald-600';
  } else if (isItemSearchMatch) {
    // Highlighted by Item Search
    cardStyles = 'bg-amber-100 text-amber-950 border-2 border-amber-500 shadow-lg ring-4 ring-amber-400 scale-[1.03] z-20';
    rackBeams = 'border-amber-600';
  } else if (isLocationSearchMatch) {
    // Highlighted by Location Search
    cardStyles = 'bg-blue-100 text-blue-950 border-2 border-blue-600 shadow-lg ring-4 ring-blue-400 scale-[1.03] z-20';
    rackBeams = 'border-blue-600';
  } else if (isMoveActive && isSameItemInMoveMode && isOccupied) {
    // Other locations holding same item during move mode
    cardStyles = 'bg-amber-50 text-amber-950 border-2 border-amber-400 ring-2 ring-amber-200';
    rackBeams = 'border-amber-400';
  } else if (isSelected) {
    // Selected for details
    cardStyles = 'bg-blue-50 text-blue-950 border-2 border-blue-500 shadow-md ring-2 ring-blue-300';
    rackBeams = 'border-blue-500';
  } else if (isOccupied) {
    // Normal Occupied Pallet / Rack Slot
    cardStyles = 'bg-white text-slate-900 border border-slate-300 shadow-2xs hover:border-blue-500 hover:shadow-md hover:scale-[1.01]';
    rackBeams = 'border-slate-400/80';
  } else {
    // Normal Empty Bay
    cardStyles = 'bg-slate-100/80 text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-200/60';
    rackBeams = 'border-slate-300';
  }

  // Dimming when a search is active and this card does not match
  if (isDimmedBySearch && !isItemSearchMatch && !isLocationSearchMatch && !isSourceInMove && !isValidDestination && !isSameItemInMoveMode) {
    cardStyles += ' opacity-25 saturate-50 hover:opacity-100';
  }

  // Card padding and text size according to cardSize with uniform height for perfect grid alignment
  const sizeClasses = {
    compact: 'p-2 h-[82px]',
    normal: 'p-2.5 h-[104px]',
    large: 'p-3 h-[126px]',
  }[cardSize];

  return (
    <div
      id={`loc-${location.location}`}
      onClick={() => onClick(location)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(location);
        }
      }}
      className={`group relative rounded-lg transition-all duration-150 flex flex-col justify-between cursor-pointer select-none text-right overflow-hidden ${sizeClasses} ${cardStyles}`}
      title={
        isOccupied
          ? `الموقع: ${location.location} | كود الصنف: ${location.itemCode} | الوصف: ${location.description || '—'}`
          : `الموقع: ${location.location} | شاغر (EMPTY)`
      }
    >
      
      {/* Industrial Rack Beam Columns (Left & Right vertical steel pillars) */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 border-r border-dashed ${rackBeams} opacity-40 pointer-events-none`} />
      <div className={`absolute top-0 bottom-0 right-0 w-1.5 border-l border-dashed ${rackBeams} opacity-40 pointer-events-none`} />

      {/* Header Row: Location Code + Status / Indicators */}
      <div className="flex items-center justify-between gap-1 w-full border-b border-black/5 pb-1 mb-1 relative z-10">
        
        {/* Location Tag */}
        <div className="flex items-center gap-1">
          <span className={`font-mono font-bold tracking-tight text-xs ${
            isSourceInMove ? 'text-white' : 'text-slate-900'
          }`}>
            {location.location}
          </span>
        </div>

        {/* Status / Role Indicator */}
        <div className="flex items-center gap-1">
          {isSourceInMove && (
            <span className="text-[10px] bg-white text-blue-800 font-bold px-1.5 py-0.5 rounded shadow-2xs">
              FROM
            </span>
          )}

          {isValidDestination && (
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
              <ArrowDownLeft className="w-2.5 h-2.5" />
              TO
            </span>
          )}

          {!isMoveActive && isOccupied && (
            <span className="w-2 h-2 rounded-full bg-blue-600 shadow-2xs" title="ممتلئ" />
          )}

          {!isMoveActive && !isOccupied && (
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
              EMPTY
            </span>
          )}
        </div>
      </div>

      {/* Middle/Bottom: Stored Pallet Box or Empty Shelf */}
      {isOccupied ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative z-10">
          
          {/* Item Code with Box Icon */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1 truncate">
              <span className={`text-[10px] font-semibold ${isSourceInMove ? 'text-blue-100' : 'text-slate-500'}`}>
                كود:
              </span>
              <span className={`font-mono font-bold text-xs tracking-tight truncate ${
                isSourceInMove ? 'text-white' : 'text-blue-950'
              }`}>
                {location.itemCode}
              </span>
            </div>

            {/* Subtle simulated barcode stripe for warehouse feel */}
            <div className={`hidden sm:flex flex-col gap-0.5 opacity-40 shrink-0 ${isSourceInMove ? 'text-white' : 'text-slate-600'}`}>
              <span className="w-4 h-0.5 bg-current" />
              <span className="w-3 h-0.5 bg-current" />
              <span className="w-4 h-0.5 bg-current" />
            </div>
          </div>

          {/* Description */}
          <div className={`text-[11px] font-medium leading-tight line-clamp-2 mt-0.5 ${
            isSourceInMove ? 'text-blue-50' : 'text-slate-700'
          }`}>
            {location.description || 'بدون وصف'}
          </div>

        </div>
      ) : (
        /* Empty Pallet Deck representation */
        <div className="flex-1 flex flex-col items-center justify-center py-1 relative z-10">
          <div className={`text-xs font-semibold flex items-center gap-1 ${
            isValidDestination ? 'text-emerald-700 font-bold' : 'text-slate-400'
          }`}>
            {isValidDestination ? (
              <>
                <ArrowDownLeft className="w-3.5 h-3.5 animate-bounce" />
                <span>اختر كوجهة (TO)</span>
              </>
            ) : (
              <span>شاغر / EMPTY</span>
            )}
          </div>
          <div className="w-12 h-1 border-b border-dashed border-slate-300 mt-1" />
        </div>
      )}

      {/* Same item in move mode indicator badge */}
      {isMoveActive && isSameItemInMoveMode && !isSourceInMove && (
        <div className="mt-1 pt-1 border-t border-amber-300 text-[10px] font-bold text-amber-800 flex items-center justify-between relative z-10">
          <span>نفس الصنف</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        </div>
      )}

      {/* Bottom Industrial Shelf Beam Line */}
      <div className={`h-1 w-full mt-1 rounded-full ${
        isSourceInMove 
          ? 'bg-blue-400/80' 
          : isValidDestination 
          ? 'bg-emerald-400' 
          : isOccupied 
          ? 'bg-amber-400/90' 
          : 'bg-slate-200'
      }`} />

    </div>
  );
};
