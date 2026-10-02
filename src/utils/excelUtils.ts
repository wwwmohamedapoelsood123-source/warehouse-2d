import * as XLSX from 'xlsx';
import { WarehouseLocation, MoveHistoryRecord, decomposeLocationCode } from '../types/warehouse';

export interface ParseResult {
  success: boolean;
  locations?: WarehouseLocation[];
  errorMessage?: string;
  duplicates?: { location: string; count: number }[];
  totalRows?: number;
}

// Normalize column headers to handle Arabic and English variations
function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase();
  
  // Location aliases
  if (
    clean === 'location' || 
    clean === 'loc' || 
    clean === 'location code' || 
    clean === 'الموقع' || 
    clean === 'موقع' || 
    clean === 'كود الموقع' ||
    clean === 'مكان'
  ) {
    return 'location';
  }

  // Item Code aliases
  if (
    clean === 'item code' || 
    clean === 'itemcode' || 
    clean === 'item' || 
    clean === 'code' || 
    clean === 'sku' ||
    clean === 'كود الصنف' || 
    clean === 'كود المنتج' || 
    clean === 'الصنف' ||
    clean === 'رقم الصنف'
  ) {
    return 'itemCode';
  }

  // Description aliases
  if (
    clean === 'description' || 
    clean === 'desc' || 
    clean === 'item name' || 
    clean === 'product' ||
    clean === 'name' ||
    clean === 'الوصف' || 
    clean === 'وصف الصنف' || 
    clean === 'اسم الصنف' || 
    clean === 'اسم المنتج' ||
    clean === 'بيان الصنف'
  ) {
    return 'description';
  }

  return clean;
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        errorMessage: 'الملف المرفوع فارغ ولا يحتوي على أوراق عمل (Sheets).',
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Read as 2D array of rows to reliably inspect headers
    const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

    if (rawRows.length === 0) {
      return {
        success: false,
        errorMessage: 'ورقة العمل الأولى فارغة تماماً.',
      };
    }

    // Find the header row (first non-empty row)
    let headerRowIndex = -1;
    for (let i = 0; i < rawRows.length; i++) {
      if (rawRows[i] && rawRows[i].length > 0 && rawRows[i].some((cell: any) => cell !== undefined && cell !== null && String(cell).trim() !== '')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return {
        success: false,
        errorMessage: 'لم يتم العثور على عناوين الأعمدة في الملف.',
      };
    }

    const rawHeaders: string[] = rawRows[headerRowIndex].map((h: any) => String(h || '').trim());
    const headerMap: { [normalized: string]: number } = {};

    rawHeaders.forEach((header, index) => {
      const normalized = normalizeHeader(header);
      headerMap[normalized] = index;
    });

    // Check mandatory columns: Location
    if (headerMap['location'] === undefined) {
      return {
        success: false,
        errorMessage: `الملف يفتقد لعمود الموقع الأساسي (Location). الأعمدة الموجودة: [${rawHeaders.filter(Boolean).join(', ')}]. الأعمدة المطلوبة هي: Location, Item Code, Description.`,
      };
    }

    const locIdx = headerMap['location'];
    const itemIdx = headerMap['itemCode'];
    const descIdx = headerMap['description'];

    const locationsList: WarehouseLocation[] = [];
    const locationCounts: { [loc: string]: number } = {};
    const seenLocations = new Set<string>();

    for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      const rawLoc = row[locIdx];
      if (rawLoc === undefined || rawLoc === null || String(rawLoc).trim() === '') {
        continue; // skip rows without location
      }

      const locCode = String(rawLoc).trim();
      const itemCode = itemIdx !== undefined && row[itemIdx] !== undefined && row[itemIdx] !== null 
        ? String(row[itemIdx]).trim() 
        : '';
      const description = descIdx !== undefined && row[descIdx] !== undefined && row[descIdx] !== null 
        ? String(row[descIdx]).trim() 
        : '';

      locationCounts[locCode] = (locationCounts[locCode] || 0) + 1;

      // Decompose location code into street, bay, level, side
      const decomp = decomposeLocationCode(locCode);

      locationsList.push({
        location: locCode,
        itemCode: itemCode,
        description: description,
        zone: decomp.street,
        street: decomp.street,
        bay: decomp.bay,
        level: decomp.level,
        side: decomp.side,
      });
      seenLocations.add(locCode);
    }

    if (locationsList.length === 0) {
      return {
        success: false,
        errorMessage: 'لم يتم العثور على أي مواقع صالحة في الملف بعد قراءة الصفوف.',
      };
    }

    // Check for duplicates
    const duplicates: { location: string; count: number }[] = [];
    for (const [loc, count] of Object.entries(locationCounts)) {
      if (count > 1) {
        duplicates.push({ location: loc, count });
      }
    }

    return {
      success: true,
      locations: locationsList,
      duplicates: duplicates.length > 0 ? duplicates : undefined,
      totalRows: locationsList.length,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: `حدث خطأ أثناء قراءة ملف Excel: ${error?.message || 'تأكد من صيغة الملف'}`,
    };
  }
}

// Export Move History to Excel
export function exportMoveHistoryToExcel(history: MoveHistoryRecord[]) {
  const exportData = history.map((rec, index) => ({
    '#': index + 1,
    'التاريخ': rec.date,
    'الوقت': rec.time,
    'من (FROM)': rec.from,
    'إلى (TO)': rec.to,
    'كود الصنف (Item Code)': rec.itemCode,
    'وصف الصنف (Description)': rec.description,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل حركات المخزن');

  // Auto column widths
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 35 },
  ];

  XLSX.writeFile(workbook, `سجل_حركات_المخزن_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Export Current Warehouse State to Excel
export function exportWarehouseToExcel(locations: WarehouseLocation[]) {
  const exportData = locations.map((loc) => ({
    'Location': loc.location,
    'Item Code': loc.itemCode || '',
    'Description': loc.description || '',
    'الحالة': loc.itemCode ? 'ممتلئ' : 'فارغ',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'مواقع المخزن');

  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 20 },
    { wch: 40 },
    { wch: 12 },
  ];

  XLSX.writeFile(workbook, `مواقع_المخزن_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Download Sample Template Excel
export function downloadTemplateExcel() {
  const templateData = [
    { Location: 'G14001A1', 'Item Code': '10025', Description: 'زيت محرك 5W-30 تخليقي 4L' },
    { Location: 'G14001A2', 'Item Code': '10030', Description: 'فلتر هواء محرك أصلي' },
    { Location: 'G14001B1', 'Item Code': '', Description: '' },
    { Location: 'G14001B2', 'Item Code': '10040', Description: 'بواجي شمعات إشعال إيريديوم' },
    { Location: 'G14002A1', 'Item Code': '10055', Description: 'سائل فرامل DOT 4 عالي الأداء' },
    { Location: 'G14002A2', 'Item Code': '', Description: '' },
    { Location: 'G14006A1', 'Item Code': '10060', Description: 'أقمشة فرامل أمامية سيراميك' },
    { Location: 'G14006A2', 'Item Code': '10070', Description: 'حزام سير محرك دينامو 6PK' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج مواقع المخزن');

  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 20 },
    { wch: 35 },
  ];

  XLSX.writeFile(workbook, 'نموذج_مواقع_المخزن.xlsx');
}
