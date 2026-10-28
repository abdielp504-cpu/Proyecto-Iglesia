export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  PASTOR: 'PASTOR',
  SECRETARIO: 'SECRETARIO',
  TESORERO: 'TESORERO',
  COORDINADOR: 'COORDINADOR',
}

export const ROLE_LABELS = {
  ADMINISTRADOR: 'Administrador',
  PASTOR: 'Pastor',
  SECRETARIO: 'Secretario',
  TESORERO: 'Tesorero',
  COORDINADOR: 'Coordinador',
}

export const seedData = {
  users: [
    { id: 'usr-admin', name: 'María González', email: 'admin@iglesia.org', password: 'Admin123!', role: ROLES.ADMINISTRADOR, active: true },
    { id: 'usr-pastor', name: 'Samuel Martínez', email: 'pastor@iglesia.org', password: 'Pastor123!', role: ROLES.PASTOR, active: true },
    { id: 'usr-secretary', name: 'Ana López', email: 'secretaria@iglesia.org', password: 'Secretaria123!', role: ROLES.SECRETARIO, active: true },
    { id: 'usr-treasurer', name: 'Carlos Ramírez', email: 'tesorero@iglesia.org', password: 'Tesorero123!', role: ROLES.TESORERO, active: true },
    { id: 'usr-coordinator', name: 'Lucía Herrera', email: 'coordinadora@iglesia.org', password: 'Coordinadora123!', role: ROLES.COORDINADOR, active: true },
  ],
  churchConfig: {
    name: 'Iglesia Comunidad de Gracia',
    logo: '',
    address: 'Av. de la Esperanza 123, Ciudad de México',
    phone: '+52 55 5555 0101',
    email: 'contacto@comunidaddegracia.org',
    meetingSchedule: 'Domingos 10:00 y 12:00\nMiércoles 19:30 - Estudio bíblico\nViernes 20:00 - Jóvenes',
    about: 'Somos una comunidad cristiana que busca amar a Dios, servir a las personas y compartir esperanza con nuestra ciudad.',
  },
  members: [
    { id: 'mbr-001', fullName: 'Elena Martínez Cruz', phone: '+52 55 5555 0110', email: 'elena.martinez@example.org', joinDate: '2022-03-15', status: 'ACTIVO' },
    { id: 'mbr-002', fullName: 'Jorge Ramírez Soto', phone: '+52 55 5555 0111', email: 'jorge.ramirez@example.org', joinDate: '2021-08-22', status: 'ACTIVO' },
    { id: 'mbr-003', fullName: 'Patricia Gómez Díaz', phone: '+52 55 5555 0112', email: 'patricia.gomez@example.org', joinDate: '2023-01-09', status: 'ACTIVO' },
    { id: 'mbr-004', fullName: 'Miguel Torres Silva', phone: '+52 55 5555 0113', email: 'miguel.torres@example.org', joinDate: '2020-11-30', status: 'INACTIVO' },
    { id: 'mbr-005', fullName: 'Sofía Hernández Ruiz', phone: '+52 55 5555 0114', email: 'sofia.hernandez@example.org', joinDate: '2024-02-18', status: 'ACTIVO' },
  ],
  ministries: [
    { id: 'min-001', name: 'Ministerio de Música', description: 'Culto y servicio musical en las reuniones de la iglesia.', responsibleId: 'usr-coordinator', memberIds: ['mbr-001', 'mbr-003'], color: 'indigo' },
    { id: 'min-002', name: 'Jóvenes', description: 'Acompañamiento y formación para jóvenes de la comunidad.', responsibleId: 'usr-coordinator', memberIds: ['mbr-002'], color: 'emerald' },
    { id: 'min-003', name: 'Servicio y Ayuda', description: 'Acciones de servicio práctico y apoyo a familias.', responsibleId: 'usr-coordinator', memberIds: ['mbr-001', 'mbr-005'], color: 'amber' },
  ],
  events: [
    { id: 'evt-001', ministryId: 'min-001', title: 'Ensayo general', date: '2026-11-05', time: '19:30', location: 'Salón principal' },
    { id: 'evt-002', ministryId: 'min-002', title: 'Reunión de jóvenes', date: '2026-11-07', time: '18:00', location: 'Salón de usos múltiples' },
    { id: 'evt-003', ministryId: 'min-003', title: 'Visita comunitaria', date: '2026-11-14', time: '09:00', location: 'Punto de encuentro' },
  ],
  attendance: [],
  donations: [],
  announcements: [],
}

export const STORAGE_KEY = 'iglesia-app-data'
export const SESSION_KEY = 'iglesia-app-session'
