import { WarehouseLocation, PendingMove, MoveHistoryRecord } from '../types/warehouse';
import { SAMPLE_LOCATIONS } from './sampleData';

const STORAGE_KEYS = {
  LOCATIONS: 'wh_2d_locations_v2',
  PENDING_MOVES: 'wh_2d_pending_moves_v2',
  MOVE_HISTORY: 'wh_2d_history_v2',
  INITIALIZED: 'wh_2d_init_v2',
};

export function loadSavedLocations(): WarehouseLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (!raw) {
      // First time initialization: populate with realistic demo data
      saveLocations(SAMPLE_LOCATIONS);
      return SAMPLE_LOCATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_LOCATIONS;
  } catch (e) {
    console.error('Failed to load locations from storage', e);
    return SAMPLE_LOCATIONS;
  }
}

export function saveLocations(locations: WarehouseLocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  } catch (e) {
    console.error('Failed to save locations to storage', e);
  }
}

export function loadSavedPendingMoves(): PendingMove[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_MOVES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load pending moves from storage', e);
    return [];
  }
}

export function savePendingMoves(moves: PendingMove[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_MOVES, JSON.stringify(moves));
  } catch (e) {
    console.error('Failed to save pending moves to storage', e);
  }
}

export function loadSavedMoveHistory(): MoveHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVE_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load move history from storage', e);
    return [];
  }
}

export function saveMoveHistory(history: MoveHistoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVE_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save move history to storage', e);
  }
}

export function clearAllWarehouseStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.PENDING_MOVES);
    localStorage.removeItem(STORAGE_KEYS.MOVE_HISTORY);
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}
