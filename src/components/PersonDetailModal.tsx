import React, { useState } from 'react';
import { 
  X, Phone, MessageCircle, FileDown, Heart, AlertTriangle, 
  MapPin, ShieldAlert, CheckCircle2, Clock, User, Building, 
  Save, Share2 
} from 'lucide-react';
import { LifeCodePerson, ScanRecord } from '../types';
import { pdfService } from '../services/pdfService';
import { storageService } from '../services/storageService';

interface PersonDetailModalProps {
  person: LifeCodePerson;
  scanRecord?: ScanRecord;
  onClose: () => void;
  onScanUpdated?: (updatedScan: ScanRecord) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  scanRecord,
  onClose,
  onScanUpdated
}) => {
  const [rescuersNotes, setRescuersNotes] = useState(scanRecord?.rescuersNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await pdfService.exportPersonToPDF(person);
    } catch (e) {
      console.error('Error generating PDF', e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveNotes = () => {
    if (!scanRecord) return;
    setIsSavingNotes(true);
    const updated: ScanRecord = {
      ...scanRecord,
      rescuersNotes,
      contactedFamily: true
    };
    storageService.updateScan(updated);
    if (onScanUpdated) {
      onScanUpdated(updated);
    }
    setIsSavingNotes(false);
    setNotesSavedSuccess(true);
    setTimeout(() => setNotesSavedSuccess(false), 2500);
  };

  // Pre-formatted WhatsApp emergency message
  const whatsappUrl = `https://wa.me/${person.primaryContact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `ALERTA CÓDIGO VIDA: Hola, he localizado a ${person.fullName} (${person.preferredName}) mediante su código QR de emergencia ${person.codeNumber}. Se encuentra bajo resguardo. Por favor contácteme de inmediato para coordinar su entrega segura.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="person-detail-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
                Ficha de Auxilio Inmediato
              </span>
              <h2 className="text-base sm:text-lg font-bold">
                {person.fullName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-person-pdf-top"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Descargar Ficha en PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Storage & Cloud Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Datos guardados en la <strong>base local del dispositivo</strong>
              </span>
            </div>
            {scanRecord && (
              <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                scanRecord.syncStatus === 'synced'
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {scanRecord.syncStatus === 'synced' ? 'Nube Sincronizada' : 'Pendiente en Nube'}
              </span>
            )}
          </div>

          {/* Condition Highlight Box */}
          <div className="bg-red-50 border-l-4 border-red-600 rounded-r-xl p-4">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Condición o Habilidad Diferente:
            </div>
            <p className="text-base sm:text-lg font-extrabold text-red-900">
              {person.condition}
            </p>
            <p className="text-xs text-red-700 mt-1">
              Responde afectivamente al nombre de: <span className="font-bold underline">{person.preferredName}</span>
            </p>
          </div>

          {/* Fast Emergency Contacts Action Bar */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Contactar Familiares Inmediatamente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Call Primary Contact */}
              <a
                id="btn-call-primary"
                href={`tel:${person.primaryContact.phone}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl shadow-xs flex items-center justify-between transition-transform active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-emerald-100 font-medium">Llamar a {person.primaryContact.relation}</p>
                    <p className="text-sm font-extrabold text-white">{person.primaryContact.name}</p>
                    <p className="text-xs text-emerald-100 font-mono">{person.primaryContact.phone}</p>
                  </div>
                </div>
              </a>

              {/* WhatsApp Alert */}
              <a
                id="btn-whatsapp-alert"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-bold p-3.5 rounded-xl shadow-xs flex items-center justify-between transition-transform active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-green-100 font-medium">Enviar WhatsApp de Auxilio</p>
                    <p className="text-sm font-extrabold text-white">Mensaje con Ubicación</p>
                    <p className="text-xs text-green-100">Notificar rescate en 1 clic</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Secondary Contact if exists */}
            {person.secondaryContact && (
              <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Contacto de respaldo: <strong>{person.secondaryContact.name} ({person.secondaryContact.relation})</strong>
                </span>
                <a
                  href={`tel:${person.secondaryContact.phone}`}
                  className="font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-md"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {person.secondaryContact.phone}
                </a>
              </div>
            )}
          </div>

          {/* CRITICAL GUIDELINES SECTION */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Pautas de Contención y Comunicación (Recomendaciones Médicas)
            </div>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
              {person.criticalGuidelines}
            </p>
          </div>

          {/* Medical Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Grupo Sanguíneo</span>
              <span className="text-base font-extrabold text-red-600">{person.bloodType}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Edad / Nacimiento</span>
              <span className="text-sm font-bold text-slate-800">
                {person.age ? `${person.age} años` : 'Registrado'}
              </span>
              <span className="text-[10px] text-slate-500 block">{person.birthDate}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Comunicación</span>
              <span className="text-xs font-bold text-slate-800 capitalize">
                {person.communicationMode.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Allergies and Medications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Alergias Severas
              </h4>
              {person.allergies && person.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {person.allergies.map((all, i) => (
                    <span key={i} className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-md font-semibold">
                      {all}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sin alergias registradas</p>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-blue-600" />
                Medicamentos Habituales
              </h4>
              {person.medications && person.medications.length > 0 ? (
                <ul className="text-xs text-slate-700 space-y-1">
                  {person.medications.map((med, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {med}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Sin medicación de urgencia</p>
              )}
            </div>
          </div>

          {/* Location and Medical Center */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Domicilio Familiar:</span>{' '}
                <span className="text-slate-600">{person.homeAddress}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Centro Médico Habitual:</span>{' '}
                <span className="text-slate-600">{person.medicalCenter}</span>
                {person.insuranceNumber && (
                  <span className="text-slate-500 ml-1.5">({person.insuranceNumber})</span>
                )}
              </div>
            </div>
          </div>

          {/* Rescuer Intervention Notes Form */}
          {scanRecord && (
            <div className="border-t border-slate-200 pt-4">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Bitácora de Intervención / Notas del Rescatista:
              </label>
              <textarea
                value={rescuersNotes}
                onChange={(e) => setRescuersNotes(e.target.value)}
                rows={2}
                placeholder="Ej: Ubicado en cruce de avenidas, tranquilo, se le ofreció agua y se notificó a la madre..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {notesSavedSuccess ? '✔ Notas guardadas en base local' : 'Se sincroniza automáticamente con la nube'}
                </span>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Notas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <button
            id="btn-export-person-pdf-bottom"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <FileDown className="w-4 h-4 text-red-600" />
            Descargar Ficha en PDF
          </button>

          <button
            id="btn-close-modal-bottom"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
