import { useState } from 'react';
import { Administrator, Building } from '../types';
import { StorageService } from '../services/storage';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Building as BuildingIcon,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Camera,
  X,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface AdministratorsViewProps {
  administrators: Administrator[];
  buildings: Building[];
  onRefresh: () => void;
  onSelectBuilding: (building: Building) => void;
}

export function AdministratorsView({
  administrators,
  buildings,
  onRefresh,
  onSelectBuilding,
}: AdministratorsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Administrator | null>(null);

  const [formData, setFormData] = useState<Partial<Administrator>>({
    name: '',
    officeAddress: '',
    email: '',
    primaryPhone: '',
    alternativePhone: '',
    notes: '',
  });

  const filteredAdmins = administrators.filter((adm) => {
    const q = searchQuery.toLowerCase();
    return (
      adm.name.toLowerCase().includes(q) ||
      adm.primaryPhone.toLowerCase().includes(q) ||
      adm.email.toLowerCase().includes(q) ||
      adm.officeAddress.toLowerCase().includes(q)
    );
  });

  const getAdminBuildings = (adminId: string) => {
    return buildings.filter((b) => b.adminId === adminId);
  };

  const handleOpenNew = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      officeAddress: '',
      email: '',
      primaryPhone: '',
      alternativePhone: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: Administrator) => {
    setEditingAdmin(admin);
    setFormData({ ...admin });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const count = getAdminBuildings(id).length;
    if (count > 0) {
      if (!confirm(`Este administrador tiene ${count} edificio(s) asignados. ¿Seguro que desea eliminarlo?`)) {
        return;
      }
    } else {
      if (!confirm(`¿Eliminar al administrador ${name}?`)) return;
    }
    StorageService.deleteAdministrator(id);
    onRefresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const id = editingAdmin ? editingAdmin.id : `ADM-${String(Date.now()).slice(-4)}`;
    const adminRecord: Administrator = {
      id,
      name: formData.name.trim().toUpperCase(),
      officeAddress: formData.officeAddress?.trim() || '',
      email: formData.email?.trim() || '',
      primaryPhone: formData.primaryPhone?.trim() || '',
      alternativePhone: formData.alternativePhone?.trim() || '',
      notes: formData.notes?.trim() || '',
      createdAt: editingAdmin ? editingAdmin.createdAt : new Date().toISOString(),
    };

    StorageService.saveAdministrator(adminRecord);
    setIsModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Administradores de Consorcios
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Base normalizada: Se cargan una sola vez y se vinculan automáticamente a sus edificios.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar administrador por nombre, teléfono, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Grid of Admins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAdmins.map((admin) => {
          const relatedBuildings = getAdminBuildings(admin.id);
          const totalCameras = relatedBuildings.reduce((sum, b) => sum + (b.cameraCount || 0), 0);

          return (
            <div
              key={admin.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Admin Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {admin.id}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {admin.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(admin)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Editar administrador"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id, admin.name)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                      title="Eliminar administrador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact info list */}
                <div className="space-y-2 my-3 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Teléfono Principal:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">
                        {admin.primaryPhone || 'Sin dato'}
                      </span>
                      {admin.primaryPhone && (
                        <a
                          href={`tel:${admin.primaryPhone.replace(/\D/g, '')}`}
                          className="px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
                        >
                          Llamar
                        </a>
                      )}
                    </div>
                  </div>

                  {admin.alternativePhone && (
                    <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Tel. Alternativo:
                      </span>
                      <span className="font-mono text-slate-300">
                        {admin.alternativePhone}
                      </span>
                    </div>
                  )}

                  {admin.email && (
                    <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        Email:
                      </span>
                      <span className="font-mono text-slate-300 truncate max-w-[200px]">
                        {admin.email}
                      </span>
                    </div>
                  )}

                  {admin.officeAddress && (
                    <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        Oficina:
                      </span>
                      <span className="text-slate-300 truncate max-w-[200px]">
                        {admin.officeAddress}
                      </span>
                    </div>
                  )}
                </div>

                {admin.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 mb-3">
                    "{admin.notes}"
                  </p>
                )}
              </div>

              {/* Related Buildings pill strip */}
              <div className="pt-3 border-t border-slate-800 mt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <BuildingIcon className="w-3.5 h-3.5 text-sky-400" />
                    {relatedBuildings.length} edificios monitoreados
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    {totalCameras} cámaras totales
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {relatedBuildings.length === 0 ? (
                    <span className="text-slate-400 text-xs italic">
                      Sin edificios asignados actualmente.
                    </span>
                  ) : (
                    relatedBuildings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => onSelectBuilding(b)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500 rounded text-[11px] text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Ver ficha del edificio"
                      >
                        <span className="font-semibold">{b.address}</span>
                        {b.buildingName && <span className="text-slate-400 font-normal">({b.buildingName})</span>}
                        <ExternalLink className="w-2.5 h-2.5 text-sky-400 ml-0.5" />
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Administrator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>{editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre completo / Estudio:
                </label>
                <input
                  type="text"
                  placeholder="Ej: JORDAN PABLO"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Teléfono Principal:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 341-425-8890"
                    value={formData.primaryPhone || ''}
                    onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-400 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Teléfono Alternativo:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 341-155-920114"
                    value={formData.alternativePhone || ''}
                    onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email de contacto:
                </label>
                <input
                  type="email"
                  placeholder="Ej: administracion@gmail.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Domicilio de oficina:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mitre 640 Piso 3 Oficina B"
                  value={formData.officeAddress || ''}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Observaciones operativas:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Avisar por WhatsApp antes de visitas técnicas. Horario de atención: 09 a 16 hs."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow cursor-pointer"
                >
                  Guardar Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
