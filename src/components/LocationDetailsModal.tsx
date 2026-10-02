import React from 'react';
import { WarehouseLocation } from '../types/warehouse';
import { X, MapPin, Package, FileText, CheckCircle2, CircleDashed, ArrowLeftRight, Layers, Shapes, Sparkles } from 'lucide-react';
import { ItemShapeBadge } from './ItemShapeBadge';
import { getItemVisual } from '../utils/itemVisuals';

interface LocationDetailsModalProps {
  location: WarehouseLocation | null;
  onClose: () => void;
  onStartMoveFromHere: (loc: WarehouseLocation) => void;
  otherLocationsWithSameItem: string[];
}

export const LocationDetailsModal: React.FC<LocationDetailsModalProps> = ({
  location,
  onClose,
  onStartMoveFromHere,
  otherLocationsWithSameItem,
}) => {
  if (!location) return null;

  const isOccupied = Boolean(location.itemCode && location.itemCode.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden text-right"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>الموقع:</span>
                <span className="font-mono text-blue-700 text-lg font-bold">{location.location}</span>
              </h3>
              <p className="text-xs text-slate-500">تفاصيل الموقع المخزني</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500 font-medium">حالة الموقع (Status):</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isOccupied 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-slate-200 text-slate-700'
            }`}>
              {isOccupied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>ممتلئ (Occupied)</span>
                </>
              ) : (
                <>
                  <CircleDashed className="w-3.5 h-3.5 text-slate-500" />
                  <span>فارغ (EMPTY)</span>
                </>
              )}
            </span>
          </div>

          {/* Item details if occupied */}
          {isOccupied ? (
            <div className="space-y-3 border-t border-slate-100 pt-3">
              
              {/* Distinct Geometric Shape Showcase */}
              {(() => {
                const visual = getItemVisual(location.itemCode, location.description);
                return (
                  <div className="p-3 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ItemShapeBadge
                        itemCode={location.itemCode}
                        description={location.description}
                        size="lg"
                        shapeOnly
                      />
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Shapes className="w-3.5 h-3.5 text-blue-600" />
                          <span>الشكل الهندسي المخصص للصنف:</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <strong className="text-sm font-black" style={{ color: visual.primaryColor }}>
                            {visual.shapeSymbol} {visual.shapeNameAr}
                          </strong>
                          <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {visual.colorNameAr}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  كود الصنف (Item Code)
                </label>
                <div className="font-mono text-base font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 select-all">
                  {location.itemCode}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  وصف الصنف (Description)
                </label>
                <div className="text-sm font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 leading-relaxed">
                  {location.description || 'لا يوجد وصف مسجل'}
                </div>
              </div>

              {/* Other locations with same item */}
              {otherLocationsWithSameItem.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    أماكن أخرى يتواجد بها نفس الصنف ({otherLocationsWithSameItem.length} موقع):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-100">
                    {otherLocationsWithSameItem.map((otherLoc) => (
                      <span
                        key={otherLoc}
                        className="px-2 py-0.5 text-xs font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200/60 rounded"
                      >
                        {otherLoc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <CircleDashed className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">هذا الموقع فارغ حالياً</p>
              <p className="text-xs text-slate-400 mt-0.5">يمكنك نقل صنف إليه من أي موقع آخر</p>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            إغلاق
          </button>

          {isOccupied && (
            <button
              onClick={() => {
                onClose();
                onStartMoveFromHere(location);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>بدء نقل من هذا الموقع</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
