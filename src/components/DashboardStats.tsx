import React from 'react';
import { WarehouseStats } from '../types/warehouse';
import { Layers, CheckCircle2, CircleDashed, Percent, Package2, Clock } from 'lucide-react';

interface DashboardStatsProps {
  stats: WarehouseStats;
  pendingCount: number;
  onGoToPending?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  pendingCount,
  onGoToPending,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* Total Locations */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">إجمالي المواقع</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.total.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs text-slate-400">موقع</span>
        </div>
      </div>

      {/* Occupied Locations */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between bg-blue-50/20">
        <div className="flex items-center justify-between text-blue-700 mb-1">
          <span className="text-xs font-medium">المواقع الممتلئة</span>
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-blue-900 tabular-nums">
            {stats.occupied.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs text-blue-600">موقع</span>
        </div>
      </div>

      {/* Empty Locations */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">المواقع الفارغة</span>
          <CircleDashed className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-700 tabular-nums">
            {stats.empty.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs text-slate-400">موقع</span>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">نسبة الإشغال</span>
          <Percent className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.occupancyRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div 
            className={`h-full transition-all duration-300 ${
              stats.occupancyRate > 90 
                ? 'bg-rose-500' 
                : stats.occupancyRate > 75 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
            }`} 
            style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Unique Items */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">الأصناف المختلفة</span>
          <Package2 className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.uniqueItems.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs text-slate-400">صنف</span>
        </div>
      </div>

      {/* Pending Moves */}
      <div 
        onClick={onGoToPending}
        className={`bg-white border rounded-xl p-3.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-colors ${
          pendingCount > 0 
            ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/60' 
            : 'border-slate-200 hover:bg-slate-50/60'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">حركات معلقة</span>
          <Clock className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono tabular-nums ${pendingCount > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
            {pendingCount.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs text-slate-400">حركة</span>
        </div>
      </div>

    </div>
  );
};
