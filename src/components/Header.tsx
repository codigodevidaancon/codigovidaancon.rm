import React from 'react';
import { Shield, Wifi, WifiOff, RefreshCw, QrCode, History, UserPlus, HeartHandshake } from 'lucide-react';
import { SyncStats } from '../types';

interface HeaderProps {
  currentTab: 'scanner' | 'history' | 'generator' | 'profiles';
  onSelectTab: (tab: 'scanner' | 'history' | 'generator' | 'profiles') => void;
  syncStats: SyncStats;
  onManualSync: () => void;
  onToggleSimulatedOffline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  syncStats,
  onManualSync,
  onToggleSimulatedOffline
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Brand and Sync Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm ring-4 ring-red-100">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                  CÓDIGO <span className="text-red-600">VIDA</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-700 tracking-wider">
                  Auxilio Inmediato
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Identificación médica y contacto rápido para personas con habilidades diferentes
              </p>
            </div>
          </div>

          {/* Sync & Network Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline Simulation Toggle */}
            <button
              id="btn-toggle-offline-mode"
              onClick={onToggleSimulatedOffline}
              title={syncStats.isSimulatedOffline ? "Restablecer conexión real" : "Simular desconexión de red"}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border flex items-center gap-1.5 transition-colors ${
                syncStats.isSimulatedOffline
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {syncStats.isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">Simulando:</span> Offline
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Red:</span> Online
                </>
              )}
            </button>

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pl-2.5">
              <div className="flex items-center gap-1.5 text-xs">
                {syncStats.isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span className="text-blue-700 font-medium hidden sm:inline">Sincronizando...</span>
                  </>
                ) : syncStats.pendingSyncCount > 0 ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-amber-800 font-semibold text-[11px] sm:text-xs">
                      {syncStats.pendingSyncCount} pendiente{syncStats.pendingSyncCount > 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-800 font-medium hidden sm:inline text-xs">
                      Nube al día
                    </span>
                  </>
                )}
              </div>

              {/* Manual Sync Button */}
              <button
                id="btn-manual-sync"
                onClick={onManualSync}
                disabled={syncStats.isSyncing || !syncStats.isOnline}
                title={
                  !syncStats.isOnline
                    ? "Sin conexión para sincronizar"
                    : "Forzar sincronización inmediata con la nube"
                }
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-40 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStats.isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 -mb-px border-t border-slate-100">
          <button
            id="tab-scanner"
            onClick={() => onSelectTab('scanner')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'scanner'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Escanear Código QR
          </button>

          <button
            id="tab-history"
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap relative ${
              currentTab === 'history'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            Historial de Escaneos
            {syncStats.pendingSyncCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === 'history' ? 'bg-white text-red-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {syncStats.pendingSyncCount}
              </span>
            )}
          </button>

          <button
            id="tab-generator"
            onClick={() => onSelectTab('generator')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'generator'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Generar Código Vida
          </button>

          <button
            id="tab-profiles"
            onClick={() => onSelectTab('profiles')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'profiles'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Fichas Registradas
          </button>
        </div>
      </div>
    </header>
  );
};
