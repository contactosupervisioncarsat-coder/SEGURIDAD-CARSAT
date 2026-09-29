import { X, Database, Server, HardDrive, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storage';

interface StorageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StorageInfoModal({ isOpen, onClose }: StorageInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-emerald-900/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Arquitectura de Datos
                </span>
                <span className="text-xs font-mono text-slate-400">Persistencia 24/7</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                ¿Dónde se Guarda la Información?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Card 1: Servidor Central */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                1. Base Central en Servidor Cloud (`carsat_db.json`)
              </h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Toda la información cargada por los operadores (notas operativas, IPs, cambios técnicos, llaves y bajas) se transmite y almacena de forma centralizada en el backend del sistema.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-blue-300 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Sincronización multi-operador entre diferentes puestos de monitoreo.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Respaldo Local */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                2. Respaldo Local Instantáneo en Navegador (Caché)
              </h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Cada terminal de guardia conserva una copia local cifrada en su almacenamiento del navegador. Si la conexión a internet sufre un corte temporal, el operador puede seguir consultando las fichas y reinicios sin interrupción.
              </p>
            </div>
          </div>

          {/* Card 3: Exportaciones y Backups */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                3. Descarga de Copias de Respaldo en Excel & JSON
              </h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Desde la pestaña <strong>Tabla Maestra</strong>, el supervisor puede descargar en cualquier momento:
              </p>
              <ul className="mt-1.5 space-y-1 text-slate-300 font-mono text-[11px] list-disc list-inside">
                <li>Planilla Excel (.CSV) con todos los edificios y datos técnicos.</li>
                <li>Copia total de respaldo (.JSON) para restaurar todo el sistema.</li>
                <li>Planilla (.CSV) del Historial de Bajas.</li>
              </ul>
            </div>
          </div>

          {/* Supervisor footnote */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Titular de Supervisión:</span>
            <span className="font-mono font-bold text-blue-300">{StorageService.SUPERVISOR_EMAIL}</span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
