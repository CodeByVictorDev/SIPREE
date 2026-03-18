
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

// En este componente diferenciamos entre:
// - Admin: puede dar de alta equipos, cambiar estado y eliminar.
// - Usuario: solo ve el inventario (especialmente cuáles están disponibles).
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

    // 1) Verificamos sesión y cargamos rol desde "usuarios"
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setUsuarioActual(user);
                try {
                    const ref = doc(db, "usuarios", user.uid);
                    const snap = await getDoc(ref);
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

    // 2) Cargamos todos los equipos (tanto para admin como usuario)
    useEffect(() => {
        if (!usuarioActual) return;
        const unsubscribeEquipos = onSnapshot(collection(db, 'equipos'), (snapshot) => {
            const lista = [];
            snapshot.forEach((docSnap) => {
                lista.push({ id: docSnap.id, ...docSnap.data() });
            });
            setEquipos(lista);
        });
        return () => {
            unsubscribeEquipos();
        };
    }, [usuarioActual, db]);

    const esAdmin = rol === 'admin';

    // 3) Solo admin puede dar de alta
    const guardarEquipo = async (e) => {
        e.preventDefault();
        if (!usuarioActual || !esAdmin) return;
        if (!nombre || !categoria || !codigo) {
            alert("Completa todos los campos obligatorios.");
            return;
        }
        try {
            await addDoc(collection(db, "equipos"), {
                nombre,
                categoria,
                codigo,
                descripcion,
                estado: "disponible",
                creadoPor: usuarioActual.uid,
                creadoEn: serverTimestamp()
            });
            setNombre('');
            setCategoria('');
            setCodigo('');
            setDescripcion('');
        } catch (error) {
            console.error(error);
            alert("Error al guardar el equipo.");
        }
    };

    // 4) Solo admin puede cambiar estado y eliminar
    const cambiarEstado = async (equipo) => {
        if (!esAdmin) return;
        const nuevoEstado = equipo.estado === "disponible" ? "prestado" : "disponible";
        const ref = doc(db, "equipos", equipo.id);
        try {
            await updateDoc(ref, { estado: nuevoEstado });
        } catch (error) {
            console.error(error);
            alert("Error al actualizar el equipo.");
        }
    };

    const eliminarEquipo = async (id) => {
        if (!esAdmin) return;
        if (window.confirm("¿Seguro que deseas eliminar este equipo?")) {
            try {
                await deleteDoc(doc(db, "equipos", id));
            } catch (error) {
                console.error(error);
                alert("Error al eliminar el equipo.");
            }
        }
    };

    return (
        <div>
            <h2>Inventario de equipos ({esAdmin ? "Vista administrador" : "Vista usuario"})</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>

            {/* Formulario solo visible para administradores */}
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

            {/* Listado: todos pueden verlo, pero solo admin tiene botones de acción */}
            <section>
                <h3>Listado de equipos</h3>
                <table border="1" cellPadding="4" cellSpacing="0">
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
                                <td>{equipo.nombre || ""}</td>
                                <td>{equipo.categoria || ""}</td>
                                <td>{equipo.codigo || ""}</td>
                                <td>{equipo.estado || ""}</td>
                                {esAdmin && (
                                    <td>
                                        <button onClick={() => cambiarEstado(equipo)}>
                                            {equipo.estado === "disponible"
                                                ? "Marcar como prestado"
                                                : "Marcar como disponible"}
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
            </section>
        </div>
    );
}

export default Inventario;
