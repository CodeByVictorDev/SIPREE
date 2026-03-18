import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from '../firebaseConfig'; // Importamos Firebase ya configurado

function MenuPrincipal() {
    const navigate = useNavigate();
    const auth = getAuth(app);

    // useEffect se ejecuta cuando el componente aparece en pantalla
    useEffect(() => {
        // Verificamos si hay alguien logueado (como en el script original)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Si no hay usuario, lo mandamos al login
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // Función para cerrar la sesión actual en el navegador
    const cerrarSesion = async () => {
        try {
            await signOut(auth);
            // Al hacer signOut, el onAuthStateChanged de arriba se dará cuenta 
            // de que ya no hay usuario y te mandará solito a la pantalla de Login.
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Hubo un problema al cerrar tu sesión.");
        }
    };

    return (
        <div>
            <h2>Bienvenido</h2>
            <div>
                {/* Aquí usamos onClick y navigate en lugar de onclick="prestamos()" */}
                <button onClick={() => navigate('/prestamos')}>Préstamos</button>
                <button onClick={() => navigate('/inventario')}>Inventario</button>
            </div>

            <br /><br />
            {/* Botón añadido para cerrar sesión fácilmente */}
            <button
                onClick={cerrarSesion}
                style={{ backgroundColor: '#ff4b4b', color: 'white' }}
            >
                Cerrar sesión
            </button>
        </div>
    );
}

export default MenuPrincipal;
