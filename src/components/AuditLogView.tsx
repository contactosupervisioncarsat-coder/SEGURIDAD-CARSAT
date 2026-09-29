import { AuditLog } from '../types';
import { History, User, Clock, CheckCircle2, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { useState } from 'react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export function AuditLogView({ logs }: AuditLogViewProps) {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((l) => {
    if (filterType === 'ALL') return true;
    return l.actionType === filterType;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  Historial de Actualizaciones & Auditoría
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                  Acceso Exclusivo Supervisor
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro protegido de auditoría con todas las modificaciones efectuadas por los operadores de turno.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              filterType === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({logs.length})
          </button>
          <button
            onClick={() => setFilterType('NOTA_OPERATIVA')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              filterType === 'NOTA_OPERATIVA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Notas
          </button>
          <button
            onClick={() => setFilterType('MODIFICACION_TECNICA')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              filterType === 'MODIFICACION_TECNICA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Técnicos
          </button>
          <button
            onClick={() => setFilterType('LLAVE_GANCHO')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              filterType === 'LLAVE_GANCHO' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ganchos
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No hay registros de cambios para el filtro seleccionado.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-850/60 transition-colors flex items-start justify-between gap-4 text-xs">
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-white text-sm">
                        {log.operatorName}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          log.actionType === 'NOTA_OPERATIVA'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.actionType === 'LLAVE_GANCHO'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {log.actionType.replace('_', ' ')}
                      </span>

                      <span className="text-slate-400 font-mono text-[11px]">
                        en {log.buildingAddress}
                      </span>
                    </div>

                    {/* Change detail */}
                    <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 mt-1 max-w-2xl">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Campo modificado: <strong className="text-slate-300">{log.fieldChanged}</strong>
                      </span>

                      {log.oldValue && (
                        <div className="text-slate-400 line-through text-[11px] mb-0.5">
                          Anterior: "{log.oldValue}"
                        </div>
                      )}

                      <div className="text-emerald-300 font-medium text-xs">
                        Nuevo valor: "{log.newValue}"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{log.timestamp}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono block mt-1">
                    {log.id}
                  </span>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
