export interface WarehouseLocation {
  location: string;
  itemCode: string;
  description: string;
  zone?: string;
  aisle?: string;
  street?: string;
  bay?: string;
  level?: string;
  side?: string;
}

export interface LocationDecomposition {
  warehouse: string;
  street: string;
  bay: string;
  level: string;
  side: string;
  sideName: string;
  rawCode: string;
}

/**
 * Decomposes location codes according to the exact warehouse specification:
 * Pattern: G + [2 digits Warehouse] + [3 digits Bay] + [1 letter Level] + [1 digit Side: 1=يمين, 2=شمال]
 * Example: G14001A1 -> Warehouse: G14, Bay: 001, Level: A, Side: 1 (يمين)
 * Also supports 10-char variant with embedded 2-digit street: G1401001A1
 */
export function decomposeLocationCode(code: string, explicitStreet?: string): LocationDecomposition {
  const clean = (code || '').trim().toUpperCase();

  // Pattern A (User's Exact Specification):
  // G + 2 digits (Warehouse) + 3 digits (Bay) + 1 letter (Level) + 1 digit (Side)
  // Example: G14001A1, G14022B2
  const patternExact = /^([A-Z]\d{2})(\d{3})([A-Z])([12])$/i;
  const matchExact = clean.match(patternExact);
  if (matchExact) {
    const wh = matchExact[1];
    const bay = matchExact[2];
    const level = matchExact[3];
    const side = matchExact[4];

    // Compute street: if explicit street is provided, use it;
    // Otherwise, 5 bays per street row (001-005 -> Street 01, 006-010 -> Street 02, etc.)
    let street = explicitStreet;
    if (!street) {
      const bayNum = parseInt(bay, 10) || 1;
      const streetNum = Math.floor((bayNum - 1) / 5) + 1;
      street = String(streetNum).padStart(2, '0');
    }

    return {
      warehouse: wh,
      street: street,
      bay: bay,
      level: level,
      side: side,
      sideName: side === '1' ? 'يمين' : 'شمال',
      rawCode: clean,
    };
  }

  // Pattern B: 10-char with embedded 2-digit street (G14 + 01 + 001 + A + 1)
  const pattern10 = /^([A-Z]\d{2})(\d{2})(\d{3})([A-Z])([12])$/i;
  const match10 = clean.match(pattern10);
  if (match10) {
    const side = match10[5];
    return {
      warehouse: match10[1],
      street: match10[2],
      bay: match10[3],
      level: match10[4],
      side: side,
      sideName: side === '1' ? 'يمين' : 'شمال',
      rawCode: clean,
    };
  }

  // Pattern C: With dashes e.g. G14-001-A-1 or G14-01-001-A-1
  const patternDash = /^([A-Z0-9]+)[-_](\d+)[-_]([A-Z])[-_]?([12])?$/i;
  const matchDash = clean.match(patternDash);
  if (matchDash) {
    const bayNum = parseInt(matchDash[2], 10) || 1;
    const streetNum = Math.floor((bayNum - 1) / 5) + 1;
    const side = matchDash[4] || '1';
    return {
      warehouse: matchDash[1],
      street: String(streetNum).padStart(2, '0'),
      bay: matchDash[2].padStart(3, '0'),
      level: matchDash[3],
      side: side,
      sideName: side === '1' ? 'يمين' : 'شمال',
      rawCode: clean,
    };
  }

  // Pattern D: Legacy aisle format e.g. A-001
  const patternLegacy = /^([A-Z])[-_ ]?(\d+)$/i;
  const matchLegacy = clean.match(patternLegacy);
  if (matchLegacy) {
    const letter = matchLegacy[1];
    const num = parseInt(matchLegacy[2], 10) || 1;
    const letterCode = letter.charCodeAt(0) - 64;
    const street = String(Math.max(1, letterCode)).padStart(2, '0');
    const bay = String(num).padStart(3, '0');

    return {
      warehouse: 'G14',
      street: street,
      bay: bay,
      level: 'A',
      side: (num % 2 === 0) ? '2' : '1',
      sideName: (num % 2 === 0) ? 'شمال' : 'يمين',
      rawCode: clean,
    };
  }

  // Fallback
  return {
    warehouse: 'G14',
    street: '01',
    bay: '001',
    level: 'A',
    side: '1',
    sideName: 'يمين',
    rawCode: clean || 'G14001A1',
  };
}

export interface PendingMove {
  id: string;
  from: string;
  to: string;
  itemCode: string;
  description: string;
  createdAt: number;
}

export interface MoveHistoryRecord {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  itemCode: string;
  description: string;
  timestamp: number;
}

export interface MoveModeState {
  active: boolean;
  fromLocation: string | null;
  selectedItemCode: string | null;
  selectedDescription: string | null;
}

export interface TopItemReport {
  itemCode: string;
  description: string;
  count: number;
  percentage: number;
  locations: string[];
}

export interface WarehouseStats {
  total: number;
  occupied: number;
  empty: number;
  occupancyRate: number;
  uniqueItems: number;
}
