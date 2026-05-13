import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — Componente de diálogo reutilizable.
 * Uso: <Modal open={bool} onClose={fn} title="..."><contenido/></Modal>
 */
export default function Modal({ open, onClose, title, children, width = '540px' }) {
    // Cerrar con Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                style={{ maxWidth: width }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
