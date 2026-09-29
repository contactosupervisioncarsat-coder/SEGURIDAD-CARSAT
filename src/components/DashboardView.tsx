import { Building, Administrator, KeyItem } from '../types';
import {
  Shield,
  Camera,
  Users,
  Key,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Power,
  MapPin,
  Flame,
} from 'lucide-react';

interface DashboardViewProps {
  buildings: Building[];
  administrators: Administrator[];
  keys: KeyItem[];
  onFilterMissing: (filterType: string) => void;
  onSelectBuilding: (building: Building) => void;
}

export function DashboardView({
  buildings,
  administrators,
  keys,
  onFilterMissing,
  onSelectBuilding,
}: DashboardViewProps) {
  // 1. OPERACIÓN CALCULATIONS
  const totalBuildings = buildings.length;
  const safeBuildings = buildings.filter((b) => b.buildingType === 'SEGURO').length;
  const unsafeBuildings = buildings.filter((b) => b.buildingType === 'NO_SEGURO').length;
  const totalCameras = buildings.reduce((sum, b) => sum + (b.cameraCount || 0), 0);
  const totalAdmins = administrators.length;
  const totalPhysicalKeys = keys.length;
  const totalRemoteControls = buildings.reduce((sum, b) => sum + (b.remoteControlCount || 0), 0);

  // 2. PARTE TÉCNICA
  const withDisk = buildings.filter((b) => b.hasDisk === 'SI').length;
  const withoutDisk = buildings.filter((b) => b.hasDisk === 'NO').length;
  const partialDisk = buildings.filter((b) => b.hasDisk === 'PARCIAL').length;

  const gigaredCount = buildings.filter((b) => b.internetType === 'Gigared').length;
  const externalInternet = buildings.filter((b) => b.internetType === 'Externo').length;
  const noInternetData = buildings.filter((b) => b.internetType === 'Sin dato' || !b.internetType).length;

  const storage1Count = buildings.filter((b) => {
    const s = (b.storageType || '').trim().toLowerCase();
    return s === 'storage' || s === 'storage 1' || s === 'storage-1' || s === 'storage1';
  }).length;
  const storage2Count = buildings.filter((b) => {
    const s = (b.storageType || '').trim().toLowerCase();
    return s === 'storage 2' || s === 'storage-2' || s === 'storage2';
  }).length;

  const withIpCount = buildings.filter((b) => b.ipAddress && b.ipAddress.trim() !== '').length;

  // 3. CALIDAD DE DATOS (FALTANTES CRÍTICOS)
  const missingIp = buildings.filter((b) => !b.ipAddress || b.ipAddress.trim() === '');
  const missingAdmin = buildings.filter((b) => !b.adminId || b.adminId.trim() === '');
  const missingReboot = buildings.filter((b) => !b.rebootProcedure || b.rebootProcedure.trim() === '');
  const missingDvrLocation = buildings.filter((b) => !b.dvrLocation || b.dvrLocation.trim() === '');
  const missingSerial = buildings.filter((b) => b.hasDisk === 'SI' && (!b.serialNumber || b.serialNumber.trim() === ''));
  const missingHookKeys = keys.filter((k) => !k.hookNumber || k.hookNumber.trim() === '');
  const missingNotes = buildings.filter((b) => !b.currentNote || b.currentNote.trim() === '');

  const totalQualityAlerts =
    missingIp.length +
    missingAdmin.length +
    missingReboot.length +
    missingDvrLocation.length +
    missingSerial.length +
    missingHookKeys.length;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>Tablero de Control & Calidad Operativa</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              SALA CCTV
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Métricas de infraestructura en tiempo real y detección proactiva de datos faltantes para el equipo de guardia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Salud de la base</span>
            <span className={`text-base font-black font-mono ${totalQualityAlerts === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalQualityAlerts === 0 ? '100% COMPLETA' : `${totalQualityAlerts} ALERTAS`}
            </span>
          </div>
        </div>
      </div>

      {/* SECTOR 1: 📊 OPERACIÓN */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            1. Sector Operación General
          </span>
          <span className="text-xs text-slate-400">· Edificios, Cámaras y Recursos</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Edificios Totales</span>
            <p className="text-2xl font-black text-white">{totalBuildings}</p>
            <span className="text-[10px] text-slate-400">Monitoreados en red</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase block mb-1">🟢 Edificios Seguros</span>
            <p className="text-2xl font-black text-emerald-400">{safeBuildings}</p>
            <span className="text-[10px] text-slate-400">{Math.round((safeBuildings / (totalBuildings || 1)) * 100)}% de la red</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">⚪ No Seguros</span>
            <p className="text-2xl font-black text-slate-300">{unsafeBuildings}</p>
            <span className="text-[10px] text-slate-400">Estándar / Básicos</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-sky-400 uppercase block mb-1">Total Cámaras</span>
            <p className="text-2xl font-black text-white">{totalCameras}</p>
            <span className="text-[10px] text-slate-400">Canales activos</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase block mb-1">Administradores</span>
            <p className="text-2xl font-black text-white">{totalAdmins}</p>
            <span className="text-[10px] text-slate-400">Consorcios vinculados</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-amber-400 uppercase block mb-1">Llaves en Tablero</span>
            <p className="text-2xl font-black text-amber-300">{totalPhysicalKeys}</p>
            <span className="text-[10px] text-slate-400">Físicas registradas</span>
          </div>

        </div>
      </div>

      {/* SECTOR 2: 🔧 PARTE TÉCNICA */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            2. Sector Parte Técnica e Infraestructura
          </span>
          <span className="text-xs text-slate-400">· Conectividad, Grabación & Almacenamiento</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Internet / Provider */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-sky-400" /> Conectividad
              </span>
              <span className="text-xs font-mono font-bold text-sky-400">{withIpCount}/{totalBuildings} IP</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Gigared:</span>
                <span className="font-bold text-white font-mono">{gigaredCount}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Internet Externo:</span>
                <span className="font-bold text-white font-mono">{externalInternet}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Sin dato de enlace:</span>
                <span className={`font-bold font-mono ${noInternetData > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {noInternetData}
                </span>
              </div>
            </div>
          </div>

          {/* Hard Disks */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-indigo-400" /> Discos Rígidos
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {withDisk} con disco
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Con disco operativo:</span>
                <span className="font-bold text-white font-mono">{withDisk}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Sin disco (solo vivo):</span>
                <span className="font-bold text-slate-400 font-mono">{withoutDisk}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Disco parcial / falla:</span>
                <span className="font-bold text-amber-400 font-mono">{partialDisk}</span>
              </div>
            </div>
          </div>

          {/* Storage Types */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" /> Tipo Storage
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {storage1Count + storage2Count} Storage
              </span>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/70 border border-purple-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="text-slate-200 font-semibold">STORAGE 1:</span>
                </div>
                <span className="font-extrabold text-white font-mono text-sm bg-purple-950/80 border border-purple-800 px-2.5 py-0.5 rounded">
                  {storage1Count} {storage1Count === 1 ? 'edificio' : 'edificios'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/70 border border-indigo-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-slate-200 font-semibold">STORAGE 2:</span>
                </div>
                <span className="font-extrabold text-white font-mono text-sm bg-indigo-950/80 border border-indigo-800 px-2.5 py-0.5 rounded">
                  {storage2Count} {storage2Count === 1 ? 'edificio' : 'edificios'}
                </span>
              </div>
            </div>
          </div>

          {/* Remote Controls & Guard */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" /> Accesos & Controles
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {totalRemoteControls} controles
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total controles remotos:</span>
                <span className="font-bold text-white font-mono">{totalRemoteControls}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Edificios con llaves físicas:</span>
                <span className="font-bold text-white font-mono">
                  {buildings.filter((b) => b.keyHasPhysical === 'SI').length}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Con guardia física/portero:</span>
                <span className="font-bold text-white font-mono">
                  {buildings.filter((b) => b.physicalGuard && b.physicalGuard.toUpperCase() !== 'NO').length}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTOR 3: ⚠️ CALIDAD DE DATOS (FALTANTES CRÍTICOS) */}
      <div className="bg-slate-900 border-2 border-amber-600/70 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>3. Sector Calidad de Datos & Información Incompleta</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                  {totalQualityAlerts} PENDIENTES
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                La base no solo guarda datos: detecta automáticamente dónde falta información técnica crítica para que los operadores no duden durante una guardia.
              </p>
            </div>
          </div>
        </div>

        {/* Quality Alerts Interactive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4 text-xs">
          
          {/* Missing Hooks */}
          <div
            onClick={() => onFilterMissing('MISSING_HOOK')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              missingHookKeys.length > 0
                ? 'bg-amber-950/30 border-amber-600/80 hover:bg-amber-950/50 hover:border-amber-400'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                ⚠️ GANCHO SIN ASIGNAR
              </span>
              <span className="font-mono font-black text-sm text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-800/80">
                {missingHookKeys.length}
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Llaves registradas en el sistema pero sin número de gancho en el tablero físico.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <span>Ver y asignar ganchos</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Missing IP */}
          <div
            onClick={() => onFilterMissing('MISSING_IP')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              missingIp.length > 0
                ? 'bg-amber-950/30 border-amber-600/80 hover:bg-amber-950/50 hover:border-amber-400'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-sky-400" />
                ⚠️ EDIFICIOS SIN IP
              </span>
              <span className="font-mono font-black text-sm text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-800/80">
                {missingIp.length}
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Edificios que no tienen IP de acceso remoto cargada para monitoreo.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <span>Filtrar estos edificios</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Missing Reboot */}
          <div
            onClick={() => onFilterMissing('MISSING_REBOOT')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              missingReboot.length > 0
                ? 'bg-red-950/30 border-red-700/80 hover:bg-red-950/50 hover:border-red-400'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-red-300 flex items-center gap-1.5">
                <Power className="w-4 h-4 text-red-400" />
                ⚠️ FALTA PROCEDIMIENTO DE REINICIO
              </span>
              <span className="font-mono font-black text-sm text-red-300 bg-slate-900 px-2 py-0.5 rounded border border-red-800/80">
                {missingReboot.length}
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Crítico: Si se caen las cámaras, el operador no sabrá qué térmica cortar.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-red-400 font-semibold">
              <span>Completar procedimiento</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Missing DVR Location */}
          <div
            onClick={() => onFilterMissing('MISSING_DVR_LOCATION')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              missingDvrLocation.length > 0
                ? 'bg-amber-950/30 border-amber-600/80 hover:bg-amber-950/50 hover:border-amber-400'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                ⚠️ FALTA UBICACIÓN DEL DVR
              </span>
              <span className="font-mono font-black text-sm text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-800/80">
                {missingDvrLocation.length}
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Edificios donde no se especificó armario, subsuelo, garita o sala de máquinas.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <span>Filtrar y relevar</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Missing Serial */}
          <div
            onClick={() => onFilterMissing('MISSING_SERIAL')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              missingSerial.length > 0
                ? 'bg-amber-950/30 border-amber-600/80 hover:bg-amber-950/50 hover:border-amber-400'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                ⚠️ FALTA NÚMERO DE SERIE
              </span>
              <span className="font-mono font-black text-sm text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-800/80">
                {missingSerial.length}
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Equipos con disco/grabación pero sin número de serie registrado para garantía o soporte.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <span>Completar números de serie</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Missing Admin */}
          <div
            onClick={() => onFilterMissing('MISSING_ADMIN')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              missingAdmin.length > 0
                ? 'bg-amber-950/30 border-amber-600/80 hover:bg-amber-950/50 hover:border-amber-400'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                ⚠️ SIN ADMINISTRADOR ASIGNADO
              </span>
              <span className="font-mono font-black text-sm text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-800/80">
                {missingAdmin.length}
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Edificios huérfanos sin datos de contacto del administrador en caso de siniestro.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <span>Asignar administradores</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
