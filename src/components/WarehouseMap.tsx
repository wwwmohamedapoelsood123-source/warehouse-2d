import React, { useMemo, useState, useRef, useCallback } from 'react';
import { WarehouseLocation, MoveModeState, decomposeLocationCode } from '../types/warehouse';
import { 
  Building2, 
  Milestone, 
  Layers, 
  ArrowLeftRight, 
  Boxes,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  Maximize2,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  AlertTriangle
} from 'lucide-react';

interface WarehouseMapProps {
  locations: WarehouseLocation[];
  onSelectLocation: (loc: WarehouseLocation) => void;
  selectedLocation: WarehouseLocation | null;
  itemSearchQuery: string;
  locationSearchQuery: string;
  moveState: MoveModeState;
  sameItemLocations: string[];
}

// ── Ultra-Lightweight, Memoized Location Card (White Base + Red Foreign + Green Highlight) ──
interface LocationSlotItemProps {
  level: string;
  side: string;
  sideName: string;
  locData: WarehouseLocation;
  isOccupied: boolean;
  isSelected: boolean;
  isSameItem: boolean;
  isDifferentInBay: boolean;
  isValidDest: boolean;
  isSearchMatch: boolean;
  isSourceInMove: boolean;
  cardDensity: 'extra' | 'detailed' | 'compact';
  onSelect: (loc: WarehouseLocation) => void;
}

