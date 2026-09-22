export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Desconocido';

export type CommunicationMode = 
  | 'verbal' 
  | 'semi-verbal' 
  | 'no-verbal' 
  | 'lengua-senas' 
  | 'pictogramas'
  | 'asistido';

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
}

export interface LifeCodePerson {
  id: string;
  codeNumber: string; // Ej: CV-PE-8842
  fullName: string;
  preferredName: string; // Apodo o nombre afectivo con el que responde
  birthDate: string;
  age?: number;
  condition: string; // Ej: "Trastorno del Espectro Autista (TEA)", "Síndrome de Down", "Alzheimer", "Hipoacusia bilateral"
  conditionCategory: 'neurodivergencia' | 'cognitiva' | 'sensorial' | 'motriz' | 'medica';
  communicationMode: CommunicationMode;
  criticalGuidelines: string; // Instrucciones de trato y contención para el rescatista
  allergies: string[];
  medications: string[];
  bloodType: BloodType;
  primaryContact: EmergencyContact;
  secondaryContact?: EmergencyContact;
  homeAddress: string;
  medicalCenter: string;
  insuranceNumber?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  personId: string;
  person: LifeCodePerson;
  scannedAt: string;
  locationInfo?: {
    latitude?: number;
    longitude?: number;
    description?: string;
  };
  syncStatus: 'synced' | 'pending' | 'syncing' | 'failed';
  syncedAt?: string;
  rescuersNotes?: string;
  contactedFamily?: boolean;
}

export interface SyncStats {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  totalLocalScans: number;
  pendingSyncCount: number;
  syncedCount: number;
  lastSyncTimestamp: string | null;
  isSyncing: boolean;
}
