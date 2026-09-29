export type BuildingType = 'SEGURO' | 'NO_SEGURO';

export type InternetType = 'Gigared' | 'Externo' | 'Sin dato';

export type DiskStatus = 'SI' | 'NO' | 'PARCIAL';

export type StorageType = 'Storage-1' | 'Storage-2' | 'Storage' | 'Disco' | 'Disco Local' | 'Otro' | 'Sin Storage';

export type KeyStatus = 'En tablero' | 'Entregada a guardia' | 'Prestada a técnico' | 'Devuelta a cliente' | 'Perdida / A reponer';

export interface Building {
  id: string; // EDIF-001
  address: string; // SAN LUIS 851
  buildingName: string; // NANDO
  adminId: string; // ID Administrador
  cameraCount: number; // 4
  monitor: string; // M1, M2, M3, M4...
  buildingType: BuildingType; // SEGURO / NO_SEGURO
  gigaredClientNumber: string; // Nº cliente Gigared
  internetType: InternetType; // Gigared / Externo / Sin dato
  ipAddress: string; // IP
  registrationDate: string; // Fecha de alta
  hasDisk: DiskStatus; // Sí / No
  storageType: StorageType; // Storage-1 / Storage-2 / Disco / Otro
  storageChannels: string; // Canales de Storage (ej: 140-144)
  physicalGuard: string; // Sí / No / Portería diurna / Tótem / Otro
  lockType: string; // Magnética, Electromecánica, etc.
  hasGateRemoteControl?: 'SI' | 'NO'; // ¿Tiene control remoto de portón? SI / NO
  remoteControlInfo: string; // Ej: 2 controles - Portón
  remoteControlCount: number;
  serialNumber: string; // Nº de serie DVR/NVR
  paymentLocation: string; // Lugar de cobro
  dvrLocation: string; // Ubicación DVR/NVR
  dvrAccessMethod: string; // Cómo acceder al equipo
  guardSchedule: string; // Horario portero/guardia
  rebootProcedure: string; // Procedimiento de reinicio
  currentNote: string; // Nota operativa actual
  lastNoteOperator: string; // Última nota por (Operador)
  lastNoteDate: string; // Fecha/hora última nota
  operationalPhotos: string[]; // URLs or base64
  keyHasPhysical: 'SI' | 'NO'; // Llave física disponible
  keyHookNumber: string; // Gancho de tablero (ej: "17" o "" si no asignado)
  status?: 'ACTIVO' | 'BAJA'; // Estado del edificio (ACTIVO por defecto)
  createdAt: string;
  updatedAt: string;
}

export interface DecommissionRecord {
  id: string; // BAJA-001
  buildingId: string;
  address: string;
  buildingName: string;
  adminId: string;
  adminName: string;
  decommissionDate: string; // YYYY-MM-DD
  reason: string; // Motivo principal
  reasonDetail: string; // Detalle explicativo
  keyReturned: 'SI' | 'NO' | 'NO_TENIA'; // Si se devolvió la llave al cliente o no
  keyReturnDetails?: string; // Ej: "Entregada con remito firmado a Administración" / "Pendiente de retiro"
  operatorName: string; // Operador que gestionó la baja
  camerasCount: number;
  equipmentRetrieved?: string; // Retiro de equipos
  timestamp: string; // Fecha y hora ISO del registro
  buildingSnapshot: Building; // Copia completa del edificio al momento de la baja
}

export interface Administrator {
  id: string; // ADM-001
  name: string; // JORDAN PABLO
  officeAddress: string;
  email: string;
  primaryPhone: string;
  alternativePhone: string;
  notes: string;
  createdAt: string;
}

export interface KeyItem {
  id: string; // LL-001
  buildingId: string;
  keyType: string; // Acceso Principal, Portón, Rack, etc.
  hookNumber: string; // "17"
  status: KeyStatus;
  location: string;
  notes: string;
  photo?: string;
  updatedAt: string;
}

export interface Operator {
  id: string;
  name: string;
  shift: string;
  active: boolean;
  role: 'OPERADOR' | 'SUPERVISOR';
}

export interface AuditLog {
  id: string;
  buildingId: string;
  buildingAddress: string;
  operatorName: string;
  timestamp: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  actionType: 'NOTA_OPERATIVA' | 'MODIFICACION_TECNICA' | 'LLAVE_GANCHO' | 'ALTA_EDIFICIO' | 'BAJA_EDIFICIO' | 'REACTIVACION_EDIFICIO' | 'IMPORTACION';
}

export type ActiveTab = 
  | 'ficha_rapida'
  | 'modificar_datos'
  | 'tablero_llaves'
  | 'administradores'
  | 'dashboard_calidad'
  | 'tabla_maestra'
  | 'historial_auditoria'
  | 'historial_bajas';

