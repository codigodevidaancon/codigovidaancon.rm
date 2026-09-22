import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { QRScanner } from './components/QRScanner';
import { ScanHistory } from './components/ScanHistory';
import { CreateProfileView } from './components/CreateProfileView';
import { RegisteredProfilesView } from './components/RegisteredProfilesView';
import { PersonDetailModal } from './components/PersonDetailModal';
import { LifeCodePerson, ScanRecord, SyncStats } from './types';
import { storageService } from './services/storageService';
import { syncService } from './services/syncService';
import { ShieldAlert, Heart, CheckCircle2, Wifi, WifiOff, CloudUpload, Info } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'scanner' | 'history' | 'generator' | 'profiles'>('scanner');
  const [syncStats, setSyncStats] = useState<SyncStats>(syncService.getStats());
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [persons, setPersons] = useState<LifeCodePerson[]>([]);
  
  // Active Person for Modal View
  const [selectedPerson, setSelectedPerson] = useState<LifeCodePerson | null>(null);
  const [activeScanRecord, setActiveScanRecord] = useState<ScanRecord | undefined>(undefined);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => prev?.text === text ? null : prev);
    }, 4000);
  }, []);

  const refreshData = useCallback(() => {
    setScans(storageService.getScans());
    setPersons(storageService.getPersons());
    setSyncStats(syncService.getStats());
  }, []);

  // Subscribe to sync service and storage events
  useEffect(() => {
    refreshData();

    const unsubscribe = syncService.subscribe((stats) => {
      setSyncStats(stats);
      setScans(storageService.getScans());
    });

    const handleStorageChange = () => refreshData();
    const handleSyncCompleted = (e: any) => {
      refreshData();
      const count = e?.detail?.count || 0;
      if (count > 0) {
        showToast(`✔ Sincronización completada: ${count} registros asegurados en la nube`, 'success');
      }
    };

    window.addEventListener('codigo_vida_scan_added', handleStorageChange);
    window.addEventListener('codigo_vida_storage_change', handleStorageChange);
    window.addEventListener('codigo_vida_sync_completed', handleSyncCompleted);

    return () => {
      unsubscribe();
      window.removeEventListener('codigo_vida_scan_added', handleStorageChange);
      window.removeEventListener('codigo_vida_storage_change', handleStorageChange);
      window.removeEventListener('codigo_vida_sync_completed', handleSyncCompleted);
    };
  }, [refreshData, showToast]);

  // Handler when a QR is scanned
  const handlePersonScanned = (person: LifeCodePerson, rawText?: string) => {
    // 1. Guardar inmediatamente en la base local del dispositivo
    const isOnline = syncService.isEffectivelyOnline();
    const newScan = storageService.addScan(person, isOnline, {
      location: 'Ubicación actual de auxilio',
      notes: 'Código QR enfocado y reconocido con éxito.'
    });

    // 2. Refrescar estado local
    refreshData();
    setSelectedPerson(person);
    setActiveScanRecord(newScan);

    // 3. Sincronización automática con la nube si hay conexión
    if (isOnline) {
      showToast(`Código Vida de ${person.fullName} guardado localmente y sincronizando con la nube...`, 'info');
      syncService.syncPendingToCloud().then(result => {
        refreshData();
        if (result.success && result.count > 0) {
          showToast(`¡Ficha de ${person.preferredName} sincronizada con la nube!`, 'success');
        }
      });
    } else {
      showToast(`Modo sin conexión: Ficha de ${person.fullName} guardada en la base local. Se sincronizará automáticamente cuando vuelva internet.`, 'warning');
    }
  };

  const handleManualSync = async () => {
    showToast('Iniciando sincronización con la nube...', 'info');
    const res = await syncService.syncPendingToCloud();
    refreshData();
    showToast(res.message, res.success ? 'success' : 'warning');
  };

  const handleToggleSimulatedOffline = () => {
    const nextState = !syncStats.isSimulatedOffline;
    syncService.setSimulatedOffline(nextState);
    if (nextState) {
      showToast('Simulación Offline activada: los nuevos escaneos se guardarán solo en la base local hasta reconectar.', 'warning');
    } else {
      showToast('Conexión reanudada: se iniciará la sincronización automática con la nube.', 'success');
    }
  };

  const handleOpenDetailModal = (person: LifeCodePerson, scan?: ScanRecord) => {
    setSelectedPerson(person);
    setActiveScanRecord(scan);
  };

  const handleCloseDetailModal = () => {
    setSelectedPerson(null);
    setActiveScanRecord(undefined);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navigation & Status Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        syncStats={syncStats}
        onManualSync={handleManualSync}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
      />

      {/* Connectivity Alert Pill when in Offline / Simulated Mode */}
      {(!syncStats.isOnline || syncStats.isSimulatedOffline) && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600 shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-950 shrink-0" />
              <span>
                <strong>Modo Local Activo:</strong> La aplicación sigue funcionando 100% offline. Todos los escaneos se guardan en la base local y se sincronizarán con la nube automáticamente al restablecerse la conexión.
              </span>
            </div>
            {syncStats.isSimulatedOffline && (
              <button
                onClick={handleToggleSimulatedOffline}
                className="bg-amber-950 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-black shrink-0 ml-3"
              >
                Volver a Conectar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'scanner' && (
          <QRScanner onPersonScanned={handlePersonScanned} />
        )}

        {currentTab === 'history' && (
          <ScanHistory
            scans={scans}
            onSelectPerson={handleOpenDetailModal}
            onRefresh={refreshData}
            isSyncing={syncStats.isSyncing}
            onManualSync={handleManualSync}
          />
        )}

        {currentTab === 'generator' && (
          <CreateProfileView
            onProfileCreated={(newPerson) => {
              refreshData();
              showToast(`Ficha creada para ${newPerson.fullName}. QR listo para imprimir.`, 'success');
              // Optionally offer to jump to scanner or profiles
            }}
          />
        )}

        {currentTab === 'profiles' && (
          <RegisteredProfilesView
            persons={persons}
            onSelectPerson={(person) => handleOpenDetailModal(person)}
            onGoToScanner={() => setCurrentTab('scanner')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CÓDIGO VIDA</span>
            <span>· Sistema Comunitario de Auxilio Inmediato para Personas con Habilidades Diferentes</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Base Local: {scans.length} registros</span>
            <span>·</span>
            <span>Nube: {syncStats.syncedCount} sincronizados</span>
            <span>·</span>
            <span>Exportación en PDF activa</span>
          </div>
        </div>
      </footer>

      {/* Person Detail & Immediate Action Modal */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          scanRecord={activeScanRecord}
          onClose={handleCloseDetailModal}
          onScanUpdated={(updated) => {
            setActiveScanRecord(updated);
            refreshData();
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in shadow-xl">
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : toastMessage.type === 'warning'
              ? 'bg-amber-900 text-amber-100 border-amber-700'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-white/80" />
            <div className="flex-1">{toastMessage.text}</div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white font-bold text-sm leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
