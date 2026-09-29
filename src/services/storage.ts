import { Building, Administrator, KeyItem, Operator, AuditLog, DecommissionRecord } from '../types';
import {
  INITIAL_BUILDINGS,
  INITIAL_ADMINISTRATORS,
  INITIAL_KEYS,
  INITIAL_OPERATORS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DECOMMISSIONS,
} from '../data/initialData';

const STORAGE_KEYS = {
  BUILDINGS: 'carsat_cctv_buildings_v2',
  ADMINISTRATORS: 'carsat_cctv_administrators_v2',
  KEYS: 'carsat_cctv_keys_v2',
  OPERATORS: 'carsat_cctv_operators_v2',
  AUDIT: 'carsat_cctv_audit_logs_v2',
  DECOMMISSIONS: 'carsat_cctv_decommissions_v2',
  ACTIVE_OPERATOR: 'carsat_cctv_active_operator_v2',
  USER_ROLE: 'carsat_cctv_user_role_v2',
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  // --- BUILDINGS ---
  getAllBuildings(): Building[] {
    const isInit = safeGet<boolean>('carsat_buildings_initialized_v2', false);
    const data = safeGet<Building[] | null>(STORAGE_KEYS.BUILDINGS, null);
    if (!isInit || data === null) {
      safeSet('carsat_buildings_initialized_v2', true);
      safeSet(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
      return INITIAL_BUILDINGS;
    }
    return data;
  },

  getBuildings(): Building[] {
    // Only return active buildings by default for monitoring operations
    return this.getAllBuildings().filter((b) => b.status !== 'BAJA');
  },

  getDecommissionedBuildings(): Building[] {
    return this.getAllBuildings().filter((b) => b.status === 'BAJA');
  },

  getBuildingById(id: string): Building | undefined {
    return this.getAllBuildings().find((b) => b.id === id);
  },

  saveBuilding(building: Building, operatorName: string, reason = 'MODIFICACION_TECNICA'): void {
    const buildings = this.getAllBuildings();
    const index = buildings.findIndex((b) => b.id === building.id);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedBuilding: Building = {
      ...building,
      status: building.status || 'ACTIVO',
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      const oldBuilding = buildings[index];
      buildings[index] = updatedBuilding;

      // Log changes
      const diffFields = Object.keys(updatedBuilding) as (keyof Building)[];
      diffFields.forEach((field) => {
        if (
          field !== 'updatedAt' &&
          field !== 'operationalPhotos' &&
          JSON.stringify(oldBuilding[field]) !== JSON.stringify(updatedBuilding[field])
        ) {
          this.addAuditLog({
            id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            buildingId: building.id,
            buildingAddress: `${building.address} (${building.buildingName})`,
            operatorName,
            timestamp: now,
            fieldChanged: String(field),
            oldValue: String(oldBuilding[field] ?? ''),
            newValue: String(updatedBuilding[field] ?? ''),
            actionType: field === 'currentNote' ? 'NOTA_OPERATIVA' : (reason as any),
          });
        }
      });
    } else {
      buildings.push(updatedBuilding);
      this.addAuditLog({
        id: 'LOG-' + Date.now(),
        buildingId: building.id,
        buildingAddress: `${building.address} (${building.buildingName})`,
        operatorName,
        timestamp: now,
        fieldChanged: 'ALTA_NUEVO_EDIFICIO',
        oldValue: '',
        newValue: building.address,
        actionType: 'ALTA_EDIFICIO',
      });
    }

    safeSet(STORAGE_KEYS.BUILDINGS, buildings);
    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  updateOperationalNote(
    buildingId: string,
    newNote: string,
    operatorName: string
  ): Building | null {
    const buildings = this.getBuildings();
    const index = buildings.findIndex((b) => b.id === buildingId);
    if (index === -1) return null;

    const building = buildings[index];
    const oldNote = building.currentNote;
    const nowFormat = new Date().toISOString().replace('T', ' ').substring(0, 16);

    building.currentNote = newNote;
    building.lastNoteOperator = operatorName;
    building.lastNoteDate = nowFormat;
    building.updatedAt = new Date().toISOString();

    buildings[index] = building;
    safeSet(STORAGE_KEYS.BUILDINGS, buildings);

    this.addAuditLog({
      id: 'LOG-' + Date.now(),
      buildingId,
      buildingAddress: `${building.address} (${building.buildingName})`,
      operatorName,
      timestamp: nowFormat,
      fieldChanged: 'currentNote',
      oldValue: oldNote,
      newValue: newNote,
      actionType: 'NOTA_OPERATIVA',
    });

    window.dispatchEvent(new Event('carsat_data_changed'));
    return building;
  },

  deleteBuilding(id: string, operatorName: string): void {
    const buildings = this.getAllBuildings();
    const building = buildings.find((b) => b.id === id);
    const filtered = buildings.filter((b) => b.id !== id);
    safeSet(STORAGE_KEYS.BUILDINGS, filtered);

    // Also remove associated keys from board
    const keys = this.getKeys();
    const filteredKeys = keys.filter((k) => k.buildingId !== id);
    safeSet(STORAGE_KEYS.KEYS, filteredKeys);

    if (building) {
      this.addAuditLog({
        id: 'LOG-' + Date.now(),
        buildingId: id,
        buildingAddress: `${building.address} (${building.buildingName})`,
        operatorName,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        fieldChanged: 'BORRADO_DEFINITIVO',
        oldValue: building.address,
        newValue: 'ELIMINADO_PERMANENTE',
        actionType: 'MODIFICACION_TECNICA',
      });
    }

    this.pushToServer();
    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  deleteExampleBuildings(operatorName: string): number {
    const demoIds = new Set(['EDIF-001', 'EDIF-002', 'EDIF-003', 'EDIF-004', 'EDIF-005', 'EDIF-006', 'EDIF-007', 'EDIF-008']);
    const buildings = this.getAllBuildings();
    const toDelete = buildings.filter((b) => demoIds.has(b.id));
    if (toDelete.length === 0) return 0;

    const remaining = buildings.filter((b) => !demoIds.has(b.id));
    safeSet(STORAGE_KEYS.BUILDINGS, remaining);

    // Also remove associated demo keys
    const keys = this.getKeys();
    const filteredKeys = keys.filter((k) => !demoIds.has(k.buildingId));
    safeSet(STORAGE_KEYS.KEYS, filteredKeys);

    this.addAuditLog({
      id: 'LOG-' + Date.now(),
      buildingId: 'DEMO-BATCH',
      buildingAddress: `${toDelete.length} Edificios de Ejemplo`,
      operatorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fieldChanged: 'BORRADO_EJEMPLOS',
      oldValue: `${toDelete.length} edificios demo`,
      newValue: 'ELIMINADOS_PERMANENTES',
      actionType: 'MODIFICACION_TECNICA',
    });

    this.pushToServer();
    window.dispatchEvent(new Event('carsat_data_changed'));
    return toDelete.length;
  },

  // --- ADMINISTRATORS ---
  getAdministrators(): Administrator[] {
    const data = safeGet<Administrator[]>(STORAGE_KEYS.ADMINISTRATORS, []);
    if (!data || data.length === 0) {
      safeSet(STORAGE_KEYS.ADMINISTRATORS, INITIAL_ADMINISTRATORS);
      return INITIAL_ADMINISTRATORS;
    }
    return data;
  },

  saveAdministrator(admin: Administrator): void {
    const admins = this.getAdministrators();
    const index = admins.findIndex((a) => a.id === admin.id);
    if (index >= 0) {
      admins[index] = admin;
    } else {
      admins.push(admin);
    }
    safeSet(STORAGE_KEYS.ADMINISTRATORS, admins);
    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  deleteAdministrator(id: string): void {
    const admins = this.getAdministrators().filter((a) => a.id !== id);
    safeSet(STORAGE_KEYS.ADMINISTRATORS, admins);
    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  // --- KEYS ---
  getKeys(): KeyItem[] {
    const data = safeGet<KeyItem[]>(STORAGE_KEYS.KEYS, []);
    if (!data || data.length === 0) {
      safeSet(STORAGE_KEYS.KEYS, INITIAL_KEYS);
      return INITIAL_KEYS;
    }
    return data;
  },

  saveKey(keyItem: KeyItem, operatorName: string): void {
    const keys = this.getKeys();
    const index = keys.findIndex((k) => k.id === keyItem.id);
    const now = new Date().toISOString();

    const updatedKey = { ...keyItem, updatedAt: now };

    if (index >= 0) {
      keys[index] = updatedKey;
    } else {
      keys.push(updatedKey);
    }
    safeSet(STORAGE_KEYS.KEYS, keys);

    // Sync with building keyHookNumber if building exists
    if (keyItem.buildingId) {
      const buildings = this.getBuildings();
      const bIndex = buildings.findIndex((b) => b.id === keyItem.buildingId);
      if (bIndex >= 0) {
        buildings[bIndex].keyHookNumber = keyItem.hookNumber;
        buildings[bIndex].keyHasPhysical = 'SI';
        safeSet(STORAGE_KEYS.BUILDINGS, buildings);
      }
    }

    this.addAuditLog({
      id: 'LOG-' + Date.now(),
      buildingId: keyItem.buildingId,
      buildingAddress: `Llave ${keyItem.keyType} (Gancho: ${keyItem.hookNumber || 'Sin Asignar'})`,
      operatorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fieldChanged: 'hookNumber',
      oldValue: '',
      newValue: keyItem.hookNumber,
      actionType: 'LLAVE_GANCHO',
    });

    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  deleteKey(id: string): void {
    const keys = this.getKeys().filter((k) => k.id !== id);
    safeSet(STORAGE_KEYS.KEYS, keys);
    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  // --- OPERATORS ---
  getOperators(): Operator[] {
    const data = safeGet<Operator[]>(STORAGE_KEYS.OPERATORS, []);
    if (!data || data.length === 0 || !data.some((o) => o.name === 'SUPERVISOR CARSAT 24HS')) {
      safeSet(STORAGE_KEYS.OPERATORS, INITIAL_OPERATORS);
      return INITIAL_OPERATORS;
    }
    return data;
  },

  saveOperator(operator: Operator): void {
    const operators = this.getOperators();
    const index = operators.findIndex((o) => o.id === operator.id);
    if (index >= 0) {
      operators[index] = operator;
    } else {
      operators.push(operator);
    }
    safeSet(STORAGE_KEYS.OPERATORS, operators);
    this.pushToServer();
    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  getActiveOperator(): string {
    const op = safeGet<string>(STORAGE_KEYS.ACTIVE_OPERATOR, 'SANABRIA MIGUEL');
    if (op === 'Diego Pérez' || op === 'SUPERVISIÓN CARSAT' || !op) {
      return 'SANABRIA MIGUEL';
    }
    return op;
  },

  setActiveOperator(name: string): void {
    safeSet(STORAGE_KEYS.ACTIVE_OPERATOR, name);
    window.dispatchEvent(new Event('carsat_operator_changed'));
  },

  getUserRole(): 'OPERADOR' | 'SUPERVISOR' {
    // If stored as supervisor, verify that session is still valid
    const role = safeGet<'OPERADOR' | 'SUPERVISOR'>(STORAGE_KEYS.USER_ROLE, 'OPERADOR');
    if (role === 'SUPERVISOR' && !this.isSupervisorVerified()) {
      return 'OPERADOR';
    }
    return role;
  },

  setUserRole(role: 'OPERADOR' | 'SUPERVISOR'): void {
    safeSet(STORAGE_KEYS.USER_ROLE, role);
    window.dispatchEvent(new Event('carsat_operator_changed'));
  },

  // --- SUPERVISOR EXCLUSIVE ACCESS ---
  SUPERVISOR_EMAIL: 'contacto.supervision.carsat@gmail.com',

  isSupervisorVerified(): boolean {
    return safeGet<boolean>('carsat_supervisor_verified_v3', false);
  },

  setSupervisorVerified(verified: boolean): void {
    safeSet('carsat_supervisor_verified_v3', verified);
    if (!verified) {
      this.setUserRole('OPERADOR');
    }
  },

  async verifySupervisorCredentials(email: string, pin?: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail !== this.SUPERVISOR_EMAIL) {
      return {
        success: false,
        error: `Acceso denegado: Únicamente la cuenta autorizada (${this.SUPERVISOR_EMAIL}) puede ingresar al Modo Supervisor.`,
      };
    }

    // Try server verification endpoint if running
    try {
      const res = await fetch('/api/auth/supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, pin }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.setSupervisorVerified(true);
          this.setUserRole('SUPERVISOR');
          return { success: true };
        }
      }
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        return { success: false, error: data.error };
      }
    } catch {
      // Offline fallback: verify email directly
      if (cleanEmail === this.SUPERVISOR_EMAIL) {
        this.setSupervisorVerified(true);
        this.setUserRole('SUPERVISOR');
        return { success: true };
      }
    }

    return { success: false, error: 'Credenciales inválidas.' };
  },

  logoutSupervisor(): void {
    this.setSupervisorVerified(false);
    this.setUserRole('OPERADOR');
    window.dispatchEvent(new Event('carsat_operator_changed'));
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    const data = safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT, []);
    if (!data || data.length === 0) {
      safeSet(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return data;
  },

  addAuditLog(log: AuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log); // Newer first
    // Limit to latest 300 logs for cleanliness
    if (logs.length > 300) logs.length = 300;
    safeSet(STORAGE_KEYS.AUDIT, logs);
  },

  // --- DECOMMISSIONS (HISTORIAL DE BAJAS) ---
  getDecommissions(): DecommissionRecord[] {
    const data = safeGet<DecommissionRecord[]>(STORAGE_KEYS.DECOMMISSIONS, []);
    if (!data || data.length === 0) {
      safeSet(STORAGE_KEYS.DECOMMISSIONS, INITIAL_DECOMMISSIONS);
      return INITIAL_DECOMMISSIONS;
    }
    return data;
  },

  decommissionBuilding(params: {
    buildingId: string;
    decommissionDate: string;
    reason: string;
    reasonDetail: string;
    keyReturned: 'SI' | 'NO' | 'NO_TENIA';
    keyReturnDetails?: string;
    equipmentRetrieved?: string;
    operatorName: string;
  }): DecommissionRecord | null {
    const allBuildings = this.getAllBuildings();
    const index = allBuildings.findIndex((b) => b.id === params.buildingId);
    if (index === -1) return null;

    const building = { ...allBuildings[index] };
    const admin = this.getAdministrators().find((a) => a.id === building.adminId);
    const nowIso = new Date().toISOString();
    const nowFormat = nowIso.replace('T', ' ').substring(0, 16);

    const oldHook = building.keyHookNumber;

    // Snapshot of the building before modifying
    const snapshot = JSON.parse(JSON.stringify(building));

    // Update building status
    building.status = 'BAJA';
    building.updatedAt = nowIso;
    if (params.keyReturned === 'SI') {
      building.keyHookNumber = '';
      building.keyHasPhysical = 'NO';
    }

    allBuildings[index] = building;
    safeSet(STORAGE_KEYS.BUILDINGS, allBuildings);

    // If key was in tablero and returned, free hook or update key item
    if (params.keyReturned === 'SI' && oldHook) {
      const keys = this.getKeys();
      const kIndex = keys.findIndex((k) => k.buildingId === building.id);
      if (kIndex >= 0) {
        keys[kIndex].status = 'Devuelta a cliente';
        keys[kIndex].hookNumber = '';
        keys[kIndex].notes = `Devuelta a cliente el ${params.decommissionDate}. ${params.keyReturnDetails || ''}`;
        keys[kIndex].updatedAt = nowIso;
        safeSet(STORAGE_KEYS.KEYS, keys);
      }
    }

    // Create decommission record
    const decommId = `BAJA-${String(Date.now()).slice(-4)}`;
    const record: DecommissionRecord = {
      id: decommId,
      buildingId: building.id,
      address: building.address,
      buildingName: building.buildingName,
      adminId: building.adminId,
      adminName: admin ? admin.name : 'Sin asignar',
      decommissionDate: params.decommissionDate,
      reason: params.reason,
      reasonDetail: params.reasonDetail,
      keyReturned: params.keyReturned,
      keyReturnDetails: params.keyReturnDetails,
      operatorName: params.operatorName,
      camerasCount: building.cameraCount,
      equipmentRetrieved: params.equipmentRetrieved,
      timestamp: nowIso,
      buildingSnapshot: snapshot,
    };

    const decommissions = this.getDecommissions();
    decommissions.unshift(record);
    safeSet(STORAGE_KEYS.DECOMMISSIONS, decommissions);

    // Audit log
    this.addAuditLog({
      id: 'LOG-' + Date.now(),
      buildingId: building.id,
      buildingAddress: `${building.address} (${building.buildingName})`,
      operatorName: params.operatorName,
      timestamp: nowFormat,
      fieldChanged: 'BAJA_DE_SERVICIO',
      oldValue: 'ACTIVO',
      newValue: `BAJA (${params.reason})`,
      actionType: 'BAJA_EDIFICIO',
    });

    window.dispatchEvent(new Event('carsat_data_changed'));
    return record;
  },

  reactivateBuilding(buildingId: string, operatorName: string): boolean {
    const allBuildings = this.getAllBuildings();
    const index = allBuildings.findIndex((b) => b.id === buildingId);
    if (index === -1) return false;

    const building = allBuildings[index];
    building.status = 'ACTIVO';
    building.updatedAt = new Date().toISOString();
    allBuildings[index] = building;
    safeSet(STORAGE_KEYS.BUILDINGS, allBuildings);

    this.addAuditLog({
      id: 'LOG-' + Date.now(),
      buildingId: building.id,
      buildingAddress: `${building.address} (${building.buildingName})`,
      operatorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fieldChanged: 'REACTIVACION_DE_SERVICIO',
      oldValue: 'BAJA',
      newValue: 'ACTIVO',
      actionType: 'REACTIVACION_EDIFICIO',
    });

    window.dispatchEvent(new Event('carsat_data_changed'));
    return true;
  },

  // --- BACKUP & RESTORE ---
  exportAllDataJSON(): string {
    const payload = {
      version: '2.1',
      exportedAt: new Date().toISOString(),
      buildings: this.getAllBuildings(),
      administrators: this.getAdministrators(),
      keys: this.getKeys(),
      operators: this.getOperators(),
      auditLogs: this.getAuditLogs(),
      decommissions: this.getDecommissions(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importDataJSON(jsonStr: string, operatorName: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.buildings)) {
        safeSet(STORAGE_KEYS.BUILDINGS, data.buildings);
      }
      if (Array.isArray(data.administrators)) {
        safeSet(STORAGE_KEYS.ADMINISTRATORS, data.administrators);
      }
      if (Array.isArray(data.keys)) {
        safeSet(STORAGE_KEYS.KEYS, data.keys);
      }
      if (Array.isArray(data.operators)) {
        safeSet(STORAGE_KEYS.OPERATORS, data.operators);
      }
      if (Array.isArray(data.decommissions)) {
        safeSet(STORAGE_KEYS.DECOMMISSIONS, data.decommissions);
      }

      this.addAuditLog({
        id: 'LOG-' + Date.now(),
        buildingId: 'ALL',
        buildingAddress: 'Base de datos restaurada por archivo JSON',
        operatorName,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        fieldChanged: 'IMPORTACION_COMPLETA',
        oldValue: '',
        newValue: `${data.buildings?.length ?? 0} edificios importados`,
        actionType: 'IMPORTACION',
      });

      window.dispatchEvent(new Event('carsat_data_changed'));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetToDemo(): void {
    safeSet(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    safeSet(STORAGE_KEYS.ADMINISTRATORS, INITIAL_ADMINISTRATORS);
    safeSet(STORAGE_KEYS.KEYS, INITIAL_KEYS);
    safeSet(STORAGE_KEYS.OPERATORS, INITIAL_OPERATORS);
    safeSet(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    safeSet(STORAGE_KEYS.DECOMMISSIONS, INITIAL_DECOMMISSIONS);
    window.dispatchEvent(new Event('carsat_data_changed'));
  },

  exportBuildingsCSV(): string {
    const buildings = this.getBuildings();
    const admins = this.getAdministrators();
    const adminMap = new Map(admins.map((a) => [a.id, a.name]));

    const headers = [
      'ID',
      'Direccion',
      'Nombre Edificio',
      'Administrador',
      'Camaras',
      'Monitor',
      'Tipo de Edificio',
      'Nro Cliente Gigared',
      'Internet',
      'IP',
      'Tiene Disco',
      'Storage',
      'Canales',
      'Guardia',
      'Cerradura',
      'Tiene Control Porton',
      'Detalle Controles',
      'Nro Serie',
      'Lugar de Cobro',
      'Ubicacion DVR',
      'Como Acceder',
      'Horario Portero',
      'Reinicio',
      'Llave Fisica',
      'Gancho Tablero',
      'Nota Operativa Actual',
      'Ultima Nota Por',
      'Fecha Ultima Nota',
    ];

    const rows = buildings.map((b) => [
      b.id,
      `"${(b.address || '').replace(/"/g, '""')}"`,
      `"${(b.buildingName || '').replace(/"/g, '""')}"`,
      `"${(adminMap.get(b.adminId) || b.adminId || '').replace(/"/g, '""')}"`,
      b.cameraCount,
      b.monitor,
      b.buildingType === 'SEGURO' ? 'Edificio Seguro' : 'Edificio No Seguro',
      `"${(b.gigaredClientNumber || '').replace(/"/g, '""')}"`,
      b.internetType,
      b.ipAddress,
      b.hasDisk,
      b.storageType,
      `"${(b.storageChannels || '').replace(/"/g, '""')}"`,
      `"${(b.physicalGuard || '').replace(/"/g, '""')}"`,
      `"${(b.lockType || '').replace(/"/g, '""')}"`,
      b.hasGateRemoteControl || (b.remoteControlCount && b.remoteControlCount > 0 ? 'SI' : 'NO'),
      `"${(b.remoteControlInfo || '').replace(/"/g, '""')}"`,
      `"${(b.serialNumber || '').replace(/"/g, '""')}"`,
      `"${(b.paymentLocation || '').replace(/"/g, '""')}"`,
      `"${(b.dvrLocation || '').replace(/"/g, '""')}"`,
      `"${(b.dvrAccessMethod || '').replace(/"/g, '""')}"`,
      `"${(b.guardSchedule || '').replace(/"/g, '""')}"`,
      `"${(b.rebootProcedure || '').replace(/"/g, '""')}"`,
      b.keyHasPhysical,
      b.keyHookNumber,
      `"${(b.currentNote || '').replace(/"/g, '""')}"`,
      `"${(b.lastNoteOperator || '').replace(/"/g, '""')}"`,
      `"${(b.lastNoteDate || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  exportDecommissionsCSV(): string {
    const decommissions = this.getDecommissions();
    const headers = [
      'ID Baja',
      'ID Edificio',
      'Direccion',
      'Nombre Edificio',
      'Administrador',
      'Fecha de Baja',
      'Motivo',
      'Detalle Motivo',
      'Llave Devuelta',
      'Detalle Entrega Llave',
      'Equipamiento Retirado',
      'Operador Responsable',
      'Camaras',
      'Fecha Registro',
    ];

    const rows = decommissions.map((d) => [
      d.id,
      d.buildingId,
      `"${(d.address || '').replace(/"/g, '""')}"`,
      `"${(d.buildingName || '').replace(/"/g, '""')}"`,
      `"${(d.adminName || '').replace(/"/g, '""')}"`,
      d.decommissionDate,
      `"${(d.reason || '').replace(/"/g, '""')}"`,
      `"${(d.reasonDetail || '').replace(/"/g, '""')}"`,
      d.keyReturned === 'SI' ? 'Sí' : d.keyReturned === 'NO' ? 'No' : 'No poseía',
      `"${(d.keyReturnDetails || '').replace(/"/g, '""')}"`,
      `"${(d.equipmentRetrieved || '').replace(/"/g, '""')}"`,
      `"${(d.operatorName || '').replace(/"/g, '""')}"`,
      d.camerasCount,
      d.timestamp.substring(0, 16).replace('T', ' '),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  // --- SERVER CENTRAL DATABASE SYNC ---
  async syncWithServer(): Promise<boolean> {
    try {
      const res = await fetch('/api/database');
      if (!res.ok) return false;
      const serverData = await res.json();
      if (!serverData) {
        // If server DB file is not yet populated, push initial dataset
        await this.pushToServer();
        return true;
      }

      const localUpdated = safeGet<string>('carsat_last_sync_timestamp', '');
      if (!localUpdated || (serverData.updatedAt && serverData.updatedAt > localUpdated)) {
        if (serverData.buildings && Array.isArray(serverData.buildings)) {
          safeSet(STORAGE_KEYS.BUILDINGS, serverData.buildings);
        }
        if (serverData.administrators && Array.isArray(serverData.administrators)) {
          safeSet(STORAGE_KEYS.ADMINISTRATORS, serverData.administrators);
        }
        if (serverData.keys && Array.isArray(serverData.keys)) {
          safeSet(STORAGE_KEYS.KEYS, serverData.keys);
        }
        if (serverData.decommissions && Array.isArray(serverData.decommissions)) {
          safeSet(STORAGE_KEYS.DECOMMISSIONS, serverData.decommissions);
        }
        if (serverData.auditLogs && Array.isArray(serverData.auditLogs)) {
          safeSet(STORAGE_KEYS.AUDIT, serverData.auditLogs);
        }
        safeSet('carsat_last_sync_timestamp', serverData.updatedAt || new Date().toISOString());
        window.dispatchEvent(new Event('carsat_data_changed'));
        return true;
      }
      return false;
    } catch {
      // In offline / preview fallback
      return false;
    }
  },

  async pushToServer(): Promise<void> {
    try {
      const payload = {
        buildings: this.getAllBuildings(),
        administrators: this.getAdministrators(),
        keys: this.getKeys(),
        operators: this.getOperators(),
        decommissions: this.getDecommissions(),
        auditLogs: this.getAuditLogs(),
        updatedAt: new Date().toISOString(),
      };
      await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      safeSet('carsat_last_sync_timestamp', payload.updatedAt);
    } catch {
      // Offline fallback
    }
  },
};

