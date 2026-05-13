import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/Layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const TIPOS    = ['RAM','Disco HDD','Disco SSD','Fuente de Poder','Tarjeta Madre','GPU','Procesador','Periférico','Otro'];
const ESTADOS  = ['activo','dañado','en_bodega','reemplazado'];
const EMPTY    = { nombre:'', tipo:'RAM', marca:'', modelo:'', especificaciones:'', equipoId:'', equipoNombre:'', estado:'activo' };

export default function Componentes() {
    const { user } = useAuth();
    const db = getFirestore(app);

    const [componentes, setComponentes] = useState([]);
    const [equipos,     setEquipos]     = useState([]);
    const [form,        setForm]        = useState(EMPTY);
    const [editId,      setEditId]      = useState(null);
    const [showForm,    setShowForm]    = useState(false);
    const [buscar,      setBuscar]      = useState('');
    const [filtroTipo,  setFiltroTipo]  = useState('');

    useEffect(() => {
        const u1 = onSnapshot(collection(db, 'componentes'), s => setComponentes(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u2 = onSnapshot(collection(db, 'equipos'),     s => setEquipos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => { u1(); u2(); };
    }, [db]);

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'equipoId') {
            const eq = equipos.find(e => e.id === value);
            setForm(f => ({ ...f, equipoId: value, equipoNombre: eq?.nombre || '' }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.nombre) return alert('El nombre es obligatorio');
        try {
            if (editId) {
                await updateDoc(doc(db, 'componentes', editId), { ...form, actualizadoEn: serverTimestamp() });
            } else {
                await addDoc(collection(db, 'componentes'), { ...form, creadoPor: user.uid, creadoEn: serverTimestamp() });
            }
            setForm(EMPTY); setEditId(null); setShowForm(false);
        } catch (err) { alert('Error: ' + err.message); }
    };

    const handleEdit = c => { setForm({ ...EMPTY, ...c }); setEditId(c.id); setShowForm(true); };
    const handleDelete = async id => {
        if (!window.confirm('¿Eliminar componente?')) return;
        await deleteDoc(doc(db, 'componentes', id));
    };

    const lista = componentes.filter(c => {
        const matchBuscar = !buscar || [c.nombre, c.marca, c.modelo, c.equipoNombre].join(' ').toLowerCase().includes(buscar.toLowerCase());
        const matchTipo   = !filtroTipo || c.tipo === filtroTipo;
        return matchBuscar && matchTipo;
    });

    return (
        <AppLayout title="Componentes" subtitle="Hardware asociado a los equipos" allow={['admin']}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <div className="filter-bar" style={{ marginBottom: 0, flex: 1 }}>
                    <input className="form-input" placeholder="Buscar componente..." value={buscar} onChange={e => setBuscar(e.target.value)} />
                    <select className="form-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}>
                    <Plus size={16} /> Nuevo componente
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>Tipo</th><th>Marca / Modelo</th><th>Especificaciones</th><th>Equipo</th><th>Estado</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 && <tr><td colSpan={7} className="text-center" style={{ padding: '2.5rem', color: '#64748b' }}>Sin componentes registrados</td></tr>}
                            {lista.map(c => (
                                <tr key={c.id}>
                                    <td><b>{c.nombre}</b></td>
                                    <td><span className="tag">{c.tipo}</span></td>
                                    <td>{c.marca} {c.modelo}</td>
                                    <td className="td-truncate">{c.especificaciones || '—'}</td>
                                    <td>{c.equipoNombre || <span className="text-muted">En bodega</span>}</td>
                                    <td><StatusBadge estado={c.estado || 'activo'} /></td>
                                    <td>
                                        <div className="td-actions">
                                            <button className="btn btn-warning btn-sm" onClick={() => handleEdit(c)} title="Editar"><Edit2 size={14} /></button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)} title="Eliminar"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Editar componente' : 'Registrar componente'} width="600px">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group form-full">
                            <label className="form-label">Nombre del componente *</label>
                            <input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} required />
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
                        <div className="form-group">
                            <label className="form-label">Marca</label>
                            <input className="form-input" name="marca" value={form.marca} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Modelo</label>
                            <input className="form-input" name="modelo" value={form.modelo} onChange={handleChange} />
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Especificaciones</label>
                            <input className="form-input" name="especificaciones" placeholder="ej: 8 GB DDR4 3200 MHz" value={form.especificaciones} onChange={handleChange} />
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Equipo al que pertenece (opcional)</label>
                            <select className="form-select" name="equipoId" value={form.equipoId} onChange={handleChange}>
                                <option value="">— En bodega / Sin asignar —</option>
                                {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.numeroSerie || e.id.slice(0,6)})</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">{editId ? 'Guardar cambios' : 'Registrar'}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
