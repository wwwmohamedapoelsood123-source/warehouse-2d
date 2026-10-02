import React from 'react';
import { Search, MapPin, X, ArrowLeftRight, Filter, AlertCircle } from 'lucide-react';

interface SearchBarProps {
  itemSearchQuery: string;
  setItemSearchQuery: (val: string) => void;
  locationSearchQuery: string;
  setLocationSearchQuery: (val: string) => void;
  itemNotFound: boolean;
  locationNotFound: boolean;
  onClearSearch: () => void;
  isMoveModeActive: boolean;
  onStartMoveMode: () => void;
  onCancelMoveMode: () => void;
  statusFilter: 'all' | 'occupied' | 'empty';
  setStatusFilter: (status: 'all' | 'occupied' | 'empty') => void;
  availableZones: string[];
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  itemSearchQuery,
  setItemSearchQuery,
  locationSearchQuery,
  setLocationSearchQuery,
  itemNotFound,
  locationNotFound,
  onClearSearch,
  isMoveModeActive,
  onStartMoveMode,
  onCancelMoveMode,
  statusFilter,
  setStatusFilter,
  availableZones,
  selectedZone,
  setSelectedZone,
}) => {
  const hasActiveSearch = itemSearchQuery.trim() !== '' || locationSearchQuery.trim() !== '' || statusFilter !== 'all' || selectedZone !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Inputs Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          
          {/* Search by Item Code */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={itemSearchQuery}
              onChange={(e) => setItemSearchQuery(e.target.value)}
              placeholder="بحث عن الصنف بالكود (مثال: 10025)..."
              className={`w-full pr-9 pl-8 py-2 text-xs md:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono ${
                itemNotFound ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {itemSearchQuery && (
              <button
                onClick={() => setItemSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search by Location */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={locationSearchQuery}
              onChange={(e) => setLocationSearchQuery(e.target.value)}
              placeholder="بحث عن Location (مثال: A-015)..."
              className={`w-full pr-9 pl-8 py-2 text-xs md:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono ${
                locationNotFound ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {locationSearchQuery && (
              <button
                onClick={() => setLocationSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('occupied')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'occupied'
                  ? 'bg-white text-blue-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ممتلئ
            </button>
            <button
              onClick={() => setStatusFilter('empty')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'empty'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              فارغ
            </button>
          </div>

          {/* Zone / Aisle Selector */}
          {availableZones.length > 1 && (
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">كل الممرات</option>
              {availableZones.map((z) => (
                <option key={z} value={z}>
                  ممر {z}
                </option>
              ))}
            </select>
          )}

          {/* Clear Search Button */}
          {hasActiveSearch && (
            <button
              onClick={onClearSearch}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              <span>مسح البحث</span>
            </button>
          )}

          {/* New Move Button */}
          {!isMoveModeActive ? (
            <button
              onClick={onStartMoveMode}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>حركة نقل جديدة</span>
            </button>
          ) : (
            <button
              onClick={onCancelMoveMode}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              <span>إلغاء النقل</span>
            </button>
          )}

        </div>

      </div>

      {/* Search alerts / validation notices */}
      {(itemNotFound || locationNotFound) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-rose-600 animate-fadeIn">
          {itemNotFound && (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              لم يتم العثور على هذا الصنف.
            </span>
          )}
          {locationNotFound && (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              لم يتم العثور على هذا الـ Location.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
