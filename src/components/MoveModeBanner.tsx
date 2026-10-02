import React from 'react';
import { MoveModeState } from '../types/warehouse';
import { ArrowLeftRight, CheckCircle2, AlertTriangle, X, CornerDownLeft } from 'lucide-react';

interface MoveModeBannerProps {
  moveState: MoveModeState;
  onCancel: () => void;
  sameItemLocations: string[];
  errorMessage: string | null;
  clearErrorMessage: () => void;
}

export const MoveModeBanner: React.FC<MoveModeBannerProps> = ({
  moveState,
  onCancel,
  sameItemLocations,
  errorMessage,
  clearErrorMessage,
}) => {
  if (!moveState.active) return null;

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/70 p-4 shadow-sm">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-blue-950">
              {moveState.fromLocation 
                ? 'الخطوة 2: اختر موقعاً فارغاً كوجهة (TO)' 
                : 'الخطوة 1: اضغط على الموقع المصدر (FROM) الذي ترغب بنقل صنفه'}
            </h2>
            <p className="text-xs text-blue-700/90 mt-0.5">
              {moveState.fromLocation 
                ? 'اضغط على أي موقع فارغ لنقل الصنف إليه وإضافته للحركات المعلقة' 
                : 'اضغط على أي موقع ممتلئ بصنف لبدء عملية النقل'}
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 self-end sm:self-auto"
        >
          <X className="w-3.5 h-3.5" />
          <span>إلغاء وضع النقل</span>
        </button>
      </div>

      {/* Selected Source Details */}
      {moveState.fromLocation && (
        <div className="mt-3.5 pt-3.5 border-t border-blue-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* Source Box */}
          <div className="bg-white/90 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                المصدر المحدد (FROM):
              </span>
              <span className="font-mono font-bold text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {moveState.fromLocation}
              </span>
            </div>
            <div className="space-y-1 text-slate-700">
              <div>
                <span className="text-slate-500">كود الصنف: </span>
                <span className="font-mono font-semibold text-slate-900">{moveState.selectedItemCode}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-500">الوصف: </span>
                <span className="font-medium text-slate-900">{moveState.selectedDescription || '—'}</span>
              </div>
            </div>
          </div>

          {/* Same item locations summary */}
          <div className="bg-white/90 border border-blue-200 rounded-lg p-3">
            <span className="font-semibold text-blue-900 block mb-1.5">
              جميع أماكن وجود هذا الصنف ({sameItemLocations.length} مواقع):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
              {sameItemLocations.map((loc) => (
                <span
                  key={loc}
                  className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded ${
                    loc === moveState.fromLocation
                      ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {loc} {loc === moveState.fromLocation ? '(المصدر)' : ''}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Error message alert */}
      {errorMessage && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={clearErrorMessage}
            className="text-rose-600 hover:text-rose-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
