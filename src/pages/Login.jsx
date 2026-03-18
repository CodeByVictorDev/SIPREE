// src/pages/Login.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from '../firebaseConfig'; // Usamos nuestra app de Firebase configurada

// Correos que serán administradores
const correosAdmin = [
  "limok401@gmail.com",
  "obedmoren02106@gmail.com",
  "victorchavez02125@gmail.com",
  "srjuanit030@gmail.com"
];

function Login() {
    const navigate = useNavigate();

    // Función asíncrona que se ejecuta cuando el usuario hace clic
    const handleLogin = async () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const db = getFirestore(app);

        try {
            // Usamos el método de ventana emergente
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const esAdmin = correosAdmin.includes(user.email);

            await setDoc(
              doc(db, "usuarios", user.uid),
              {
                nombre: user.displayName,
                correo: user.email,
                rol: esAdmin ? "admin" : "usuario"
              },
              { merge: true }
            );

            alert("Login correcto: " + user.email);

            if (esAdmin) {
                navigate('/admin');
            } else {
                navigate('/usuario');
            }
        } catch (error) {
            console.error(error);
            alert("Error Firebase: " + error.code + " - " + error.message);
        }
    };

    return (
        <div>
            <h2>Iniciar sesión</h2>
            <button onClick={handleLogin}>Iniciar sesión con Google</button>
        </div>
    );
}

export default Login;
