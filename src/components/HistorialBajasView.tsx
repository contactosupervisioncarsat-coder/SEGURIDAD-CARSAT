import { useState, useMemo } from 'react';
import { DecommissionRecord, Building } from '../types';
import { StorageService } from '../services/storage';
import {
  Archive,
  Search,
  Download,
  Calendar,
  Key,
  Shield,
  RotateCcw,
  Eye,
  X,
  HardDrive,
  User,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface HistorialBajasViewProps {
  decommissions: DecommissionRecord[];
  onRefresh: () => void;
  currentOperator: string;
}

export function HistorialBajasView({
  decommissions,
  onRefresh,
  currentOperator,
}: HistorialBajasViewProps) {
  const [search, setSearch] = useState('');
  const [filterKeyStatus, setFilterKeyStatus] = useState<'ALL' | 'SI' | 'NO' | 'NO_TENIA'>('ALL');
  const [selectedSnapshot, setSelectedSnapshot] = useState<DecommissionRecord | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return decommissions.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        d.address.toLowerCase().includes(q) ||
        d.buildingName.toLowerCase().includes(q) ||
        d.adminName.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q) ||
        d.reasonDetail.toLowerCase().includes(q) ||
        d.operatorName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.buildingId.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterKeyStatus !== 'ALL' && d.keyReturned !== filterKeyStatus) {
        return false;
      }

      return true;
    });
  }, [decommissions, search, filterKeyStatus]);

  const handleExportCSV = () => {
    const csv = StorageService.exportDecommissionsCSV();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CARSAT_CCTV_Historial_Bajas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReactivate = (record: DecommissionRecord) => {
    if (confirm(`¿Confirma reactivar el edificio "${record.address}" e incorporarlo nuevamente a la sala de monitoreo activa?`)) {
      StorageService.reactivateBuilding(record.buildingId, currentOperator);
      onRefresh();
      setReactivatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Archive className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
              Control de Bajas & Auditoría
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Historial de Bajas de Edificios
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Registro protegido de todos los edificios dados de baja del servicio de monitoreo CCTV.
            Conserva el motivo, la fecha de rescisión, el estado de devolución de llaves y el inventario técnico retirado.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Bajas</span>
            <span className="text-2xl font-black text-red-400 font-mono">{decommissions.length}</span>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Descargar historial en CSV para Excel"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Dirección, Administrador, Motivo, Operador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 font-sans"
          />
        </div>

        {/* Filter by Key Status */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <span className="text-slate-400 text-[11px] font-semibold uppercase shrink-0 mr-1">
            Llave:
          </span>

          <button
            onClick={() => setFilterKeyStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              filterKeyStatus === 'ALL'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setFilterKeyStatus('SI')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              filterKeyStatus === 'SI'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Llave Devuelta
          </button>

          <button
            onClick={() => setFilterKeyStatus('NO')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              filterKeyStatus === 'NO'
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Pendiente de Devolución
          </button>
        </div>

      </div>

      {/* Decommissions List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Archive className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-bold text-white">No se encontraron registros de bajas</h3>
          <p className="text-xs text-slate-500 mt-1">
            {search ? 'Ninguna baja coincide con el término buscado.' : 'No hay edificios dados de baja en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all text-xs"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/80">
                    Baja Registrada
                  </span>
                  <span className="font-mono text-slate-400 text-xs">{record.id}</span>
                  <span className="text-slate-500 font-mono text-[11px]">({record.buildingId})</span>
                  <div className="flex items-center gap-1 text-slate-300 font-medium ml-2">
                    <Calendar className="w-3.5 h-3.5 text-red-400" />
                    <span>Fecha de baja: <strong className="text-white font-mono">{record.decommissionDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSnapshot(record)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-semibold"
                    title="Ver ficha técnica original de este edificio"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ver Ficha Técnica</span>
                  </button>

                  <button
                    onClick={() => handleReactivate(record)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors font-semibold cursor-pointer"
                    title="Reactivar edificio para la sala de monitoreo"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reactivar Edificio</span>
                  </button>
                </div>
              </div>

              {/* Building & Reason Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3.5">
                
                {/* Building & Admin */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {record.address} {record.buildingName && `(${record.buildingName})`}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span>Administrador: <strong className="text-slate-200">{record.adminName}</strong></span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 font-mono">
                    {record.camerasCount} cámaras monitoreadas
                  </p>
                </div>

                {/* Reason & Details */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Motivo de la Baja:
                  </span>
                  <p className="font-bold text-red-300 text-xs mb-1">
                    {record.reason}
                  </p>
                  <p className="text-slate-300 text-xs italic">
                    "{record.reasonDetail}"
                  </p>
                </div>

                {/* Key Status & Equipment */}
                <div className="space-y-2">
                  
                  {/* Key status */}
                  <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                    record.keyReturned === 'SI'
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : record.keyReturned === 'NO'
                      ? 'bg-red-950/40 border-red-800/80 text-red-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <Key className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <span className="text-[10px] uppercase font-bold block">
                        Estado de Llave:
                      </span>
                      <p className="font-bold text-xs mt-0.5">
                        {record.keyReturned === 'SI' && '🟢 Llave Devuelta al Cliente'}
                        {record.keyReturned === 'NO' && '🔴 Llave Pendiente de Devolución (En CARSAT)'}
                        {record.keyReturned === 'NO_TENIA' && '⚪ No Poseía Llave Física'}
                      </p>
                      {record.keyReturnDetails && (
                        <p className="text-[11px] text-slate-300 mt-1">
                          {record.keyReturnDetails}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Equipment */}
                  {record.equipmentRetrieved && (
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-300 text-[11px]">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                          Equipamiento Retirado:
                        </span>
                        <p>{record.equipmentRetrieved}</p>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Footer info */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  Baja gestionada por: <strong className="text-slate-300">{record.operatorName}</strong>
                </span>
                <span className="font-mono text-slate-500">
                  Registrado el {record.timestamp.replace('T', ' ').substring(0, 16)}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Snapshot Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl p-6 my-auto text-xs space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 uppercase">
                  Ficha Histórica Archivada
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedSnapshot.address} {selectedSnapshot.buildingName && `(${selectedSnapshot.buildingName})`}
                </h3>
                <p className="text-slate-400 text-xs">
                  Baja por: {selectedSnapshot.reason} el {selectedSnapshot.decommissionDate}
                </p>
              </div>

              <button
                onClick={() => setSelectedSnapshot(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Technical Snapshot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Cámaras:</span>
                <p className="text-base font-bold text-white">{selectedSnapshot.buildingSnapshot.cameraCount}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">IP Original:</span>
                <p className="font-mono font-bold text-sky-400 truncate">{selectedSnapshot.buildingSnapshot.ipAddress || 'Sin IP'}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Internet:</span>
                <p className="text-white font-medium">{selectedSnapshot.buildingSnapshot.internetType}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Grabación:</span>
                <p className="text-white font-medium">
                  {selectedSnapshot.buildingSnapshot.storageType}
                  {selectedSnapshot.buildingSnapshot.storageChannels && ` (${selectedSnapshot.buildingSnapshot.storageChannels})`}
                </p>
              </div>
            </div>

            {/* Procedures & Notes */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                  Ubicación DVR y Acceso:
                </span>
                <p className="text-slate-200">
                  {selectedSnapshot.buildingSnapshot.dvrLocation || 'Sin dato'} · {selectedSnapshot.buildingSnapshot.dvrAccessMethod}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                  Procedimiento de Reinicio:
                </span>
                <p className="text-slate-200">
                  {selectedSnapshot.buildingSnapshot.rebootProcedure || 'Sin dato'}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                  Última Nota Operativa Registrada:
                </span>
                <p className="text-slate-300 italic">
                  "{selectedSnapshot.buildingSnapshot.currentNote || 'Sin notas'}"
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
