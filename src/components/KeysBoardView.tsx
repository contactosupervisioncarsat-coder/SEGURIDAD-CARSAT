import { useState } from 'react';
import { KeyItem, Building } from '../types';
import { StorageService } from '../services/storage';
import {
  Key,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

interface KeysBoardViewProps {
  keys: KeyItem[];
  buildings: Building[];
  currentOperator: string;
  onRefresh: () => void;
  onSelectBuilding: (building: Building) => void;
}

export function KeysBoardView({
  keys,
  buildings,
  currentOperator,
  onRefresh,
  onSelectBuilding,
}: KeysBoardViewProps) {
  const [filterMode, setFilterMode] = useState<'TODAS' | 'SIN_GANCHO' | 'EN_TABLERO' | 'PRESTADAS'>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKeyModal, setActiveKeyModal] = useState<KeyItem | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  // New key form state
  const [newKeyForm, setNewKeyForm] = useState<Partial<KeyItem>>({
    buildingId: buildings[0]?.id || '',
    keyType: 'Acceso Principal',
    hookNumber: '',
    status: 'En tablero',
    location: 'Tablero Central Sala Monitoreo',
    notes: '',
  });

  const buildingMap = new Map(buildings.map((b) => [b.id, b]));

  // Visual hooks map for 1 to 50
  const hookAssignments = new Map<string, { key: KeyItem; building?: Building }>();
  keys.forEach((k) => {
    if (k.hookNumber && k.hookNumber.trim() !== '') {
      // Normalize number without leading zeros or with standard 2 digits
      const normalized = k.hookNumber.trim();
      hookAssignments.set(normalized, { key: k, building: buildingMap.get(k.buildingId) });
      const numOnly = String(parseInt(normalized, 10));
      if (numOnly !== normalized) {
        hookAssignments.set(numOnly, { key: k, building: buildingMap.get(k.buildingId) });
      }
    }
  });

  const filteredKeys = keys.filter((k) => {
    const building = buildingMap.get(k.buildingId);
    const textMatch =
      searchQuery === '' ||
      k.hookNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.keyType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building?.buildingName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!textMatch) return false;

    if (filterMode === 'SIN_GANCHO') {
      return !k.hookNumber || k.hookNumber.trim() === '';
    }
    if (filterMode === 'EN_TABLERO') {
      return k.status === 'En tablero';
    }
    if (filterMode === 'PRESTADAS') {
      return k.status !== 'En tablero';
    }
    return true;
  });

  const unassignedCount = keys.filter((k) => !k.hookNumber || k.hookNumber.trim() === '').length;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.buildingId) return;

    const id = activeKeyModal ? activeKeyModal.id : `LL-${String(Date.now()).slice(-4)}`;
    const record: KeyItem = {
      id,
      buildingId: newKeyForm.buildingId,
      keyType: newKeyForm.keyType || 'Acceso General',
      hookNumber: newKeyForm.hookNumber || '',
      status: (newKeyForm.status as any) || 'En tablero',
      location: newKeyForm.location || 'Tablero Central Sala Monitoreo',
      notes: newKeyForm.notes || '',
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveKey(record, currentOperator);
    setIsEditingNew(false);
    setActiveKeyModal(null);
    onRefresh();
  };

  const handleQuickAssignHook = (key: KeyItem, hookStr: string) => {
    const updated = { ...key, hookNumber: hookStr };
    StorageService.saveKey(updated, currentOperator);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Tablero Central de Llaves
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control físico de ganchos del tablero en sala de guardia. Si un gancho no está definido, se completa progresivamente.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {unassignedCount > 0 && (
            <button
              onClick={() => setFilterMode('SIN_GANCHO')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-600 text-amber-300 text-xs font-bold animate-pulse hover:bg-amber-900/80 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{unassignedCount} LLAVES SIN GANCHO ASIGNADO</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveKeyModal(null);
              setNewKeyForm({
                buildingId: buildings[0]?.id || '',
                keyType: 'Acceso Principal',
                hookNumber: '',
                status: 'En tablero',
                location: 'Tablero Central Sala Monitoreo',
                notes: '',
              });
              setIsEditingNew(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nueva Llave</span>
          </button>
        </div>
      </div>

      {/* Visual Hook Board: 1 to 40 (Simulating physical board on the wall) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Vista Visual del Tablero Físico (Ganchos 01 al 40)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            🟢 Ocupado con llave asignada · ⚪ Gancho disponible
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((hookNum) => {
            const hookStr = hookNum < 10 ? `0${hookNum}` : String(hookNum);
            const hookNumStr = String(hookNum);
            const slot = hookAssignments.get(hookStr) || hookAssignments.get(hookNumStr);

            return (
              <div
                key={hookNum}
                onClick={() => {
                  if (slot?.building) {
                    onSelectBuilding(slot.building);
                  } else if (slot?.key) {
                    setActiveKeyModal(slot.key);
                    setNewKeyForm(slot.key);
                    setIsEditingNew(true);
                  }
                }}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer relative ${
                  slot
                    ? 'bg-slate-800/90 border-amber-500/80 hover:bg-amber-950/40 hover:border-amber-400 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
                title={slot ? `Gancho #${hookStr}: ${slot.building?.address || 'Edificio'} (${slot.key.keyType})` : `Gancho #${hookStr} disponible`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
                  <span>#{hookStr}</span>
                  {slot ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>

                {slot ? (
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-amber-200 truncate">
                      {slot.building?.address || 'Llave'}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">
                      {slot.key.keyType}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Libre</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterMode === 'TODAS'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({keys.length})
          </button>
          <button
            onClick={() => setFilterMode('SIN_GANCHO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterMode === 'SIN_GANCHO'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            ⚠️ Sin Gancho ({unassignedCount})
          </button>
          <button
            onClick={() => setFilterMode('EN_TABLERO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterMode === 'EN_TABLERO'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            En Tablero
          </button>
          <button
            onClick={() => setFilterMode('PRESTADAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterMode === 'PRESTADAS'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Prestadas / Fuera
          </button>
        </div>

        {/* Search box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por edificio, gancho o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Keys List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Gancho</th>
                <th className="py-3 px-4">Edificio</th>
                <th className="py-3 px-4">Tipo de Llave</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Ubicación Física / Observaciones</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron llaves con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => {
                  const building = buildingMap.get(key.buildingId);
                  const isMissingHook = !key.hookNumber || key.hookNumber.trim() === '';

                  return (
                    <tr key={key.id} className="hover:bg-slate-850 transition-colors">
                      {/* Hook */}
                      <td className="py-3 px-4">
                        {isMissingHook ? (
                          <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-600 rounded font-bold text-[11px] inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            SIN ASIGNAR
                          </span>
                        ) : (
                          <span className="font-mono text-base font-black text-amber-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-700">
                            #{key.hookNumber}
                          </span>
                        )}
                      </td>

                      {/* Building */}
                      <td className="py-3 px-4">
                        {building ? (
                          <div>
                            <button
                              onClick={() => onSelectBuilding(building)}
                              className="font-bold text-white hover:text-emerald-400 text-left flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>{building.address}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                            {building.buildingName && (
                              <p className="text-[11px] text-slate-400">{building.buildingName}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Edificio no vinculado</span>
                        )}
                      </td>

                      {/* Key Type */}
                      <td className="py-3 px-4 font-medium text-slate-300">
                        {key.keyType}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            key.status === 'En tablero'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {key.status}
                        </span>
                      </td>

                      {/* Location & notes */}
                      <td className="py-3 px-4 text-slate-300 max-w-xs">
                        <p className="font-medium text-slate-200">{key.location}</p>
                        {key.notes && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">{key.notes}</p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveKeyModal(key);
                              setNewKeyForm(key);
                              setIsEditingNew(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                            title="Editar llave"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Key */}
      {isEditingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>{activeKeyModal ? 'Modificar Llave' : 'Registrar Llave en Tablero'}</span>
              </h3>
              <button
                onClick={() => setIsEditingNew(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4 mt-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Edificio asignado:
                </label>
                <select
                  value={newKeyForm.buildingId}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, buildingId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
                  required
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.address} {b.buildingName ? `(${b.buildingName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Gancho de tablero (ej: 17):
                  </label>
                  <input
                    type="text"
                    placeholder="Dejar vacío si sin asignar"
                    value={newKeyForm.hookNumber || ''}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, hookNumber: e.target.value.trim() })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Estado:
                  </label>
                  <select
                    value={newKeyForm.status}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
                  >
                    <option value="En tablero">En tablero</option>
                    <option value="Entregada a guardia">Entregada a guardia</option>
                    <option value="Prestada a técnico">Prestada a técnico</option>
                    <option value="Perdida / A reponer">Perdida / A reponer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de llave / Qué abre:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Acceso Principal y Sala DVR"
                  value={newKeyForm.keyType}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, keyType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ubicación física:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tablero Central Sala Monitoreo"
                  value={newKeyForm.location}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Observaciones / Llavero / Precinto:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Llavero verde con logo CARSAT, precinto Nº 102"
                  value={newKeyForm.notes}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingNew(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow cursor-pointer"
                >
                  Guardar Llave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
