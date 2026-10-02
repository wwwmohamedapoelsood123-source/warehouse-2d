import React, { useMemo } from 'react';
import { WarehouseLocation, WarehouseStats, TopItemReport } from '../types/warehouse';
import { BarChart3, TrendingUp, Layers, CheckCircle2, CircleDashed, Percent, Package2 } from 'lucide-react';

interface ReportsSectionProps {
  locations: WarehouseLocation[];
  stats: WarehouseStats;
  onFilterByItemCode: (itemCode: string) => void;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  locations,
  stats,
  onFilterByItemCode,
}) => {
  // Compute top distributed items
  const topItems: TopItemReport[] = useMemo(() => {
    const map: { [code: string]: { desc: string; locations: string[] } } = {};

    locations.forEach((loc) => {
      if (!loc.itemCode || loc.itemCode.trim() === '') return;
      const code = loc.itemCode.trim();
      if (!map[code]) {
        map[code] = {
          desc: loc.description || '',
          locations: [],
        };
      }
      map[code].locations.push(loc.location);
    });

    const list: TopItemReport[] = Object.keys(map).map((code) => {
      const count = map[code].locations.length;
      return {
        itemCode: code,
        description: map[code].desc,
        count: count,
        percentage: stats.occupied > 0 ? (count / stats.occupied) * 100 : 0,
        locations: map[code].locations,
      };
    });

    // Sort descending by count
    return list.sort((a, b) => b.count - a.count);
  }, [locations, stats.occupied]);

  return (
    <div className="space-y-6 mb-8">
      
      {/* Capacity Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>تقرير حالة سعة المخزن (Capacity Report)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              مؤشرات الإشغال وتوزيع الفراغات المتاحة داخل المخزن
            </p>
          </div>
          <span className="font-mono text-xl font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 tabular-nums">
            {stats.occupancyRate.toFixed(1)}% إشغال
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-blue-700">
              المواقع المشغولة: {stats.occupied} موقع ({stats.occupancyRate.toFixed(1)}%)
            </span>
            <span className="text-slate-500">
              المواقع الشاغرة: {stats.empty} موقع ({(100 - stats.occupancyRate).toFixed(1)}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
              title={`نسبة الإشغال: ${stats.occupancyRate.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* 4 KPI breakdown boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-500 block mb-1">إجمالي المواقع</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {stats.total}
            </span>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
            <span className="text-blue-700 block mb-1">المواقع الممتلئة</span>
            <span className="text-lg font-bold font-mono text-blue-900 tabular-nums">
              {stats.occupied}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-500 block mb-1">المواقع الفارغة</span>
            <span className="text-lg font-bold font-mono text-slate-700 tabular-nums">
              {stats.empty}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-500 block mb-1">عدد الأصناف الفريدة</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {stats.uniqueItems}
            </span>
          </div>
        </div>

      </div>

      {/* Top Distributed Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>أكثر الأصناف انتشارًا في المخزن (Top Distributed Items)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ترتيب تنازلي للأصناف حسب عدد مواقع التخزين التي تشغلها
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            إجمالي الأصناف: {topItems.length}
          </span>
        </div>

        {topItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-xs">لا توجد أصناف مخزنة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">كود الصنف (Item Code)</th>
                  <th className="py-2.5 px-3">وصف الصنف (Description)</th>
                  <th className="py-2.5 px-3 text-center">عدد المواقع (Locations Count)</th>
                  <th className="py-2.5 px-3 text-center">نسبة الاستحواذ</th>
                  <th className="py-2.5 px-3">المواقع المشغولة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topItems.map((item, idx) => (
                  <tr key={item.itemCode} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-center text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onFilterByItemCode(item.itemCode)}
                        className="font-mono font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                        title="تظليل مواقع هذا الصنف في الخريطة"
                      >
                        {item.itemCode}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium max-w-sm truncate">
                      {item.description || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {item.count}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600 tabular-nums">
                      {item.percentage.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {item.locations.slice(0, 8).map((loc) => (
                          <span
                            key={loc}
                            className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded"
                          >
                            {loc}
                          </span>
                        ))}
                        {item.locations.length > 8 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{item.locations.length - 8} أخرى
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
