/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  WarehouseLocation, 
  PendingMove, 
  MoveHistoryRecord, 
  MoveModeState, 
  WarehouseStats 
} from './types/warehouse';
import { 
  loadSavedLocations, 
  saveLocations, 
  loadSavedPendingMoves, 
  savePendingMoves, 
  loadSavedMoveHistory, 
  saveMoveHistory, 
  clearAllWarehouseStorage 
} from './utils/storage';
import { exportWarehouseToExcel } from './utils/excelUtils';
import { SAMPLE_LOCATIONS } from './utils/sampleData';

import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { SearchBar } from './components/SearchBar';
import { MoveModeBanner } from './components/MoveModeBanner';
import { WarehouseMap } from './components/WarehouseMap';
import { LocationDetailsModal } from './components/LocationDetailsModal';
import { PendingMoves } from './components/PendingMoves';
import { EditMoveModal } from './components/EditMoveModal';
import { MoveHistory } from './components/MoveHistory';
import { ReportsSection } from './components/ReportsSection';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ConfirmClearModal } from './components/ConfirmClearModal';

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  // Primary state
  const [locations, setLocations] = useState<WarehouseLocation[]>(() => loadSavedLocations());
  const [pendingMoves, setPendingMoves] = useState<PendingMove[]>(() => loadSavedPendingMoves());
  const [moveHistory, setMoveHistory] = useState<MoveHistoryRecord[]>(() => loadSavedMoveHistory());

  // UI Navigation tab: map | pending | history | reports
  const [activeTab, setActiveTab] = useState<'map' | 'pending' | 'history' | 'reports'>('map');

  // Search & Filtering
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'empty'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Move Mode State
  const [moveState, setMoveState] = useState<MoveModeState>({
    active: false,
    fromLocation: null,
    selectedItemCode: null,
    selectedDescription: null,
  });
  const [moveErrorMessage, setMoveErrorMessage] = useState<string | null>(null);

  // Modals & Panels
  const [selectedLocationOnMap, setSelectedLocationOnMap] = useState<WarehouseLocation | null>(null);
  const [selectedLocationForDetails, setSelectedLocationForDetails] = useState<WarehouseLocation | null>(null);
  const [editingMove, setEditingMove] = useState<PendingMove | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  // Feedback Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Persist locations
  useEffect(() => {
    saveLocations(locations);
  }, [locations]);

  // Persist pending moves
  useEffect(() => {
    savePendingMoves(pendingMoves);
  }, [pendingMoves]);

  // Persist history
  useEffect(() => {
    saveMoveHistory(moveHistory);
  }, [moveHistory]);

  // Computed Warehouse Statistics
  const stats: WarehouseStats = useMemo(() => {
    const total = locations.length;
    const occupied = locations.filter((l) => l.itemCode && l.itemCode.trim() !== '').length;
    const empty = total - occupied;
    const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
    const uniqueItems = new Set(
      locations
        .filter((l) => l.itemCode && l.itemCode.trim() !== '')
        .map((l) => l.itemCode.trim())
    ).size;

    return { total, occupied, empty, occupancyRate, uniqueItems };
  }, [locations]);

  // Available Zones / Aisles
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((l) => {
      const z = l.zone || l.location.charAt(0).toUpperCase();
      if (z) set.add(z);
    });
    return Array.from(set).sort();
  }, [locations]);

  // Locations filtered by zone and status
  const visibleLocations = useMemo(() => {
    return locations.filter((loc) => {
      // Zone filter
      if (selectedZone !== 'all') {
        const z = loc.zone || loc.location.charAt(0).toUpperCase();
        if (z !== selectedZone) return false;
      }
      // Status filter
      const isOcc = Boolean(loc.itemCode && loc.itemCode.trim() !== '');
      if (statusFilter === 'occupied' && !isOcc) return false;
      if (statusFilter === 'empty' && isOcc) return false;

      return true;
    });
  }, [locations, selectedZone, statusFilter]);

  // Search validation check
  const itemNotFound = useMemo(() => {
    const query = itemSearchQuery.trim().toLowerCase();
    if (!query) return false;
    return !locations.some(
      (l) => l.itemCode && l.itemCode.toLowerCase().includes(query)
    );
  }, [itemSearchQuery, locations]);

  const locationNotFound = useMemo(() => {
    const query = locationSearchQuery.trim().toLowerCase();
    if (!query) return false;
    return !locations.some(
      (l) => l.location.toLowerCase() === query
    );
  }, [locationSearchQuery, locations]);

  // Auto-scroll to location when searched
  useEffect(() => {
    const query = locationSearchQuery.trim();
    if (!query) return;
    const match = locations.find((l) => l.location.toLowerCase() === query.toLowerCase());
    if (match) {
      const el = document.getElementById(`loc-${match.location}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [locationSearchQuery, locations]);

  // Same item locations when in move mode
  const sameItemLocationsInMove = useMemo(() => {
    if (!moveState.active || !moveState.selectedItemCode) return [];
    return locations
      .filter((l) => l.itemCode && l.itemCode.trim() === moveState.selectedItemCode)
      .map((l) => l.location);
  }, [moveState.active, moveState.selectedItemCode, locations]);

  // Other locations with same item for modal details
  const modalOtherLocationsWithSameItem = useMemo(() => {
    if (!selectedLocationForDetails || !selectedLocationForDetails.itemCode) return [];
    return locations
      .filter(
        (l) => 
          l.itemCode && 
          l.itemCode.trim() === selectedLocationForDetails.itemCode.trim() &&
          l.location !== selectedLocationForDetails.location
      )
      .map((l) => l.location);
  }, [selectedLocationForDetails, locations]);

  // Clear search handler
  const handleClearSearch = () => {
    setItemSearchQuery('');
    setLocationSearchQuery('');
    setStatusFilter('all');
    setSelectedZone('all');
  };

  // Start Move Mode from button
  const handleStartMoveMode = () => {
    setMoveState({
      active: true,
      fromLocation: null,
      selectedItemCode: null,
      selectedDescription: null,
    });
    setMoveErrorMessage(null);
    setActiveTab('map');
  };

  // Start Move Mode from specific location
  const handleStartMoveFromLocation = (loc: WarehouseLocation) => {
    if (!loc.itemCode || loc.itemCode.trim() === '') {
      setMoveErrorMessage('لا يمكن نقل موقع فارغ.');
      return;
    }
    setMoveState({
      active: true,
      fromLocation: loc.location,
      selectedItemCode: loc.itemCode,
      selectedDescription: loc.description || '',
    });
    setMoveErrorMessage(null);
    setActiveTab('map');
  };

  // Cancel Move Mode
  const handleCancelMoveMode = () => {
    setMoveState({
      active: false,
      fromLocation: null,
      selectedItemCode: null,
      selectedDescription: null,
    });
    setMoveErrorMessage(null);
  };

  // Card click handler
  const handleLocationClick = (loc: WarehouseLocation) => {
    // If NOT in move mode: DO NOT open modal, only highlight on map!
    if (!moveState.active) {
      if (!loc.location || selectedLocationOnMap?.location === loc.location) {
        setSelectedLocationOnMap(null); // toggle off if clicking same location or clearing
      } else {
        setSelectedLocationOnMap(loc);
      }
      return;
    }

    // IN MOVE MODE:
    // Step 1: choosing FROM
    if (!moveState.fromLocation) {
      const isOccupied = Boolean(loc.itemCode && loc.itemCode.trim() !== '');
      if (!isOccupied) {
        setMoveErrorMessage('هذا الموقع فارغ، يرجى اختيار موقع ممتلئ بصنف كمصدر (FROM).');
        return;
      }

      setMoveState({
        active: true,
        fromLocation: loc.location,
        selectedItemCode: loc.itemCode,
        selectedDescription: loc.description || '',
      });
      setMoveErrorMessage(null);
      return;
    }

    // Step 2: choosing TO
    // Check if clicked the same location
    if (loc.location === moveState.fromLocation) {
      setMoveErrorMessage('لا يمكن نقل الصنف إلى نفس الموقع.');
      return;
    }

    // Check if destination is occupied
    const isDestOccupied = Boolean(loc.itemCode && loc.itemCode.trim() !== '');
    if (isDestOccupied) {
      setMoveErrorMessage('لا يمكن نقل الصنف إلى Location ممتلئة.');
      return;
    }

    // Valid move! Create pending move
    const newMove: PendingMove = {
      id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      from: moveState.fromLocation,
      to: loc.location,
      itemCode: moveState.selectedItemCode || '',
      description: moveState.selectedDescription || '',
      createdAt: Date.now(),
    };

    setPendingMoves((prev) => [...prev, newMove]);
    showNotification(`تمت إضافة حركة النقل (${newMove.from} ← ${newMove.to}) إلى الحركات المعلقة.`);

    // Reset move state
    setMoveState({
      active: false,
      fromLocation: null,
      selectedItemCode: null,
      selectedDescription: null,
    });
    setMoveErrorMessage(null);
  };

  // Delete pending move
  const handleDeletePendingMove = (id: string) => {
    setPendingMoves((prev) => prev.filter((m) => m.id !== id));
    showNotification('تم حذف الحركة من قائمة الحركات المعلقة.', 'info');
  };

  // Clear all pending moves
  const handleClearAllPendingMoves = () => {
    setPendingMoves([]);
    showNotification('تم إلغاء جميع الحركات المعلقة.', 'info');
  };

  // Save edited move
  const handleSaveEditedMove = (updatedMove: PendingMove) => {
    setPendingMoves((prev) =>
      prev.map((m) => (m.id === updatedMove.id ? updatedMove : m))
    );
    setEditingMove(null);
    showNotification('تم تحديث حركة النقل بنجاح.', 'success');
  };

  // Apply Moves: executes all pending moves
  const handleApplyMoves = () => {
    if (pendingMoves.length === 0) return;

    // Validate all moves first
    const currentLocMap = new Map<string, WarehouseLocation>();
    locations.forEach((loc) => {
      currentLocMap.set(loc.location, { ...loc });
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newHistoryRecords: MoveHistoryRecord[] = [];

    for (const move of pendingMoves) {
      const fromLoc = currentLocMap.get(move.from);
      const toLoc = currentLocMap.get(move.to);

      if (!fromLoc || !fromLoc.itemCode || fromLoc.itemCode !== move.itemCode) {
        showNotification(
          `فشل التطبيق: الموقع المصدر (${move.from}) لم يعد يحتوي على الصنف (${move.itemCode}).`,
          'error'
        );
        return;
      }

      if (!toLoc || (toLoc.itemCode && toLoc.itemCode.trim() !== '')) {
        showNotification(
          `فشل التطبيق: موقع الوجهة (${move.to}) لم يعد فارغاً.`,
          'error'
        );
        return;
      }

      // Apply transfer in memory map
      toLoc.itemCode = fromLoc.itemCode;
      toLoc.description = fromLoc.description;
      fromLoc.itemCode = '';
      fromLoc.description = '';

      newHistoryRecords.push({
        id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        date: dateStr,
        time: timeStr,
        from: move.from,
        to: move.to,
        itemCode: move.itemCode,
        description: move.description,
        timestamp: Date.now(),
      });
    }

    // All valid: commit changes to state
    const updatedLocations = Array.from(currentLocMap.values());
    setLocations(updatedLocations);
    setMoveHistory((prev) => [...newHistoryRecords, ...prev]);
    setPendingMoves([]);

    showNotification(
      `تم تطبيق ${newHistoryRecords.length} حركة نقل بنجاح وتحديث خريطة المخزن!`,
      'success'
    );
    setActiveTab('map');
  };

  // Import confirmed from Excel
  const handleConfirmImport = (newLocations: WarehouseLocation[]) => {
    setLocations(newLocations);
    setPendingMoves([]);
    handleClearSearch();
    showNotification(
      `تم استيراد ${newLocations.length} موقع مخزني بنجاح!`,
      'success'
    );
  };

  // Clear all warehouse data confirmed
  const handleConfirmClearWarehouse = () => {
    clearAllWarehouseStorage();
    setLocations([]);
    setPendingMoves([]);
    setMoveHistory([]);
    handleClearSearch();
    handleCancelMoveMode();
    showNotification('تم مسح جميع بيانات المخزن بنجاح.', 'info');
  };

  // Quick filter from Reports table to highlight item
  const handleFilterByItemCode = (itemCode: string) => {
    setItemSearchQuery(itemCode);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header */}
      <Header
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportWarehouse={() => exportWarehouseToExcel(locations)}
        onClearWarehouse={() => setIsClearModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingMoves.length}
      />

      {/* Main Container: Full width when on map tab so all bays fit on screen */}
      <main className={`flex-1 w-full mx-auto py-4 sm:py-6 ${activeTab === 'map' ? 'max-w-none px-2 sm:px-4 lg:px-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
        
        {/* KPI Dashboard Stats Bar */}
        <DashboardStats
          stats={stats}
          pendingCount={pendingMoves.length}
          onGoToPending={() => setActiveTab('pending')}
        />

        {/* Global Floating Toast / Alert */}
        {notification && (
          <div className="fixed bottom-6 left-6 z-50 animate-fadeIn">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs md:text-sm font-semibold max-w-md ${
                notification.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : notification.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : notification.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="mr-auto p-1 hover:opacity-75"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Search Bar (always visible when on Map tab) */}
        {activeTab === 'map' && (
          <SearchBar
            itemSearchQuery={itemSearchQuery}
            setItemSearchQuery={setItemSearchQuery}
            locationSearchQuery={locationSearchQuery}
            setLocationSearchQuery={setLocationSearchQuery}
            itemNotFound={itemNotFound}
            locationNotFound={locationNotFound}
            onClearSearch={handleClearSearch}
            isMoveModeActive={moveState.active}
            onStartMoveMode={handleStartMoveMode}
            onCancelMoveMode={handleCancelMoveMode}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            availableZones={availableZones}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
          />
        )}

        {/* Move Mode Guide Banner */}
        {activeTab === 'map' && (
          <MoveModeBanner
            moveState={moveState}
            onCancel={handleCancelMoveMode}
            sameItemLocations={sameItemLocationsInMove}
            errorMessage={moveErrorMessage}
            clearErrorMessage={() => setMoveErrorMessage(null)}
          />
        )}

        {/* TAB 1: Warehouse 2D Map */}
        {activeTab === 'map' && (
          <WarehouseMap
            locations={visibleLocations}
            onSelectLocation={handleLocationClick}
            selectedLocation={selectedLocationOnMap}
            itemSearchQuery={itemSearchQuery}
            locationSearchQuery={locationSearchQuery}
            moveState={moveState}
            sameItemLocations={sameItemLocationsInMove}
          />
        )}

        {/* TAB 2: Pending Moves */}
        {activeTab === 'pending' && (
          <PendingMoves
            pendingMoves={pendingMoves}
            onApplyMoves={handleApplyMoves}
            onDeleteMove={handleDeletePendingMove}
            onClearAllMoves={handleClearAllPendingMoves}
            onEditMove={(move) => setEditingMove(move)}
          />
        )}

        {/* TAB 3: Move History */}
        {activeTab === 'history' && (
          <MoveHistory
            history={moveHistory}
            onClearHistory={() => {
              setMoveHistory([]);
              showNotification('تم مسح سجل الحركات.', 'info');
            }}
          />
        )}

        {/* TAB 4: Reports */}
        {activeTab === 'reports' && (
          <ReportsSection
            locations={locations}
            stats={stats}
            onFilterByItemCode={handleFilterByItemCode}
          />
        )}

        {/* Below Map Quick Sections: Show Pending Moves overview if any exist while on Map tab */}
        {activeTab === 'map' && pendingMoves.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <PendingMoves
              pendingMoves={pendingMoves}
              onApplyMoves={handleApplyMoves}
              onDeleteMove={handleDeletePendingMove}
              onClearAllMoves={handleClearAllPendingMoves}
              onEditMove={(move) => setEditingMove(move)}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>Warehouse 2D Location Manager · إدارة مواقع المخزن وحركات النقل</p>
          <div className="flex items-center gap-3">
            <span>مواقع المخزن: <strong className="font-mono text-slate-700">{locations.length}</strong></span>
            <span>·</span>
            <span>الحركات المعلقة: <strong className="font-mono text-slate-700">{pendingMoves.length}</strong></span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Location Details Modal */}
      <LocationDetailsModal
        location={selectedLocationForDetails}
        onClose={() => setSelectedLocationForDetails(null)}
        onStartMoveFromHere={handleStartMoveFromLocation}
        otherLocationsWithSameItem={modalOtherLocationsWithSameItem}
      />

      {/* 2. Edit Pending Move Modal */}
      <EditMoveModal
        move={editingMove}
        locations={locations}
        onClose={() => setEditingMove(null)}
        onSave={handleSaveEditedMove}
      />

      {/* 3. Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleConfirmImport}
        hasExistingData={locations.length > 0}
        hasPendingMoves={pendingMoves.length > 0}
      />

      {/* 4. Confirm Clear Warehouse Modal */}
      <ConfirmClearModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearWarehouse}
        totalLocations={locations.length}
      />

    </div>
  );
}
