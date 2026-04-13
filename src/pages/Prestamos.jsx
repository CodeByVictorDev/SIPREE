
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
    where,
    getDoc
} from 'firebase/firestore';
import { app } from '../firebaseConfig';
function Prestamos() {
    const navigate = useNavigate();

    const [usuarioActual, setUsuarioActual] = useState(null);
    const [rol, setRol] = useState('usuario');
    const [prestamosList, setPrestamosList] = useState([]);
    const [equiposDisponibles, setEquiposDisponibles] = useState([]);
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [matricula, setMatricula] = useState('');
    const [equipoId, setEquipoId] = useState('');

    const auth = getAuth(app);
    const db = getFirestore(app);
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

    useEffect(() => {
        if (!usuarioActual) return;
        const basePrestamos = collection(db, 'prestamos');
        const qPrestamos = rol === 'admin'
            ? basePrestamos
            : query(basePrestamos, where('usuarioId', '==', usuarioActual.uid));

        const unsubscribePrestamos = onSnapshot(qPrestamos, (snapshot) => {
            const lista = [];
            snapshot.forEach((docSnap) => {
                lista.push({ id: docSnap.id, ...docSnap.data() });
            });
            setPrestamosList(lista);
        });

        const qEquipos = query(collection(db, "equipos"), where("estado", "==", "disponible"));
        const unsubscribeEquipos = onSnapshot(qEquipos, (snapshot) => {
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
    }, [usuarioActual, rol, db]);

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
                usuarioId: usuarioActual.uid,
                nombreUsuario: usuarioActual.displayName || '',
                correoUsuario: usuarioActual.email || '',
                nombre: nombreAlumno,
                matricula: matricula,
                equipoId: equipoId,
                equipo: equipoTexto,
                estado: "Solicitado",
                creadoEn: serverTimestamp()
            });

            setNombreAlumno('');
            setMatricula('');
            setEquipoId('');
        } catch (error) {
            console.error(error);
            alert("Error al registrar el préstamo.");
        }
    };

    const aprobarPrestamo = async (prestamo) => {
        if (prestamo.estado !== "Solicitado") return;
        try {
            await updateDoc(doc(db, "prestamos", prestamo.id), { estado: "Aprobado" });
            if (prestamo.equipoId) {
                await updateDoc(doc(db, "equipos", prestamo.equipoId), { estado: "prestado" });
            }
        } catch (error) {
            console.error(error);
            alert("Error al aprobar el préstamo.");
        }
    };

    const marcarDevuelto = async (prestamo) => {
        if (prestamo.estado !== "Aprobado") return;
        try {
            await updateDoc(doc(db, "prestamos", prestamo.id), { estado: "Devuelto" });
            if (prestamo.equipoId) {
                await updateDoc(doc(db, "equipos", prestamo.equipoId), { estado: "disponible" });
            }
        } catch (error) {
            console.error(error);
            alert("Error al marcar como devuelto.");
        }
    };

    const eliminarPrestamo = async (prestamo) => {
        if (!window.confirm("¿Seguro que deseas eliminar este préstamo?")) return;
        try {
            await deleteDoc(doc(db, "prestamos", prestamo.id));
            if (prestamo.equipoId && prestamo.estado === "Aprobado") {
                await updateDoc(doc(db, "equipos", prestamo.equipoId), { estado: "disponible" });
            }
        } catch (error) {
            console.error(error);
            alert("Error al eliminar el préstamo.");
        }
    };

    const esAdmin = rol === 'admin';
    const panelRuta = esAdmin ? '/admin' : '/usuario';

    return (
        <div>
            <h2>Préstamos de alumnos ({esAdmin ? "Vista administrador" : "Vista usuario"})</h2>
            <button onClick={() => navigate(panelRuta)}>Volver al panel</button>

            <section>
                <h3>Solicitar nuevo préstamo</h3>
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
                    <button type="submit">Solicitar préstamo</button>
                </form>
            </section>

            <section>
                <h3>{esAdmin ? "Todos los préstamos" : "Mis préstamos"}</h3>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                {esAdmin && <th>Usuario</th>}
                                <th>Nombre</th>
                                <th>Matrícula</th>
                                <th>Equipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestamosList.map((prestamo) => {
                                let claseEstado = "estado-libre";
                                if (prestamo.estado === "Aprobado") claseEstado = "estado-prestado";
                                if (prestamo.estado === "Solicitado") claseEstado = "estado-pendiente";

                                return (
                                    <tr key={prestamo.id}>
                                        {esAdmin && (
                                            <td>{prestamo.correoUsuario || prestamo.nombreUsuario || ""}</td>
                                        )}
                                        <td>{prestamo.nombre || ""}</td>
                                        <td>{prestamo.matricula || ""}</td>
                                        <td>{prestamo.equipo || ""}</td>
                                        <td>
                                            <span className={`estado-label ${claseEstado}`}>
                                                {prestamo.estado || "Solicitado"}
                                            </span>
                                        </td>
                                        <td>
                                            {esAdmin ? (
                                                <>
                                                    <button
                                                        onClick={() => aprobarPrestamo(prestamo)}
                                                        disabled={prestamo.estado !== "Solicitado"}
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => marcarDevuelto(prestamo)}
                                                        disabled={prestamo.estado !== "Aprobado"}
                                                    >
                                                        Marcar devuelto
                                                    </button>
                                                    <button onClick={() => eliminarPrestamo(prestamo)}>
                                                        Eliminar
                                                    </button>
                                                </>
                                            ) : (
                                                <span>Sin acciones</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Prestamos;
