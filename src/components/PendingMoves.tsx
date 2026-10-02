import React from 'react';
import { PendingMove } from '../types/warehouse';
import { ArrowLeftRight, Trash2, Edit3, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface PendingMovesProps {
  pendingMoves: PendingMove[];
  onApplyMoves: () => void;
  onDeleteMove: (id: string) => void;
  onClearAllMoves: () => void;
  onEditMove: (move: PendingMove) => void;
}

export const PendingMoves: React.FC<PendingMovesProps> = ({
  pendingMoves,
  onApplyMoves,
  onDeleteMove,
  onClearAllMoves,
  onEditMove,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-600" />
            <span>الحركات المعلقة (Pending Moves)</span>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {pendingMoves.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حركات النقل المسجلة بانتظار المراجعة والاعتماد الفعلي
          </p>
        </div>

        {/* Action Controls */}
        {pendingMoves.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClearAllMoves}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>إلغاء كل الحركات</span>
            </button>

            <button
              onClick={onApplyMoves}
              className="px-4 py-2 text-xs md:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>تطبيق الحركات ({pendingMoves.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Table or Empty State */}
      {pendingMoves.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <ArrowLeftRight className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">لا توجد حركات معلقة حالياً</p>
          <p className="text-xs text-slate-400 mt-1">
            اضغط على &ldquo;حركة نقل جديدة&rdquo; في الخريطة لاختيار موقع مصدر وموقع وجهة فارغ
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold">من (FROM)</th>
                <th className="py-2.5 px-3 font-semibold text-center">مسار النقل</th>
                <th className="py-2.5 px-3 font-semibold">إلى (TO)</th>
                <th className="py-2.5 px-3 font-semibold">كود الصنف (Item Code)</th>
                <th className="py-2.5 px-3 font-semibold">وصف الصنف (Description)</th>
                <th className="py-2.5 px-3 font-semibold text-center w-28">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingMoves.map((move, index) => (
                <tr 
                  key={move.id}
                  className="hover:bg-amber-50/30 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-center text-slate-400">
                    {index + 1}
                  </td>
                  
                  {/* FROM */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-sm bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200 inline-block">
                      {move.from}
                    </span>
                  </td>

                  {/* Arrow Indicator */}
                  <td className="py-3 px-3 text-center text-slate-400">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600">
                      ←
                    </span>
                  </td>

                  {/* TO */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-sm bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200 inline-block">
                      {move.to}
                    </span>
                  </td>

                  {/* Item Code */}
                  <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                    {move.itemCode}
                  </td>

                  {/* Description */}
                  <td className="py-3 px-3 text-slate-600 font-medium max-w-xs truncate">
                    {move.description || '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditMove(move)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="تعديل الحركة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMove(move.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="حذف الحركة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
