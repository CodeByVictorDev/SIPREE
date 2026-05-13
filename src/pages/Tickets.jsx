import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/Layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { Plus, MessageSquare } from 'lucide-react';

const PRIORIDADES = ['alta','media','baja'];
const TIPOS = ['hardware','software','mixto','otro'];
const ESTADOS = ['abierto','en_progreso','cerrado'];
const EMPTY = { titulo:'', descripcion:'', prioridad:'media', tipo:'otro', equipoId:'', equipoNombre:'', asignadoA:'', asignadoANombre:'' };

export default function Tickets() {
    const { user, rol } = useAuth();
    const db = getFirestore(app);
    const esAdmin = rol === 'admin';
    const esTecnico = rol === 'tecnico';

    const [tickets,  setTickets]  = useState([]);
    const [equipos,  setEquipos]  = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [form,     setForm]     = useState(EMPTY);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [observ,   setObserv]   = useState('');
    const [filtroEst, setFiltroEst] = useState('');
    const [filtroPri, setFiltroPri] = useState('');
    const [buscar,   setBuscar]   = useState('');

    useEffect(() => {
        const u1 = onSnapshot(collection(db, 'tickets'),  s => setTickets(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u2 = onSnapshot(collection(db, 'equipos'),  s => setEquipos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u3 = onSnapshot(collection(db, 'usuarios'), s =>
            setTecnicos(s.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.rol === 'tecnico' || u.rol === 'admin')));
        return () => { u1(); u2(); u3(); };
    }, [db]);

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'equipoId') {
            const eq = equipos.find(eq => eq.id === value);
            setForm(f => ({ ...f, equipoId: value, equipoNombre: eq?.nombre || '' }));
        } else if (name === 'asignadoA') {
            const tec = tecnicos.find(t => t.id === value);
            setForm(f => ({ ...f, asignadoA: value, asignadoANombre: tec?.nombre || tec?.correo || '' }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.titulo || !form.descripcion) return alert('Título y descripción son obligatorios');
        await addDoc(collection(db, 'tickets'), {
            ...form, estado: 'abierto', observaciones: [],
            creadoPor: user.uid, creadoPorNombre: user.displayName || user.email,
            creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp()
        });
        setForm(EMPTY); setShowForm(false);
    };

    const handleEstado = async (id, estado) => {
        await updateDoc(doc(db, 'tickets', id), { estado, actualizadoEn: serverTimestamp() });
    };

    const handleObservacion = async () => {
        if (!observ.trim() || !selected) return;
        const obs = { texto: observ, autor: user.displayName || user.email, fecha: new Date().toISOString() };
        await updateDoc(doc(db, 'tickets', selected.id), {
            observaciones: arrayUnion(obs), actualizadoEn: serverTimestamp()
        });
        setObserv('');
        // Refrescar el seleccionado
        setSelected(t => ({ ...t, observaciones: [...(t.observaciones || []), obs] }));
    };

    const lista = tickets.filter(t => {
        if (!esAdmin && !esTecnico && t.creadoPor !== user?.uid) return false;
        const matchB = !buscar  || [t.titulo, t.descripcion, t.equipoNombre].join(' ').toLowerCase().includes(buscar.toLowerCase());
        const matchE = !filtroEst || t.estado === filtroEst;
        const matchP = !filtroPri || t.prioridad === filtroPri;
        return matchB && matchE && matchP;
    });

    return (
        <AppLayout title="Tickets" subtitle="Gestión de incidencias y soporte" allow={['admin','tecnico','usuario']}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <div className="filter-bar" style={{ marginBottom: 0, flex: 1 }}>
                    <input className="form-input" placeholder="Buscar ticket..." value={buscar} onChange={e => setBuscar(e.target.value)} />
                    <select className="form-select" value={filtroEst} onChange={e => setFiltroEst(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                    <select className="form-select" value={filtroPri} onChange={e => setFiltroPri(e.target.value)}>
                        <option value="">Todas las prioridades</option>
                        {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={16} /> Nuevo ticket
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Equipo</th><th>Creado por</th><th>Asignado a</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:'2.5rem', color:'#64748b' }}>Sin tickets</td></tr>}
                            {lista.map(t => (
                                <tr key={t.id}>
                                    <td><b className="td-truncate" style={{ maxWidth: 160, display:'block' }}>{t.titulo}</b></td>
                                    <td><StatusBadge estado={t.tipo} small /></td>
                                    <td><StatusBadge estado={t.prioridad} small /></td>
                                    <td>
                                        {(esAdmin || esTecnico)
                                            ? <select className="form-select" style={{ padding:'.2rem .45rem', fontSize:'.78rem', width:'auto' }}
                                                value={t.estado} onChange={e => handleEstado(t.id, e.target.value)}>
                                                {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                                              </select>
                                            : <StatusBadge estado={t.estado} small />}
                                    </td>
                                    <td className="td-truncate">{t.equipoNombre || '—'}</td>
                                    <td className="td-truncate">{t.creadoPorNombre || '—'}</td>
                                    <td className="td-truncate">{t.asignadoANombre || <span className="text-muted">Sin asignar</span>}</td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setSelected(t)} title="Ver / Comentar">
                                            <MessageSquare size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal crear ticket */}
            <Modal open={showForm} onClose={() => setShowForm(false)} title="Crear ticket de soporte" width="620px">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group form-full">
                            <label className="form-label">Título del problema *</label>
                            <input className="form-input" name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: PC no enciende en sala 3" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prioridad</label>
                            <select className="form-select" name="prioridad" value={form.prioridad} onChange={handleChange}>
                                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tipo</label>
                            <select className="form-select" name="tipo" value={form.tipo} onChange={handleChange}>
                                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Equipo afectado</label>
                            <select className="form-select" name="equipoId" value={form.equipoId} onChange={handleChange}>
                                <option value="">— Sin equipo específico —</option>
                                {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.numeroSerie || e.id.slice(0,6)})</option>)}
                            </select>
                        </div>
                        {esAdmin && (
                            <div className="form-group form-full">
                                <label className="form-label">Asignar a técnico</label>
                                <select className="form-select" name="asignadoA" value={form.asignadoA} onChange={handleChange}>
                                    <option value="">— Sin asignar —</option>
                                    {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre || t.correo}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="form-group form-full">
                            <label className="form-label">Descripción detallada *</label>
                            <textarea className="form-textarea" name="descripcion" value={form.descripcion} onChange={handleChange} required placeholder="Describe el problema con el mayor detalle posible..." />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Crear ticket</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                    </div>
                </form>
            </Modal>

            {/* Modal detalle + observaciones */}
            <Modal open={!!selected} onClose={() => { setSelected(null); setObserv(''); }} title={`Ticket — ${selected?.titulo || ''}`} width="640px">
                {selected && (
                    <div>
                        <div className="flex gap-1 mb-2">
                            <StatusBadge estado={selected.estado} />
                            <StatusBadge estado={selected.prioridad} />
                            <StatusBadge estado={selected.tipo} />
                        </div>
                        <div className="info-grid mb-2">
                            <div className="info-row"><span className="info-row-label">Equipo</span><span className="info-row-value">{selected.equipoNombre || '—'}</span></div>
                            <div className="info-row"><span className="info-row-label">Creado por</span><span className="info-row-value">{selected.creadoPorNombre || '—'}</span></div>
                            <div className="info-row"><span className="info-row-label">Asignado a</span><span className="info-row-value">{selected.asignadoANombre || 'Sin asignar'}</span></div>
                        </div>
                        <div className="form-group mb-2">
                            <span className="form-label">Descripción</span>
                            <p style={{ color:'#94a3b8', fontSize:'.88rem', marginTop:'.3rem', lineHeight:1.6 }}>{selected.descripcion}</p>
                        </div>
                        <div className="section-divider" />
                        <p className="form-label mb-1">Historial de observaciones</p>
                        <div className="observ-list mb-2">
                            {(selected.observaciones || []).length === 0 && <p className="text-muted">Sin observaciones aún.</p>}
                            {(selected.observaciones || []).map((o, i) => (
                                <div key={i} className="observ-item">
                                    <div className="observ-meta">{o.autor} · {new Date(o.fecha).toLocaleString('es-MX')}</div>
                                    <div className="observ-text">{o.texto}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            <input className="form-input" placeholder="Agregar observación técnica..." value={observ} onChange={e => setObserv(e.target.value)} />
                            <button className="btn btn-primary" onClick={handleObservacion}>Agregar</button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
