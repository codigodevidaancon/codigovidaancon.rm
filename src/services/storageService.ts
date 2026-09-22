import { LifeCodePerson, ScanRecord } from '../types';
import { INITIAL_PERSONS } from '../data/mockPersons';

const STORAGE_KEYS = {
  PERSONS: 'codigo_vida_persons_v1',
  SCANS: 'codigo_vida_scans_v1',
  LAST_SYNC: 'codigo_vida_last_sync_v1',
  SIMULATED_OFFLINE: 'codigo_vida_simulated_offline_v1'
};

// Seed initial records if first run
function initializeStorage() {
  if (typeof window === 'undefined') return;

  const existingPersons = localStorage.getItem(STORAGE_KEYS.PERSONS);
  if (!existingPersons) {
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(INITIAL_PERSONS));
  }

  const existingScans = localStorage.getItem(STORAGE_KEYS.SCANS);
  if (!existingScans) {
    // Initial demonstration scan
    const initialScans: ScanRecord[] = [
      {
        id: 'scan-init-01',
        personId: INITIAL_PERSONS[0].id,
        person: INITIAL_PERSONS[0],
        scannedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        locationInfo: {
          description: 'Cerca a Estación Angamos, Lima'
        },
        syncStatus: 'synced',
        syncedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        rescuersNotes: 'Niño ubicado esperando en banca, se contactó a su madre Elena.',
        contactedFamily: true
      },
      {
        id: 'scan-init-02',
        personId: INITIAL_PERSONS[1].id,
        person: INITIAL_PERSONS[1],
        scannedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
        locationInfo: {
          description: 'Parque Kennedy, Miraflores'
        },
        syncStatus: 'pending', // Pending cloud sync to showcase offline status!
        rescuersNotes: 'Doña Carmen desorientada pero tranquila, cuidada en punto de serenazgo.',
        contactedFamily: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(initialScans));
  }
}

// Ensure storage is initialized on module load
initializeStorage();

export const storageService = {
  getPersons(): LifeCodePerson[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONS);
      if (!data) return INITIAL_PERSONS;
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading persons from storage', e);
      return INITIAL_PERSONS;
    }
  },

  getPersonById(id: string): LifeCodePerson | undefined {
    const list = this.getPersons();
    return list.find(p => p.id === id || p.codeNumber === id);
  },

  savePerson(person: LifeCodePerson): LifeCodePerson {
    const list = this.getPersons();
    const index = list.findIndex(p => p.id === person.id);
    let updated: LifeCodePerson[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = person;
    } else {
      updated = [person, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(updated));
    return person;
  },

  getScans(): ScanRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCANS);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading scans from storage', e);
      return [];
    }
  },

  addScan(person: LifeCodePerson, isOnline = true, options?: { location?: string; notes?: string }): ScanRecord {
    const newScan: ScanRecord = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      personId: person.id,
      person,
      scannedAt: new Date().toISOString(),
      locationInfo: {
        description: options?.location || 'Ubicación de auxilio en campo'
      },
      // If we are currently online and not simulated offline, it will attempt immediate sync
      syncStatus: isOnline ? 'pending' : 'pending',
      rescuersNotes: options?.notes || 'Escaneo de asistencia inmediata realizado.'
    };

    const scans = this.getScans();
    const updated = [newScan, ...scans];
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(updated));

    // Also notify any listening components
    window.dispatchEvent(new CustomEvent('codigo_vida_scan_added', { detail: newScan }));

    return newScan;
  },

  updateScan(scan: ScanRecord): void {
    const scans = this.getScans();
    const updated = scans.map(s => s.id === scan.id ? scan : s);
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('codigo_vida_scan_updated', { detail: scan }));
  },

  deleteScan(id: string): void {
    const scans = this.getScans();
    const filtered = scans.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('codigo_vida_storage_change'));
  },

  getPendingScans(): ScanRecord[] {
    const scans = this.getScans();
    return scans.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'failed');
  },

  markScansAsSynced(scanIds: string[], syncedTimestamp: string): void {
    const scans = this.getScans();
    const updated = scans.map(s => {
      if (scanIds.includes(s.id)) {
        return {
          ...s,
          syncStatus: 'synced' as const,
          syncedAt: syncedTimestamp
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, syncedTimestamp);
    window.dispatchEvent(new CustomEvent('codigo_vida_sync_completed', { detail: { count: scanIds.length } }));
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },

  getSimulatedOffline(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
  },

  setSimulatedOffline(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, String(value));
    window.dispatchEvent(new CustomEvent('codigo_vida_network_changed'));
  }
};
