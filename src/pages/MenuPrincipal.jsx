import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebaseConfig';
function MenuPrincipal() {
    const navigate = useNavigate();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setUserName(user.displayName || user.email);
                try {
                    await updateDoc(doc(db, "usuarios", user.uid), {
                        online: true,
                        ultimoActivo: serverTimestamp()
                    });
                } catch (e) {
                    console.error(e);
                }
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
