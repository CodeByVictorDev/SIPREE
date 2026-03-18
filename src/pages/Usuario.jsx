// src/pages/Usuario.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from '../firebaseConfig';

function Usuario() {
    const navigate = useNavigate();
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

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
            <h2>Panel de usuario</h2>
            <p>Desde aquí puedes consultar el inventario y los préstamos registrados.</p>

            <section>
                <h3>Acciones disponibles</h3>
                <button onClick={() => navigate('/inventario')}>Ver inventario</button>
                <button onClick={() => navigate('/prestamos')}>Ver préstamos</button>
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

export default Usuario;
