import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';
import { Camera, Upload, AlertCircle, Sparkles, CheckCircle2, RotateCcw, ExternalLink, HelpCircle } from 'lucide-react';
import { LifeCodePerson } from '../types';
import { parseQRCodeContent } from '../utils/qrPayloadParser';
import { playScanSuccessSound } from '../utils/audioFeedback';
import { INITIAL_PERSONS } from '../data/mockPersons';

interface QRScannerProps {
  onPersonScanned: (person: LifeCodePerson, rawText?: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onPersonScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedSamplePerson, setSelectedSamplePerson] = useState<LifeCodePerson>(INITIAL_PERSONS[0]);
  const [sampleQrDataUrl, setSampleQrDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate Sample QR preview for the quick-test cards
  useEffect(() => {
    async function genSampleQr() {
      try {
        const payload = JSON.stringify({
          type: 'CODIGO_VIDA_PROFILE',
          id: selectedSamplePerson.id,
          code: selectedSamplePerson.codeNumber,
          fullName: selectedSamplePerson.fullName,
          preferredName: selectedSamplePerson.preferredName,
          condition: selectedSamplePerson.condition,
          primaryContact: selectedSamplePerson.primaryContact,
          criticalGuidelines: selectedSamplePerson.criticalGuidelines,
          allergies: selectedSamplePerson.allergies,
          bloodType: selectedSamplePerson.bloodType
        });
        const url = await QRCode.toDataURL(payload, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setSampleQrDataUrl(url);
      } catch (e) {
        console.error('Error generating sample QR', e);
      }
    }
    genSampleQr();
  }, [selectedSamplePerson]);

  const handleScanSuccess = (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    playScanSuccessSound();

    const { person, error } = parseQRCodeContent(decodedText);
    if (person) {
      // Successfully identified
      stopScanner();
      onPersonScanned(person, decodedText);
    } else {
      setCameraError(error || 'Código QR no reconocido como Código Vida.');
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      if (!qrReaderRef.current) {
        qrReaderRef.current = new Html5Qrcode('qr-reader-viewport');
      }

      await qrReaderRef.current.start(
        { facingMode },
        {
          fps: 15,
          qrbox: { width: 260, height: 260 }
        },
        handleScanSuccess,
        () => {
          // ignore frame scan failure
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Comprueba los permisos o usa la opción de "Subir Imagen" o "Probar Códigos de Muestra".'
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (qrReaderRef.current && qrReaderRef.current.isScanning) {
      try {
        await qrReaderRef.current.stop();
      } catch (e) {
        console.error('Error stopping scanner', e);
      }
    }
    setIsScanning(false);
    setIsProcessing(false);
  };

  // Toggle Camera Facing Mode (Front / Back)
  const toggleFacingMode = async () => {
    await stopScanner();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrReaderRef.current && qrReaderRef.current.isScanning) {
        qrReaderRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle Image File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    setIsProcessing(true);

    try {
      let scanner = qrReaderRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode('qr-reader-viewport');
        qrReaderRef.current = scanner;
      }

      const decodedText = await scanner.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      console.error('File scan error', err);
      setCameraError('No se encontró ningún código QR legible en la imagen seleccionada.');
      setIsProcessing(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Quick Direct Simulation for Evaluators / Testing without camera
  const handleSimulateQuickScan = (person: LifeCodePerson) => {
    playScanSuccessSound();
    onPersonScanned(person, person.codeNumber);
  };

  return (
    <div className="space-y-6">
      {/* Scanner Main Stage */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner with instructions */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <h2 className="text-lg font-bold">Lector de Auxilio Código Vida</h2>
            </div>
            <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
              Enfoca con la cámara la pulsera, credencial, parche o medalla QR de la persona. Se obtendrán sus datos de contacto y cuidados médicos al instante.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isScanning ? (
              <button
                id="btn-start-camera"
                onClick={startScanner}
                className="bg-white text-red-700 hover:bg-red-50 font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 text-sm transition-transform active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Activar Cámara
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-flip-camera"
                  onClick={toggleFacingMode}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  title="Cambiar entre cámara frontal y trasera"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Girar ({facingMode === 'environment' ? 'Trasera' : 'Frontal'})
                </button>
                <button
                  id="btn-stop-camera"
                  onClick={stopScanner}
                  className="bg-slate-900/80 hover:bg-slate-900 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors"
                >
                  Detener
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Camera Viewport Area */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-slate-100 shadow-inner">
            {/* Viewport for html5-qrcode */}
            <div id="qr-reader-viewport" className="w-full h-full object-cover"></div>

            {/* Inactive State Visual */}
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white">
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-4 ring-8 ring-white/5">
                  <Camera className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="font-bold text-base mb-1">Cámara en espera</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-5">
                  Pulsa "Activar Cámara" para escanear en tiempo real, o sube una fotografía del código QR.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    id="btn-activate-camera-center"
                    onClick={startScanner}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Encender Cámara
                  </button>
                  <button
                    id="btn-upload-qr-image"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Subir Imagen QR
                  </button>
                </div>
              </div>
            )}

            {/* Active Scanning Guides Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-red-500 rounded-2xl relative">
                  {/* Corner accents */}
                  <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
                  {/* Animated laser line */}
                  <div className="w-full h-0.5 bg-red-400 shadow-[0_0_8px_#f87171] animate-bounce absolute top-1/2" />
                </div>
                <div className="absolute bottom-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full font-medium">
                  Enfocando... mantén quieto el código
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="mt-4 w-full max-w-md bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{cameraError}</p>
                <p className="mt-1 text-rose-600">
                  Tip: También puedes probar abajo los botones directos de demostración con 1 solo clic.
                </p>
              </div>
            </div>
          )}

          {/* Quick upload button when camera is on */}
          {isScanning && (
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 underline"
              >
                <Upload className="w-3 h-3" /> O cargar captura de QR desde archivo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Test Station (Códigos Vida de Prueba para Testeo Inmediato) */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Estación de Pruebas: Códigos Vida Preconfigurados
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Prueba rápida sin necesidad de imprimir
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Selecciona una persona con habilidad diferente para visualizar su código QR oficial en pantalla y probar el escaneo inmediatamente:
        </p>

        {/* Profile Selector Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {INITIAL_PERSONS.map(person => {
            const isSelected = selectedSamplePerson.id === person.id;
            return (
              <button
                key={person.id}
                id={`btn-sample-person-${person.id}`}
                onClick={() => setSelectedSamplePerson(person)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-white border-red-500 shadow-sm ring-2 ring-red-100'
                    : 'bg-white/60 hover:bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {person.photoUrl ? (
                      <img src={person.photoUrl} alt={person.fullName} className="w-full h-full object-cover" />
                    ) : (
                      person.fullName.substring(0, 2)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{person.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{person.condition.split('-')[0]}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected QR Display and 1-Click Simulation Button */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {sampleQrDataUrl && (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                <img
                  src={sampleQrDataUrl}
                  alt={`QR de ${selectedSamplePerson.fullName}`}
                  className="w-28 h-28 object-contain"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  {selectedSamplePerson.codeNumber}
                </span>
                <span className="text-xs text-slate-500">
                  {selectedSamplePerson.bloodType} · {selectedSamplePerson.age} años
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-1">
                {selectedSamplePerson.fullName} ({selectedSamplePerson.preferredName})
              </h4>
              <p className="text-xs text-red-700 font-medium mt-0.5">
                {selectedSamplePerson.condition}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md line-clamp-2">
                Pauta de auxilio: {selectedSamplePerson.criticalGuidelines}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            {/* Quick 1-click test button */}
            <button
              id="btn-simulate-quick-scan"
              onClick={() => handleSimulateQuickScan(selectedSamplePerson)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simular Escaneo Directo
            </button>

            <a
              href={sampleQrDataUrl}
              download={`QR_CodigoVida_${selectedSamplePerson.codeNumber}.png`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              Descargar Imagen QR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
