import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { app } from '../firebaseConfig';

function Inventario() {
    const navigate = useNavigate();

    const [usuarioActual, setUsuarioActual] = useState(null);
    const [rol, setRol] = useState('usuario');
    const [equipos, setEquipos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Escucha si el usuario está autenticado y obtiene su rol
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setUsuarioActual(user);
                try {
                    const snap = await getDoc(doc(db, 'usuarios', user.uid));
                    const data = snap.data();
                    setRol(data?.rol === 'admin' ? 'admin' : 'usuario');
                } catch (e) {
                    console.error(e);
                    setRol('usuario');
                }
            }
        });
        return () => unsubscribeAuth();
    }, [auth, db, navigate]);

    // Carga todos los equipos en tiempo real desde Firestore
    useEffect(() => {
        if (!usuarioActual) return;
        const unsubEquipos = onSnapshot(collection(db, 'equipos'), (snapshot) => {
            const lista = [];
            snapshot.forEach((docSnap) => lista.push({ id: docSnap.id, ...docSnap.data() }));
            setEquipos(lista);
        });
        return () => unsubEquipos();
    }, [usuarioActual, db]);

    const esAdmin = rol === 'admin';
    const panelRuta = esAdmin ? '/admin' : '/usuario';

    // Guarda un nuevo equipo en Firestore
    const guardarEquipo = async (e) => {
        e.preventDefault();
        if (!usuarioActual || !esAdmin) return;
        if (!nombre || !categoria || !codigo) {
            alert('Completa todos los campos obligatorios.');
            return;
        }
        try {
            await addDoc(collection(db, 'equipos'), {
                nombre,
                categoria,
                codigo,
                descripcion,
                estado: 'disponible',
                creadoPor: usuarioActual.uid,
                creadoEn: serverTimestamp()
            });
            setNombre('');
            setCategoria('');
            setCodigo('');
            setDescripcion('');
        } catch (error) {
            console.error(error);
            alert('Error al guardar el equipo.');
        }
    };

    // Alterna el estado del equipo entre disponible y prestado
    const cambiarEstado = async (equipo) => {
        if (!esAdmin) return;
        const nuevoEstado = equipo.estado === 'disponible' ? 'prestado' : 'disponible';
        try {
            await updateDoc(doc(db, 'equipos', equipo.id), { estado: nuevoEstado });
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el equipo.');
        }
    };

    // Elimina un equipo de Firestore
    const eliminarEquipo = async (id) => {
        if (!esAdmin) return;
        if (window.confirm('¿Seguro que deseas eliminar este equipo?')) {
            try {
                await deleteDoc(doc(db, 'equipos', id));
            } catch (error) {
                console.error(error);
                alert('Error al eliminar el equipo.');
            }
        }
    };

    return (
        <div>
            <h2>Inventario de equipos</h2>
            <button onClick={() => navigate(panelRuta)}>Volver al panel</button>

            {esAdmin && (
                <section>
                    <h3>Registrar nuevo equipo</h3>
                    <form onSubmit={guardarEquipo}>
                        <label>
                            Nombre del equipo
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            Categoría
                            <input
                                type="text"
                                placeholder="Laptop, proyector, etc."
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            Código / Número de serie
                            <input
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            Descripción
                            <textarea
                                rows="3"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </label>
                        <br />
                        <button type="submit">Guardar equipo</button>
                    </form>
                </section>
            )}

            <section>
                <h3>Listado de equipos</h3>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Código</th>
                                <th>Estado</th>
                                {esAdmin && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {equipos.map((equipo) => (
                                <tr key={equipo.id}>
                                    <td>{equipo.nombre || ''}</td>
                                    <td>{equipo.categoria || ''}</td>
                                    <td>{equipo.codigo || ''}</td>
                                    <td>
                                        <span className={`estado-label ${equipo.estado === 'disponible' ? 'estado-libre' : 'estado-prestado'}`}>
                                            {equipo.estado || ''}
                                        </span>
                                    </td>
                                    {esAdmin && (
                                        <td>
                                            <button onClick={() => cambiarEstado(equipo)}>
                                                {equipo.estado === 'disponible'
                                                    ? 'Marcar prestado'
                                                    : 'Marcar disponible'}
                                            </button>
                                            <button onClick={() => eliminarEquipo(equipo.id)}>
                                                Eliminar
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Inventario;