const LocationSlotItem = React.memo<LocationSlotItemProps>(({
  level,
  side,
  sideName,
  locData,
  isOccupied,
  isSelected,
  isSameItem,
  isDifferentInBay,
  isValidDest,
  isSearchMatch,
  isSourceInMove,
  cardDensity,
  onSelect,
}) => {
  // ── Color System Requested:
  // 1. If clicked or same item -> Bright GREEN (اللون الأخضر)
  // 2. If different item in bay -> Bright RED (اللون الأحمر)
  // 3. If occupied -> Clean WHITE card with details (اللون الأبيض)
  // 4. If empty -> Truly clean empty slot (لو فاضي خليه فاضي)

  let bgStyle = 'bg-slate-50 text-slate-400 border border-dashed border-slate-300 hover:bg-slate-100';
  let badgeStyle = 'bg-slate-200 text-slate-700 font-bold';
  let tag: string | null = null;
  let tagClass = 'bg-white text-slate-900';

  if (isSourceInMove || isSelected) {
    // 1. Exact clicked location: Emerald GREEN
    bgStyle = 'bg-emerald-600 text-white border-2 border-emerald-300 ring-2 ring-emerald-300 shadow-sm';
    badgeStyle = 'bg-emerald-800 text-white font-black';
    tag = 'الموقع المحدد';
    tagClass = 'bg-white text-emerald-950 font-black';
  } else if (isSameItem) {
    // 1. All locations of the same item: Emerald GREEN
    bgStyle = 'bg-emerald-600 text-white border-2 border-emerald-400 ring-2 ring-emerald-300 shadow-sm';
    badgeStyle = 'bg-emerald-800 text-white font-black';
    tag = 'نفس الصنف';
    tagClass = 'bg-emerald-100 text-emerald-950 font-black';
  } else if (isValidDest) {
    bgStyle = 'bg-emerald-50 text-emerald-950 font-bold border-2 border-dashed border-emerald-600';
    badgeStyle = 'bg-emerald-700 text-white';
    tag = 'متاح للنقل';
  } else if (isSearchMatch) {
    bgStyle = 'bg-sky-50 text-sky-950 border-2 border-sky-500 font-bold';
    badgeStyle = 'bg-sky-700 text-white font-black';
    tag = 'مطابق للبحث';
  } else if (isOccupied && isDifferentInBay) {
    // 2. Different item in the bay: Bright RED
    bgStyle = 'bg-rose-50 text-rose-950 border-2 border-rose-500 ring-2 ring-rose-200 hover:bg-rose-100';
    badgeStyle = 'bg-rose-600 text-white font-black';
    tag = 'صنف مختلف بالباكية';
    tagClass = 'bg-rose-600 text-white font-bold';
  } else if (isOccupied) {
    // 3. Normal occupied location: Clean WHITE card
    bgStyle = 'bg-white text-slate-900 border border-slate-300 hover:border-slate-400 shadow-2xs hover:bg-slate-50';
    badgeStyle = 'bg-slate-100 text-slate-700 border border-slate-300 font-bold';
  }

  const heightClass = 
    cardDensity === 'extra' 
      ? 'min-h-[128px] p-2.5' 
      : cardDensity === 'detailed' 
      ? 'min-h-[110px] p-2' 
      : 'min-h-[88px] p-1.5';

  return (
    <button
      type="button"
      onClick={() => onSelect(locData)}
      className={`rounded-xl text-right flex flex-col justify-between cursor-pointer select-none transition-transform active:scale-95 ${bgStyle} ${heightClass}`}
      title={
        isOccupied
          ? `الموقع: ${locData.location} | كود: ${locData.itemCode} | الصنف: ${locData.description || 'بدون وصف'} ${
              isDifferentInBay ? '[⚠️ صنف مختلف في هذه الباكية!]' : ''
            }`
          : `الموقع: ${locData.location} | شاغر (EMPTY)`
      }
    >
      {/* 1. Header Bar: Level + Side + Location Code */}
      <div className="flex items-center justify-between w-full border-b border-black/10 pb-1 gap-1">
        <div className="flex items-center gap-1">
          <span className={`text-[11px] font-mono font-black px-1.5 py-0.2 rounded ${badgeStyle}`}>
            {level}{side} ({sideName})
          </span>
          {level === 'A' && (
            <span className="text-[10px] font-bold opacity-80 bg-black/5 px-1 rounded">
              أرضي
            </span>
          )}
        </div>

        {tag ? (
          <span className={`text-[10px] px-1.5 py-0.2 rounded shadow-2xs ${tagClass}`}>
            {tag}
          </span>
        ) : (
          <span className="text-xs font-mono font-bold tracking-tight opacity-90 bg-black/5 px-1.5 py-0.2 rounded">
            {locData.location}
          </span>
        )}
      </div>

      {/* 2. Middle Row: Item Code */}
      {isOccupied ? (
        <div className="my-1 flex items-center justify-between gap-1 w-full">
          <div className={`font-mono text-xs md:text-sm px-2 py-0.5 rounded-lg border flex items-center gap-1.5 w-full justify-center ${
            isSelected || isSameItem
              ? 'bg-emerald-700/80 text-white border-emerald-400 font-black'
              : isDifferentInBay
              ? 'bg-rose-100 text-rose-950 border-rose-300 font-black'
              : 'bg-slate-100 text-slate-900 border-slate-200 font-bold'
          }`}>
            {isDifferentInBay && !isSelected && !isSameItem && (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span className="text-[11px] opacity-75 font-sans">كود:</span>
            <span className="tracking-wide text-sm font-black">{locData.itemCode}</span>
          </div>
        </div>
      ) : (
        /* Empty Slot: Truly clean and empty */
        <div className="text-xs text-slate-400 font-bold text-center my-auto py-1">
          شاغر (فارغ)
        </div>
      )}

      {/* 3. Bottom Row: Product Name in Clear Readable Arabic */}
      {isOccupied ? (
        <div className={`text-xs font-bold leading-snug line-clamp-2 text-right mt-auto ${
          isSelected || isSameItem 
            ? 'text-emerald-50' 
            : isDifferentInBay 
            ? 'text-rose-950 font-bold' 
            : 'text-slate-800'
        }`}>
          {locData.description || 'بدون وصف'}
        </div>
      ) : (
        <div className="h-0.5 w-full border-b border-dashed border-slate-300 mt-auto" />
      )}
    </button>
  );
});

LocationSlotItem.displayName = 'LocationSlotItem';

export const WarehouseMap: React.FC<WarehouseMapProps> = ({
  locations,
  onSelectLocation,
  selectedLocation,
  itemSearchQuery,
  locationSearchQuery,
  moveState,
  sameItemLocations,
}) => {
  // View options:
  const [cardDensity, setCardDensity] = useState<'detailed' | 'extra' | 'compact'>('detailed');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [wheelMode, setWheelMode] = useState<'zoom' | 'scroll'>('zoom');
  const [showBottomDetails, setShowBottomDetails] = useState<boolean>(true);

  // Wheel animation frame ref for 60fps smooth zooming
  const wheelAnimRef = useRef<number | null>(null);

  // Clean normalized search queries
  const cleanItemSearch = itemSearchQuery.trim().toLowerCase();
  const cleanLocSearch = locationSearchQuery.trim().toLowerCase();

  // Fast map lookup: locCode -> WarehouseLocation
  const locationMap = useMemo(() => {
    const map = new Map<string, WarehouseLocation>();
    locations.forEach((l) => {
      map.set(l.location.toUpperCase(), l);
    });
    return map;
  }, [locations]);

  // Selected item code and all locations that contain the EXACT SAME item code
  const selectedItemCode = selectedLocation?.itemCode?.trim();
  const sameItemLocationsAsSelected = useMemo(() => {
    if (!selectedItemCode) return [];
    const target = selectedItemCode.toLowerCase();
    return locations.filter(
      (l) => l.itemCode && l.itemCode.trim().toLowerCase() === target
    );
  }, [locations, selectedItemCode]);

  // Set of uppercase locations with the same item code for O(1) fast lookup
  const sameItemLocsSet = useMemo(() => {
    return new Set(sameItemLocationsAsSelected.map((l) => l.location.toUpperCase()));
  }, [sameItemLocationsAsSelected]);

  // Dynamically group locations by street and bay + Calculate dominant item per bay
  const streetsData = useMemo(() => {
    const streetBaysMap = new Map<string, Map<string, WarehouseLocation[]>>();
    let detectedWarehouse = 'G14';
    const allBaysSet = new Set<string>();

    locations.forEach((loc) => {
      const decomp = decomposeLocationCode(loc.location);
      if (decomp.warehouse && decomp.warehouse.trim() !== '') {
        detectedWarehouse = decomp.warehouse;
      }

      const streetKey = decomp.street || '01';
      const bayKey = decomp.bay || '001';
      allBaysSet.add(bayKey);

      if (!streetBaysMap.has(streetKey)) {
        streetBaysMap.set(streetKey, new Map());
      }
      const baysMap = streetBaysMap.get(streetKey)!;
      if (!baysMap.has(bayKey)) {
        baysMap.set(bayKey, []);
      }
      baysMap.get(bayKey)!.push(loc);
    });

    const sortedStreetKeys = Array.from(streetBaysMap.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    if (sortedStreetKeys.length === 0) {
      return {
        warehouse: 'G14',
        totalBays: 20,
        streets: [1, 2, 3, 4].map((s) => {
          const streetKey = String(s).padStart(2, '0');
          const startBay = (s - 1) * 5 + 1;
          const bays = [0, 1, 2, 3, 4].map((offset) => {
            const bayKey = String(startBay + offset).padStart(3, '0');
            return {
              bayKey,
              name: `باكية ${bayKey}`,
              slotMap: new Map<string, WarehouseLocation>(),
              locs: [],
              dominantItemCode: null as string | null,
              hasMixedItems: false,
            };
          });

          return {
            streetKey,
            name: `شارع ${streetKey}`,
            bays,
          };
        }),
      };
    }

    const streets = sortedStreetKeys.map((streetKey) => {
      const baysMap = streetBaysMap.get(streetKey)!;
      const sortedBayKeys = Array.from(baysMap.keys()).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );

      const bays = sortedBayKeys.map((bayKey) => {
        const locs = baysMap.get(bayKey)!;
        const slotMap = new Map<string, WarehouseLocation>();
        const bayItemCounts = new Map<string, number>();

        locs.forEach((l) => {
          const d = decomposeLocationCode(l.location);
          slotMap.set(`${d.level}${d.side}`, l);

          if (l.itemCode && l.itemCode.trim() !== '') {
            const code = l.itemCode.trim();
            bayItemCounts.set(code, (bayItemCounts.get(code) || 0) + 1);
          }
        });

        // Determine dominant product in this bay:
        let dominantItemCode: string | null = null;
        let maxCount = 0;
        bayItemCounts.forEach((count, code) => {
          if (count > maxCount) {
            maxCount = count;
            dominantItemCode = code;
          }
        });

        const hasMixedItems = bayItemCounts.size > 1;

        return {
          bayKey,
          name: `باكية ${bayKey}`,
          slotMap,
          locs,
          dominantItemCode,
          hasMixedItems,
        };
      });

      return {
        streetKey,
        name: `شارع ${streetKey}`,
        bays,
      };
    });

    return {
      warehouse: detectedWarehouse,
      totalBays: allBaysSet.size,
      streets,
    };
  }, [locations]);

  // Shelf levels: D at top, A at bottom (الدور الأرضي)
  const levelsFromTopToBottom = ['D', 'C', 'B', 'A'];

  // Active location for bottom decomposition
  const activeLocation = selectedLocation || (locations.length > 0 ? locations[0] : null);
  const activeDecomposition = activeLocation 
    ? decomposeLocationCode(activeLocation.location)
    : { 
        warehouse: streetsData.warehouse, 
        street: '01', 
        bay: '001', 
        level: 'A', 
        side: '1', 
        sideName: 'يمين', 
        rawCode: `${streetsData.warehouse}001A1` 
      };

  // High performance, throttled wheel zoom handler
  const handleMapWheel = useCallback((e: React.WheelEvent) => {
    if (wheelMode === 'zoom' || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 8 : -8;
      if (wheelAnimRef.current !== null) {
        cancelAnimationFrame(wheelAnimRef.current);
      }
      wheelAnimRef.current = requestAnimationFrame(() => {
        setZoomLevel((z) => Math.min(160, Math.max(40, z + delta)));
        wheelAnimRef.current = null;
      });
    }
  }, [wheelMode]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(160, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(40, z - 10));
  const handleResetZoom = () => setZoomLevel(100);
  const handleFitScreen = () => setZoomLevel(50);

  const handleClearSelection = () => {
    onSelectLocation({ location: '', itemCode: '', description: '' });
  };

  return (
    <div className="w-full space-y-3 mb-6">
      
      {/* 1. Header: Flat, Crisp, Lightweight */}
      <div className="bg-[#0b2b48] text-white px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full border border-[#163b5e]">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>مخطط المخزن الشامل - {streetsData.warehouse}</span>
              <span className="text-[11px] font-normal bg-blue-500/40 text-blue-100 px-2 py-0.5 rounded-full">
                لوكيشنات بيضاء · تظليل الصنف بالأخضر · المختلف بالأحمر
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-blue-200 mt-0.5">
              <span>{locations.length} موقع</span>
              <span>·</span>
              <span>{streetsData.streets.length} شوارع</span>
              <span>·</span>
              <span>{streetsData.totalBays} باكية</span>
            </div>
          </div>
        </div>

        {/* View Density Switcher & Toggle Bottom Info */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end flex-wrap">
          <button
            onClick={() => setShowBottomDetails((v) => !v)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#143e66] hover:bg-[#1a4f82] text-blue-100 border border-[#205282] flex items-center gap-1 cursor-pointer"
          >
            {showBottomDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showBottomDetails ? 'إخفاء دليل الألوان والتفاصيل' : 'إظهار دليل الألوان والتفاصيل'}</span>
          </button>

          {/* Density options: Extra / Detailed / Compact */}
          <div className="flex items-center gap-1 bg-[#143e66] p-0.5 rounded-lg border border-[#205282]">
            <button
              onClick={() => setCardDensity('extra')}
              className={`px-2 py-1 text-xs font-bold rounded-md cursor-pointer ${
                cardDensity === 'extra' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:text-white'
              }`}
            >
              فائق التكبير
            </button>
            <button
              onClick={() => setCardDensity('detailed')}
              className={`px-2 py-1 text-xs font-bold rounded-md cursor-pointer ${
                cardDensity === 'detailed' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:text-white'
              }`}
            >
              واضح ومكبر
            </button>
            <button
              onClick={() => setCardDensity('compact')}
              className={`px-2 py-1 text-xs font-bold rounded-md cursor-pointer ${
                cardDensity === 'compact' ? 'bg-blue-500 text-white' : 'text-blue-200 hover:text-white'
              }`}
            >
              مدمج
            </button>
          </div>
        </div>

      </div>

      {/* 2. Highlight Alert Banner: When any location is clicked, highlights all in bright green */}
      {selectedItemCode && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-2.5 rounded-xl flex items-center justify-between flex-wrap gap-2 w-full shadow-2xs">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400 inline-block shrink-0" />
            <span className="font-bold text-emerald-900">
              تم تظليل جميع مواقع هذا الصنف في المخزن باللون الأخضر:
            </span>
            <span className="font-mono font-black bg-emerald-600 text-white px-2 py-0.5 rounded text-xs">
              {selectedItemCode}
            </span>
            {selectedLocation?.description && (
              <span className="text-emerald-800 font-semibold hidden md:inline">
                ({selectedLocation.description})
              </span>
            )}
            <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-xs">
              إجمالي: {sameItemLocationsAsSelected.length} موقع
            </span>
          </div>

          <button
            onClick={handleClearSelection}
            className="text-xs bg-white hover:bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>إلغاء التظليل</span>
          </button>
        </div>
      )}

      {/* 3. Fast Zoom Ribbon Bar */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 w-full">
        
        {/* Left side: Zoom presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1 ml-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>الزوم:</span>
          </span>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 flex-wrap">
            <button
              onClick={() => setZoomLevel(40)}
              className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                zoomLevel === 40 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              40% (شامل)
            </button>
            <button
              onClick={() => setZoomLevel(60)}
              className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                zoomLevel === 60 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              60%
            </button>
            <button
              onClick={() => setZoomLevel(80)}
              className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                zoomLevel === 80 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              80%
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                zoomLevel === 100 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              100% (طبيعي)
            </button>
            <button
              onClick={() => setZoomLevel(125)}
              className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                zoomLevel === 125 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              125%
            </button>
            <button
              onClick={() => setZoomLevel(150)}
              className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                zoomLevel === 150 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              150% (فائق)
            </button>
          </div>

          <button
            onClick={handleFitScreen}
            className="px-2 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 text-blue-600" />
            <span>احتواء الشاشة</span>
          </button>

          <button
            onClick={() => setWheelMode((m) => (m === 'zoom' ? 'scroll' : 'zoom'))}
            className={`px-2 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 cursor-pointer ${
              wheelMode === 'zoom'
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>🖱️ العجلة:</span>
            <span className={wheelMode === 'zoom' ? 'text-amber-200 underline' : 'text-slate-900'}>
              {wheelMode === 'zoom' ? 'زوم فوري' : 'تمرير رأسي'}
            </span>
          </button>
        </div>

        {/* Right side: Fast stepper buttons & range */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 40}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 disabled:opacity-30 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min={40}
            max={160}
            step={5}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-24 sm:w-32 h-1.5 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
          />
          <span className="font-mono text-xs font-black text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 min-w-[45px] text-center">
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 160}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 disabled:opacity-30 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {zoomLevel !== 100 && (
            <button
              onClick={handleResetZoom}
              className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 cursor-pointer"
              title="إعادة ضبط 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* 4. MAIN WAREHOUSE FLOOR PLAN */}
      <div 
        onWheel={handleMapWheel}
        className="w-full bg-[#edf3f8] border-2 border-[#163654] rounded-2xl p-3 sm:p-4 relative overflow-x-auto overflow-y-hidden"
      >
        
        {/* Floating Controls HUD */}
        <div className="sticky bottom-2 left-2 z-30 float-left inline-flex items-center gap-1 bg-slate-900 text-white p-1 rounded-xl border border-slate-700 shadow-md">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 40}
            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-200 hover:text-white cursor-pointer"
          >
            <ZoomOut className="w-3 h-3" />
          </button>

          <span className="font-mono text-xs font-bold text-amber-300 px-1.5 py-0.2 bg-slate-800 rounded">
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 160}
            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-200 hover:text-white cursor-pointer"
          >
            <ZoomIn className="w-3 h-3" />
          </button>

          {zoomLevel !== 100 && (
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.2 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer"
            >
              100%
            </button>
          )}

          <button
            onClick={handleFitScreen}
            className="px-1.5 py-0.2 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-blue-200 rounded cursor-pointer"
          >
            احتواء
          </button>
        </div>

        {/* Scaled Canvas Container */}
        <div 
          className="relative origin-top-right w-full"
          style={{ 
            zoom: `${zoomLevel}%`,
            minWidth: `${Math.max(streetsData.streets[0]?.bays.length || 5, 5) * (cardDensity === 'extra' ? 340 : cardDensity === 'detailed' ? 295 : 240)}px`
          }}
        >
          
          {/* Warehouse Streets Stack */}
          <div className="space-y-5 py-1 w-full">
            {streetsData.streets.map((street) => {
              return (
                <div key={street.streetKey} className="space-y-1.5 w-full" style={{ contain: 'content' }}>
                  
                  {/* Street Header Pill & Bidirectional Arrows */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex items-center justify-between text-slate-400 pointer-events-none">
                      <span className="text-xs font-bold text-slate-700">◀</span>
                      <div className="flex-1 border-t-2 border-[#204364]/30 mx-2" />
                      <span className="text-xs font-bold text-slate-700">▶</span>
                    </div>

                    <div className="relative z-10 bg-[#0f2d4a] text-white text-xs font-bold px-6 py-0.5 rounded-full border border-[#204a70] flex items-center gap-2">
                      <span>{street.name}</span>
                      <span className="text-[10px] text-blue-200 font-normal">
                        ({street.bays.length} باكيات)
                      </span>
                    </div>
                  </div>

                  {/* All bays of this street spread across width */}
                  <div 
                    className="grid gap-2.5 sm:gap-3.5 w-full" 
                    style={{ 
                      gridTemplateColumns: `repeat(${Math.max(street.bays.length, 5)}, minmax(${
                        cardDensity === 'extra' ? '330px' : cardDensity === 'detailed' ? '285px' : '240px'
                      }, 1fr))` 
                    }}
                  >
                    {street.bays.map((bay) => {
                      return (
                        <div 
                          key={bay.bayKey}
                          className={`rounded-xl p-2 text-center flex flex-col w-full border-2 ${
                            bay.hasMixedItems 
                              ? 'bg-[#293d54] border-rose-500/70' 
                              : 'bg-[#244360] border-[#31577a]'
                          }`}
                          style={{ contain: 'content' }}
                        >
                          {/* Bay Header */}
                          <div className={`text-white text-xs font-bold py-0.5 px-2 rounded-lg mb-1.5 border flex items-center justify-between ${
                            bay.hasMixedItems 
                              ? 'bg-rose-950/80 border-rose-500' 
                              : 'bg-[#102d4a] border-[#204a70]'
                          }`}>
                            <div className="flex items-center gap-1">
                              <span>{bay.name}</span>
                              {bay.hasMixedItems && (
                                <span className="bg-rose-600 text-white text-[9px] px-1 rounded font-bold">
                                  بها أصناف مختلفة
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-blue-200 font-normal">4 أدوار × جانبين</span>
                          </div>

                          {/* 4 Levels x 2 Sides */}
                          <div className="grid grid-cols-2 gap-1.5 flex-1">
                            
                            {/* Left Column: Side 2 (شمال 2) */}
                            <div className="flex flex-col gap-1.5">
                              <div className="text-[10px] font-bold text-blue-200 bg-[#163654] py-0.2 rounded text-center">
                                شمال (2)
                              </div>

                              {levelsFromTopToBottom.map((level) => {
                                const locCode = `${streetsData.warehouse}${bay.bayKey}${level}2`;
                                const existingLoc = bay.slotMap.get(`${level}2`);
                                const loc = existingLoc || locationMap.get(locCode.toUpperCase()) || {
                                  location: locCode,
                                  itemCode: '',
                                  description: '',
                                };
                                const isOccupied = Boolean(loc.itemCode && loc.itemCode.trim() !== '');
                                const isSelected = selectedLocation?.location.toUpperCase() === loc.location.toUpperCase();
                                
                                // All locations containing the same item as the selected location turn GREEN!
                                const isSameItem = Boolean(
                                  !isSelected && 
                                  selectedItemCode && 
                                  loc.itemCode && 
                                  sameItemLocsSet.has(loc.location.toUpperCase())
                                );

                                // Different item in bay -> Highlight RED!
                                const isDifferentInBay = Boolean(
                                  isOccupied && 
                                  bay.hasMixedItems && 
                                  bay.dominantItemCode && 
                                  loc.itemCode.trim() !== bay.dominantItemCode
                                );

                                const isSourceInMove = moveState.active && moveState.fromLocation === loc.location;
                                const isValidDest = moveState.active && Boolean(moveState.fromLocation) && !isOccupied;
                                const isSearchMatch = Boolean(
                                  (cleanItemSearch && loc.itemCode && loc.itemCode.toLowerCase().includes(cleanItemSearch)) ||
                                  (cleanLocSearch && loc.location.toLowerCase() === cleanLocSearch)
                                );

                                return (
                                  <LocationSlotItem
                                    key={`${level}2`}
                                    level={level}
                                    side="2"
                                    sideName="شمال"
                                    locData={loc}
                                    isOccupied={isOccupied}
                                    isSelected={isSelected}
                                    isSameItem={isSameItem}
                                    isDifferentInBay={isDifferentInBay}
                                    isValidDest={isValidDest}
                                    isSearchMatch={isSearchMatch}
                                    isSourceInMove={isSourceInMove}
                                    cardDensity={cardDensity}
                                    onSelect={onSelectLocation}
                                  />
                                );
                              })}
                            </div>

                            {/* Right Column: Side 1 (يمين 1) */}
                            <div className="flex flex-col gap-1.5">
                              <div className="text-[10px] font-bold text-blue-200 bg-[#163654] py-0.2 rounded text-center">
                                يمين (1)
                              </div>

                              {levelsFromTopToBottom.map((level) => {
                                const locCode = `${streetsData.warehouse}${bay.bayKey}${level}1`;
                                const existingLoc = bay.slotMap.get(`${level}1`);
                                const loc = existingLoc || locationMap.get(locCode.toUpperCase()) || {
                                  location: locCode,
                                  itemCode: '',
                                  description: '',
                                };
                                const isOccupied = Boolean(loc.itemCode && loc.itemCode.trim() !== '');
                                const isSelected = selectedLocation?.location.toUpperCase() === loc.location.toUpperCase();
                                
                                // All locations containing the same item as the selected location turn GREEN!
                                const isSameItem = Boolean(
                                  !isSelected && 
                                  selectedItemCode && 
                                  loc.itemCode && 
                                  sameItemLocsSet.has(loc.location.toUpperCase())
                                );

                                // Different item in bay -> Highlight RED!
                                const isDifferentInBay = Boolean(
                                  isOccupied && 
                                  bay.hasMixedItems && 
                                  bay.dominantItemCode && 
                                  loc.itemCode.trim() !== bay.dominantItemCode
                                );

                                const isSourceInMove = moveState.active && moveState.fromLocation === loc.location;
                                const isValidDest = moveState.active && Boolean(moveState.fromLocation) && !isOccupied;
                                const isSearchMatch = Boolean(
                                  (cleanItemSearch && loc.itemCode && loc.itemCode.toLowerCase().includes(cleanItemSearch)) ||
                                  (cleanLocSearch && loc.location.toLowerCase() === cleanLocSearch)
                                );

                                return (
                                  <LocationSlotItem
                                    key={`${level}1`}
                                    level={level}
                                    side="1"
                                    sideName="يمين"
                                    locData={loc}
                                    isOccupied={isOccupied}
                                    isSelected={isSelected}
                                    isSameItem={isSameItem}
                                    isDifferentInBay={isDifferentInBay}
                                    isValidDest={isValidDest}
                                    isSearchMatch={isSearchMatch}
                                    isSourceInMove={isSourceInMove}
                                    cardDensity={cardDensity}
                                    onSelect={onSelectLocation}
                                  />
                                );
                              })}
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom 5 KPI Summary Boxes */}
        <div className="mt-4 pt-3 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs w-full">
          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block leading-tight">المخزن الحالي</span>
              <strong className="font-mono text-sm text-slate-900">{streetsData.warehouse}</strong>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
            <Milestone className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block leading-tight">عدد الشوارع</span>
              <strong className="font-mono text-sm text-slate-900">{streetsData.streets.length}</strong>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block leading-tight">إجمالي الباكيات</span>
              <strong className="font-mono text-sm text-slate-900">{streetsData.totalBays}</strong>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 text-blue-700 font-bold shrink-0 text-center leading-none">☰</span>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block leading-tight">الأدوار</span>
              <strong className="font-mono text-xs text-slate-900">4 (A أرضي)</strong>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center gap-2 col-span-2 sm:col-span-1">
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block leading-tight">الجانبان</span>
              <strong className="text-xs text-slate-900">2 (شمال - يمين)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 5. BOTTOM DETAILS & COLOR GUIDE SECTION */}
      {showBottomDetails && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                دليل الألوان وتفاصيل الموقع المحدد
              </h3>
            </div>
            <button
              onClick={() => setShowBottomDetails(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              إخفاء لوحة التفاصيل ✕
            </button>
          </div>

          {/* 3 Detail Columns: Decomposition, Status Colors, Selected Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start">
            
            {/* Column 1: تفكيك كود الموقع */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 text-center">
                تفكيك كود الموقع (امتداد اللوكيشن)
              </h4>

              <div className="bg-[#0b2b48] text-white text-center py-1.5 px-3 rounded-lg font-mono text-sm font-bold tracking-widest">
                {activeDecomposition.rawCode}
              </div>

              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="space-y-0.5">
                  <div className="bg-[#bce0fd] text-[#0b2b48] font-bold text-xs py-1 rounded font-mono">
                    {activeDecomposition.warehouse}
                  </div>
                  <span className="text-[10px] text-slate-600 block">المخزن</span>
                </div>

                <div className="space-y-0.5">
                  <div className="bg-[#ffe8a8] text-[#8a5b00] font-bold text-xs py-1 rounded font-mono">
                    {activeDecomposition.bay}
                  </div>
                  <span className="text-[10px] text-slate-600 block">الباكية</span>
                </div>

                <div className="space-y-0.5">
                  <div className="bg-[#ffd2bc] text-[#9c3808] font-bold text-xs py-1 rounded font-mono">
                    {activeDecomposition.level}
                  </div>
                  <span className="text-[10px] text-slate-600 block">الدور</span>
                </div>

                <div className="space-y-0.5">
                  <div className="bg-[#e4d8fe] text-[#4f20b3] font-bold text-xs py-1 rounded font-mono">
                    {activeDecomposition.side}
                  </div>
                  <span className="text-[10px] text-slate-600 block">{activeDecomposition.sideName}</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200 flex justify-between text-xs text-slate-600">
                <span>الشارع:</span>
                <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  شارع {activeDecomposition.street}
                </span>
              </div>
            </div>

            {/* Column 2: دليل الألوان المعتمد */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 text-right">
                دليل الألوان المعتمد
              </h4>

              <div className="space-y-2 text-xs">
                {/* 1. White */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded bg-white border border-slate-300 inline-block shrink-0 shadow-2xs" />
                  <span className="text-slate-800 font-bold">لوكيشن أبيض: موقع ممتلئ بصنف الباكية العادي</span>
                </div>

                {/* 2. Red */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded bg-rose-50 border-2 border-rose-500 inline-block shrink-0" />
                  <span className="text-rose-950 font-black">تظليل أحمر: صنف مختلف في نفس الباكية (شاذ)</span>
                </div>

                {/* 3. Green */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded bg-emerald-600 border border-emerald-400 inline-block shrink-0" />
                  <span className="text-emerald-950 font-black">تظليل أخضر: الصنف المحدد وجميع مواقعه بالمخزن</span>
                </div>

                {/* 4. Empty */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded bg-slate-50 border border-dashed border-slate-300 inline-block shrink-0" />
                  <span className="text-slate-500 font-medium">لوكيشن فاضي: موقع شاغر بدون أي صنف</span>
                </div>
              </div>
            </div>

            {/* Column 3: بيانات الموقع المحدد */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 text-right">
                {activeLocation ? `الموقع: ${activeLocation.location}` : 'بيانات الموقع'}
              </h4>

              {activeLocation && activeLocation.itemCode ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-medium">كود الصنف:</span>
                    <span className="font-mono font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      {activeLocation.itemCode}
                    </span>
                  </div>

                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">اسم / وصف المنتج:</span>
                    <span className="font-bold text-slate-900">{activeLocation.description || 'بدون وصف'}</span>
                  </div>

                  {sameItemLocationsAsSelected.length > 1 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-900 block">
                        جميع مواقع هذا الصنف في المخزن ({sameItemLocationsAsSelected.length} موقع مضلل بالأخضر):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                        {sameItemLocationsAsSelected.map((l) => (
                          <button
                            key={l.location}
                            type="button"
                            onClick={() => onSelectLocation(l)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                              l.location.toUpperCase() === activeLocation.location.toUpperCase()
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-950 hover:bg-emerald-200 border border-emerald-300'
                            }`}
                          >
                            {l.location}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg text-center text-slate-500 font-medium text-xs border border-slate-200">
                  {activeLocation ? 'هذا الموقع شاغر (فاضي)' : 'اضغط على أي موقع لعرض بياناته'}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
