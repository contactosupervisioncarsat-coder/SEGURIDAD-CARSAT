import { useState } from 'react';
import { Building, Administrator, BuildingType, InternetType, DiskStatus, StorageType } from '../types';
import { StorageService } from '../services/storage';
import {
  X,
  Building as BuildingIcon,
  Save,
  Camera,
  Wifi,
  HardDrive,
  Key,
  Power,
  Users,
  Plus,
  Check,
} from 'lucide-react';

interface NewBuildingModalProps {
  administrators: Administrator[];
  isOpen: boolean;
  onClose: () => void;
  onCreated: (building: Building) => void;
  onAdminCreated?: (admin: Administrator) => void;
  currentOperator: string;
}

export function NewBuildingModal({
  administrators,
  isOpen,
  onClose,
  onCreated,
  onAdminCreated,
  currentOperator,
}: NewBuildingModalProps) {
  // Building basic state
  const [address, setAddress] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [buildingType, setBuildingType] = useState<BuildingType>('SEGURO');
  const [cameraCount, setCameraCount] = useState(4);
  const [monitor, setMonitor] = useState('M1');
  const [gigaredClientNumber, setGigaredClientNumber] = useState('');
  const [internetType, setInternetType] = useState<InternetType>('Gigared');
  const [ipAddress, setIpAddress] = useState('');

  // Storage state
  const [hasDisk, setHasDisk] = useState<DiskStatus>('SI');
  const [storageType, setStorageType] = useState<StorageType>('Storage-1');
  const [storageChannels, setStorageChannels] = useState('140-144');

  // Administrator state (choose existing or create new on the fly)
  const [adminMode, setAdminMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [adminId, setAdminId] = useState(administrators[0]?.id || '');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPrimaryPhone, setNewAdminPrimaryPhone] = useState('');
  const [newAdminAltPhone, setNewAdminAltPhone] = useState('');
  const [newAdminOfficeAddress, setNewAdminOfficeAddress] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminNotes, setNewAdminNotes] = useState('');

  // Other technical fields
  const [physicalGuard, setPhysicalGuard] = useState('NO');
  const [lockType, setLockType] = useState('Cerradura electromagnética 12V');
  const [hasGateRemoteControl, setHasGateRemoteControl] = useState<'SI' | 'NO'>('SI');
  const [remoteControlInfo, setRemoteControlInfo] = useState('2 controles - Portón levadizo cocheras');
  const [remoteControlCount, setRemoteControlCount] = useState(2);
  const [serialNumber, setSerialNumber] = useState('');
  const [paymentLocation, setPaymentLocation] = useState('');
  const [dvrLocation, setDvrLocation] = useState('');
  const [dvrAccessMethod, setDvrAccessMethod] = useState('');
  const [guardSchedule, setGuardSchedule] = useState('');
  const [rebootProcedure, setRebootProcedure] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [keyHasPhysical, setKeyHasPhysical] = useState<'SI' | 'NO'>('SI');
  const [keyHookNumber, setKeyHookNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    let finalAdminId = adminId;

    // If adding a new administrator on the fly
    if (adminMode === 'NEW') {
      if (!newAdminName.trim()) {
        alert('Por favor ingrese el nombre del nuevo administrador.');
        return;
      }
      const newAdmId = `ADM-${String(Date.now()).slice(-4)}`;
      const newAdmin: Administrator = {
        id: newAdmId,
        name: newAdminName.trim().toUpperCase(),
        primaryPhone: newAdminPrimaryPhone.trim(),
        alternativePhone: newAdminAltPhone.trim(),
        officeAddress: newAdminOfficeAddress.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        notes: newAdminNotes.trim(),
        createdAt: new Date().toISOString(),
      };

      StorageService.saveAdministrator(newAdmin);
      finalAdminId = newAdmId;
      if (onAdminCreated) {
        onAdminCreated(newAdmin);
      }
    }

    const newId = `EDIF-${String(Date.now()).slice(-4)}`;
    const now = new Date().toISOString();

    const newBuilding: Building = {
      id: newId,
      address: address.trim().toUpperCase(),
      buildingName: buildingName.trim().toUpperCase(),
      adminId: finalAdminId,
      cameraCount: Number(cameraCount) || 1,
      monitor,
      buildingType,
      gigaredClientNumber: gigaredClientNumber.trim(),
      internetType,
      ipAddress: ipAddress.trim(),
      registrationDate: now.slice(0, 10),
      hasDisk,
      storageType,
      storageChannels: storageChannels.trim(),
      physicalGuard,
      lockType,
      hasGateRemoteControl,
      remoteControlInfo,
      remoteControlCount: Number(remoteControlCount) || 0,
      serialNumber: serialNumber.trim(),
      paymentLocation,
      dvrLocation,
      dvrAccessMethod,
      guardSchedule,
      rebootProcedure,
      currentNote: currentNote.trim(),
      lastNoteOperator: currentOperator,
      lastNoteDate: now.replace('T', ' ').substring(0, 16),
      operationalPhotos: [],
      keyHasPhysical,
      keyHookNumber: keyHookNumber.trim(),
      status: 'ACTIVO',
      createdAt: now,
      updatedAt: now,
    };

    StorageService.saveBuilding(newBuilding, currentOperator, 'ALTA_EDIFICIO');

    // If has key and hook, also register into Keys table
    if (keyHasPhysical === 'SI') {
      StorageService.saveKey(
        {
          id: `LL-${String(Date.now()).slice(-4)}`,
          buildingId: newId,
          keyType: 'Acceso General y Sala DVR',
          hookNumber: keyHookNumber.trim(),
          status: 'En tablero',
          location: 'Tablero Central Sala Monitoreo',
          notes: `Llavero para ${address}`,
          updatedAt: now,
        },
        currentOperator
      );
    }

    onCreated(newBuilding);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-xs">
        
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <BuildingIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Alta de Nuevo Edificio en Sala de Monitoreo
              </h2>
              <p className="text-[11px] text-slate-400">
                Complete los datos técnicos para incorporarlo a la base de guardia CCTV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Identificación Principal */}
          <div>
            <h3 className="font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-xs">
              <span>1. Identificación Principal</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Dirección (Calle y Número) *
                </label>
                <input
                  type="text"
                  placeholder="Ej: SAN LUIS 851"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre del edificio (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: NANDO"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de Edificio
                </label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold"
                >
                  <option value="SEGURO">🟢 Edificio Seguro</option>
                  <option value="NO_SEGURO">⚪ Edificio No Seguro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Lugar de Cobro
                </label>
                <input
                  type="text"
                  placeholder="Ej: Débito / Cobrador"
                  value={paymentLocation}
                  onChange={(e) => setPaymentLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Guardia Física
                </label>
                <input
                  type="text"
                  placeholder="Ej: Portería diurna / NO / 24hs"
                  value={physicalGuard}
                  onChange={(e) => setPhysicalGuard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* ADMINISTRADOR (SELECCIONAR EXISTENTE O CREAR NUEVO) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-sky-400" />
                <span>2. Administrador / Consorcio</span>
              </h3>

              {/* Selector de modo: Existente vs Nuevo */}
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAdminMode('EXISTING')}
                  className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                    adminMode === 'EXISTING'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Elegir existente
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMode('NEW')}
                  className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    adminMode === 'NEW'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  + Nuevo administrador
                </button>
              </div>
            </div>

            {adminMode === 'EXISTING' ? (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Seleccionar Administrador de la lista
                </label>
                <select
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
                >
                  <option value="">-- Sin Administrador asignado --</option>
                  {administrators.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.name} {adm.primaryPhone ? `(${adm.primaryPhone})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Si el administrador no está en la lista, haga clic arriba en "+ Nuevo administrador" para crearlo directamente.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Datos del Nuevo Administrador a Registrar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nombre o Razón Social *
                    </label>
                    <input
                      type="text"
                      required={adminMode === 'NEW'}
                      placeholder="Ej: ESTUDIO PÉREZ Y ASOC."
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Teléfono Principal *
                    </label>
                    <input
                      type="text"
                      required={adminMode === 'NEW'}
                      placeholder="Ej: 341-456-7890"
                      value={newAdminPrimaryPhone}
                      onChange={(e) => setNewAdminPrimaryPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Teléfono Alternativo / Celular
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 341-155-123456"
                      value={newAdminAltPhone}
                      onChange={(e) => setNewAdminAltPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Email de contacto
                    </label>
                    <input
                      type="email"
                      placeholder="Ej: contacto@administracion.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Domicilio de Oficina
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Santa Fe 1420 Piso 2"
                      value={newAdminOfficeAddress}
                      onChange={(e) => setNewAdminOfficeAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Observaciones de contacto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Atiende de 9 a 14hs"
                      value={newAdminNotes}
                      onChange={(e) => setNewAdminNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cámaras & Red */}
          <div>
            <h3 className="font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-xs">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>3. Cámaras & Conectividad IP</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cantidad de Cámaras
                </label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={cameraCount}
                  onChange={(e) => setCameraCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Monitor Asignado
                </label>
                <select
                  value={monitor}
                  onChange={(e) => setMonitor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                >
                  <option value="M1">Monitor M1</option>
                  <option value="M2">Monitor M2</option>
                  <option value="M3">Monitor M3</option>
                  <option value="M4">Monitor M4</option>
                  <option value="M5">Monitor M5</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dirección IP
                </label>
                <input
                  type="text"
                  placeholder="Ej: 190.183.45.120"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value.trim())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de Internet
                </label>
                <select
                  value={internetType}
                  onChange={(e) => setInternetType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Gigared">Gigared</option>
                  <option value="Externo">Externo</option>
                  <option value="Sin dato">Sin dato</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Nº Cliente Gigared
                </label>
                <input
                  type="text"
                  placeholder="Ej: 948123"
                  value={gigaredClientNumber}
                  onChange={(e) => setGigaredClientNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Nº de Serie del DVR/NVR
                </label>
                <input
                  type="text"
                  placeholder="Ej: DS-7204HQHI-K1/042018"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Grabación & Storage (relacionado con Storage 1 / 2 y canal) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h3 className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>4. Grabación & Servidor de Storage</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ¿Tiene Disco en el equipo?
                </label>
                <select
                  value={hasDisk}
                  onChange={(e) => setHasDisk(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="SI">💾 Con Disco</option>
                  <option value="NO">Sin Disco</option>
                  <option value="PARCIAL">Parcial</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Servidor / Tipo de Storage
                </label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-semibold"
                >
                  <option value="Storage-1">Storage-1</option>
                  <option value="Storage-2">Storage-2</option>
                  <option value="Storage">Storage estándar</option>
                  <option value="Disco Local">Disco Local</option>
                  <option value="Sin Storage">Sin Storage</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Canales de Storage (ej: 140-144)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 140-144"
                  value={storageChannels}
                  onChange={(e) => setStorageChannels(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * El número de canales indica el rango asignado en el servidor Storage-1 o Storage-2 para este edificio.
            </p>
          </div>

          {/* Llaves de Guardia & Tablero */}
          <div>
            <h3 className="font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-xs">
              <Key className="w-4 h-4 text-amber-400" />
              <span>5. Llaves de Guardia & Gancho de Tablero</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ¿Posee llave física disponible?
                </label>
                <select
                  value={keyHasPhysical}
                  onChange={(e) => setKeyHasPhysical(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold"
                >
                  <option value="SI">Sí, posee llave</option>
                  <option value="NO">No posee llave</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Gancho de Tablero (dejar vacío si aún no está asignado)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 17 (o vacío)"
                  value={keyHookNumber}
                  onChange={(e) => setKeyHookNumber(e.target.value.trim())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  🚗 ¿Tiene control remoto de portón?
                </label>
                <select
                  value={hasGateRemoteControl}
                  onChange={(e) => {
                    const val = e.target.value as 'SI' | 'NO';
                    setHasGateRemoteControl(val);
                    if (val === 'NO') {
                      setRemoteControlInfo('Sin control');
                      setRemoteControlCount(0);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                >
                  <option value="SI">SÍ (Tiene control remoto de portón)</option>
                  <option value="NO">NO (No tiene control)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detalle / Cantidad de Controles de Portón
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2 controles - Portón levadizo cocheras"
                  value={remoteControlInfo}
                  onChange={(e) => setRemoteControlInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Ubicación y Procedimientos Críticos */}
          <div>
            <h3 className="font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-xs">
              <Power className="w-4 h-4 text-red-400" />
              <span>6. Operatividad Crítica para Guardias</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Procedimiento de Reinicio de Emergencia
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Cortar alimentación durante 30 segundos bajando la térmica Nº 4 'CCTV' en el subsuelo..."
                  value={rebootProcedure}
                  onChange={(e) => setRebootProcedure(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ubicación del DVR/NVR
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Armario en subsuelo, sector bombas"
                    value={dvrLocation}
                    onChange={(e) => setDvrLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cómo acceder al equipo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pedir llave al encargado o solicitar al tablero gancho 17"
                    value={dvrAccessMethod}
                    onChange={(e) => setDvrAccessMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nota Operativa Inicial
                </label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones para operadores de guardia al vigilar este edificio..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">
              Operador registrando: <strong className="text-white">{currentOperator}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Nuevo Edificio</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
