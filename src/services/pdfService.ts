import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { LifeCodePerson, ScanRecord } from '../types';

export const pdfService = {
  /**
   * Generates a printable Emergency ID Card / Life Code Profile in PDF
   */
  async exportPersonToPDF(person: LifeCodePerson): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 18;

    // Header Background Bar (Medical Blue / Red accents)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Emergency Accent Stripe
    doc.setFillColor(239, 68, 68); // red-500
    doc.rect(0, 28, pageWidth, 2.5, 'F');

    // Title & Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CÓDIGO VIDA · FICHA MÉDICA Y AUXILIO', 14, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('RED DE IDENTIFICACIÓN PARA PERSONAS CON HABILIDADES DIFERENTES', 14, 19);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(254, 202, 202); // red-200
    doc.text(`ID: ${person.codeNumber}`, pageWidth - 14, 16, { align: 'right' });

    currentY = 38;

    // Generate QR code for the person
    let qrDataUrl = '';
    try {
      // Create standardized QR payload
      const qrPayload = JSON.stringify({
        type: 'CODIGO_VIDA_PROFILE',
        id: person.id,
        code: person.codeNumber,
        name: person.fullName,
        condition: person.condition,
        contact: person.primaryContact.phone,
        url: window?.location?.origin ? `${window.location.origin}/#profile/${person.id}` : ''
      });
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256
      });
    } catch (e) {
      console.error('Error generating QR for PDF', e);
    }

    // Top Section: Person Identification & Photo/QR
    // Box for QR Code on the right
    if (qrDataUrl) {
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(pageWidth - 55, currentY, 41, 48, 2, 2, 'FD');
      doc.addImage(qrDataUrl, 'PNG', pageWidth - 52.5, currentY + 2.5, 36, 36);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text('ESCANEAR PARA AUXILIO', pageWidth - 34.5, currentY + 43, { align: 'center' });
    }

    // Person Information Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(person.fullName, 14, currentY + 6);

    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Responde afectivamente a: "${person.preferredName}" · Sangre: ${person.bloodType}`, 14, currentY + 12);

    if (person.age) {
      doc.setFontSize(9);
      doc.text(`Edad: ${person.age} años · F. Nacimiento: ${person.birthDate}`, 14, currentY + 18);
    }

    // Condition High Alert Card
    currentY += 24;
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(248, 113, 113); // red-400
    doc.roundedRect(14, currentY, pageWidth - 75, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(185, 28, 28); // red-700
    doc.text('CONDICIÓN / HABILIDAD DIFERENTE:', 18, currentY + 6);

    doc.setFontSize(10.5);
    doc.setTextColor(153, 27, 27); // red-800
    doc.text(person.condition, 18, currentY + 13);

    currentY += 28;

    // CRITICAL GUIDELINES SECTION (Most important for responder)
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(14, currentY, pageWidth - 28, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('⚠ PAUTAS DE CONTENCIÓN Y COMUNICACIÓN INMEDIATA', 19, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(69, 26, 3); // amber-950

    const splitGuidelines = doc.splitTextToSize(person.criticalGuidelines, pageWidth - 38);
    doc.text(splitGuidelines, 19, currentY + 14);

    currentY += 38;

    // EMERGENCY CONTACTS
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(52, 211, 153); // emerald-400
    doc.roundedRect(14, currentY, pageWidth - 28, 36, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.text('CONTACTOS FAMILIARES DE EMERGENCIA (LLAMAR DE INMEDIATO)', 19, currentY + 7);

    // Primary Contact
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`1. ${person.primaryContact.name} (${person.primaryContact.relation})`, 19, currentY + 15);

    doc.setFontSize(11);
    doc.setTextColor(4, 120, 87);
    doc.text(`Tel: ${person.primaryContact.phone}`, 19, currentY + 22);

    if (person.primaryContact.secondaryPhone) {
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Alt: ${person.primaryContact.secondaryPhone}`, 19, currentY + 28);
    }

    // Secondary Contact
    if (person.secondaryContact) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`2. ${person.secondaryContact.name} (${person.secondaryContact.relation})`, (pageWidth / 2) + 2, currentY + 15);

      doc.setFontSize(11);
      doc.setTextColor(4, 120, 87);
      doc.text(`Tel: ${person.secondaryContact.phone}`, (pageWidth / 2) + 2, currentY + 22);
    }

    currentY += 42;

    // MEDICAL AND LOGISTIC DETAILS (Two-column layout)
    const colWidth = (pageWidth - 32) / 2;

    // Left Column: Medical Alerts
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, colWidth, 46, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('DATOS MÉDICOS DE SEGURIDAD', 18, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    doc.text('Alergias:', 18, currentY + 14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(person.allergies.join(', ') || 'Ninguna registrada', 35, currentY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Medicamentos:', 18, currentY + 22);
    doc.setFont('helvetica', 'normal');
    const medsText = doc.splitTextToSize(person.medications.join(', ') || 'Ninguno', colWidth - 28);
    doc.text(mededsSafe(medsText), 18, currentY + 28);

    // Right Column: Address and Hospital
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14 + colWidth + 4, currentY, colWidth, 46, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('DOMICILIO Y CENTRO DE SALUD', 18 + colWidth + 4, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Dirección habitual:', 18 + colWidth + 4, currentY + 14);
    doc.setFont('helvetica', 'normal');
    const addr = doc.splitTextToSize(person.homeAddress || 'No especificada', colWidth - 10);
    doc.text(addr, 18 + colWidth + 4, currentY + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('Hospital habitual:', 18 + colWidth + 4, currentY + 31);
    doc.setFont('helvetica', 'normal');
    doc.text(person.medicalCenter || 'Hospital de la zona', 18 + colWidth + 4, currentY + 36);

    currentY += 52;

    // Footer with legal & solidarity message
    doc.setDrawColor(226, 232, 240);
    doc.line(14, currentY, pageWidth - 14, currentY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Ficha generada bajo el protocolo Código Vida. Documento de auxilio ciudadano sin fines comerciales.',
      14,
      currentY + 5
    );
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString('es-ES')} · Código de verificación: ${person.codeNumber}`,
      14,
      currentY + 9
    );

    // Save File
    const cleanName = person.fullName.replace(/\s+/g, '_');
    doc.save(`Codigo_Vida_${cleanName}.pdf`);
  },

  /**
   * Generates a complete rescue / scan history report in PDF
   */
  async exportScanHistoryToPDF(scans: ScanRecord[]): Promise<void> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 16;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 24, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('REPORTE HISTÓRICO DE INTERVENCIONES Y ESCANEOS · CÓDIGO VIDA', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(191, 219, 254);
    doc.text(
      `Registro oficial de asistencias · Generado el ${new Date().toLocaleString('es-ES')} · Total registros: ${scans.length}`,
      14,
      18
    );

    currentY = 32;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text('FECHA Y HORA', 18, currentY + 5.5);
    doc.text('CÓDIGO / NOMBRE', 55, currentY + 5.5);
    doc.text('CONDICIÓN / HABILIDAD', 115, currentY + 5.5);
    doc.text('CONTACTO FAMILIAR', 180, currentY + 5.5);
    doc.text('ESTADO NUBE', 235, currentY + 5.5);
    doc.text('DETALLES / NOTAS', 260, currentY + 5.5);

    currentY += 10;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    scans.forEach((scan, index) => {
      // Check page overflow
      if (currentY > 185) {
        doc.addPage();
        currentY = 20;
      }

      // Alternate row backgrounds
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY - 3, pageWidth - 28, 8, 'F');
      }

      const dateStr = new Date(scan.scannedAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.setTextColor(30, 41, 59);
      doc.text(dateStr, 18, currentY + 2);

      // Person code + Name
      doc.setFont('helvetica', 'bold');
      doc.text(scan.person?.fullName || 'Desconocido', 55, currentY + 2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`[${scan.person?.codeNumber || '-'}]`, 55, currentY + 5);

      // Condition
      doc.setTextColor(30, 41, 59);
      const cond = (scan.person?.condition || '-').substring(0, 36);
      doc.text(cond, 115, currentY + 2);

      // Contact
      const contactInfo = `${scan.person?.primaryContact?.name || '-'} (${scan.person?.primaryContact?.phone || '-'})`;
      doc.text(contactInfo.substring(0, 32), 180, currentY + 2);

      // Cloud Sync Status
      if (scan.syncStatus === 'synced') {
        doc.setTextColor(22, 163, 74); // green-600
        doc.text('✔ Sincronizado', 235, currentY + 2);
      } else {
        doc.setTextColor(217, 119, 6); // amber-600
        doc.text('⏳ Local (Pendiente)', 235, currentY + 2);
      }

      // Notes
      doc.setTextColor(100, 116, 139);
      const note = (scan.rescuersNotes || scan.locationInfo?.description || 'Sin notas adicionales').substring(0, 25);
      doc.text(note, 260, currentY + 2);

      currentY += 8;
    });

    // Summary Box at bottom
    currentY += 4;
    const syncedCount = scans.filter(s => s.syncStatus === 'synced').length;
    const pendingCount = scans.length - syncedCount;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, pageWidth - 28, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `RESUMEN: Total Asistencias: ${scans.length}  |  Registros Sincronizados con la Nube: ${syncedCount}  |  Pendientes de Conexión: ${pendingCount}`,
      20,
      currentY + 7
    );

    const dateNow = new Date().toISOString().slice(0, 10);
    doc.save(`Reporte_Historial_Codigo_Vida_${dateNow}.pdf`);
  }
};

function mededsSafe(text: string | string[]): string | string[] {
  return text;
}
