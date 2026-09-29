import { useState, useEffect } from 'react';
import { Building, Administrator, BuildingType, InternetType, DiskStatus, StorageType } from '../types';
import { X, Save, AlertTriangle, ShieldCheck, HardDrive, Wifi, Key, Camera, Power, MapPin, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storage';

interface BuildingEditModalProps {
  building: Building | null;
  administrators: Administrator[];
  allBuildings: Building[];
  currentOperator: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function BuildingEditModal({
  building,
  administrators,
  allBuildings,
  currentOperator,
  isOpen,
  onClose,
  onSaved,
}: BuildingEditModalProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Building>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (building) {
      setSelectedBuildingId(building.id);
      setFormData({ ...building });
    } else if (allBuildings.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(allBuildings[0].id);
      setFormData({ ...allBuildings[0] });
    }
  }, [building, allBuildings]);

  const handleSelectBuilding = (id: string) => {
    setSelectedBuildingId(id);
    const target = allBuildings.find((b) => b.id === id);
    if (target) {
      setFormData({ ...target });
    }
  };

  const handleChange = (field: keyof Building, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    const fullBuilding = allBuildings.find((b) => b.id === formData.id);
    if (!fullBuilding) return;

    // Build the updated object preserving protected system fields
    const updated: Building = {
      ...fullBuilding,
      adminId: formData.adminId ?? fullBuilding.adminId,
      cameraCount: Number(formData.cameraCount ?? fullBuilding.cameraCount),
      monitor: formData.monitor ?? fullBuilding.monitor,
      buildingType: (formData.buildingType as BuildingType) ?? fullBuilding.buildingType,
      ipAddress: formData.ipAddress ?? '',
      gigaredClientNumber: formData.gigaredClientNumber ?? '',
      internetType: (formData.internetType as InternetType) ?? fullBuilding.internetType,
      keyHasPhysical: formData.keyHasPhysical ?? fullBuilding.keyHasPhysical,
      keyHookNumber: formData.keyHookNumber ?? '',
      remoteControlInfo: formData.remoteControlInfo ?? '',
      remoteControlCount: Number(formData.remoteControlCount ?? 0),
      hasDisk: (formData.hasDisk as DiskStatus) ?? fullBuilding.hasDisk,
      storageType: (formData.storageType as StorageType) ?? fullBuilding.storageType,
      storageChannels: formData.storageChannels ?? '',
      serialNumber: formData.serialNumber ?? '',
      physicalGuard: formData.physicalGuard ?? '',
      lockType: formData.lockType ?? '',
      paymentLocation: formData.paymentLocation ?? '',
      dvrLocation: formData.dvrLocation ?? '',
      dvrAccessMethod: formData.dvrAccessMethod ?? '',
      guardSchedule: formData.guardSchedule ?? '',
      rebootProcedure: formData.rebootProcedure ?? '',
      currentNote: formData.currentNote ?? fullBuilding.currentNote,
    };

    StorageService.saveBuilding(updated, currentOperator, 'MODIFICACION_TECNICA');
    setToastMessage('¡Datos actualizados correctamente en la base maestra!');
    setTimeout(() => {
      setToastMessage(null);
      onSaved();
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  const currentSelectedBuilding = allBuildings.find((b) => b.id === selectedBuildingId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Actualizar Edificio</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  Capa Operativa Protegida
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Solo se pueden modificar campos técnicos y de guardia autorizados. La estructura y los identificadores quedan resguardados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Building Selector (Dropdown if multiple, or locked to current) */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-4 flex-wrap">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider shrink-0">
            🏢 Edificio a modificar:
          </label>
          <select
            value={selectedBuildingId}
            onChange={(e) => handleSelectBuilding(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            {allBuildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.address} {b.buildingName ? `(${b.buildingName})` : ''} — {b.id}
              </option>
            ))}
          </select>

          {currentSelectedBuilding && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                ID Protegido: {currentSelectedBuilding.id}
              </span>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* SECTION 1: DATOS OPERATIVOS PRINCIPALES */}
          <div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4" /> 1. Datos del Sistema & Cámaras
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de edificio
                </label>
                <select
                  value={formData.buildingType || 'SEGURO'}
                  onChange={(e) => handleChange('buildingType', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-semibold focus:border-emerald-500"
                >
                  <option value="SEGURO">🟢 Edificio Seguro</option>
                  <option value="NO_SEGURO">⚪ Edificio No Seguro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cantidad de cámaras
                </label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={formData.cameraCount ?? 4}
                  onChange={(e) => handleChange('cameraCount', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Monitor asignado
                </label>
                <select
                  value={formData.monitor || 'M1'}
                  onChange={(e) => handleChange('monitor', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-semibold focus:border-emerald-500"
                >
                  <option value="M1">Monitor M1</option>
                  <option value="M2">Monitor M2</option>
                  <option value="M3">Monitor M3</option>
                  <option value="M4">Monitor M4</option>
                  <option value="M5">Monitor M5</option>
                  <option value="M6">Monitor M6</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Administrador del edificio
                </label>
                <select
                  value={formData.adminId || ''}
                  onChange={(e) => handleChange('adminId', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-emerald-500"
                >
                  <option value="">-- Seleccionar Administrador --</option>
                  {administrators.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.name} ({adm.primaryPhone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Guardia física / Portería
                </label>
                <input
                  type="text"
                  placeholder="Ej: Portería diurna / NO / Tótem"
                  value={formData.physicalGuard || ''}
                  onChange={(e) => handleChange('physicalGuard', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Lugar de cobro
                </label>
                <input
                  type="text"
                  placeholder="Ej: En administración / Débito"
                  value={formData.paymentLocation || ''}
                  onChange={(e) => handleChange('paymentLocation', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                />
              </div>

            </div>
          </div>

          {/* SECTION 2: CONECTIVIDAD & INTERNET */}
          <div>
            <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Wifi className="w-4 h-4" /> 2. Conectividad & Red
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dirección IP
                </label>
                <input
                  type="text"
                  placeholder="Ej: 190.183.45.120"
                  value={formData.ipAddress || ''}
                  onChange={(e) => handleChange('ipAddress', e.target.value.trim())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-medium focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de Internet
                </label>
                <select
                  value={formData.internetType || 'Gigared'}
                  onChange={(e) => handleChange('internetType', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                >
                  <option value="Gigared">Gigared</option>
                  <option value="Externo">Externo (Telecom / Fibertel / Claro)</option>
                  <option value="Sin dato">Sin dato</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nº de cliente Gigared
                </label>
                <input
                  type="text"
                  placeholder="Ej: 948123"
                  value={formData.gigaredClientNumber || ''}
                  onChange={(e) => handleChange('gigaredClientNumber', e.target.value.trim())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: EQUIPO, DISCO & STORAGE */}
          <div>
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> 3. Almacenamiento & Hardware
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tiene disco
                </label>
                <select
                  value={formData.hasDisk || 'SI'}
                  onChange={(e) => handleChange('hasDisk', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                >
                  <option value="SI">Sí (Con disco instalado)</option>
                  <option value="NO">No (Sin disco)</option>
                  <option value="PARCIAL">Parcial / Dañado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de almacenamiento / Storage
                </label>
                <select
                  value={formData.storageType || 'Storage-1'}
                  onChange={(e) => handleChange('storageType', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 font-semibold"
                >
                  <option value="Storage-1">Storage-1</option>
                  <option value="Storage-2">Storage-2</option>
                  <option value="Storage">Storage estándar</option>
                  <option value="Disco Local">Disco local</option>
                  <option value="Otro">Otro</option>
                  <option value="Sin Storage">Sin Storage</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Canales de Storage (ej: 140-144)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 140-144"
                  value={formData.storageChannels || ''}
                  onChange={(e) => handleChange('storageChannels', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nº de serie DVR/NVR
                </label>
                <input
                  type="text"
                  placeholder="Ej: DS-7204HQHI-K1/042018"
                  value={formData.serialNumber || ''}
                  onChange={(e) => handleChange('serialNumber', e.target.value.trim())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: LLAVES & ACCESOS */}
          <div>
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4" /> 4. Tablero de Llaves, Controles & Cerraduras
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ¿Tiene llave física?
                </label>
                <select
                  value={formData.keyHasPhysical || 'SI'}
                  onChange={(e) => handleChange('keyHasPhysical', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                >
                  <option value="SI">Sí</option>
                  <option value="NO">No</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  📍 Gancho de tablero
                </label>
                <input
                  type="text"
                  placeholder="Ej: 17 (dejar vacío si aún no asignado)"
                  value={formData.keyHookNumber || ''}
                  onChange={(e) => handleChange('keyHookNumber', e.target.value.trim())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold text-sm focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400">
                  Si no está asignado, dejar vacío. El sistema avisará en Calidad de Datos.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  🚗 ¿Tiene control remoto de portón?
                </label>
                <select
                  value={formData.hasGateRemoteControl || (formData.remoteControlCount && formData.remoteControlCount > 0 ? 'SI' : 'NO')}
                  onChange={(e) => {
                    const val = e.target.value as 'SI' | 'NO';
                    handleChange('hasGateRemoteControl', val);
                    if (val === 'NO' && !formData.remoteControlInfo) {
                      handleChange('remoteControlInfo', 'Sin control');
                      handleChange('remoteControlCount', 0);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-emerald-500"
                >
                  <option value="SI">SÍ (Tiene control remoto de portón)</option>
                  <option value="NO">NO (No tiene control)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detalle de controles / Portón
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2 controles - Portón levadizo cocheras"
                  value={formData.remoteControlInfo || ''}
                  onChange={(e) => handleChange('remoteControlInfo', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cantidad de controles
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  placeholder="Ej: 2"
                  value={formData.remoteControlCount ?? 0}
                  onChange={(e) => handleChange('remoteControlCount', parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de cerradura
                </label>
                <input
                  type="text"
                  placeholder="Ej: Electromagnética 12V con pulsador"
                  value={formData.lockType || ''}
                  onChange={(e) => handleChange('lockType', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: INSTRUCCIONES TÉCNICAS & REINICIOS */}
          <div>
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Power className="w-4 h-4" /> 5. Procedimientos de Reinicio & Ubicación Física
            </h3>
            
            <div className="space-y-4 mt-3">
              <div>
                <label className="block text-red-300 font-bold mb-1">
                  ⚡ Procedimiento de reinicio (crítico en emergencias)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Cortar alimentación durante 30 segundos bajando la térmica Nº 4 en el tablero de subsuelo..."
                  value={formData.rebootProcedure || ''}
                  onChange={(e) => handleChange('rebootProcedure', e.target.value)}
                  className="w-full bg-slate-950 border border-red-900/60 rounded-lg p-2.5 text-slate-100 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    📍 Ubicación exacta del DVR/NVR
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Armario en subsuelo, sector bombas"
                    value={formData.dvrLocation || ''}
                    onChange={(e) => handleChange('dvrLocation', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    🔐 Cómo acceder al equipo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pedir llave al encargado o gancho 17"
                    value={formData.dvrAccessMethod || ''}
                    onChange={(e) => handleChange('dvrAccessMethod', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    🕐 Horario portero / guardia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: L a V 08:00 a 16:00 hs"
                    value={formData.guardSchedule || ''}
                    onChange={(e) => handleChange('guardSchedule', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Toast feedback */}
          {toastMessage && (
            <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <p className="text-slate-400 text-xs">
              Modificación registrada a nombre de: <span className="text-emerald-400 font-semibold">{currentOperator}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
