import { Building, Administrator } from '../types';
import {
  Camera,
  Monitor,
  Wifi,
  HardDrive,
  Key,
  Gamepad2,
  Phone,
  Power,
  MapPin,
  Clock,
  Edit3,
  MessageSquare,
  AlertTriangle,
  Copy,
  Check,
  Maximize2,
  Image as ImageIcon,
  Archive,
  Car,
} from 'lucide-react';
import { useState } from 'react';

interface BuildingCardProps {
  building: Building;
  admin?: Administrator;
  onEdit: (building: Building) => void;
  onQuickNote: (building: Building) => void;
  onViewDetails: (building: Building) => void;
  onAssignHook?: (building: Building) => void;
  onDecommission?: (building: Building) => void;
}

export function BuildingCard({
  building,
  admin,
  onEdit,
  onQuickNote,
  onViewDetails,
  onAssignHook,
  onDecommission,
}: BuildingCardProps) {
  const [copiedIp, setCopiedIp] = useState(false);

  const handleCopyIp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!building.ipAddress) return;
    navigator.clipboard.writeText(building.ipAddress);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const isSafe = building.buildingType === 'SEGURO';
  const hasHookMissing = building.keyHasPhysical === 'SI' && (!building.keyHookNumber || building.keyHookNumber.trim() === '');
  const hasIpMissing = !building.ipAddress || building.ipAddress.trim() === '';
  const hasRebootMissing = !building.rebootProcedure || building.rebootProcedure.trim() === '';
  const hasDvrLocationMissing = !building.dvrLocation || building.dvrLocation.trim() === '';

  return (
    <div
      onClick={() => onViewDetails(building)}
      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all duration-200 hover:shadow-slate-950/50 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      {/* Top Bar: Type Status & Monitor */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase ${
                isSafe
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isSafe ? 'Edificio Seguro' : 'Edificio No Seguro'}
            </span>

            {building.monitor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                <Monitor className="w-3 h-3 text-blue-400" />
                {building.monitor}
              </span>
            )}

            <span className="text-[11px] font-mono text-slate-400">
              {building.id}
            </span>
          </div>

          {/* Building Address & Name */}
          <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
            <span>{building.address}</span>
            {building.buildingName && (
              <span className="text-slate-400 font-medium text-sm font-sans">
                — {building.buildingName}
              </span>
            )}
          </h3>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(building);
          }}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          title="Ver ficha ampliada"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 text-xs">
        {/* Cameras */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Cámaras</span>
          </div>
          <p className="font-bold text-slate-100 text-sm">{building.cameraCount} cámaras</p>
        </div>

        {/* Internet & IP */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 relative">
          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px]">{building.internetType}</span>
          </div>
          {building.ipAddress ? (
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-medium text-slate-200 text-xs truncate">
                {building.ipAddress}
              </span>
              <button
                onClick={handleCopyIp}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Copiar IP"
              >
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <p className="text-amber-400 text-xs font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Sin IP cargada
            </p>
          )}
        </div>

        {/* Disk & Storage */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-slate-400">Grabación</span>
          </div>
          <p className="font-bold text-slate-100 text-xs">
            {building.hasDisk === 'SI' ? '💾 Con disco' : 'Sin disco'}
          </p>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap font-mono">
            <span className="text-indigo-300 font-bold bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/50">
              {building.storageType || 'Storage-1'}
            </span>
            {building.storageChannels && (
              <span className="text-slate-300 font-medium">
                Canal: <strong className="text-white">{building.storageChannels}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Keys & Hook */}
        <div
          onClick={(e) => {
            if (hasHookMissing && onAssignHook) {
              e.stopPropagation();
              onAssignHook(building);
            }
          }}
          className={`p-2.5 rounded-lg border transition-colors ${
            hasHookMissing
              ? 'bg-amber-950/40 border-amber-600/80 hover:bg-amber-950/60 cursor-pointer'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Llave de guardia</span>
          </div>
          {building.keyHasPhysical === 'SI' ? (
            building.keyHookNumber ? (
              <p className="font-bold text-amber-300 text-xs">
                🔑 Gancho: <span className="text-sm font-mono font-black text-white bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">{building.keyHookNumber}</span>
              </p>
            ) : (
              <p className="font-bold text-amber-400 text-xs flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ GANCHO SIN ASIGNAR
              </p>
            )
          ) : (
            <p className="text-slate-400 text-xs">Llave: No</p>
          )}
        </div>
      </div>

      {/* Control Remoto de Portón Strip */}
      <div className={`rounded-lg px-2.5 py-1.5 mb-2.5 border text-xs flex items-center justify-between gap-2 ${
        building.hasGateRemoteControl === 'SI'
          ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-200'
          : building.hasGateRemoteControl === 'NO'
          ? 'bg-slate-900/70 border-slate-800 text-slate-400'
          : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
      }`}>
        <div className="flex items-center gap-1.5 shrink-0">
          <Car className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-300">
            Control de Portón:
          </span>
          <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
            building.hasGateRemoteControl === 'SI'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : building.hasGateRemoteControl === 'NO'
              ? 'bg-slate-800 text-slate-400'
              : 'bg-amber-900/50 text-amber-300'
          }`}>
            {building.hasGateRemoteControl === 'SI'
              ? 'SÍ TIENE'
              : building.hasGateRemoteControl === 'NO'
              ? 'NO TIENE'
              : 'SIN DATO'}
          </span>
        </div>

        {building.remoteControlInfo ? (
          <span className="text-[11px] text-slate-300 truncate max-w-[190px] font-mono" title={building.remoteControlInfo}>
            {building.remoteControlInfo}
          </span>
        ) : building.hasGateRemoteControl === 'SI' ? (
          <span className="text-[10px] text-cyan-400/80 font-medium">Disponible en guardia</span>
        ) : null}
      </div>

      {/* Admin Contact Strip */}
      <div className="bg-slate-800/40 rounded-lg p-2.5 mb-3 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
            Administrador:
          </span>
          <span className="font-bold text-slate-200 truncate">
            {admin?.name || 'No asignado'}
          </span>
        </div>
        {admin?.primaryPhone && (
          <a
            href={`tel:${admin.primaryPhone.replace(/\D/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono font-medium hover:underline text-xs shrink-0 ml-2"
          >
            <Phone className="w-3 h-3" />
            <span>{admin.primaryPhone}</span>
          </a>
        )}
      </div>

      {/* Operational Highlights (Reboot, Location) */}
      <div className="space-y-2 mb-3 text-xs">
        {/* Reboot Procedure (Vital for operators) */}
        <div className="p-2 rounded-lg bg-red-950/20 border border-red-900/40 flex items-start gap-2">
          <Power className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-slate-200">
            <span className="font-bold text-red-300 block text-[11px] uppercase tracking-wider">
              Procedimiento de reinicio:
            </span>
            <p className="text-slate-300 line-clamp-2 text-xs mt-0.5">
              {building.rebootProcedure || (
                <span className="text-amber-400 italic">⚠️ Sin procedimiento de reinicio documentado</span>
              )}
            </p>
          </div>
        </div>

        {/* DVR Location */}
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-200">
            <span className="font-semibold text-slate-400 block text-[11px] uppercase tracking-wider">
              Ubicación DVR/NVR & Acceso:
            </span>
            <p className="text-slate-300 line-clamp-2 text-xs mt-0.5">
              {building.dvrLocation ? (
                <>
                  {building.dvrLocation}
                  {building.dvrAccessMethod && ` · ${building.dvrAccessMethod}`}
                </>
              ) : (
                <span className="text-amber-400 italic">⚠️ Sin ubicación de equipo cargada</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Current Operational Note */}
      {building.currentNote && (
        <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 mb-3 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <MessageSquare className="w-3 h-3" /> Nota operativa actual
            </span>
            {building.lastNoteOperator && (
              <span className="text-[10px] text-slate-400">
                Por {building.lastNoteOperator} · {building.lastNoteDate}
              </span>
            )}
          </div>
          <p className="text-slate-200 text-xs italic line-clamp-2">
            "{building.currentNote}"
          </p>
        </div>
      )}

      {/* Warning Badges Strip if missing fields */}
      {(hasHookMissing || hasIpMissing || hasRebootMissing || hasDvrLocationMissing) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hasHookMissing && (
            <span className="text-[10px] px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800 rounded font-semibold flex items-center gap-1">
              ⚠️ GANCHO SIN ASIGNAR
            </span>
          )}
          {hasIpMissing && (
            <span className="text-[10px] px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800 rounded font-semibold flex items-center gap-1">
              ⚠️ FALTA IP
            </span>
          )}
          {hasRebootMissing && (
            <span className="text-[10px] px-2 py-0.5 bg-red-950/80 text-red-300 border border-red-800 rounded font-semibold flex items-center gap-1">
              ⚠️ FALTA REINICIO
            </span>
          )}
          {hasDvrLocationMissing && (
            <span className="text-[10px] px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800 rounded font-semibold flex items-center gap-1">
              ⚠️ FALTA UBICACIÓN DVR
            </span>
          )}
        </div>
      )}

      {/* Action Buttons: Modificar Datos & Actualizar Nota */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2">
          {building.operationalPhotos && building.operationalPhotos.length > 0 && (
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              {building.operationalPhotos.length} fotos
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickNote(building);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Actualizar nota operativa rápida"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nota</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(building);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
            title="Modificar datos técnicos permitidos"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modificar</span>
          </button>

          {onDecommission && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDecommission(building);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white border border-red-800 hover:border-red-600 shadow-sm transition-all cursor-pointer"
              title="Dar de baja este edificio (abrir formulario de rescisión)"
            >
              <Archive className="w-3.5 h-3.5 text-red-400" />
              <span>Baja</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
