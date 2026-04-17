import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400">{message}</p>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-stretch sm:justify-center mt-6 w-full max-w-xs mx-auto">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="w-full sm:w-auto">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
