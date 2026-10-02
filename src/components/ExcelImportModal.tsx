import React, { useState, useRef } from 'react';
import { WarehouseLocation } from '../types/warehouse';
import { parseExcelFile, downloadTemplateExcel, ParseResult } from '../utils/excelUtils';
import { SAMPLE_LOCATIONS } from '../utils/sampleData';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (locations: WarehouseLocation[]) => void;
  hasExistingData: boolean;
  hasPendingMoves: boolean;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
  hasExistingData,
  hasPendingMoves,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [confirmedOverwrite, setConfirmedOverwrite] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setParseResult(null);

    const result = await parseExcelFile(selectedFile);
    setParseResult(result);
    setLoading(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setLoading(true);
    setParseResult(null);

    const result = await parseExcelFile(droppedFile);
    setParseResult(result);
    setLoading(false);
  };

  // Compute summary stats from parsed locations
  let summary = null;
  if (parseResult?.success && parseResult.locations) {
    const locs = parseResult.locations;
    const occupied = locs.filter((l) => l.itemCode && l.itemCode.trim() !== '').length;
    const empty = locs.length - occupied;
    const uniqueItems = new Set(
      locs.filter((l) => l.itemCode && l.itemCode.trim() !== '').map((l) => l.itemCode)
    ).size;

    summary = {
      total: locs.length,
      occupied,
      empty,
      uniqueItems,
    };
  }

  const handleApply = () => {
    if (!parseResult?.locations) return;
    onConfirmImport(parseResult.locations);
    handleClose();
  };

  const handleLoadSample = () => {
    onConfirmImport(SAMPLE_LOCATIONS);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParseResult(null);
    setConfirmedOverwrite(false);
    onClose();
  };

  const needsConfirmation = (hasExistingData || hasPendingMoves) && !confirmedOverwrite;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-right flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">استيراد ملف مواقع المخزن (Excel)</h3>
              <p className="text-xs text-slate-500">رفع ملف .xlsx أو .xls أو .csv لتحديث مواقع المخزن</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Notice about format */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
            <span className="font-semibold block">الأعمدة الأساسية المطلوبة:</span>
            <div className="font-mono text-[11px] bg-white/80 p-1.5 rounded border border-blue-200/50 text-blue-800">
              Location | Item Code | Description
            </div>
            <p className="text-[11px] text-blue-700">
              * إذا كان Item Code فارغاً، سيتم احتساب الموقع كـ فارغ (EMPTY).
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              {file ? file.name : 'اسحب وأفلت ملف Excel هنا أو اضغط للاختيار'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              يدعم ملفات بصيغة XLSX و XLS و CSV
            </p>
          </div>

          {/* Quick Helper Actions: Template Download & Sample Dataset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={downloadTemplateExcel}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>تحميل نموذج Excel فارغ</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>استخدام بيانات تجريبية جاهزة</span>
            </button>
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="py-4 text-center text-xs text-slate-500">
              جاري قراءة وتحليل بيانات الملف...
            </div>
          )}

          {/* Parse Error Alert */}
          {parseResult && !parseResult.success && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">خطأ في التحقق من الملف:</span>
                <span>{parseResult.errorMessage}</span>
              </div>
            </div>
          )}

          {/* Duplicate Locations Warning */}
          {parseResult?.duplicates && parseResult.duplicates.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>تنبيه: تم رصد مواقع مكررة في الملف!</span>
              </div>
              <p className="text-[11px] text-amber-800">
                تم العثور على {parseResult.duplicates.length} موقع متكرر بالملف. لن يتم فقدان البيانات، وسيتم الاحتفاظ بالمواقع كما وردت.
              </p>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1 font-mono text-[10px]">
                {parseResult.duplicates.map((d) => (
                  <span key={d.location} className="bg-amber-200/70 text-amber-950 px-1.5 py-0.5 rounded">
                    {d.location} ({d.count} مرات)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Successful Parse Summary */}
          {summary && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم التحقق من الملف بنجاح! ملخص البيانات المستخرجة:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 text-center">
                  <span className="text-slate-500 block text-[11px]">إجمالي المواقع</span>
                  <span className="text-base font-bold font-mono text-slate-900">{summary.total}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 text-center">
                  <span className="text-blue-600 block text-[11px]">الممتلئة</span>
                  <span className="text-base font-bold font-mono text-blue-900">{summary.occupied}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 text-center">
                  <span className="text-slate-500 block text-[11px]">الفارغة</span>
                  <span className="text-base font-bold font-mono text-slate-700">{summary.empty}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 text-center">
                  <span className="text-slate-500 block text-[11px]">أصناف فريدة</span>
                  <span className="text-base font-bold font-mono text-slate-900">{summary.uniqueItems}</span>
                </div>
              </div>

              {/* Overwrite Confirmation Checkbox */}
              {(hasExistingData || hasPendingMoves) && (
                <div className="pt-2 border-t border-emerald-200/60">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedOverwrite}
                      onChange={(e) => setConfirmedOverwrite(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>
                      أؤكد استبدال بيانات المخزن الحالية بالبيانات الجديدة المستوردة
                      {hasPendingMoves && ' (سيتم إلغاء الحركات المعلقة أيضاً)'}.
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={!summary || needsConfirmation}
            onClick={handleApply}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              summary && !needsConfirmation
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعتماد واستيراد المواقع ({summary?.total || 0})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
