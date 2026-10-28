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
  members: [],
  ministries: [],
  events: [],
  attendance: [],
  donations: [],
  announcements: [],
}

export const STORAGE_KEY = 'iglesia-app-data'
export const SESSION_KEY = 'iglesia-app-session'

