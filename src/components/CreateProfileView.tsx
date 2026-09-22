import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  UserPlus, QrCode, FileDown, CheckCircle2, AlertTriangle, 
  Heart, Phone, Home, Building, Sparkles, Download, Shield 
} from 'lucide-react';
import { LifeCodePerson, BloodType, CommunicationMode } from '../types';
import { storageService } from '../services/storageService';
import { pdfService } from '../services/pdfService';

interface CreateProfileViewProps {
  onProfileCreated: (newPerson: LifeCodePerson) => void;
}

export const CreateProfileView: React.FC<CreateProfileViewProps> = ({ onProfileCreated }) => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [birthDate, setBirthDate] = useState('2015-05-10');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [condition, setCondition] = useState('Trastorno del Espectro Autista (TEA)');
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('pictogramas');
  const [criticalGuidelines, setCriticalGuidelines] = useState(
    'Hablarle con tono calmado. No sujetar sus brazos bruscamente. En caso de crisis sensorial, apartar de estímulos ruidosos y llamar de inmediato a su madre.'
  );
  const [allergiesText, setAllergiesText] = useState('Penicilina');
  const [medicationsText, setMedicationsText] = useState('Ninguna de urgencia');
  const [primaryName, setPrimaryName] = useState('');
  const [primaryRelation, setPrimaryRelation] = useState('Madre');
  const [primaryPhone, setPrimaryPhone] = useState('+51 ');
  const [secondaryName, setSecondaryName] = useState('');
  const [secondaryRelation, setSecondaryRelation] = useState('Padre');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [medicalCenter, setMedicalCenter] = useState('');

  const [generatedCode, setGeneratedCode] = useState(`CV-PE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live QR Code generation as user types
  useEffect(() => {
    async function updateQR() {
      try {
        const payload = JSON.stringify({
          type: 'CODIGO_VIDA_PROFILE',
          code: generatedCode,
          name: fullName || 'Persona Código Vida',
          alias: preferredName || fullName,
          condition: condition,
          contact: primaryPhone,
          url: `${window?.location?.origin || ''}/#code/${generatedCode}`
        });

        const dataUrl = await QRCode.toDataURL(payload, {
          width: 300,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating preview QR', err);
      }
    }

    updateQR();
  }, [generatedCode, fullName, preferredName, condition, primaryPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !primaryName.trim() || !primaryPhone.trim()) {
      alert('Por favor completa al menos el Nombre, el Contacto de Emergencia y su Teléfono.');
      return;
    }

    const newPerson: LifeCodePerson = {
      id: `per-${Date.now()}`,
      codeNumber: generatedCode,
      fullName: fullName.trim(),
      preferredName: preferredName.trim() || fullName.trim().split(' ')[0],
      birthDate,
      bloodType,
      condition: condition.trim(),
      conditionCategory: 'neurodivergencia',
      communicationMode,
      criticalGuidelines: criticalGuidelines.trim(),
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      medications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
      primaryContact: {
        name: primaryName.trim(),
        relation: primaryRelation.trim(),
        phone: primaryPhone.trim()
      },
      secondaryContact: secondaryName.trim() ? {
        name: secondaryName.trim(),
        relation: secondaryRelation.trim(),
        phone: secondaryPhone.trim()
      } : undefined,
      homeAddress: homeAddress.trim() || 'No registrada',
      medicalCenter: medicalCenter.trim() || 'Centro de salud de la zona',
      createdAt: new Date().toISOString()
    };

    // Save to local database
    storageService.savePerson(newPerson);
    setSavedSuccess(true);
    onProfileCreated(newPerson);

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleExportPDF = async () => {
    const tempPerson: LifeCodePerson = {
      id: `per-${Date.now()}`,
      codeNumber: generatedCode,
      fullName: fullName.trim() || 'Nombre de la Persona',
      preferredName: preferredName.trim() || 'Apodo',
      birthDate,
      bloodType,
      condition: condition.trim(),
      conditionCategory: 'neurodivergencia',
      communicationMode,
      criticalGuidelines: criticalGuidelines.trim(),
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      medications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
      primaryContact: {
        name: primaryName.trim() || 'Contacto Principal',
        relation: primaryRelation.trim(),
        phone: primaryPhone.trim() || '+51 999 999 999'
      },
      secondaryContact: secondaryName.trim() ? {
        name: secondaryName.trim(),
        relation: secondaryRelation.trim(),
        phone: secondaryPhone.trim()
      } : undefined,
      homeAddress: homeAddress.trim() || 'No registrada',
      medicalCenter: medicalCenter.trim() || 'Centro de salud de la zona',
      createdAt: new Date().toISOString()
    };

    await pdfService.exportPersonToPDF(tempPerson);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Registrar Nueva Ficha y Generar Código Vida
            </h2>
            <p className="text-xs text-slate-500">
              Genera la credencial QR para pulsera, medalla o tarjeta de una persona con habilidades diferentes o condición especial.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section 1: Personal Data */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                1. Datos de la Persona
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Lucas Benjamín Morales"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Afectivo / Cómo responderle *
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="Ej: Luquitas"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value as BloodType)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="B-">B Negativo (B-)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                    <option value="AB-">AB Negativo (AB-)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Condition and Guidelines */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                2. Condición y Pautas de Trato
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Habilidad Diferente / Condición Principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      placeholder="Ej: TEA no verbal, Síndrome de Down, Alzheimer..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Modo de Comunicación
                    </label>
                    <select
                      value={communicationMode}
                      onChange={(e) => setCommunicationMode(e.target.value as CommunicationMode)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      <option value="pictogramas">Pictogramas / Tarjetas</option>
                      <option value="no-verbal">No verbal (comprensión gestual)</option>
                      <option value="semi-verbal">Semi-verbal (frases cortas)</option>
                      <option value="lengua-senas">Lengua de Señas</option>
                      <option value="verbal">Verbal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pautas de Contención Inmediata (Instrucciones para el rescatista) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={criticalGuidelines}
                    onChange={(e) => setCriticalGuidelines(e.target.value)}
                    placeholder="Instrucciones cruciales para evitar crisis, cómo hablarle, a qué estímulos es sensible, etc."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Emergency Contacts */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                3. Contactos Familiares de Urgencia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contacto Principal (Nombre) *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryName}
                    onChange={(e) => setPrimaryName(e.target.value)}
                    placeholder="Ej: Andrea Gómez"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parentesco *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryRelation}
                    onChange={(e) => setPrimaryRelation(e.target.value)}
                    placeholder="Madre, Padre, Tutor..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono Móvil *
                  </label>
                  <input
                    type="tel"
                    required
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Secondary Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Contacto Respaldo (Nombre)
                  </label>
                  <input
                    type="text"
                    value={secondaryName}
                    onChange={(e) => setSecondaryName(e.target.value)}
                    placeholder="Nombre familiar alterno"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Parentesco
                  </label>
                  <input
                    type="text"
                    value={secondaryRelation}
                    onChange={(e) => setSecondaryRelation(e.target.value)}
                    placeholder="Padre, Tía, etc."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Teléfono Respaldo
                  </label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="Teléfono alternativo"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Medical Alerts and Home */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                4. Alertas Médicas y Residencia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alergias (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="Penicilina, Sulfas..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medicamentos Habituales
                  </label>
                  <input
                    type="text"
                    value={medicationsText}
                    onChange={(e) => setMedicationsText(e.target.value)}
                    placeholder="Nombre y dosis si aplica..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección Domiciliaria
                  </label>
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="Calle, número, distrito, ciudad..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Centro Médico Habitual / Hospital
                  </label>
                  <input
                    type="text"
                    value={medicalCenter}
                    onChange={(e) => setMedicalCenter(e.target.value)}
                    placeholder="Ej: Hospital de la Solidaridad..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {savedSuccess ? '✔ ¡Ficha guardada exitosamente en base local!' : 'Se guardará en la base local y sincronizará con la nube.'}
              </span>

              <button
                type="submit"
                id="btn-save-profile"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                Registrar Ficha y Generar QR
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview & Badge Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center flex flex-col items-center">
            <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider mb-2">
              Credencial Código Vida en Tiempo Real
            </span>

            {/* Generated QR Code Preview */}
            <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-inner mb-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Generado" className="w-48 h-48 object-contain mx-auto" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12" />
                </div>
              )}
            </div>

            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              {generatedCode}
            </span>

            <h4 className="font-bold text-slate-900 text-base mt-2">
              {fullName || 'Nombre de la Persona'}
            </h4>
            <p className="text-xs text-red-600 font-semibold">
              {condition || 'Condición especial'}
            </p>

            <div className="w-full border-t border-slate-100 mt-4 pt-4 flex flex-col gap-2">
              <a
                href={qrDataUrl}
                download={`QR_CodigoVida_${generatedCode}.png`}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Imagen QR (PNG)
              </a>

              <button
                type="button"
                onClick={handleExportPDF}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <FileDown className="w-4 h-4 text-red-600" />
                Exportar Ficha Oficial (PDF)
              </button>
            </div>
          </div>

          {/* Quick Tip Card */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900">
            <h5 className="font-bold flex items-center gap-1.5 mb-1 text-red-800">
              <Shield className="w-4 h-4 text-red-600" />
              Uso de la Credencial
            </h5>
            <p className="leading-relaxed text-[11px] text-red-800/90">
              Imprime este código QR y colócalo en una pulsera médica de silicona, credencial plastificada de cuello, o parche en la mochila o prenda de vestir de la persona.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
