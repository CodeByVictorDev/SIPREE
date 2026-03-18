
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
    serverTimestamp
} from 'firebase/firestore';
import { app } from '../firebaseConfig';
function Inventario() {
    const navigate = useNavigate();
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const auth = getAuth(app);
    const db = getFirestore(app);
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setUsuarioActual(user);
            }
        });
        return () => unsubscribeAuth();
    }, [auth, navigate]);
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
    const guardarEquipo = async (e) => {
        e.preventDefault(); // Evitamos recargar la página
        if (!usuarioActual) return;
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
    const cambiarEstado = async (equipo) => {
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
            <h2>Inventario de equipos</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
            <section>
                <h3>Registrar nuevo equipo</h3>
                {/* Aquí pasamos nuestra función al evento de envío */}
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
            <section>
                <h3>Listado de equipos</h3>
                <table border="1" cellPadding="4" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Código</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Recorremos nuestro array de equipos y creamos las filas */}
                        {equipos.map((equipo) => (
                            <tr key={equipo.id}>
                                <td>{equipo.nombre || ""}</td>
                                <td>{equipo.categoria || ""}</td>
                                <td>{equipo.codigo || ""}</td>
                                <td>{equipo.estado || ""}</td>
                                <td>
                                    <button onClick={() => cambiarEstado(equipo)}>
                                        {equipo.estado === "disponible" ? "Marcar como prestado" : "Marcar como disponible"}
                                    </button>
                                    <button onClick={() => eliminarEquipo(equipo.id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
export default Inventario;
