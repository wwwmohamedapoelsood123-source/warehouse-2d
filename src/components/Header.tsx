import React from 'react';
import { 
  Boxes, 
  Upload, 
  Download, 
  Trash2, 
  FileSpreadsheet, 
  BarChart3, 
  History, 
  ArrowLeftRight 
} from 'lucide-react';

interface HeaderProps {
  onOpenImport: () => void;
  onExportWarehouse: () => void;
  onClearWarehouse: () => void;
  activeTab: 'map' | 'pending' | 'history' | 'reports';
  setActiveTab: (tab: 'map' | 'pending' | 'history' | 'reports') => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenImport,
  onExportWarehouse,
  onClearWarehouse,
  activeTab,
  setActiveTab,
  pendingCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Title (Single text element wordmark) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                Warehouse 2D Location Manager
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                مُدير مواقع المخزن ونقل الأصناف
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean tab controls) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>خريطة المخزن</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>الحركات المعلقة</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 text-[10px] rounded-full bg-amber-500 text-white font-mono flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>سجل الحركات</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>التقارير وسعة المخزن</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImport}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="استيراد مواقع وأصناف من ملف Excel"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد Excel</span>
            </button>

            <button
              onClick={onExportWarehouse}
              className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors items-center gap-1.5 whitespace-nowrap"
              title="تصدير مواقع المخزن الحالية إلى Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>تصدير المخزن</span>
            </button>

            <button
              onClick={onClearWarehouse}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="مسح بيانات المخزن"
              aria-label="مسح بيانات المخزن"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'map' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            خريطة المخزن
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'pending' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            الحركات المعلقة
            {pendingCount > 0 && (
              <span className="px-1 text-[10px] rounded-full bg-amber-500 text-white font-mono">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'history' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            سجل الحركات
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            التقارير
          </button>
        </div>
      </div>
    </header>
  );
};
