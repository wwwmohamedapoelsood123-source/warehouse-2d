import React, { useState } from 'react';
import { MoveHistoryRecord } from '../types/warehouse';
import { History, Download, Trash2, Search, ArrowLeftRight, Calendar, Clock } from 'lucide-react';
import { exportMoveHistoryToExcel } from '../utils/excelUtils';

interface MoveHistoryProps {
  history: MoveHistoryRecord[];
  onClearHistory: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      item.from.toLowerCase().includes(term) ||
      item.to.toLowerCase().includes(term) ||
      item.itemCode.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.date.includes(term)
    );
  });

  const handleExport = () => {
    if (history.length === 0) return;
    exportMoveHistoryToExcel(history);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>سجل الحركات المنفذة (Move History)</span>
            <span className="text-xs font-mono font-medium text-slate-500">
              ({history.length} حركة)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            أرشيف كامل لجميع عمليات نقل الأصناف التي تمت وتطبيقها في المخزن
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                title="تصدير سجل الحركات إلى ملف Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير سجل الحركات Excel</span>
              </button>

              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                title="مسح سجل الحركات"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح السجل</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter search if history is non-empty */}
      {history.length > 0 && (
        <div className="mb-4">
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="فلترة السجل برقم الصنف، الموقع، التاريخ..."
              className="w-full pr-9 pl-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Content Table or Empty State */}
      {history.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">لا توجد حركات منفذة في السجل بعد</p>
          <p className="text-xs text-slate-400 mt-1">
            عند الضغط على &ldquo;تطبيق الحركات&rdquo; سيتم توثيق كل حركة هنا مع التاريخ والوقت
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <p className="text-xs">لا توجد حركات تطابق معيار البحث</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">الوقت</th>
                <th className="py-2.5 px-3">من (FROM)</th>
                <th className="py-2.5 px-3 text-center">المسار</th>
                <th className="py-2.5 px-3">إلى (TO)</th>
                <th className="py-2.5 px-3">كود الصنف (Item Code)</th>
                <th className="py-2.5 px-3">وصف الصنف (Description)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredHistory.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-center text-slate-400">
                    {filteredHistory.length - idx}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{item.date}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.time}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {item.from}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-400">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                      ←
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {item.to}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                    {item.itemCode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-sm">
                    {item.description || '—'}
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
