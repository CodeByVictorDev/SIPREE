// src/pages/Admin.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from '../firebaseConfig'; // Importamos Firebase ya configurado

function Admin() {
    const navigate = useNavigate();
    const auth = getAuth(app);
    const db = getFirestore(app);

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
                    alert("No tienes permisos de administrador.");
                    navigate('/usuario');
                }
            } catch (e) {
                console.error(e);
                alert("Error verificando permisos de administrador.");
                navigate('/usuario');
            }
        });

        return () => unsubscribe();
    }, [auth, db, navigate]);

    const cerrarSesion = async () => {
        try {
            await signOut(auth);
            // navigate to login will be handled by onAuthStateChanged
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Hubo un problema al cerrar tu sesión.");
        }
    };

    return (
        <div>
            <h2>Panel de administrador</h2>
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
