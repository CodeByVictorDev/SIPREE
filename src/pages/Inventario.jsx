import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/Layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

const ESTADOS = ['activo','en_mantenimiento','error_hardware','error_software','falta_componente','fuera_de_servicio','reparado','pendiente'];
const SO_LIST  = ['Windows 10','Windows 11','Windows 7','Ubuntu','Debian','macOS','ChromeOS','Sin SO'];
const EMPTY    = { nombre:'', marca:'', modelo:'', numeroSerie:'', categoria:'', procesador:'', ram:'', almacenamiento:'', sistemaOperativo:'', estado:'activo', descripcion:'' };

export default function Inventario() {
    const { user, rol } = useAuth();
    const db = getFirestore(app);
    const esAdmin = rol === 'admin';
    const basePath = rol === 'admin' ? '/admin' : rol === 'tecnico' ? '/tecnico' : '/usuario';

    const [equipos, setEquipos] = useState([]);
    const [form,    setForm]    = useState(EMPTY);
    const [editId,  setEditId]  = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [buscar,  setBuscar]  = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');

    useEffect(() => {
        return onSnapshot(collection(db, 'equipos'), s =>
            setEquipos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [db]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.nombre || !form.numeroSerie) return alert('Nombre y N° de serie son obligatorios');
        try {
            if (editId) {
                await updateDoc(doc(db, 'equipos', editId), { ...form, actualizadoEn: serverTimestamp() });
            } else {
                await addDoc(collection(db, 'equipos'), { ...form, creadoPor: user.uid, creadoEn: serverTimestamp() });
            }
            setForm(EMPTY); setEditId(null); setShowForm(false);
        } catch (err) { alert('Error al guardar: ' + err.message); }
    };

    const handleEdit = eq => { setForm({ ...EMPTY, ...eq }); setEditId(eq.id); setShowForm(true); };

    const handleDelete = async id => {
        if (!window.confirm('¿Eliminar equipo?')) return;
        await deleteDoc(doc(db, 'equipos', id)).catch(err => alert(err.message));
    };

    const handleEstado = async (id, estado) => {
        await updateDoc(doc(db, 'equipos', id), { estado, actualizadoEn: serverTimestamp() });
    };

    const equiposFiltrados = equipos.filter(e => {
        const matchBuscar = !buscar || [e.nombre, e.marca, e.modelo, e.numeroSerie, e.categoria].join(' ').toLowerCase().includes(buscar.toLowerCase());
        const matchEstado = !filtroEstado || e.estado === filtroEstado;
        return matchBuscar && matchEstado;
    });

    return (
        <AppLayout title="Inventario" subtitle="Gestión de equipos de cómputo" allow={['admin','tecnico','usuario']}>
            {/* Filtros + Acción */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <div className="filter-bar" style={{ marginBottom: 0, flex: 1 }}>
                    <input className="form-input" placeholder="Buscar equipo..." value={buscar} onChange={e => setBuscar(e.target.value)} />
                    <select className="form-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                </div>
                {esAdmin && (
                    <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}>
                        <Plus size={16} /> Nuevo equipo
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th><th>Marca / Modelo</th><th>N° Serie</th>
                                <th>Procesador</th><th>RAM</th><th>SO</th>
                                <th>Estado</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equiposFiltrados.length === 0 && (
                                <tr><td colSpan={8} className="text-center" style={{ padding: '2.5rem', color: '#64748b' }}>Sin equipos registrados</td></tr>
                            )}
                            {equiposFiltrados.map(eq => (
                                <tr key={eq.id}>
                                    <td><b>{eq.nombre}</b><br /><span className="text-muted">{eq.categoria}</span></td>
                                    <td>{eq.marca} {eq.modelo}</td>
                                    <td className="td-truncate">{eq.numeroSerie || '—'}</td>
                                    <td className="td-truncate">{eq.procesador || '—'}</td>
                                    <td>{eq.ram || '—'}</td>
                                    <td>{eq.sistemaOperativo || '—'}</td>
                                    <td><StatusBadge estado={eq.estado || 'activo'} /></td>
                                    <td>
                                        <div className="td-actions">
                                            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(eq)} title="Ver detalle"><Eye size={14} /></button>
                                            {esAdmin && <>
                                                <button className="btn btn-warning btn-sm" onClick={() => handleEdit(eq)} title="Editar"><Edit2 size={14} /></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(eq.id)} title="Eliminar"><Trash2 size={14} /></button>
                                            </>}
                                            {rol === 'tecnico' && (
                                                <select className="form-select" style={{ padding: '.25rem .5rem', fontSize: '.78rem', width: 'auto' }}
                                                    value={eq.estado || 'activo'} onChange={e => handleEstado(eq.id, e.target.value)}>
                                                    {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal formulario */}
            <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Editar equipo' : 'Registrar equipo'} width="680px">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {[['nombre','Nombre del equipo','text',true],['marca','Marca','text'],['modelo','Modelo','text'],['numeroSerie','N° de serie','text',true],['categoria','Categoría (Laptop, Desktop...)','text'],['procesador','Procesador','text'],['ram','RAM (ej: 8 GB DDR4)','text'],['almacenamiento','Almacenamiento (ej: 256 GB SSD)','text']].map(([name,label,type,req]) => (
                            <div className="form-group" key={name}>
                                <label className="form-label">{label}</label>
                                <input className="form-input" name={name} type={type} value={form[name]} onChange={handleChange} required={!!req} />
                            </div>
                        ))}
                        <div className="form-group">
                            <label className="form-label">Sistema Operativo</label>
                            <select className="form-select" name="sistemaOperativo" value={form.sistemaOperativo} onChange={handleChange}>
                                <option value="">— Seleccionar —</option>
                                {SO_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado</label>
                            <select className="form-select" name="estado" value={form.estado} onChange={handleChange}>
                                {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                            </select>
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Descripción / Observaciones</label>
                            <textarea className="form-textarea" name="descripcion" value={form.descripcion} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">{editId ? 'Guardar cambios' : 'Registrar equipo'}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                    </div>
                </form>
            </Modal>

            {/* Modal detalle */}
            <Modal open={!!selected} onClose={() => setSelected(null)} title={`Detalle — ${selected?.nombre || ''}`} width="640px">
                {selected && (
                    <div>
                        <div style={{ marginBottom: '.75rem' }}><StatusBadge estado={selected.estado || 'activo'} /></div>
                        <div className="info-grid">
                            {[['Marca', selected.marca],['Modelo', selected.modelo],['N° Serie', selected.numeroSerie],
                              ['Categoría', selected.categoria],['Procesador', selected.procesador],['RAM', selected.ram],
                              ['Almacenamiento', selected.almacenamiento],['Sistema Operativo', selected.sistemaOperativo]].map(([l,v]) => (
                                <div className="info-row" key={l}>
                                    <span className="info-row-label">{l}</span>
                                    <span className="info-row-value">{v || '—'}</span>
                                </div>
                            ))}
                        </div>
                        {selected.descripcion && <>
                            <div className="section-divider" />
                            <div className="form-group">
                                <span className="form-label">Descripción</span>
                                <p style={{ color: '#94a3b8', fontSize: '.88rem', marginTop: '.25rem' }}>{selected.descripcion}</p>
                            </div>
                        </>}
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
