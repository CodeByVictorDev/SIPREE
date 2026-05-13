import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const CORREOS_ADMIN = [
    "limok401@gmail.com", "obedmoreno2106@gmail.com",
    "victorchavez02125@gmail.com", "srjuanito30@gmail.com", "obremoreno2106@gmail.com"
];

function GoogleIcon() {
    return (
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
    );
}

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true); setError('');
        const auth = getAuth(app);
        const db   = getFirestore(app);
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            const user   = result.user;
            const esAdmin = CORREOS_ADMIN.includes(user.email);

            // Obtener rol previo (no sobreescribir tecnico→usuario)
            const { getDoc } = await import('firebase/firestore');
            const snap = await getDoc(doc(db, 'usuarios', user.uid));
            const rolActual = snap.data()?.rol;
            const rolFinal = esAdmin ? 'admin' : (rolActual || 'usuario');

            await setDoc(doc(db, 'usuarios', user.uid), {
                nombre: user.displayName,
                correo: user.email,
                foto:   user.photoURL,
                rol:    rolFinal,
                online: true,
                ultimoActivo: serverTimestamp()
            }, { merge: true });

            navigate(rolFinal === 'admin' ? '/admin' : rolFinal === 'tecnico' ? '/tecnico' : '/usuario');
        } catch (err) {
            setError('Error al iniciar sesión. Intenta de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">SIPREE</div>
                <p className="login-tagline">Sistema Institucional de Soporte Técnico</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
                    {['Mesa de ayuda', 'Gestión de equipos', 'Diagnóstico inteligente'].map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', justifyContent: 'center' }}>
                            <span style={{ color: '#3b82f6', fontSize: '.9rem' }}>✓</span>
                            <span style={{ fontSize: '.82rem', color: '#94a3b8' }}>{f}</span>
                        </div>
                    ))}
                </div>

                <div className="login-divider"><span>Iniciar sesión con</span></div>

                <button className="login-google-btn" onClick={handleGoogleLogin} disabled={loading}>
                    {loading ? <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                              : <><GoogleIcon /> Continuar con Google</>}
                </button>

                {error && <p style={{ color: '#fca5a5', fontSize: '.82rem', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}

                <p className="login-footer">
                    Acceso restringido a personal autorizado de la institución.
                </p>
            </div>
        </div>
    );
}
