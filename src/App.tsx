import React, { useState, useEffect, useMemo } from 'react';
import { Building, Administrator, KeyItem, ActiveTab, AuditLog, DecommissionRecord } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { BuildingCard } from './components/BuildingCard';
import { BuildingDetailModal } from './components/BuildingDetailModal';
import { BuildingEditModal } from './components/BuildingEditModal';
import { QuickNoteModal } from './components/QuickNoteModal';
import { KeysBoardView } from './components/KeysBoardView';
import { AdministratorsView } from './components/AdministratorsView';
import { DashboardView } from './components/DashboardView';
import { MasterTableView } from './components/MasterTableView';
import { AuditLogView } from './components/AuditLogView';
import { NewBuildingModal } from './components/NewBuildingModal';
import { DecommissionModal } from './components/DecommissionModal';
import { HistorialBajasView } from './components/HistorialBajasView';
import { SupervisorAuthModal } from './components/SupervisorAuthModal';
import { StorageInfoModal } from './components/StorageInfoModal';
import {
  Search,
  Building2,
  Key,
  Users,
  BarChart3,
  FileSpreadsheet,
  History,
  AlertTriangle,
  Plus,
  Edit3,
  Archive,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ficha_rapida');
  const [currentOperator, setCurrentOperator] = useState<string>(StorageService.getActiveOperator());
  const [userRole, setUserRole] = useState<'OPERADOR' | 'SUPERVISOR'>(StorageService.getUserRole());

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [decommissions, setDecommissions] = useState<DecommissionRecord[]>([]);

  // Search & Filter state for Ficha view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SEGURO' | 'NO_SEGURO'>('ALL');
  const [filterMissingOnly, setFilterMissingOnly] = useState(false);
  const [filterSpecificMissing, setFilterSpecificMissing] = useState<string | null>(null);

  // Modals state
  const [selectedBuildingForDetail, setSelectedBuildingForDetail] = useState<Building | null>(null);
  const [selectedBuildingForEdit, setSelectedBuildingForEdit] = useState<Building | null>(null);
  const [selectedBuildingForNote, setSelectedBuildingForNote] = useState<Building | null>(null);
  const [selectedBuildingForDecommission, setSelectedBuildingForDecommission] = useState<Building | null>(null);
  const [isNewBuildingModalOpen, setIsNewBuildingModalOpen] = useState(false);
  const [isSupervisorAuthModalOpen, setIsSupervisorAuthModalOpen] = useState(false);
  const [isStorageInfoOpen, setIsStorageInfoOpen] = useState(false);

  // Load data locally
  const refreshData = () => {
    setBuildings(StorageService.getBuildings());
    setAdministrators(StorageService.getAdministrators());
    setKeys(StorageService.getKeys());
    setAuditLogs(StorageService.getAuditLogs());
    setDecommissions(StorageService.getDecommissions());
    setCurrentOperator(StorageService.getActiveOperator());
    setUserRole(StorageService.getUserRole());
  };

  useEffect(() => {
    refreshData();
    // Carga e integración inicial con Supabase
    StorageService.syncWithServer().then(() => refreshData());

    // Auto-sincronización periódica cada 10 segundos
    const syncInterval = setInterval(() => {
      StorageService.syncWithServer().then(() => refreshData());
    }, 10000);

    const handleDataChanged = () => refreshData();
    window.addEventListener('carsat_data_changed', handleDataChanged);
    window.addEventListener('carsat_operator_changed', handleDataChanged);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('carsat_data_changed', handleDataChanged);
      window.removeEventListener('carsat_operator_changed', handleDataChanged);
    };
  }, []);

  const handleOperatorChange = (name: string) => {
    setCurrentOperator(name);
    StorageService.setActiveOperator(name);
  };

  const handleRoleChange = (role: 'OPERADOR' | 'SUPERVISOR') => {
    if (role === 'SUPERVISOR') {
      if (StorageService.isSupervisorVerified()) {
        setUserRole('SUPERVISOR');
        StorageService.setUserRole('SUPERVISOR');
      } else {
        setIsSupervisorAuthModalOpen(true);
      }
    } else {
      setUserRole('OPERADOR');
      StorageService.logoutSupervisor();
      if (activeTab === 'historial_auditoria') {
        setActiveTab('ficha_rapida');
      }
    }
  };

  // Map administrators by id
  const adminMap = useMemo(() => {
    return new Map(administrators.map((a) => [a.id, a]));
  }, [administrators]);

  // Calculate missing quality count for top alert
  const missingCount = useMemo(() => {
    let count = 0;
    buildings.forEach((b) => {
      if (!b.ipAddress || b.ipAddress.trim() === '') count++;
      if (!b.dvrLocation || b.dvrLocation.trim() === '') count++;
      if (!b.rebootProcedure || b.rebootProcedure.trim() === '') count++;
      if (b.keyHasPhysical === 'SI' && (!b.keyHookNumber || b.keyHookNumber.trim() === '')) count++;
      if (!b.adminId || b.adminId.trim() === '') count++;
    });
    return count;
  }, [buildings]);

  // Filter buildings for the Cards View
  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const admin = adminMap.get(b.adminId);
      const matchesText =
        q === '' ||
        b.address.toLowerCase().includes(q) ||
        b.buildingName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.ipAddress.toLowerCase().includes(q) ||
        b.gigaredClientNumber.toLowerCase().includes(q) ||
        b.monitor.toLowerCase().includes(q) ||
        b.keyHookNumber.toLowerCase().includes(q) ||
        (admin && admin.name.toLowerCase().includes(q));

      if (!matchesText) return false;

      if (filterType !== 'ALL' && b.buildingType !== filterType) {
        return false;
      }

      if (filterMissingOnly) {
        const hasMissing =
          !b.ipAddress ||
          b.ipAddress.trim() === '' ||
          !b.dvrLocation ||
          b.dvrLocation.trim() === '' ||
          !b.rebootProcedure ||
          b.rebootProcedure.trim() === '' ||
          (b.keyHasPhysical === 'SI' && (!b.keyHookNumber || b.keyHookNumber.trim() === '')) ||
          !b.adminId ||
          b.adminId.trim() === '';
        if (!hasMissing) return false;
      }

      if (filterSpecificMissing) {
        if (filterSpecificMissing === 'MISSING_IP' && (b.ipAddress && b.ipAddress.trim() !== '')) return false;
        if (filterSpecificMissing === 'MISSING_DVR_LOCATION' && (b.dvrLocation && b.dvrLocation.trim() !== '')) return false;
        if (filterSpecificMissing === 'MISSING_REBOOT' && (b.rebootProcedure && b.rebootProcedure.trim() !== '')) return false;
        if (filterSpecificMissing === 'MISSING_SERIAL' && (b.serialNumber && b.serialNumber.trim() !== '')) return false;
        if (filterSpecificMissing === 'MISSING_ADMIN' && (b.adminId && b.adminId.trim() !== '')) return false;
        if (filterSpecificMissing === 'MISSING_HOOK' && (b.keyHookNumber && b.keyHookNumber.trim() !== '')) return false;
      }

      return true;
    });
  }, [buildings, searchQuery, filterType, filterMissingOnly, filterSpecificMissing, adminMap]);

  const handleFilterMissingFromDashboard = (type: string) => {
    if (type === 'MISSING_HOOK') {
      setActiveTab('tablero_llaves');
      return;
    }
    setFilterSpecificMissing(type);
    setFilterMissingOnly(true);
    setActiveTab('ficha_rapida');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Main Navigation Header */}
      <Header
        currentOperator={currentOperator}
        onOperatorChange={handleOperatorChange}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        missingDataCount={missingCount}
        onGoToQuality={() => setActiveTab('dashboard_calidad')}
        decommissionCount={decommissions.length}
        onGoToDecommissions={() => setActiveTab('historial_bajas')}
        onShowStorageInfo={() => setIsStorageInfoOpen(true)}
      />

      {/* Main Tab Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto text-xs font-semibold scrollbar-none">
            
            {/* Tab 1: Ficha Rápida */}
            <button
              onClick={() => {
                setActiveTab('ficha_rapida');
                setFilterSpecificMissing(null);
              }}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'ficha_rapida'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Consulta de Edificios</span>
              <span className="font-mono text-[10px] bg-slate-950/60 px-1.5 py-0.2 rounded">
                {buildings.length}
              </span>
            </button>

            {/* Tab 2: Modificar Datos */}
            <button
              onClick={() => {
                setSelectedBuildingForEdit(buildings[0] || null);
                setActiveTab('modificar_datos');
              }}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'modificar_datos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>Modificar Datos</span>
            </button>

            {/* Tab 3: Tablero Llaves */}
            <button
              onClick={() => setActiveTab('tablero_llaves')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'tablero_llaves'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Tablero de Llaves</span>
              <span className="font-mono text-[10px] bg-slate-950/60 px-1.5 py-0.2 rounded">
                {keys.length}
              </span>
            </button>

            {/* Tab 4: Administradores */}
            <button
              onClick={() => setActiveTab('administradores')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'administradores'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Administradores</span>
              <span className="font-mono text-[10px] bg-slate-950/60 px-1.5 py-0.2 rounded">
                {administrators.length}
              </span>
            </button>

            {/* Tab 5: Dashboard & Calidad */}
            <button
              onClick={() => setActiveTab('dashboard_calidad')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'dashboard_calidad'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Dashboard & Calidad</span>
              {missingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Tab 6: Tabla Maestra (Supervisor preferred) */}
            <button
              onClick={() => setActiveTab('tabla_maestra')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'tabla_maestra'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Tabla Maestra (Airtable)</span>
            </button>

            {/* Tab 7: Historial & Auditoría (Exclusivo Supervisor) */}
            {userRole === 'SUPERVISOR' && (
              <button
                onClick={() => setActiveTab('historial_auditoria')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'historial_auditoria'
                    ? 'bg-blue-700 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <History className="w-4 h-4 text-blue-400" />
                <span>Auditoría</span>
                <span className="font-mono text-[10px] bg-slate-950/60 px-1.5 py-0.2 rounded">
                  {auditLogs.length}
                </span>
              </button>
            )}

            {/* Tab 8: Historial de Bajas */}
            <button
              onClick={() => setActiveTab('historial_bajas')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'historial_bajas'
                  ? 'bg-red-800 text-white shadow-md ring-1 ring-red-500 font-bold'
                  : 'text-red-300 hover:text-white hover:bg-red-950/80 bg-red-950/40 border border-red-900/60 font-semibold'
              }`}
            >
              <Archive className="w-4 h-4 text-red-400" />
              <span>Historial de Bajas</span>
              <span className="font-mono text-[10px] bg-red-900 text-white border border-red-700 px-1.5 py-0.2 rounded-full font-bold">
                {decommissions.length}
              </span>
            </button>

          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ======================================================== */}
        {/* VIEW 1: CONSULTA DE EDIFICIOS (FICHAS OPERATIVAS)        */}
        {/* ======================================================== */}
        {activeTab === 'ficha_rapida' && (
          <div className="space-y-6">
            
            {/* Search & Filter Header Strip */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Global search input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por Dirección, Nombre, Administrador, IP, Nº Cliente, Gancho..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans"
                  autoFocus
                />
              </div>

              {/* Quick Filter buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                
                <button
                  onClick={() => {
                    setFilterType('ALL');
                    setFilterMissingOnly(false);
                    setFilterSpecificMissing(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                    filterType === 'ALL' && !filterMissingOnly && !filterSpecificMissing
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({buildings.length})
                </button>

                <button
                  onClick={() => {
                    setFilterType('SEGURO');
                    setFilterMissingOnly(false);
                    setFilterSpecificMissing(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                    filterType === 'SEGURO'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  🟢 Seguros ({buildings.filter((b) => b.buildingType === 'SEGURO').length})
                </button>

                <button
                  onClick={() => {
                    setFilterType('NO_SEGURO');
                    setFilterMissingOnly(false);
                    setFilterSpecificMissing(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                    filterType === 'NO_SEGURO'
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚪ No Seguros ({buildings.filter((b) => b.buildingType === 'NO_SEGURO').length})
                </button>

                <button
                  onClick={() => {
                    setFilterMissingOnly(!filterMissingOnly);
                    setFilterSpecificMissing(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                    filterMissingOnly
                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Datos Faltantes</span>
                </button>

                {/* Historial de Bajas quick button */}
                <button
                  onClick={() => setActiveTab('historial_bajas')}
                  className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                  title="Abrir Historial de Edificios Dados de Baja"
                >
                  <Archive className="w-3.5 h-3.5 text-red-400" />
                  <span>Historial de Bajas</span>
                  <span className="font-mono text-[10px] bg-red-900 text-white px-1.5 py-0.2 rounded-full font-bold">
                    {decommissions.length}
                  </span>
                </button>

                {userRole === 'SUPERVISOR' && (
                  <button
                    onClick={() => setIsNewBuildingModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo</span>
                  </button>
                )}

              </div>
            </div>

            {/* Filter Active Alert Badge */}
            {(filterSpecificMissing || filterMissingOnly) && (
              <div className="bg-amber-950/60 border border-amber-700/80 rounded-lg p-3 text-xs text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Mostrando únicamente edificios con{' '}
                    <strong>
                      {filterSpecificMissing ? filterSpecificMissing.replace('MISSING_', '').toLowerCase() : 'datos técnicos incompletos'}
                    </strong>.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFilterMissingOnly(false);
                    setFilterSpecificMissing(null);
                  }}
                  className="text-amber-400 underline font-bold hover:text-white"
                >
                  Limpiar filtro
                </button>
              </div>
            )}

            {/* Buildings Cards Grid */}
            {filteredBuildings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <h3 className="text-base font-bold text-white mb-1">
                  No se encontraron edificios
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  No hay resultados para "{searchQuery}". Pruebe con otra dirección, nombre de edificio o número de cliente.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('ALL');
                    setFilterMissingOnly(false);
                    setFilterSpecificMissing(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBuildings.map((building) => (
                  <BuildingCard
                    key={building.id}
                    building={building}
                    admin={adminMap.get(building.adminId)}
                    onViewDetails={(b) => setSelectedBuildingForDetail(b)}
                    onEdit={(b) => setSelectedBuildingForEdit(b)}
                    onQuickNote={(b) => setSelectedBuildingForNote(b)}
                    onAssignHook={(b) => setSelectedBuildingForEdit(b)}
                    onDecommission={(b) => setSelectedBuildingForDecommission(b)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: MODIFICAR DATOS (FORMULARIO CONTROLADO)           */}
        {/* ======================================================== */}
        {activeTab === 'modificar_datos' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="max-w-2xl mx-auto text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <Edit3 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Sección: Modificar Datos Técnicos & Operativos
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Acceso controlado para operadores. Permite actualizar IP, cámaras, disco, ganchos de llaves, procedimientos de reinicio y notas sin alterar IDs ni relaciones del sistema.
              </p>

              <button
                onClick={() => setSelectedBuildingForEdit(buildings[0] || null)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Abrir Editor de Edificio</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: TABLERO DE LLAVES & GANCHOS                      */}
        {/* ======================================================== */}
        {activeTab === 'tablero_llaves' && (
          <KeysBoardView
            keys={keys}
            buildings={buildings}
            currentOperator={currentOperator}
            onRefresh={refreshData}
            onSelectBuilding={(b) => setSelectedBuildingForDetail(b)}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 4: ADMINISTRADORES DE CONSORCIOS                    */}
        {/* ======================================================== */}
        {activeTab === 'administradores' && (
          <AdministratorsView
            administrators={administrators}
            buildings={buildings}
            onRefresh={refreshData}
            onSelectBuilding={(b) => setSelectedBuildingForDetail(b)}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 5: DASHBOARD & CONTROL DE CALIDAD                    */}
        {/* ======================================================== */}
        {activeTab === 'dashboard_calidad' && (
          <DashboardView
            buildings={buildings}
            administrators={administrators}
            keys={keys}
            onFilterMissing={handleFilterMissingFromDashboard}
            onSelectBuilding={(b) => setSelectedBuildingForDetail(b)}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 6: TABLA MAESTRA COMPLETA (AIRTABLE / EXCEL)         */}
        {/* ======================================================== */}
        {activeTab === 'tabla_maestra' && (
          <MasterTableView
            buildings={buildings}
            administrators={administrators}
            onSelectBuilding={(b) => setSelectedBuildingForDetail(b)}
            onEditBuilding={(b) => setSelectedBuildingForEdit(b)}
            onNewBuilding={() => setIsNewBuildingModalOpen(true)}
            onDecommission={(b) => setSelectedBuildingForDecommission(b)}
            onRefresh={refreshData}
            currentOperator={currentOperator}
            userRole={userRole}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 7: AUDITORÍA & HISTORIAL DE OPERADORES (SUPERVISOR) */}
        {/* ======================================================== */}
        {userRole === 'SUPERVISOR' && activeTab === 'historial_auditoria' && (
          <AuditLogView logs={auditLogs} />
        )}

        {/* ======================================================== */}
        {/* VIEW 8: HISTORIAL DE BAJAS DE EDIFICIOS                  */}
        {/* ======================================================== */}
        {activeTab === 'historial_bajas' && (
          <HistorialBajasView
            decommissions={decommissions}
            onRefresh={refreshData}
            currentOperator={currentOperator}
          />
        )}

      </main>

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* Detail Modal */}
      <BuildingDetailModal
        building={selectedBuildingForDetail}
        admin={selectedBuildingForDetail ? adminMap.get(selectedBuildingForDetail.adminId) : undefined}
        isOpen={Boolean(selectedBuildingForDetail)}
        onClose={() => setSelectedBuildingForDetail(null)}
        onEdit={(b) => setSelectedBuildingForEdit(b)}
        onQuickNote={(b) => setSelectedBuildingForNote(b)}
        onDecommission={(b) => setSelectedBuildingForDecommission(b)}
        currentOperator={currentOperator}
      />

      {/* Controlled Edit Modal */}
      <BuildingEditModal
        building={selectedBuildingForEdit}
        administrators={administrators}
        allBuildings={buildings}
        currentOperator={currentOperator}
        isOpen={Boolean(selectedBuildingForEdit)}
        onClose={() => setSelectedBuildingForEdit(null)}
        onSaved={refreshData}
      />

      {/* Quick Note Modal */}
      <QuickNoteModal
        building={selectedBuildingForNote}
        currentOperator={currentOperator}
        isOpen={Boolean(selectedBuildingForNote)}
        onClose={() => setSelectedBuildingForNote(null)}
        onUpdated={refreshData}
      />

      {/* Decommission Modal */}
      <DecommissionModal
        building={selectedBuildingForDecommission}
        admin={selectedBuildingForDecommission ? adminMap.get(selectedBuildingForDecommission.adminId) : undefined}
        isOpen={Boolean(selectedBuildingForDecommission)}
        onClose={() => setSelectedBuildingForDecommission(null)}
        onSuccess={() => {
          refreshData();
          setSelectedBuildingForDecommission(null);
          setSelectedBuildingForDetail(null);
          setActiveTab('historial_bajas');
        }}
        currentOperator={currentOperator}
      />

      {/* New Building Modal (Supervisor) */}
      <NewBuildingModal
        administrators={administrators}
        isOpen={isNewBuildingModalOpen}
        onClose={() => setIsNewBuildingModalOpen(false)}
        onCreated={(b) => {
          refreshData();
          setSelectedBuildingForDetail(b);
        }}
        currentOperator={currentOperator}
      />

      {/* Supervisor Auth Modal (Protects Supervisor Mode) */}
      <SupervisorAuthModal
        isOpen={isSupervisorAuthModalOpen}
        onClose={() => setIsSupervisorAuthModalOpen(false)}
        onSuccess={() => {
          setUserRole('SUPERVISOR');
          StorageService.setUserRole('SUPERVISOR');
          setIsSupervisorAuthModalOpen(false);
        }}
      />

      {/* Storage Architecture Info Modal */}
      <StorageInfoModal
        isOpen={isStorageInfoOpen}
        onClose={() => setIsStorageInfoOpen(false)}
      />

    </div>
  );
}