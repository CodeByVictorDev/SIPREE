import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebaseConfig';

const correosAdmin = [
    "limok401@gmail.com",
    "obedmoren02106@gmail.com",
    "victorchavez02125@gmail.com",
    "srjuanito30@gmail.com"
];

function Login() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const db = getFirestore(app);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const esAdmin = correosAdmin.includes(user.email);

            await setDoc(
                doc(db, "usuarios", user.uid),
                {
                    nombre: user.displayName,
                    correo: user.email,
                    rol: esAdmin ? "admin" : "usuario",
                    online: true,
                    ultimoActivo: serverTimestamp()
                },
                { merge: true }
            );

            if (esAdmin) {
                navigate('/admin');
            } else {
                navigate('/usuario');
            }
        } catch (error) {
            console.error(error);
            alert("Error al iniciar sesión: " + error.message);
        }
    };

    return (
        <div className="login-page">
            <h2>Bienvenido a SIPREE</h2>
            <button onClick={handleLogin}>Iniciar sesión con Google</button>
        </div>
    );
}

export default Login;
