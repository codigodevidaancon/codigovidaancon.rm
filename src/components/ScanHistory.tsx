import React, { useState } from 'react';
import { 
  History, Search, FileDown, Trash2, ExternalLink, 
  CheckCircle2, Clock, CloudUpload, Filter, RefreshCw, AlertCircle, Phone
} from 'lucide-react';
import { ScanRecord, LifeCodePerson } from '../types';
import { pdfService } from '../services/pdfService';
import { storageService } from '../services/storageService';

interface ScanHistoryProps {
  scans: ScanRecord[];
  onSelectPerson: (person: LifeCodePerson, scan: ScanRecord) => void;
  onRefresh: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  scans,
  onSelectPerson,
  onRefresh,
  isSyncing,
  onManualSync
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'synced' | 'pending'>('all');
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Filter scans
  const filteredScans = scans.filter(scan => {
    const matchesSearch = 
      scan.person?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.person?.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.person?.codeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.rescuersNotes?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'synced') return scan.syncStatus === 'synced';
    if (filterStatus === 'pending') return scan.syncStatus === 'pending' || scan.syncStatus === 'failed';
    return true;
  });

  const syncedCount = scans.filter(s => s.syncStatus === 'synced').length;
  const pendingCount = scans.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'failed').length;

  const handleExportHistoryPDF = async () => {
    if (filteredScans.length === 0) return;
    setIsExportingAll(true);
    try {
      await pdfService.exportScanHistoryToPDF(filteredScans);
    } catch (e) {
      console.error('Error exporting history PDF', e);
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Deseas eliminar este registro del historial local?')) {
      storageService.deleteScan(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Escaneos</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{scans.length}</span>
            <span className="text-xs text-slate-500">en base local</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Sincronizados en Nube</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{syncedCount}</span>
            <span className="text-xs text-emerald-600">respaldo seguro</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pendientes de Nube</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
              <span className="text-xs text-amber-600">esperando conexión</span>
            </div>
            {pendingCount > 0 && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sincronizar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & PDF Export */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-history"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, condición, ID..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 bg-slate-50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({scans.length})
          </button>
          <button
            onClick={() => setFilterStatus('synced')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filterStatus === 'synced'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Nube ({syncedCount})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
        </div>

        {/* Export History to PDF Button */}
        <button
          id="btn-export-history-pdf"
          onClick={handleExportHistoryPDF}
          disabled={isExportingAll || filteredScans.length === 0}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" />
          Exportar Reporte PDF ({filteredScans.length})
        </button>
      </div>

      {/* History List */}
      {filteredScans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">No hay registros que coincidan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Los escaneos que realices con la cámara o cargando un código QR se guardarán automáticamente aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => {
            const isSynced = scan.syncStatus === 'synced';
            const scanDate = new Date(scan.scannedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={scan.id}
                id={`scan-card-${scan.id}`}
                onClick={() => onSelectPerson(scan.person, scan)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-red-400 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Person Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-700 font-bold shrink-0 border border-slate-200">
                    {scan.person?.photoUrl ? (
                      <img
                        src={scan.person.photoUrl}
                        alt={scan.person.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      scan.person?.fullName?.substring(0, 2) || 'CV'
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900">
                        {scan.person?.fullName}
                      </h4>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {scan.person?.codeNumber}
                      </span>
                      <span className="text-xs text-red-600 font-bold">
                        {scan.person?.bloodType}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-red-700 mt-0.5 truncate">
                      {scan.person?.condition}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span>Escaneado: {scanDate}</span>
                      {scan.person?.primaryContact && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {scan.person.primaryContact.name} ({scan.person.primaryContact.phone})
                        </span>
                      )}
                    </div>

                    {scan.rescuersNotes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg mt-1.5 italic">
                        "{scan.rescuersNotes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badges & Action Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100">
                  {/* Sync Status Badge */}
                  <div>
                    {isSynced ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Sincronizado en Nube
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Guardado en Base Local
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pdfService.exportPersonToPDF(scan.person);
                      }}
                      className="p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      title="Exportar Ficha Individual a PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(scan.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectPerson(scan.person, scan)}
                      className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
