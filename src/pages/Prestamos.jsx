
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
    query,
    where
} from 'firebase/firestore';
import { app } from '../firebaseConfig';
function Prestamos() {
    const navigate = useNavigate();
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [prestamosList, setPrestamosList] = useState([]);
    const [equiposDisponibles, setEquiposDisponibles] = useState([]);
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [matricula, setMatricula] = useState('');
    const [equipoId, setEquipoId] = useState('');
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
        const unsubscribePrestamos = onSnapshot(collection(db, 'prestamos'), (snapshot) => {
            const lista = [];
            snapshot.forEach((docSnap) => {
                lista.push({ id: docSnap.id, ...docSnap.data() });
            });
            setPrestamosList(lista);
        });
        const q = query(collection(db, "equipos"), where("estado", "==", "disponible"));
        const unsubscribeEquipos = onSnapshot(q, (snapshot) => {
            const lista = [];
            snapshot.forEach((docSnap) => {
                lista.push({ id: docSnap.id, ...docSnap.data() });
            });
            setEquiposDisponibles(lista);
        });
        return () => {
            unsubscribePrestamos();
            unsubscribeEquipos();
        };
    }, [usuarioActual, db]);
    const registrarPrestamo = async (e) => {
        e.preventDefault();
        if (!usuarioActual) return;
        if (!nombreAlumno || !matricula || !equipoId) {
            alert("Completa todos los campos.");
            return;
        }
        const equipoEncontrado = equiposDisponibles.find(eq => eq.id === equipoId);
        const equipoTexto = equipoEncontrado ? `${equipoEncontrado.nombre} (${equipoEncontrado.codigo})` : "";
        try {
            await addDoc(collection(db, "prestamos"), {
                nombre: nombreAlumno,
                matricula: matricula,
                equipoId: equipoId,
                equipo: equipoTexto,
                estado: "Prestado",
                creadoPor: usuarioActual.uid,
                creadoEn: serverTimestamp()
            });
            await updateDoc(doc(db, "equipos", equipoId), { estado: "prestado" });
            setNombreAlumno('');
            setMatricula('');
            setEquipoId('');
        } catch (error) {
            console.error(error);
            alert("Error al registrar el préstamo.");
        }
    };
    const cambiarEstado = async (prestamo) => {
        const nuevoEstado = prestamo.estado === "Prestado" ? "Libre" : "Prestado";
        const ref = doc(db, "prestamos", prestamo.id);
        try {
            await updateDoc(ref, { estado: nuevoEstado });
            if (prestamo.equipoId) {
                const nuevoEstadoEquipo = nuevoEstado === "Prestado" ? "prestado" : "disponible";
                await updateDoc(doc(db, "equipos", prestamo.equipoId), { estado: nuevoEstadoEquipo });
            }
        } catch (error) {
            console.error(error);
            alert("Error al cambiar estado.");
        }
    };
    const eliminarPrestamo = async (prestamo) => {
        if (window.confirm("¿Seguro que deseas eliminar este préstamo?")) {
            try {
                await deleteDoc(doc(db, "prestamos", prestamo.id));
                if (prestamo.equipoId) {
                    await updateDoc(doc(db, "equipos", prestamo.equipoId), { estado: "disponible" });
                }
            } catch (error) {
                console.error(error);
                alert("Error al eliminar el préstamo.");
            }
        }
    };
    return (
        <div>
            <h2>Préstamos de alumnos</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
            <section>
                <h3>Registrar nuevo préstamo</h3>
                <form onSubmit={registrarPrestamo}>
                    <label>
                        Nombre del alumno
                        <input
                            type="text"
                            value={nombreAlumno}
                            onChange={(e) => setNombreAlumno(e.target.value)}
                            required
                        />
                    </label>
                    <br />
                    <label>
                        Matrícula
                        <input
                            type="text"
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                            required
                        />
                    </label>
                    <br />
                    <label>
                        Equipo a prestar
                        <select
                            value={equipoId}
                            onChange={(e) => setEquipoId(e.target.value)}
                            required
                        >
                            <option value="">Selecciona un equipo disponible</option>
                            {equiposDisponibles.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.nombre || "Sin nombre"} ({eq.codigo || ""})
                                </option>
                            ))}
                        </select>
                    </label>
                    <br />
                    <button type="submit">Registrar préstamo</button>
                </form>
            </section>
            <section>
                <h3>Lista de préstamos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Matrícula</th>
                            <th>Equipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prestamosList.map((prestamo) => {
                            const esPrestado = prestamo.estado === "Prestado";
                            const claseEstado = esPrestado ? "estado-prestado" : "estado-libre";
                            return (
                                <tr key={prestamo.id}>
                                    <td>{prestamo.nombre || ""}</td>
                                    <td>{prestamo.matricula || ""}</td>
                                    <td>{prestamo.equipo || ""}</td>
                                    <td>
                                        {/* class de HTML es className en React porque class es reservada de JS */}
                                        <span className={`estado-label ${claseEstado}`}>
                                            {prestamo.estado || "Libre"}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => cambiarEstado(prestamo)}>
                                            Cambiar estado
                                        </button>
                                        <button onClick={() => eliminarPrestamo(prestamo)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
export default Prestamos;
