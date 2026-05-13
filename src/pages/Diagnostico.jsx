import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/Layout/AppLayout';
import { diagnosticar, clasificarTipo } from '../services/diagnosticoEngine';
import { Stethoscope, Send } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';

export default function Diagnostico() {
    const { user } = useAuth();
    const db = getFirestore(app);

    const [texto,      setTexto]      = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscado,    setBuscado]    = useState(false);
    const [guardado,   setGuardado]   = useState(false);

    const handleDiagnosticar = () => {
        if (!texto.trim()) return;
        const res = diagnosticar(texto);
        setResultados(res);
        setBuscado(true);
        setGuardado(false);
    };

    const handleGuardar = async () => {
        if (!resultados.length) return;
        await addDoc(collection(db, 'diagnosticos'), {
            textoPoblema: texto,
            tipo: clasificarTipo(texto),
            resultados: resultados.map(r => ({ id: r.id, problema: r.problema, puntaje: r.puntaje })),
            creadoPor: user.uid,
            creadoPorNombre: user.displayName || user.email,
            creadoEn: serverTimestamp()
        });
        setGuardado(true);
    };

    const ejemplos = [
        'La computadora está muy lenta',
        'No enciende la PC',
        'Se congela y aparece pantalla azul',
        'No hay conexión a internet',
        'El disco duro no aparece',
        'Hay virus en el sistema'
    ];

    return (
        <AppLayout title="Diagnóstico Inteligente" subtitle="Motor de reglas para detectar problemas técnicos" allow={['admin','tecnico','usuario']}>
            <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
                {/* Panel izquierdo: entrada */}
                <div>
                    <div className="card mb-2">
                        <p className="card-title">Describir el problema</p>
                        <textarea
                            className="form-textarea"
                            style={{ minHeight: 130, marginBottom: '.75rem' }}
                            placeholder="Escribe aquí el problema técnico del equipo..."
                            value={texto}
                            onChange={e => setTexto(e.target.value)}
                            onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleDiagnosticar(); }}
                        />
                        <button className="btn btn-primary" onClick={handleDiagnosticar} style={{ width: '100%' }}>
                            <Send size={16} /> Analizar problema
                        </button>
                    </div>

                    <div className="card">
                        <p className="card-title">Ejemplos rápidos</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                            {ejemplos.map(ej => (
                                <button key={ej} className="btn btn-secondary btn-sm" style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                                    onClick={() => { setTexto(ej); setResultados([]); setBuscado(false); }}>
                                    {ej}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel derecho: resultados */}
                <div>
                    {!buscado && (
                        <div className="card diag-empty" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Stethoscope size={56} color="#1f2d45" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#64748b', fontSize: '.95rem' }}>Describe un problema técnico para comenzar el diagnóstico</p>
                            <p style={{ color: '#475569', fontSize: '.8rem', marginTop: '.5rem' }}>El motor analizará palabras clave y sugerirá posibles causas y soluciones</p>
                        </div>
                    )}

                    {buscado && resultados.length === 0 && (
                        <div className="card diag-empty">
                            <div className="diag-empty-icon">🔍</div>
                            <p>No se encontraron coincidencias en la base de conocimiento.</p>
                            <p className="text-muted mt-1">Intenta describir el problema con más detalle o diferentes palabras.</p>
                        </div>
                    )}

                    {buscado && resultados.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>
                                    Se encontraron <b style={{ color: '#f1f5f9' }}>{resultados.length}</b> posibles diagnósticos
                                </p>
                                <button className="btn btn-success btn-sm" onClick={handleGuardar} disabled={guardado}>
                                    {guardado ? '✓ Guardado' : 'Guardar diagnóstico'}
                                </button>
                            </div>

                            <div className="diag-results">
                                {resultados.map((r, i) => (
                                    <div key={r.id} className="diag-card" style={{ borderLeft: `3px solid ${i === 0 ? '#3b82f6' : '#1f2d45'}` }}>
                                        <div className="diag-card-header">
                                            <span className="diag-card-title">
                                                {i === 0 && '⭐ '}{r.problema}
                                            </span>
                                            <div className="flex gap-1">
                                                <StatusBadge estado={r.tipo} small />
                                                <span className="diag-score">{r.puntaje}% relevancia</span>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '.75rem' }}>
                                            <p className="diag-section-title">🔴 Posibles causas</p>
                                            <ul className="diag-list">
                                                {r.causas.map((c, j) => <li key={j}>{c}</li>)}
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="diag-section-title">✅ Soluciones sugeridas</p>
                                            <ul className="diag-list">
                                                {r.soluciones.map((s, j) => (
                                                    <li key={j} style={{ color: '#6ee7b7' }}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
