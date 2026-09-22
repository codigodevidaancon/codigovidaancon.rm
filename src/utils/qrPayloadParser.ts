import { LifeCodePerson } from '../types';
import { storageService } from '../services/storageService';

export function parseQRCodeContent(decodedText: string): {
  person?: LifeCodePerson;
  error?: string;
} {
  if (!decodedText || typeof decodedText !== 'string') {
    return { error: 'El contenido del código QR está vacío o no es legible.' };
  }

  const trimmed = decodedText.trim();

  // Case 1: JSON payload
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);

      // If full person object is embedded
      if (data.fullName && data.primaryContact) {
        const person: LifeCodePerson = {
          id: data.id || `cv-${Date.now()}`,
          codeNumber: data.codeNumber || data.code || `CV-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: data.fullName,
          preferredName: data.preferredName || data.fullName.split(' ')[0],
          birthDate: data.birthDate || '2000-01-01',
          age: data.age,
          condition: data.condition || 'Condición médica especial',
          conditionCategory: data.conditionCategory || 'neurodivergencia',
          communicationMode: data.communicationMode || 'verbal',
          criticalGuidelines: data.criticalGuidelines || 'Brindar auxilio y contactar de inmediato a sus familiares.',
          allergies: Array.isArray(data.allergies) ? data.allergies : [],
          medications: Array.isArray(data.medications) ? data.medications : [],
          bloodType: data.bloodType || 'O+',
          primaryContact: {
            name: data.primaryContact.name || 'Familiar de Contacto',
            relation: data.primaryContact.relation || 'Tutor',
            phone: data.primaryContact.phone || '+51 999 999 999',
            secondaryPhone: data.primaryContact.secondaryPhone
          },
          secondaryContact: data.secondaryContact,
          homeAddress: data.homeAddress || 'No especificada',
          medicalCenter: data.medicalCenter || 'Centro de salud de referencia',
          photoUrl: data.photoUrl,
          notes: data.notes,
          createdAt: data.createdAt || new Date().toISOString()
        };

        // Cache or save into local database if not exists
        storageService.savePerson(person);
        return { person };
      }

      // If it has id or code
      if (data.id || data.code) {
        const found = storageService.getPersonById(data.id || data.code);
        if (found) return { person: found };
      }
    } catch (e) {
      console.warn('Error parsing QR JSON payload', e);
    }
  }

  // Case 2: URL containing #profile/ID or ?id=ID
  if (trimmed.includes('#profile/') || trimmed.includes('/profile/')) {
    const parts = trimmed.split(/#profile\/|\/profile\//);
    if (parts.length > 1) {
      const id = parts[1].split('?')[0].split('/')[0];
      const found = storageService.getPersonById(id);
      if (found) return { person: found };
    }
  }

  // Case 3: Plain ID or Code (e.g. CV-TEA-1042 or per-mateo-01)
  const foundByCode = storageService.getPersonById(trimmed);
  if (foundByCode) {
    return { person: foundByCode };
  }

  // Search by codeNumber match in registered persons
  const allPersons = storageService.getPersons();
  const matched = allPersons.find(p => 
    p.codeNumber.toLowerCase() === trimmed.toLowerCase() ||
    p.id.toLowerCase() === trimmed.toLowerCase() ||
    trimmed.toLowerCase().includes(p.codeNumber.toLowerCase())
  );

  if (matched) {
    return { person: matched };
  }

  return {
    error: `Código QR no reconocido en la red de Código Vida ("${trimmed.substring(0, 30)}..."). Verifica que sea una credencial o pulsera válida.`
  };
}
