import { useState, useEffect } from 'react';
import { Shield, Clock, User, ChevronDown, Check, Settings, ShieldCheck, AlertCircle, Archive, Database, Lock } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Operator } from '../types';

interface HeaderProps {
  currentOperator: string;
  onOperatorChange: (name: string) => void;
  userRole: 'OPERADOR' | 'SUPERVISOR';
  onRoleChange: (role: 'OPERADOR' | 'SUPERVISOR') => void;
  missingDataCount: number;
  onGoToQuality: () => void;
  decommissionCount?: number;
  onGoToDecommissions?: () => void;
  onShowStorageInfo?: () => void;
}

export function Header({
  currentOperator,
  onOperatorChange,
  userRole,
  onRoleChange,
  missingDataCount,
  onGoToQuality,
  decommissionCount,
  onGoToDecommissions,
  onShowStorageInfo,
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [showOpMenu, setShowOpMenu] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const dateStr = now.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      setTime(`${dateStr.toUpperCase()} · ${timeStr}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOperators(StorageService.getOperators());
    const handleDataChange = () => {
      setOperators(StorageService.getOperators());
    };
    window.addEventListener('carsat_data_changed', handleDataChange);
    return () => window.removeEventListener('carsat_data_changed', handleDataChange);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & CCTV Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-inner font-black text-lg tracking-wider">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white uppercase font-mono">
                CARSAT CCTV
              </span>
              <span className="text-[10px] tracking-widest font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase">
                Sala de Monitoreo
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans block">
              Base de datos
            </p>
          </div>
        </div>

        {/* Live Clock & Central Storage Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/70 px-3 py-1.5 rounded-md border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{time || 'CARGANDO HORA...'}</span>
          </div>

          {onShowStorageInfo && (
            <button
              onClick={onShowStorageInfo}
              className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-slate-950/70 hover:bg-slate-900 border border-emerald-800/50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
              title="Información sobre dónde se guardan los datos"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Base Central: Servidor Cloud</span>
            </button>
          )}
        </div>

        {/* Action Badges: Missing Data & Historial de Bajas */}
        <div className="flex items-center gap-2">
          {missingDataCount > 0 && (
            <button
              onClick={onGoToQuality}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-amber-950/70 border border-amber-700/60 text-amber-300 hover:bg-amber-900/80 transition-colors cursor-pointer"
              title="Ver datos incompletos o faltantes"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span className="font-medium font-mono">{missingDataCount} datos faltantes</span>
            </button>
          )}

          {onGoToDecommissions && (
            <button
              onClick={onGoToDecommissions}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-red-950/70 border border-red-700/60 text-red-300 hover:bg-red-900/80 transition-colors cursor-pointer"
              title="Abrir Historial de Edificios Dados de Baja"
            >
              <Archive className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold hidden sm:inline">Historial Bajas</span>
              <span className="font-mono text-[10px] bg-red-900 text-white font-bold px-1.5 py-0.2 rounded-full">
                {decommissionCount || 0}
              </span>
            </button>
          )}
        </div>

        {/* Operator & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Operator Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOpMenu(!showOpMenu)}
              className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Operador en turno
                </span>
                <span className="font-medium text-white truncate max-w-[130px] block">
                  {currentOperator}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showOpMenu && (
              <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 text-xs max-h-96 overflow-y-auto">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                  Seleccionar operador de guardia
                </div>
                {operators.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => {
                      onOperatorChange(op.name);
                      setShowOpMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      op.name === currentOperator ? 'text-emerald-400 bg-slate-800/60 font-medium' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{op.name}</p>
                      <p className="text-[10px] text-slate-400">{op.shift}</p>
                    </div>
                    {op.name === currentOperator && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode Switch: Operador vs Supervisor */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onRoleChange('OPERADOR')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                userRole === 'OPERADOR'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Operador: Búsqueda rápida, fichas operativas y modificación de notas"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Operador</span>
              </div>
            </button>
            <button
              onClick={() => onRoleChange('SUPERVISOR')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                userRole === 'SUPERVISOR'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Supervisor (Exclusivo contacto.supervision.carsat@gmail.com)"
            >
              <div className="flex items-center gap-1.5">
                {userRole === 'SUPERVISOR' ? (
                  <Settings className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Supervisor</span>
              </div>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
