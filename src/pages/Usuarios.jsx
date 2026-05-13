import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import AppLayout from '../components/Layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';

const ROLES = ['usuario','tecnico','admin'];

export default function Usuarios() {
    const db = getFirestore(app);
    const [usuarios, setUsuarios] = useState([]);
    const [buscar,   setBuscar]   = useState('');

    useEffect(() => {
        return onSnapshot(collection(db, 'usuarios'), s =>
            setUsuarios(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [db]);

    const handleRol = async (id, rol) => {
        await updateDoc(doc(db, 'usuarios', id), { rol });
    };

    const lista = usuarios.filter(u =>
        !buscar || [u.nombre, u.correo].join(' ').toLowerCase().includes(buscar.toLowerCase())
    );

    return (
        <AppLayout title="Usuarios" subtitle="Gestión de roles del sistema" allow={['admin']}>
            <div className="filter-bar mb-2">
                <input className="form-input" placeholder="Buscar por nombre o correo..." value={buscar} onChange={e => setBuscar(e.target.value)} />
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>Correo</th><th>Rol actual</th><th>Estado</th><th>Cambiar rol</th></tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:'2.5rem', color:'#64748b' }}>Sin usuarios</td></tr>}
                            {lista.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            {u.foto
                                                ? <img src={u.foto} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }} />
                                                : <div style={{ width:28, height:28, borderRadius:'50%', background:'#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', fontWeight:700 }}>
                                                    {(u.nombre||'?')[0].toUpperCase()}
                                                  </div>
                                            }
                                            <span>{u.nombre || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="td-truncate">{u.correo || '—'}</td>
                                    <td><StatusBadge estado={u.rol || 'usuario'} /></td>
                                    <td>
                                        <span style={{ display:'flex', alignItems:'center', gap:'.3rem' }}>
                                            <span style={{ width:8, height:8, borderRadius:'50%', background: u.online ? '#10b981' : '#475569', display:'inline-block' }} />
                                            <span className="text-muted">{u.online ? 'Online' : 'Offline'}</span>
                                        </span>
                                    </td>
                                    <td>
                                        <select className="form-select" style={{ padding:'.25rem .5rem', fontSize:'.8rem', width:'auto' }}
                                            value={u.rol || 'usuario'} onChange={e => handleRol(u.id, e.target.value)}>
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
