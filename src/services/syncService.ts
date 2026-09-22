import { storageService } from './storageService';
import { SyncStats, ScanRecord } from '../types';

type SyncListener = (stats: SyncStats) => void;

class SyncService {
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private autoSyncTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
      window.addEventListener('codigo_vida_scan_added', () => this.triggerAutoSync());
      window.addEventListener('codigo_vida_network_changed', () => this.handleNetworkChange());

      // Periodic check for auto-sync every 25 seconds
      this.autoSyncTimer = window.setInterval(() => {
        if (this.isEffectivelyOnline() && !this.isSyncing) {
          const pending = storageService.getPendingScans();
          if (pending.length > 0) {
            this.syncPendingToCloud();
          }
        }
      }, 25000);
    }
  }

  public isEffectivelyOnline(): boolean {
    if (typeof window === 'undefined') return true;
    const browserOnline = navigator.onLine;
    const simulatedOffline = storageService.getSimulatedOffline();
    return browserOnline && !simulatedOffline;
  }

  public getStats(): SyncStats {
    const scans = storageService.getScans();
    const pending = storageService.getPendingScans();
    const synced = scans.filter(s => s.syncStatus === 'synced');
    const isOnline = this.isEffectivelyOnline();
    const simulatedOffline = storageService.getSimulatedOffline();

    return {
      isOnline,
      isSimulatedOffline: simulatedOffline,
      totalLocalScans: scans.length,
      pendingSyncCount: pending.length,
      syncedCount: synced.length,
      lastSyncTimestamp: storageService.getLastSyncTime(),
      isSyncing: this.isSyncing
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const stats = this.getStats();
    this.listeners.forEach(fn => fn(stats));
  }

  public handleNetworkChange() {
    this.notify();
    if (this.isEffectivelyOnline()) {
      this.triggerAutoSync();
    }
  }

  public setSimulatedOffline(value: boolean) {
    storageService.setSimulatedOffline(value);
    this.handleNetworkChange();
  }

  public async triggerAutoSync(): Promise<void> {
    if (!this.isEffectivelyOnline() || this.isSyncing) {
      this.notify();
      return;
    }
    await this.syncPendingToCloud();
  }

  public async syncPendingToCloud(): Promise<{ success: boolean; count: number; message: string }> {
    if (!this.isEffectivelyOnline()) {
      return {
        success: false,
        count: 0,
        message: 'No hay conexión a internet disponible. Los datos permanecen guardados en la base local.'
      };
    }

    const pending = storageService.getPendingScans();
    if (pending.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'Todo el historial ya está sincronizado con la nube.'
      };
    }

    this.isSyncing = true;
    this.notify();

    try {
      // Send payload to cloud sync API endpoint
      const response = await fetch('/api/cloud-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scans: pending,
          clientTimestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Error en servidor de sincronización: ${response.status}`);
      }

      const result = await response.json();
      const syncedIds: string[] = result.syncedIds || pending.map(p => p.id);
      const serverTimestamp = result.serverTimestamp || new Date().toISOString();

      storageService.markScansAsSynced(syncedIds, serverTimestamp);

      this.isSyncing = false;
      this.notify();

      return {
        success: true,
        count: syncedIds.length,
        message: `Sincronización exitosa: ${syncedIds.length} registros subidos a la nube.`
      };
    } catch (err: any) {
      console.warn('Fallo de conexión al sincronizar con la nube, reteniendo en base local:', err);
      // Fallback: If server is temporarily unreachable, fallback to client-side optimistic sync marking after delay
      // but only if online is true
      this.isSyncing = false;
      this.notify();

      return {
        success: false,
        count: 0,
        message: 'Error de red con la nube. Los registros están protegidos en la base local.'
      };
    }
  }
}

export const syncService = new SyncService();
