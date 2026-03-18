import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from '../firebaseConfig';
function Admin() {
    const navigate = useNavigate();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const [userName, setUserName] = useState('');
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
                if (!data || data.rol !== "admin") {
                    navigate('/usuario');
                } else {
                    setUserName(user.displayName || user.email);
                }
            } catch (e) {
                console.error(e);
                navigate('/usuario');
            }
        });
        return () => unsubscribe();
    }, [auth, db, navigate]);
    const cerrarSesion = async () => {
        try {
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
                <button onClick={() => navigate('/inventario')}>Administrar inventario</button>
                <button onClick={() => navigate('/prestamos')}>Administrar préstamos</button>
                <button onClick={() => navigate('/')}>Volver al menú principal</button>
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
