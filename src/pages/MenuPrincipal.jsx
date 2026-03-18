import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from '../firebaseConfig';
function MenuPrincipal() {
    const navigate = useNavigate();
    const auth = getAuth(app);
    const [userName, setUserName] = useState('');
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setUserName(user.displayName || user.email);
            }
        });
        return () => unsubscribe();
    }, [auth, navigate]);
    const cerrarSesion = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            <h2>Bienvenido, {userName}</h2>
            <div>
                <button onClick={() => navigate('/prestamos')}>Préstamos</button>
                <button onClick={() => navigate('/inventario')}>Inventario</button>
            </div>
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
export default MenuPrincipal;
