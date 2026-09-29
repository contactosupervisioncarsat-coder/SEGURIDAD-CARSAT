import { useState } from 'react';
import { StorageService } from '../services/storage';
import { ShieldCheck, Lock, AlertCircle, X, Key, Mail, CheckCircle2 } from 'lucide-react';

interface SupervisorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupervisorAuthModal({ isOpen, onClose, onSuccess }: SupervisorAuthModalProps) {
  const authorizedEmail = StorageService.SUPERVISOR_EMAIL;
  const [emailInput, setEmailInput] = useState(authorizedEmail);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await StorageService.verifySupervisorCredentials(emailInput, pinInput);
    setLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Credenciales no autorizadas.');
    }
  };

  const handleUseOfficialEmail = () => {
    setEmailInput(authorizedEmail);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-blue-900/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border-b border-blue-900/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                  Acceso Restringido
                </span>
                <span className="text-xs font-mono text-slate-400">Jefatura</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Modo Supervisor
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Cuenta autorizada para supervisión</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              El Modo Supervisor permite acceder a la Tabla Maestra completa, dar de alta/baja edificios, modificar la base y auditar los logs de los operadores.
            </p>
            <div className="pt-1 flex items-center gap-1.5 font-mono text-blue-200 text-[11px]">
              <span className="text-slate-400">Titular:</span>
              <strong className="text-white">{authorizedEmail}</strong>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-slate-300 font-semibold">
              Correo de Supervisión:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="contacto.supervision.carsat@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            {emailInput.toLowerCase().trim() !== authorizedEmail && (
              <button
                type="button"
                onClick={handleUseOfficialEmail}
                className="text-[11px] text-blue-400 hover:underline pt-0.5 block"
              >
                Usar cuenta oficial ({authorizedEmail})
              </button>
            )}
          </div>

          {/* PIN / Clave */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold">
                PIN de Seguridad de Supervisión:
              </label>
              <span className="text-[10px] text-slate-400">PIN por defecto: 2026</span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingrese PIN (ej: 2026)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar (Permanecer en Operador)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verificando...' : 'Verificar e Ingresar'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
