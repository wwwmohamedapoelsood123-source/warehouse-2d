import React, { useState, useMemo } from 'react';
import { WarehouseLocation } from '../types/warehouse';
import { getItemVisual } from '../utils/itemVisuals';
import { ItemShapeBadge } from './ItemShapeBadge';
import { Shapes, Filter, Check, X, Search, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ItemShapesLegendProps {
  locations: WarehouseLocation[];
  selectedItemCode: string | null;
  onSelectItem: (itemCode: string | null) => void;
}

export const ItemShapesLegend: React.FC<ItemShapesLegendProps> = ({
  locations,
  selectedItemCode,
  onSelectItem,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Extract all unique items present in warehouse with location counts
  const uniqueItems = useMemo(() => {
    const map = new Map<string, { itemCode: string; description: string; count: number }>();

    locations.forEach((loc) => {
      if (!loc.itemCode || loc.itemCode.trim() === '') return;
      const code = loc.itemCode.trim();
      const existing = map.get(code);
      if (existing) {
        existing.count += 1;
        if (!existing.description && loc.description) {
          existing.description = loc.description;
        }
      } else {
        map.set(code, {
          itemCode: code,
          description: loc.description || '',
          count: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [locations]);

  // Filtered list based on search
  const filteredItems = useMemo(() => {
    if (!filterQuery.trim()) return uniqueItems;
    const q = filterQuery.toLowerCase().trim();
    return uniqueItems.filter((item) => {
      const visual = getItemVisual(item.itemCode, item.description);
      return (
        item.itemCode.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        visual.shapeNameAr.toLowerCase().includes(q) ||
        visual.colorNameAr.toLowerCase().includes(q)
      );
    });
  }, [uniqueItems, filterQuery]);

  if (uniqueItems.length === 0) return null;

  return (
    <div className="bg-white border-2 border-[#163b5e]/20 rounded-2xl shadow-sm overflow-hidden mb-3">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-[#0b2b48] to-[#154673] text-white px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
            <Shapes className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>دليل وتمييز أشكال الأصناف</span>
                <span className="text-[11px] font-normal bg-white/20 px-2 py-0.2 rounded-full">
                  كل صنف له شكل هندسي ولون مميز
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-blue-200">
              اضغط على أي صنف لتظليله فوراً في جميع مواقع المخزن
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedItemCode && (
            <button
              onClick={() => onSelectItem(null)}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء التظليل المحدد ({selectedItemCode})</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 flex items-center gap-1 text-xs px-2 cursor-pointer transition-colors"
          >
            <span>{isExpanded ? 'طي الشريط' : 'عرض الأصناف'} ({uniqueItems.length})</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content: Horizontal Carousel / Grid of Shapes */}
      {isExpanded && (
        <div className="p-3 bg-slate-50/70 border-t border-slate-200 space-y-2">
          
          {/* Quick Search inside shapes */}
          {uniqueItems.length > 6 && (
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="ابحث باسم الشكل (سداسي، نجمة...) أو كود الصنف..."
                className="w-full text-xs pr-8 pl-6 py-1 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Cards of unique items and their shapes */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            {filteredItems.map((item) => {
              const isSelected = selectedItemCode === item.itemCode;
              const visual = getItemVisual(item.itemCode, item.description);

              return (
                <button
                  key={item.itemCode}
                  type="button"
                  onClick={() => onSelectItem(isSelected ? null : item.itemCode)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-right transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400 scale-[1.03]'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                  title={`${item.description || 'بدون وصف'} | شكل: ${visual.shapeNameAr} | مواقع: ${item.count}`}
                >
                  {/* Distinct SVG Shape */}
                  <ItemShapeBadge
                    itemCode={item.itemCode}
                    description={item.description}
                    size="md"
                    shapeOnly
                  />

                  {/* Item Text & Shape Info */}
                  <div className="flex flex-col text-right pr-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {item.itemCode}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected 
                          ? 'bg-emerald-800 text-emerald-100' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.count} موقع
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {visual.shapeNameAr}
                      </span>
                      <span className="text-[10px] opacity-60">·</span>
                      <span 
                        className={`text-[10px] font-medium truncate max-w-[130px] ${
                          isSelected ? 'text-emerald-50' : 'text-slate-600'
                        }`}
                      >
                        {item.description || 'بدون وصف'}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-emerald-800 flex items-center justify-center shrink-0 mr-1 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
