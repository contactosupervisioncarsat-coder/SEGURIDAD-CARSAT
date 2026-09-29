import { useState } from 'react';
import { Building, Administrator, DecommissionRecord } from '../types';
import { StorageService } from '../services/storage';
import {
  X,
  AlertTriangle,
  Calendar,
  Key,
  Archive,
  HardDrive,
  User,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface DecommissionModalProps {
  building: Building | null;
  admin?: Administrator;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: DecommissionRecord) => void;
  currentOperator: string;
}

export function DecommissionModal({
  building,
  admin,
  isOpen,
  onClose,
  onSuccess,
  currentOperator,
}: DecommissionModalProps) {
  if (!isOpen || !building) return null;

  const today = new Date().toISOString().slice(0, 10);

  const [decommissionDate, setDecommissionDate] = useState(today);
  const [reason, setReason] = useState('Rescisión de contrato por el consorcio');
  const [reasonDetail, setReasonDetail] = useState('');
  const [keyReturned, setKeyReturned] = useState<'SI' | 'NO' | 'NO_TENIA'>(
    building.keyHasPhysical === 'SI' ? 'SI' : 'NO_TENIA'
  );
  const [keyReturnDetails, setKeyReturnDetails] = useState('');
  const [equipmentRetrieved, setEquipmentRetrieved] = useState('');
  const [operatorName, setOperatorName] = useState(currentOperator);
  const [confirmStep, setConfirmStep] = useState(false);

  const REASONS = [
    'Rescisión de contrato por el consorcio',
    'Cambio de empresa de monitoreo / seguridad',
    'Falta de pago / Deuda acumulada',
    'Decisión de asamblea de copropietarios',
    'Demolición / Cierre / Venta del inmueble',
    'Incompatibilidad técnica / Imposibilidad de enlace',
    'Reemplazo por tótem o sistema autónomo',
    'Otro motivo operativo / comercial',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    const record = StorageService.decommissionBuilding({
      buildingId: building.id,
      decommissionDate,
      reason,
      reasonDetail: reasonDetail.trim(),
      keyReturned,
      keyReturnDetails: keyReturnDetails.trim(),
      equipmentRetrieved: equipmentRetrieved.trim(),
      operatorName,
    });

    if (record) {
      onSuccess(record);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-red-900/60 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950/80 to-slate-900 border-b border-red-900/50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-300 border border-red-800">
                  Baja de Edificio
                </span>
                <span className="text-xs font-mono text-slate-400">{building.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {building.address} {building.buildingName ? `— ${building.buildingName}` : ''}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="p-4 bg-amber-950/30 border-b border-amber-900/40 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">
              Esta acción dará de baja el edificio de la sala de monitoreo activa.
            </p>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Toda la información técnica y notas quedarán archivadas en la pestaña{' '}
              <strong className="text-white">"Historial de Bajas"</strong> para auditoría y futuras consultas.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Quick info row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block font-semibold">Administrador:</span>
              <span className="text-slate-200 font-medium truncate block">
                {admin?.name || 'Sin asignar'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Cámaras actuales:</span>
              <span className="text-slate-200 font-medium">{building.cameraCount} cámaras</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Llave física:</span>
              <span className="text-amber-300 font-mono font-medium">
                {building.keyHasPhysical === 'SI'
                  ? `Sí (Gancho #${building.keyHookNumber || 'Sin asignar'})`
                  : 'No posee'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Fecha de la Baja */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                Fecha de la Baja *
              </label>
              <input
                type="date"
                required
                value={decommissionDate}
                onChange={(e) => setDecommissionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Motivo Principal */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Motivo Principal de la Baja *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detalle Explicativo */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Detalle explicativo del motivo *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Explique las causas de la baja (ej: decisión de asamblea por aumento de costos, cambio a otra empresa...)"
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-red-500 resize-none placeholder-slate-500"
            />
          </div>

          {/* ESTADO DE LA LLAVE (CRÍTICO) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="block font-bold text-amber-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="w-4 h-4 text-amber-400" />
              ¿Se devolvió la llave al cliente? *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  keyReturned === 'SI'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="keyReturned"
                  checked={keyReturned === 'SI'}
                  onChange={() => setKeyReturned('SI')}
                  className="accent-emerald-500"
                />
                <span className="font-semibold text-xs">Sí, devuelta al cliente</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  keyReturned === 'NO'
                    ? 'bg-red-950/60 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="keyReturned"
                  checked={keyReturned === 'NO'}
                  onChange={() => setKeyReturned('NO')}
                  className="accent-red-500"
                />
                <span className="font-semibold text-xs">No, aún en CARSAT</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  keyReturned === 'NO_TENIA'
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="keyReturned"
                  checked={keyReturned === 'NO_TENIA'}
                  onChange={() => setKeyReturned('NO_TENIA')}
                  className="accent-slate-400"
                />
                <span className="font-semibold text-xs">No poseía llave física</span>
              </label>
            </div>

            {keyReturned === 'SI' && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Detalle de entrega: ¿A quién se entregó? / Nº remito o constancia firmada"
                  value={keyReturnDetails}
                  onChange={(e) => setKeyReturnDetails(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-800/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
                <p className="text-[10px] text-emerald-400/90 mt-1">
                  ✓ El gancho #{building.keyHookNumber || 'asignado'} quedará liberado automáticamente en el tablero.
                </p>
              </div>
            )}

            {keyReturned === 'NO' && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Observación: ¿Dónde permanece la llave? / Fecha tentativa de entrega"
                  value={keyReturnDetails}
                  onChange={(e) => setKeyReturnDetails(e.target.value)}
                  className="w-full bg-slate-900 border border-red-800/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500 placeholder-slate-500"
                />
                <p className="text-[10px] text-red-400 mt-1">
                  ⚠️ Atención: La llave figurará como "Pendiente de devolución" en el Historial de Bajas.
                </p>
              </div>
            )}
          </div>

          {/* Retiro de Equipamiento */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              Retiro de equipamiento técnico / Destino de equipos (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Se retiró DVR Dahua 8ch, 1 disco de 2TB y fuentes; cámaras quedaron en el edificio"
              value={equipmentRetrieved}
              onChange={(e) => setEquipmentRetrieved(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500 placeholder-slate-500"
            />
          </div>

          {/* Operador responsable */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Operador / Supervisor responsable de registrar la baja
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Confirmation step message */}
          {confirmStep && (
            <div className="p-3 bg-red-950/80 border border-red-600 rounded-xl text-center">
              <p className="text-red-200 font-bold text-xs">
                ¿Confirma dar de baja definitiva a {building.address}?
              </p>
              <p className="text-red-300 text-[11px] mt-0.5">
                Haga clic nuevamente en "Confirmar Baja" para guardar.
              </p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md ${
                confirmStep
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : 'bg-red-700 hover:bg-red-600 text-white'
              }`}
            >
              <Archive className="w-4 h-4" />
              {confirmStep ? '¡Confirmar y Guardar Baja!' : 'Dar de Baja Edificio'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
