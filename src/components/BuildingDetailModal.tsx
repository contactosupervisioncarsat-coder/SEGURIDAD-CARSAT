import { useState } from 'react';
import { Building, Administrator } from '../types';
import {
  X,
  Camera,
  Monitor,
  Wifi,
  HardDrive,
  Key,
  Gamepad2,
  Phone,
  Mail,
  MapPin,
  Power,
  Calendar,
  Shield,
  Edit3,
  MessageSquare,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Image as ImageIcon,
  Printer,
  Archive,
  Car,
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface BuildingDetailModalProps {
  building: Building | null;
  admin?: Administrator;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (b: Building) => void;
  onQuickNote: (b: Building) => void;
  onDecommission?: (b: Building) => void;
  currentOperator: string;
}

export function BuildingDetailModal({
  building,
  admin,
  isOpen,
  onClose,
  onEdit,
  onQuickNote,
  onDecommission,
  currentOperator,
}: BuildingDetailModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  if (!isOpen || !building) return null;

  const isSafe = building.buildingType === 'SEGURO';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const updatedPhotos = [...(building.operationalPhotos || []), newPhotoUrl.trim()];
    const updatedBuilding = { ...building, operationalPhotos: updatedPhotos };
    StorageService.saveBuilding(updatedBuilding, currentOperator, 'MODIFICACION_TECNICA');
    setNewPhotoUrl('');
    setShowAddPhoto(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:m-0 print:border-none print:shadow-none print:max-h-none">
        
        {/* Top Header */}
        <div className="p-5 bg-slate-850 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className={`px-3 py-1 rounded text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 ${
                  isSafe
                    ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                {isSafe ? '🟢 EDIFICIO SEGURO' : '⚪ EDIFICIO NO SEGURO'}
              </span>

              {building.monitor && (
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-950/90 text-blue-300 border border-blue-800/80 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5" />
                  Monitor {building.monitor}
                </span>
              )}

              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {building.id}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{building.address}</span>
              {building.buildingName && (
                <span className="text-emerald-400 font-sans font-medium text-lg">
                  ({building.buildingName})
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              title="Imprimir ficha técnica"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Top Quick Stats Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Cameras */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase font-semibold">Cámaras</span>
              </div>
              <p className="text-xl font-black text-white">{building.cameraCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cámaras monitoreadas</p>
            </div>

            {/* IP & Gigared */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Wifi className="w-4 h-4 text-sky-400" />
                <span className="text-xs uppercase font-semibold">{building.internetType}</span>
              </div>
              {building.ipAddress ? (
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-sm font-bold text-sky-300 truncate">
                    {building.ipAddress}
                  </span>
                  <button
                    onClick={() => copyToClipboard(building.ipAddress, 'ip')}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                    title="Copiar IP"
                  >
                    {copied === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <p className="text-amber-400 font-semibold">⚠️ Sin IP cargada</p>
              )}
              {building.gigaredClientNumber && (
                <p className="text-[11px] text-slate-400 mt-1">Cliente Nº {building.gigaredClientNumber}</p>
              )}
            </div>

            {/* Storage */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase font-semibold">Grabación</span>
              </div>
              <p className="text-sm font-bold text-white">
                {building.hasDisk === 'SI' ? '💾 Con Disco' : 'Sin Disco'}
              </p>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap font-mono">
                <span className="text-xs text-indigo-300 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                  {building.storageType || 'Storage-1'}
                </span>
                {building.storageChannels ? (
                  <span className="text-xs text-slate-200">
                    Canal: <strong className="text-white font-bold">{building.storageChannels}</strong>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Sin canal</span>
                )}
              </div>
            </div>

            {/* Keys & Hook */}
            <div className={`p-3.5 rounded-xl border ${
              building.keyHasPhysical === 'SI' && !building.keyHookNumber
                ? 'bg-amber-950/40 border-amber-600'
                : 'bg-slate-950/70 border-slate-800'
            }`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-xs uppercase font-semibold">Llave en Tablero</span>
              </div>
              {building.keyHasPhysical === 'SI' ? (
                building.keyHookNumber ? (
                  <div>
                    <span className="text-[10px] text-slate-400 block">GANCHO ASIGNADO:</span>
                    <span className="text-xl font-black font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60 inline-block mt-0.5">
                      #{building.keyHookNumber}
                    </span>
                  </div>
                ) : (
                  <p className="text-amber-400 font-bold text-xs flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    GANCHO SIN ASIGNAR
                  </p>
                )
              ) : (
                <p className="text-slate-400 text-xs">Sin llave física</p>
              )}
            </div>

          </div>

          {/* CRITICAL REBOOT PROCEDURE BOX (HIGH CONTRAST FOR EMERGENCIES) */}
          <div className="p-4 rounded-xl bg-red-950/30 border-2 border-red-800/80 text-slate-100 shadow-md">
            <div className="flex items-center gap-2 mb-1.5">
              <Power className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="font-extrabold text-red-300 text-sm tracking-wider uppercase font-mono">
                PROCEDIMIENTO DE REINICIO DE EQUIPO (EMERGENCIA)
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-red-900/50 mt-2 font-mono">
              {building.rebootProcedure || '⚠️ Sin procedimiento de reinicio documentado en la base. Consultar supervisor.'}
            </p>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Location & Access details */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4" /> Ubicación Física del DVR & Acceso
              </h3>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                  Ubicación del DVR/NVR:
                </span>
                <p className="text-slate-200 text-xs mt-0.5 font-medium">
                  {building.dvrLocation || 'No informada'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                  Cómo acceder al equipo / Quién permite el acceso:
                </span>
                <p className="text-slate-200 text-xs mt-0.5 font-medium">
                  {building.dvrAccessMethod || 'No especificado'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                  Horario de portero / guardia física:
                </span>
                <p className="text-slate-200 text-xs mt-0.5 font-medium">
                  {building.guardSchedule || 'Sin horario de portería fijado'}
                </p>
              </div>

              {/* Control Remoto de Portón Card */}
              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-800/60 flex items-start gap-2.5">
                <Car className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">
                      Control Remoto de Portón
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      building.hasGateRemoteControl === 'SI'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : building.hasGateRemoteControl === 'NO'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {building.hasGateRemoteControl === 'SI' ? '✓ TIENE CONTROL' : building.hasGateRemoteControl === 'NO' ? '✗ NO TIENE' : 'SIN DATO'}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs mt-1">
                    {building.remoteControlInfo || (building.hasGateRemoteControl === 'SI' ? 'Control de portón disponible en sala de guardia' : 'Edificio sin control remoto de portón')}
                  </p>
                  {building.remoteControlCount !== undefined && building.remoteControlCount > 0 && (
                    <p className="text-[11px] text-cyan-400 mt-0.5 font-mono">
                      Cantidad de controles registrados: {building.remoteControlCount}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                  Tipo de cerradura:
                </span>
                <p className="text-slate-200 text-xs mt-0.5 font-medium">
                  {building.lockType || 'Sin dato'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                  Número de serie DVR/NVR:
                </span>
                <p className="text-slate-300 font-mono text-xs mt-0.5">
                  {building.serialNumber || 'Sin número de serie cargado'}
                </p>
              </div>
            </div>

            {/* Right: Contact & Admin */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Shield className="w-4 h-4" /> Contacto de Administración
              </h3>

              {admin ? (
                <>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                      Administrador:
                    </span>
                    <p className="text-base font-bold text-white mt-0.5">
                      {admin.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Teléfono Principal:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {admin.primaryPhone}
                      </span>
                    </div>
                    <a
                      href={`tel:${admin.primaryPhone.replace(/\D/g, '')}`}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Llamar
                    </a>
                  </div>

                  {admin.alternativePhone && (
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Teléfono Alternativo:</span>
                      <span className="font-mono font-medium text-slate-300 text-xs">
                        {admin.alternativePhone}
                      </span>
                    </div>
                  )}

                  {admin.officeAddress && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                        Oficina:
                      </span>
                      <p className="text-slate-300 text-xs mt-0.5">{admin.officeAddress}</p>
                    </div>
                  )}

                  {admin.email && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                        Email:
                      </span>
                      <p className="text-slate-300 text-xs mt-0.5 font-mono">{admin.email}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-amber-400">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-semibold">Sin administrador asignado a este edificio.</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Lugar de cobro: <span className="text-slate-200">{building.paymentLocation || 'Sin dato'}</span>
              </div>
            </div>

          </div>

          {/* Current Operational Note */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Nota Operativa Actual</span>
              </div>
              {building.lastNoteOperator && (
                <span className="text-xs text-slate-400 font-mono">
                  Firmada por: <strong className="text-slate-200">{building.lastNoteOperator}</strong> ({building.lastNoteDate})
                </span>
              )}
            </div>
            <p className="text-slate-200 text-sm italic bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              "{building.currentNote || 'Sin notas registradas aún.'}"
            </p>
          </div>

          {/* Photos Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Fotos Operativas (DVR, Tableros, Acceso)
              </h3>
              <button
                onClick={() => setShowAddPhoto(!showAddPhoto)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddPhoto ? 'Cancelar' : 'Agregar URL de foto'}
              </button>
            </div>

            {showAddPhoto && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex gap-2">
                <input
                  type="url"
                  placeholder="Pegar URL de la foto (ej: https://...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={handleAddPhoto}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            )}

            {building.operationalPhotos && building.operationalPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {building.operationalPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-36"
                  >
                    <img
                      src={url}
                      alt={`Foto operativa ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-white font-medium">Foto #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-center">
                No hay fotos operativas adjuntas todavía.
              </p>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3 print:hidden">
          <span className="text-[11px] text-slate-400 font-mono">
            Última actualización: {building.updatedAt?.replace('T', ' ').substring(0, 16) || 'Reciente'}
          </span>

          <div className="flex items-center gap-2">
            {onDecommission && (
              <button
                onClick={() => {
                  onClose();
                  onDecommission(building);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Dar de baja este edificio del servicio"
              >
                <Archive className="w-3.5 h-3.5 text-red-400" />
                Dar de Baja
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onQuickNote(building);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Actualizar Nota
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(building);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Modificar Datos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
