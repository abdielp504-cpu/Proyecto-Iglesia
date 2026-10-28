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
    { id: 'evt-001', ministryId: 'min-001', title: 'Ensayo general', type: 'ADMINISTRATIVO', date: '2026-11-05', time: '19:30', location: 'Salón principal', description: 'Preparación musical para el culto dominical.', responsibleId: 'mbr-001', status: 'PROGRAMADO' },
    { id: 'evt-002', ministryId: 'min-002', title: 'Reunión de jóvenes', type: 'ADMINISTRATIVO', date: '2026-11-07', time: '18:00', location: 'Salón de usos múltiples', description: 'Reunión semanal de formación y convivencia.', responsibleId: 'usr-coordinator', status: 'PROGRAMADO' },
    { id: 'evt-003', ministryId: 'min-003', title: 'Visita comunitaria', type: 'ADMINISTRATIVO', date: '2026-11-14', time: '09:00', location: 'Punto de encuentro', description: 'Servicio de apoyo a familias de la comunidad.', responsibleId: 'mbr-005', status: 'PROGRAMADO' },
    { id: 'evt-004', title: 'Culto de celebración', type: 'RELIGIOSO', date: '2026-11-08', time: '10:00', location: 'Templo principal', description: 'Reunión general de adoración y enseñanza.', responsibleId: 'usr-pastor', status: 'PROGRAMADO' },
  ],
  attendance: [
    { id: 'att-001', eventId: 'evt-004', date: '2026-10-25', records: [{ memberId: 'mbr-001', status: 'PRESENTE' }, { memberId: 'mbr-002', status: 'PRESENTE' }, { memberId: 'mbr-003', status: 'AUSENTE' }, { memberId: 'mbr-005', status: 'PRESENTE' }], savedAt: '2026-10-25T13:00:00.000Z' },
  ],
  donations: [
    { id: 'don-001', date: '2026-10-03', amount: 1250, concept: 'DIEZMO', method: 'TRANSFERENCIA', anonymous: false, memberId: 'mbr-001' },
    { id: 'don-002', date: '2026-10-11', amount: 860, concept: 'OFRENDA_GENERAL', method: 'EFECTIVO', anonymous: true, memberId: null },
    { id: 'don-003', date: '2026-10-18', amount: 2400, concept: 'CONSTRUCCION', method: 'DEPOSITO', anonymous: false, memberId: 'mbr-002' },
  ],
  announcements: [
    { id: 'ann-001', title: 'Campaña de apoyo comunitario', content: 'Durante noviembre estaremos reuniendo alimentos no perecederos para familias de nuestra comunidad. Puedes entregarlos los domingos en recepción.', publishedAt: '2026-10-20', importance: 'IMPORTANTE' },
    { id: 'ann-002', title: 'Nuevo horario de estudio bíblico', content: 'A partir de esta semana el estudio bíblico se realizará los miércoles a las 19:30 en el salón principal.', publishedAt: '2026-10-15', importance: 'GENERAL' },
  ],
}

export const STORAGE_KEY = 'iglesia-app-data'
export const SESSION_KEY = 'iglesia-app-session'
