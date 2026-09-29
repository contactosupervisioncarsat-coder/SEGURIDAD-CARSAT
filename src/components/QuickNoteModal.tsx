import { useState, useEffect } from 'react';
import { Building } from '../types';
import { StorageService } from '../services/storage';
import { MessageSquare, X, Check, Clock, User, AlertCircle } from 'lucide-react';

interface QuickNoteModalProps {
  building: Building | null;
  currentOperator: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function QuickNoteModal({
  building,
  currentOperator,
  isOpen,
  onClose,
  onUpdated,
}: QuickNoteModalProps) {
  const [noteText, setNoteText] = useState('');
  const [operator, setOperator] = useState(currentOperator);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (building) {
      setNoteText(building.currentNote || '');
    }
    setOperator(currentOperator);
    setIsSaved(false);
  }, [building, currentOperator, isOpen]);

  if (!isOpen || !building) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    StorageService.updateOperationalNote(building.id, noteText.trim(), operator);
    setIsSaved(true);
    setTimeout(() => {
      onUpdated();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Nota Operativa de Guardia
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {building.address} {building.buildingName ? `· ${building.buildingName}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Previous Note reference */}
          {building.currentNote && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">Nota anterior guardada:</span>
                <span className="font-mono text-[10px]">
                  {building.lastNoteOperator} · {building.lastNoteDate}
                </span>
              </div>
              <p className="italic text-slate-400 text-xs">
                "{building.currentNote}"
              </p>
            </div>
          )}

          {/* New Note input */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1.5">
              Nueva nota operativa (reemplaza la anterior y actualiza la fecha):
            </label>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ej: DVR trasladado al depósito. Para reiniciar cortar térmica Nº 4 en el pasillo..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              required
            />
          </div>

          {/* Operator Signature */}
          <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Operador firmante:</span>
            </div>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Actualizado</span>
                </>
              ) : (
                <span>Guardar Nota</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
