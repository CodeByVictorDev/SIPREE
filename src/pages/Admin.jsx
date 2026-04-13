import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, onSnapshot, query, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebaseConfig';

const correosAdmin = [
    "limok401@gmail.com",
    "obedmoren02106@gmail.com",
    "victorchavez02125@gmail.com",
    "srjuanito30@gmail.com"
];
function Admin() {
    const navigate = useNavigate();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const [userName, setUserName] = useState('');
    const [usuariosOnline, setUsuariosOnline] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                const ref = doc(db, "usuarios", user.uid);
                const snap = await getDoc(ref);
                const data = snap.data();
                const emailEsAdmin = correosAdmin.includes(user.email);
                if (!data || data.rol !== "admin") {
                    if (emailEsAdmin) {
                        await updateDoc(ref, {
                            rol: "admin"
                        });
                    } else {
                        navigate('/usuario');
                        return;
                    }
                }
                {
                    setUserName(user.displayName || user.email);
                    await updateDoc(ref, {
                        online: true,
                        ultimoActivo: serverTimestamp()
                    });
                    const q = query(
                        collection(db, "usuarios"),
                        where("online", "==", true)
                    );
                    const unsubOnline = onSnapshot(q, (snapOnline) => {
                        const lista = [];
                        snapOnline.forEach((u) => {
                            lista.push({ id: u.id, ...u.data() });
                        });
                        setUsuariosOnline(lista);
                    });
                    return () => unsubOnline();
                }
            } catch (e) {
                console.error(e);
                navigate('/usuario');
            }
        });
        return () => unsubscribe();
    }, [auth, db, navigate]);

    const cerrarSesion = async () => {
        const user = auth.currentUser;
        try {
            if (user) {
                await updateDoc(doc(db, "usuarios", user.uid), {
                    online: false,
                    ultimoActivo: serverTimestamp()
                });
            }
            await signOut(auth);
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            <h2>Panel de Administrador - {userName}</h2>
            <p>Desde aquí puedes gestionar el inventario completo y todos los préstamos.</p>

            <section>
                <h3>Acciones de administración</h3>
                <button onClick={() => navigate('/admin/inventario')}>Administrar inventario</button>
                <button onClick={() => navigate('/admin/prestamos')}>Administrar préstamos</button>
            </section>

            <section>
                <h3>Usuarios en línea</h3>
                {usuariosOnline.length === 0 ? (
                    <p>No hay usuarios conectados actualmente.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosOnline.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.nombre || ""}</td>
                                    <td>{u.correo || ""}</td>
                                    <td>{u.rol || "usuario"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <br /><br />
            <button
                onClick={cerrarSesion}
                style={{ backgroundColor: '#ff4b4b', color: 'white' }}
            >
                Cerrar sesión
            </button>
        </div>
    );
}
export default Admin;
