import { LifeCodePerson } from '../types';

export const INITIAL_PERSONS: LifeCodePerson[] = [
  {
    id: 'per-mateo-01',
    codeNumber: 'CV-TEA-1042',
    fullName: 'Mateo Ramos Silva',
    preferredName: 'Mateíto',
    birthDate: '2014-06-18',
    age: 12,
    condition: 'Trastorno del Espectro Autista (TEA) Grado 3 - No verbal',
    conditionCategory: 'neurodivergencia',
    communicationMode: 'pictogramas',
    criticalGuidelines: 'Mateo no habla pero comprende frases cortas y afectuosas. No tocar sus hombros ni agarrarlo fuerte porque puede tener una sobrecarga sensorial. Se calma escuchando música instrumental o mostrándole fotos en el teléfono. Es sensible a sirenas y ruidos metálicos fuertes.',
    allergies: ['Penicilina', 'Mariscos', 'Picaduras de avispa'],
    medications: ['Melatonina en gotas nocturna', 'Complejo B'],
    bloodType: 'O+',
    primaryContact: {
      name: 'Elena Silva de Ramos',
      relation: 'Madre',
      phone: '+51 987 654 321',
      secondaryPhone: '+51 984 112 233',
      email: 'elena.ramos@familia.org'
    },
    secondaryContact: {
      name: 'Jorge Ramos Morales',
      relation: 'Padre',
      phone: '+51 991 223 344'
    },
    homeAddress: 'Av. Las Gardenias 452, Dpto 301, San Borja, Lima',
    medicalCenter: 'Instituto Nacional de Salud del Niño (San Borja)',
    insuranceNumber: 'SIS-98402941',
    photoUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&auto=format&fit=crop&q=80',
    notes: 'Lleva una pulsera de tela celeste en la muñeca derecha con su código QR.',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'per-carmen-02',
    codeNumber: 'CV-ALZ-2089',
    fullName: 'Carmen Rosa Delgado de Vargas',
    preferredName: 'Doña Carmencita',
    birthDate: '1948-03-12',
    age: 78,
    condition: 'Enfermedad de Alzheimer (Fase Moderada) con desorientación espacial',
    conditionCategory: 'cognitiva',
    communicationMode: 'verbal',
    criticalGuidelines: 'Suele creer que está yendo al mercado o a buscar a sus hijos pequeños. Validar sus palabras sin contradecirla bruscamente para no causarle angustia. Ofrecerle un vaso de agua o asiento. Responderá amablemente a su nombre "Doña Carmencita".',
    allergies: ['Sulfas', 'Aspirina'],
    medications: ['Donepezilo 10mg diario', 'Losartán 50mg (Hipertensión)'],
    bloodType: 'A+',
    primaryContact: {
      name: 'Valeria Vargas Delgado',
      relation: 'Hija / Cuidadora principal',
      phone: '+51 993 456 789',
      secondaryPhone: '+51 981 889 900',
      email: 'valeria.vargas@correo.com'
    },
    secondaryContact: {
      name: 'Carlos Vargas Delgado',
      relation: 'Hijo',
      phone: '+51 997 112 334'
    },
    homeAddress: 'Calle Los Pinos 184, Miraflores, Lima',
    medicalCenter: 'Clínica San Felipe - Neurología',
    insuranceNumber: 'PACIFICO-882310',
    photoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&auto=format&fit=crop&q=80',
    notes: 'Porta collar con medalla metálica QR Código Vida.',
    createdAt: '2026-02-05T14:30:00Z'
  },
  {
    id: 'per-thiago-03',
    codeNumber: 'CV-DS-3301',
    fullName: 'Thiago Benítez Castro',
    preferredName: 'Thiaguito',
    birthDate: '2016-11-20',
    age: 9,
    condition: 'Síndrome de Down (Trisomía 21) con Cardiopatía Congénita corregida',
    conditionCategory: 'neurodivergencia',
    communicationMode: 'semi-verbal',
    criticalGuidelines: 'Muy cariñoso pero puede asustarse si hay mucha gente rodeándolo. Hablarle a su altura física (agachándose suavemente). Evitar que corra o se sobreexija físicamente por su condición cardíaca controlada.',
    allergies: ['Ibuprofeno', 'Lácteos no deslactosados'],
    medications: ['Levotiroxina 25mcg en ayunas', 'Inhalador de salbutamol si hay fatiga'],
    bloodType: 'B+',
    primaryContact: {
      name: 'Carlos Benítez Orosco',
      relation: 'Padre',
      phone: '+51 975 882 109',
      secondaryPhone: '+51 963 445 566',
      email: 'carlos.benitez@tecnologia.pe'
    },
    secondaryContact: {
      name: 'Mariana Castro',
      relation: 'Madre',
      phone: '+51 992 334 887'
    },
    homeAddress: 'Jr. Huancavelica 820, Magdalena del Mar, Lima',
    medicalCenter: 'Hospital Nacional Edgardo Rebagliati Martins',
    insuranceNumber: 'ESSALUD-09238411',
    photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fbdd77e58a?w=400&auto=format&fit=crop&q=80',
    notes: 'Prenda con parche bordado Código Vida en la solapa de su casaca.',
    createdAt: '2026-03-01T09:15:00Z'
  },
  {
    id: 'per-sofia-04',
    codeNumber: 'CV-SEN-4410',
    fullName: 'Sofía Morales Vega',
    preferredName: 'Sofi',
    birthDate: '2001-09-04',
    age: 24,
    condition: 'Hipoacusia bilateral profunda (Persona Sorda) y Diabetes Mellitus Tipo 1',
    conditionCategory: 'sensorial',
    communicationMode: 'lengua-senas',
    criticalGuidelines: 'Sofía se comunica principalmente por Lengua de Señas Peruana (LSP) y lectura labial / notas escritas en el teléfono. Mírala siempre de frente para que pueda leer tus labios. Si muestra sudoración excesiva o temblor, puede tener hipoglucemia: necesita azúcar o jugo de inmediato.',
    allergies: ['Cefalexina', 'Yodo'],
    medications: ['Insulina Glargina nocturna', 'Insulina Lispro con comidas'],
    bloodType: 'O-',
    primaryContact: {
      name: 'Andrés Morales Vega',
      relation: 'Hermano',
      phone: '+51 980 321 654',
      email: 'andres.morales@diseno.com'
    },
    secondaryContact: {
      name: 'Rosa Vega Mendoza',
      relation: 'Madre',
      phone: '+51 966 543 210'
    },
    homeAddress: 'Urb. Los Álamos Mz. B Lt. 12, Surco, Lima',
    medicalCenter: 'Hospital María Auxiliadora',
    insuranceNumber: 'SIS-44019283',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    notes: 'Lleva reloj inteligente médico y tarjeta física Código Vida en su billetera.',
    createdAt: '2026-03-15T16:45:00Z'
  }
];
