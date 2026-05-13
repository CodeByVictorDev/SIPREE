import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/Layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { Plus, Edit2 } from 'lucide-react';

const TIPOS = ['preventivo','correctivo'];
const ESTADOS = ['programado','en_progreso','completado'];
const EMPTY = { equipoId:'', equipoNombre:'', tipo:'preventivo', estado:'programado', descripcion:'', fechaProgramada:'', observaciones:'' };

export default function Mantenimiento() {
    const { user, rol } = useAuth();
    const db = getFirestore(app);
    const esAdmin = rol === 'admin';

    const [mantos,   setMantos]   = useState([]);
    const [equipos,  setEquipos]  = useState([]);
    const [form,     setForm]     = useState(EMPTY);
    const [editId,   setEditId]   = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [filtroEst, setFiltroEst] = useState('');
    const [filtroTip, setFiltroTip] = useState('');

    useEffect(() => {
        const u1 = onSnapshot(collection(db, 'mantenimientos'), s => setMantos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u2 = onSnapshot(collection(db, 'equipos'),        s => setEquipos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => { u1(); u2(); };
    }, [db]);

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'equipoId') {
            const eq = equipos.find(eq => eq.id === value);
            setForm(f => ({ ...f, equipoId: value, equipoNombre: eq?.nombre || '' }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.equipoId || !form.descripcion || !form.fechaProgramada) return alert('Completa los campos obligatorios');
        const data = {
            ...form,
            tecnicoId: user.uid,
            tecnicoNombre: user.displayName || user.email,
            actualizadoEn: serverTimestamp()
        };
        if (editId) {
            await updateDoc(doc(db, 'mantenimientos', editId), data);
        } else {
            await addDoc(collection(db, 'mantenimientos'), { ...data, creadoEn: serverTimestamp() });
        }
        setForm(EMPTY); setEditId(null); setShowForm(false);
    };

    const handleEdit = m => {
        setForm({
            ...EMPTY, ...m,
            fechaProgramada: m.fechaProgramada?.toDate?.()?.toISOString?.()?.slice(0,10) || m.fechaProgramada || ''
        });
        setEditId(m.id); setShowForm(true);
    };

    const handleEstado = async (id, estado) => {
        const extra = estado === 'completado' ? { fechaCompletado: serverTimestamp() } : {};
        await updateDoc(doc(db, 'mantenimientos', id), { estado, ...extra, actualizadoEn: serverTimestamp() });
    };

    const lista = mantos.filter(m => {
        const matchE = !filtroEst || m.estado === filtroEst;
        const matchT = !filtroTip || m.tipo   === filtroTip;
        return matchE && matchT;
    });

    const formatFecha = ts => {
        try {
            const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
            return d ? d.toLocaleDateString('es-MX') : '—';
        } catch { return '—'; }
    };

    return (
        <AppLayout title="Mantenimiento" subtitle="Registro de mantenimientos preventivos y correctivos" allow={['admin','tecnico']}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <div className="filter-bar" style={{ marginBottom: 0, flex: 1 }}>
                    <select className="form-select" value={filtroEst} onChange={e => setFiltroEst(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                    <select className="form-select" value={filtroTip} onChange={e => setFiltroTip(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}>
                    <Plus size={16} /> Programar mantenimiento
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>Equipo</th><th>Tipo</th><th>Estado</th><th>Fecha Programada</th><th>Técnico</th><th>Descripción</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:'2.5rem', color:'#64748b' }}>Sin mantenimientos registrados</td></tr>}
                            {lista.map(m => (
                                <tr key={m.id}>
                                    <td><b>{m.equipoNombre || '—'}</b></td>
                                    <td><span className="tag">{m.tipo}</span></td>
                                    <td>
                                        <select className="form-select" style={{ padding:'.2rem .45rem', fontSize:'.78rem', width:'auto' }}
                                            value={m.estado} onChange={e => handleEstado(m.id, e.target.value)}>
                                            {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                                        </select>
                                    </td>
                                    <td>{formatFecha(m.fechaProgramada)}</td>
                                    <td className="td-truncate">{m.tecnicoNombre || '—'}</td>
                                    <td className="td-truncate">{m.descripcion || '—'}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm" onClick={() => handleEdit(m)}><Edit2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Editar mantenimiento' : 'Programar mantenimiento'} width="600px">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group form-full">
                            <label className="form-label">Equipo *</label>
                            <select className="form-select" name="equipoId" value={form.equipoId} onChange={handleChange} required>
                                <option value="">— Seleccionar equipo —</option>
                                {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.numeroSerie || e.id.slice(0,6)})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tipo</label>
                            <select className="form-select" name="tipo" value={form.tipo} onChange={handleChange}>
                                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado</label>
                            <select className="form-select" name="estado" value={form.estado} onChange={handleChange}>
                                {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                            </select>
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Fecha programada *</label>
                            <input className="form-input" type="date" name="fechaProgramada" value={form.fechaProgramada} onChange={handleChange} required />
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Descripción del trabajo *</label>
                            <textarea className="form-textarea" name="descripcion" value={form.descripcion} onChange={handleChange} required placeholder="Qué se va a hacer..." />
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Observaciones adicionales</label>
                            <textarea className="form-textarea" name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Notas, materiales necesarios, etc." />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">{editId ? 'Guardar cambios' : 'Programar'}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
