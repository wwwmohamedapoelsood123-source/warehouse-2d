import React, { useState, useEffect } from 'react';
import { PendingMove, WarehouseLocation } from '../types/warehouse';
import { X, Edit3, AlertCircle, ArrowLeftRight, Check } from 'lucide-react';

interface EditMoveModalProps {
  move: PendingMove | null;
  locations: WarehouseLocation[];
  onClose: () => void;
  onSave: (updatedMove: PendingMove) => void;
}

export const EditMoveModal: React.FC<EditMoveModalProps> = ({
  move,
  locations,
  onClose,
  onSave,
}) => {
  if (!move) return null;

  const [fromLoc, setFromLoc] = useState<string>(move.from);
  const [toLoc, setToLoc] = useState<string>(move.to);
  const [error, setError] = useState<string | null>(null);

  // Available FROM locations: any occupied location
  const occupiedLocations = locations.filter((loc) => loc.itemCode && loc.itemCode.trim() !== '');

  // Available TO locations: empty locations, plus the current move.to (which is empty in warehouse)
  const emptyLocations = locations.filter(
    (loc) => (!loc.itemCode || loc.itemCode.trim() === '') || loc.location === move.to
  );

  // Find item details for currently selected FROM
  const currentFromItem = locations.find((l) => l.location === fromLoc);

  useEffect(() => {
    setError(null);
  }, [fromLoc, toLoc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromLoc || !toLoc) {
      setError('يرجى اختيار موقع المصدر وموقع الوجهة.');
      return;
    }

    if (fromLoc === toLoc) {
      setError('لا يمكن أن يكون موقع المصدر هو نفس موقع الوجهة.');
      return;
    }

    const targetLoc = locations.find((l) => l.location === toLoc);
    if (targetLoc && targetLoc.itemCode && targetLoc.location !== move.to) {
      setError('لا يمكن نقل الصنف إلى Location ممتلئة.');
      return;
    }

    const sourceLoc = locations.find((l) => l.location === fromLoc);
    if (!sourceLoc || !sourceLoc.itemCode) {
      setError('موقع المصدر المحدد فارغ ولا يحتوي على صنف لنقله.');
      return;
    }

    onSave({
      ...move,
      from: fromLoc,
      to: toLoc,
      itemCode: sourceLoc.itemCode,
      description: sourceLoc.description || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden text-right"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">تعديل حركة النقل</h3>
              <p className="text-xs text-slate-500">تحديث موقع المصدر أو موقع الوجهة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* FROM selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              موقع المصدر (FROM):
            </label>
            <select
              value={fromLoc}
              onChange={(e) => setFromLoc(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {occupiedLocations.map((loc) => (
                <option key={loc.location} value={loc.location}>
                  {loc.location} — {loc.itemCode} ({loc.description || 'بدون وصف'})
                </option>
              ))}
            </select>
          </div>

          {/* Current selected item summary */}
          {currentFromItem && (
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">الصنف المنقول:</span>
                <span className="font-mono font-bold text-blue-900">{currentFromItem.itemCode}</span>
              </div>
              <div className="text-slate-600 truncate">{currentFromItem.description || '—'}</div>
            </div>
          )}

          {/* TO selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              موقع الوجهة الفارغ (TO):
            </label>
            <select
              value={toLoc}
              onChange={(e) => setToLoc(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {emptyLocations.map((loc) => (
                <option key={loc.location} value={loc.location}>
                  {loc.location} {loc.location === move.to ? '(الوجهة الحالية)' : '(موقع فارغ)'}
                </option>
              ))}
            </select>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ التعديل</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
