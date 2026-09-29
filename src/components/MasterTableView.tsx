import { useState, useMemo } from 'react';
import { Building, Administrator, BuildingType, InternetType } from '../types';
import { StorageService } from '../services/storage';
import {
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Check,
  ChevronDown,
  Archive,
} from 'lucide-react';

interface MasterTableViewProps {
  buildings: Building[];
  administrators: Administrator[];
  onSelectBuilding: (building: Building) => void;
  onEditBuilding: (building: Building) => void;
  onNewBuilding: () => void;
  onRefresh: () => void;
  onDecommission?: (building: Building) => void;
  currentOperator: string;
  userRole?: 'OPERADOR' | 'SUPERVISOR';
}

export function MasterTableView({
  buildings,
  administrators,
  onSelectBuilding,
  onEditBuilding,
  onNewBuilding,
  onRefresh,
  onDecommission,
  currentOperator,
  userRole = 'OPERADOR',
}: MasterTableViewProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterInternet, setFilterInternet] = useState<string>('ALL');
  const [filterMonitor, setFilterMonitor] = useState<string>('ALL');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const demoIds = useMemo(() => new Set(['EDIF-001', 'EDIF-002', 'EDIF-003', 'EDIF-004', 'EDIF-005', 'EDIF-006', 'EDIF-007', 'EDIF-008']), []);
  const demoBuildingsCount = useMemo(() => buildings.filter((b) => demoIds.has(b.id)).length, [buildings, demoIds]);

  const adminMap = useMemo(() => {
    return new Map(administrators.map((a) => [a.id, a]));
  }, [administrators]);

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const q = search.toLowerCase();
      const admin = adminMap.get(b.adminId);
      const matchesSearch =
        q === '' ||
        b.address.toLowerCase().includes(q) ||
        b.buildingName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.ipAddress.toLowerCase().includes(q) ||
        b.gigaredClientNumber.toLowerCase().includes(q) ||
        b.keyHookNumber.toLowerCase().includes(q) ||
        (admin && admin.name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterType !== 'ALL' && b.buildingType !== filterType) return false;
      if (filterInternet !== 'ALL' && b.internetType !== filterInternet) return false;
      if (filterMonitor !== 'ALL' && b.monitor !== filterMonitor) return false;

      return true;
    });
  }, [buildings, search, filterType, filterInternet, filterMonitor, adminMap]);

  // Export to CSV
  const handleExportCSV = () => {
    const csvData = StorageService.exportBuildingsCSV();
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CARSAT_CCTV_Edificios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export full JSON backup
  const handleExportJSON = () => {
    const jsonData = StorageService.exportAllDataJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CARSAT_CCTV_Backup_Total_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = () => {
    if (!importJsonText.trim()) return;
    const ok = StorageService.importDataJSON(importJsonText, currentOperator);
    if (ok) {
      setImportStatus('¡Datos importados con éxito!');
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportJsonText('');
        onRefresh();
      }, 1000);
    } else {
      setImportStatus('Error: formato JSON no válido.');
    }
  };

  const handleDeleteBuilding = (id: string, address: string) => {
    if (userRole !== 'SUPERVISOR') {
      alert('Acción restringida: Únicamente el Supervisor puede borrar edificios de la base de datos.');
      return;
    }
    if (
      confirm(
        `⚠️ ATENCIÓN SUPERVISOR:\n\n¿Seguro que desea ELIMINAR DEFINITIVAMENTE el edificio "${address}" (${id})?\n\nEsta acción NO es una baja: el edificio y sus llaves asociadas serán eliminados por completo de la base de datos central.`
      )
    ) {
      StorageService.deleteBuilding(id, currentOperator);
      onRefresh();
    }
  };

  const handleDeleteDemoBuildings = () => {
    if (userRole !== 'SUPERVISOR') {
      alert('Acción restringida: Únicamente el Supervisor puede borrar edificios de ejemplo.');
      return;
    }
    if (
      confirm(
        `⚠️ ATENCIÓN SUPERVISOR:\n\n¿Desea ELIMINAR DEFINITIVAMENTE los ${demoBuildingsCount} edificios de ejemplo precargados (EDIF-001 al EDIF-008)?\n\nEsta acción dejará la base de datos completamente limpia para que comiencen a cargar los edificios reales de CARSAT.`
      )
    ) {
      StorageService.deleteExampleBuildings(currentOperator);
      onRefresh();
    }
  };

  const handleResetDemo = () => {
    if (confirm('¿Restablecer datos de muestra del centro de monitoreo?')) {
      StorageService.resetToDemo();
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Base Maestra de Edificios (Tabla Completa)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Vista de datos integral sin depender de colores de celda. {buildings.length} edificios registrados.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNewBuilding}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Edificio</span>
          </button>

          {/* Borrar Edificios de Ejemplo (Solo Supervisor) */}
          {userRole === 'SUPERVISOR' && demoBuildingsCount > 0 && (
            <button
              onClick={handleDeleteDemoBuildings}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-700/80 text-xs font-bold transition-colors cursor-pointer shadow-md"
              title="Eliminar todos los edificios de ejemplo para dejar la base limpia"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Borrar Edificios de Ejemplo ({demoBuildingsCount})</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Exportar a archivo Excel / CSV compatible"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV Excel</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Copia de seguridad completa en JSON"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Copia de Respaldo</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Restaurar copia o importar JSON"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Restaurar / Importar</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por dirección, nombre, IP, gancho, admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Tipo de Edificio */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-500"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="SEGURO">🟢 Edificio Seguro</option>
            <option value="NO_SEGURO">⚪ Edificio No Seguro</option>
          </select>

          {/* Internet */}
          <select
            value={filterInternet}
            onChange={(e) => setFilterInternet(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-500"
          >
            <option value="ALL">Todo Internet</option>
            <option value="Gigared">Gigared</option>
            <option value="Externo">Externo</option>
            <option value="Sin dato">Sin dato</option>
          </select>

          {/* Monitor */}
          <select
            value={filterMonitor}
            onChange={(e) => setFilterMonitor(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-500"
          >
            <option value="ALL">Todos Monitores</option>
            <option value="M1">Monitor M1</option>
            <option value="M2">Monitor M2</option>
            <option value="M3">Monitor M3</option>
            <option value="M4">Monitor M4</option>
            <option value="M5">Monitor M5</option>
          </select>

          <button
            onClick={handleResetDemo}
            className="px-2.5 py-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors shrink-0"
            title="Restablecer datos demo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Master Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[68vh]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-20 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-3">Edificio</th>
                <th className="py-3 px-3">Tipo Edificio</th>
                <th className="py-3 px-3">Cámaras</th>
                <th className="py-3 px-3">Monitor</th>
                <th className="py-3 px-3">Internet</th>
                <th className="py-3 px-3">IP Remota</th>
                <th className="py-3 px-3">Nº Gigared</th>
                <th className="py-3 px-3">Llave / Gancho</th>
                <th className="py-3 px-3">Control Portón</th>
                <th className="py-3 px-3">Disco / Storage</th>
                <th className="py-3 px-3">Administrador</th>
                <th className="py-3 px-3">Reinicio</th>
                <th className="py-3 px-3">Ubicación DVR</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-400">
                    No se encontraron edificios con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredBuildings.map((building) => {
                  const admin = adminMap.get(building.adminId);
                  const isSafe = building.buildingType === 'SEGURO';

                  return (
                    <tr
                      key={building.id}
                      onClick={() => onSelectBuilding(building)}
                      className="hover:bg-slate-850/80 transition-colors cursor-pointer group"
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                        {building.id}
                      </td>

                      {/* Dirección */}
                      <td className="py-2.5 px-4 font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {building.address}
                      </td>

                      {/* Nombre Edificio */}
                      <td className="py-2.5 px-3 text-slate-300">
                        {building.buildingName || '-'}
                      </td>

                      {/* Tipo de Edificio (Explícito) */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1 ${
                            isSafe
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          {isSafe ? 'Edificio Seguro' : 'No Seguro'}
                        </span>
                      </td>

                      {/* Cámaras */}
                      <td className="py-2.5 px-3 font-mono font-bold text-center">
                        {building.cameraCount}
                      </td>

                      {/* Monitor */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-300">
                        {building.monitor || '-'}
                      </td>

                      {/* Internet */}
                      <td className="py-2.5 px-3">
                        <span className="text-slate-300">{building.internetType}</span>
                      </td>

                      {/* IP */}
                      <td className="py-2.5 px-3 font-mono">
                        {building.ipAddress ? (
                          <span className="text-sky-300">{building.ipAddress}</span>
                        ) : (
                          <span className="text-amber-400 font-semibold text-[10px]">⚠️ Sin IP</span>
                        )}
                      </td>

                      {/* Cliente Gigared */}
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {building.gigaredClientNumber || '-'}
                      </td>

                      {/* Llave / Gancho */}
                      <td className="py-2.5 px-3">
                        {building.keyHasPhysical === 'SI' ? (
                          building.keyHookNumber ? (
                            <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/80">
                              Gancho #{building.keyHookNumber}
                            </span>
                          ) : (
                            <span className="text-amber-400 text-[10px] font-bold animate-pulse">
                              ⚠️ SIN GANCHO
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500">Sin llave</span>
                        )}
                      </td>

                      {/* Control Portón */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            building.hasGateRemoteControl === 'SI'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : building.hasGateRemoteControl === 'NO'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {building.hasGateRemoteControl === 'SI' ? '🚗 SÍ' : building.hasGateRemoteControl === 'NO' ? 'NO' : 'Sin dato'}
                        </span>
                        {building.remoteControlInfo && (
                          <span className="text-[10px] text-slate-400 ml-1.5 truncate max-w-[120px] inline-block align-middle" title={building.remoteControlInfo}>
                            {building.remoteControlInfo}
                          </span>
                        )}
                      </td>

                      {/* Disco / Storage */}
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                        <span className="font-medium">{building.hasDisk === 'SI' ? '💾 Disco' : 'Sin disco'}</span> ·{' '}
                        <span className="text-indigo-400 font-mono">{building.storageType}</span>{' '}
                        {building.storageChannels && (
                          <span className="text-slate-400 font-mono text-[10px]">(Ch. {building.storageChannels})</span>
                        )}
                      </td>

                      {/* Administrador */}
                      <td className="py-2.5 px-3 text-slate-300 max-w-[150px] truncate">
                        {admin ? admin.name : <span className="text-amber-400">Sin asignar</span>}
                      </td>

                      {/* Reinicio */}
                      <td className="py-2.5 px-3 text-slate-400 max-w-[180px] truncate">
                        {building.rebootProcedure || <span className="text-red-400">⚠️ Falta</span>}
                      </td>

                      {/* Ubicación DVR */}
                      <td className="py-2.5 px-3 text-slate-400 max-w-[160px] truncate">
                        {building.dvrLocation || <span className="text-amber-400">⚠️ Falta</span>}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onEditBuilding(building)}
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors"
                            title="Editar edificio"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Dar de baja (historial de bajas) - Disponible para Operador y Supervisor */}
                          {onDecommission && (
                            <button
                              onClick={() => onDecommission(building)}
                              className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors"
                              title="Dar de baja edificio (Mover a Historial de Bajas)"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-400 hover:text-amber-300" />
                            </button>
                          )}

                          {/* Borrado Definitivo - EXCLUSIVO MODO SUPERVISOR */}
                          {userRole === 'SUPERVISOR' && (
                            <button
                              onClick={() => handleDeleteBuilding(building.id, building.address)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/60 transition-colors"
                              title="⚠️ ELIMINAR DEFINITIVAMENTE (Solo Supervisor)"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Mostrando {filteredBuildings.length} de {buildings.length} edificios
          </span>
          <span className="font-mono">
            CARSAT Monitoreo CCTV · Sistema de Datos Protegido
          </span>
        </div>
      </div>

      {/* Modal: Import JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-5 text-xs">
            <h3 className="font-bold text-white text-base mb-1">
              Restaurar o Importar Base de Datos JSON
            </h3>
            <p className="text-slate-400 text-xs mb-3">
              Pegue a continuación el contenido de una copia de respaldo en formato JSON para restaurar edificios, llaves, administradores y notas.
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Pegue aquí el JSON..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-xs focus:border-amber-500"
            />

            {importStatus && (
              <p className="mt-2 text-xs font-bold text-amber-400">
                {importStatus}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportJSON}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white font-bold"
              >
                Importar Ahora
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
