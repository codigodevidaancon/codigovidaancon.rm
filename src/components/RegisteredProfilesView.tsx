import React, { useState } from 'react';
import QRCode from 'qrcode';
import { 
  HeartHandshake, Search, FileDown, QrCode, Phone, 
  MapPin, ShieldAlert, Sparkles, ExternalLink, User 
} from 'lucide-react';
import { LifeCodePerson } from '../types';
import { pdfService } from '../services/pdfService';

interface RegisteredProfilesViewProps {
  persons: LifeCodePerson[];
  onSelectPerson: (person: LifeCodePerson) => void;
  onGoToScanner: () => void;
}

export const RegisteredProfilesView: React.FC<RegisteredProfilesViewProps> = ({
  persons,
  onSelectPerson,
  onGoToScanner
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQRPreview, setSelectedQRPreview] = useState<{ person: LifeCodePerson; qrUrl: string } | null>(null);

  const filtered = persons.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.preferredName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowQR = async (person: LifeCodePerson, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const payload = JSON.stringify({
        type: 'CODIGO_VIDA_PROFILE',
        id: person.id,
        code: person.codeNumber,
        fullName: person.fullName,
        preferredName: person.preferredName,
        condition: person.condition,
        primaryContact: person.primaryContact,
        criticalGuidelines: person.criticalGuidelines,
        allergies: person.allergies,
        bloodType: person.bloodType
      });
      const url = await QRCode.toDataURL(payload, { width: 320, margin: 2 });
      setSelectedQRPreview({ person, qrUrl: url });
    } catch (err) {
      console.error('Error generating QR preview', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-red-600" />
            Directorio de Fichas Médicas Código Vida
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personas protegidas bajo el sistema de identificación y auxilio rápido ({persons.length} registradas)
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, condición, código..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(person => (
          <div
            key={person.id}
            id={`profile-card-${person.id}`}
            onClick={() => onSelectPerson(person)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-red-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200 shrink-0">
                    {person.photoUrl ? (
                      <img src={person.photoUrl} alt={person.fullName} className="w-full h-full object-cover" />
                    ) : (
                      person.fullName.substring(0, 2)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {person.fullName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                        {person.codeNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Responde a: "{person.preferredName}"
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                  {person.bloodType}
                </span>
              </div>

              {/* Condition Alert */}
              <div className="bg-red-50/70 border border-red-100 rounded-xl p-2.5 mb-3">
                <p className="text-xs font-bold text-red-800">
                  {person.condition}
                </p>
                <p className="text-[11px] text-red-700/90 mt-0.5 line-clamp-2">
                  {person.criticalGuidelines}
                </p>
              </div>

              {/* Contact info */}
              <div className="space-y-1 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {person.primaryContact.name} ({person.primaryContact.relation}):{' '}
                    <strong>{person.primaryContact.phone}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{person.homeAddress}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => handleShowQR(person, e)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
                Ver Código QR
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    pdfService.exportPersonToPDF(person);
                  }}
                  className="text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  PDF
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPerson(person)}
                  className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Ficha Completa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal View */}
      {selectedQRPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Código QR de Emergencia
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedQRPreview.person.fullName} ({selectedQRPreview.person.codeNumber})
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
              <img
                src={selectedQRPreview.qrUrl}
                alt="QR Code"
                className="w-56 h-56 mx-auto object-contain"
              />
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={selectedQRPreview.qrUrl}
                download={`QR_${selectedQRPreview.person.codeNumber}.png`}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Descargar Imagen QR (PNG)
              </a>
              <button
                onClick={() => setSelectedQRPreview(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
