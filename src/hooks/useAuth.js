import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

// Correos que siempre son admin
const CORREOS_ADMIN = [
    "limok401@gmail.com",
    "victorchavez02125@gmail.com",
    "srjuanito30@gmail.com",
    "obedmoreno2106@gmail.com",
    "obremoreno2106@gmail.com"
];

/**
 * Hook que devuelve el usuario autenticado y su rol.
 * Roles posibles: 'admin' | 'tecnico' | 'usuario'
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [rol, setRol] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(app);
        const db = getFirestore(app);

        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setRol(null);
                setLoading(false);
                return;
            }
            try {
                const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
                const data = snap.data();
                // Si el correo está en la lista de admins, siempre es admin
                const esAdmin = CORREOS_ADMIN.includes(firebaseUser.email);
                const rolFirestore = data?.rol || 'usuario';
                const rolFinal = esAdmin ? 'admin' : rolFirestore;
                setRol(rolFinal);
            } catch {
                setRol('usuario');
            }
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { user, rol, loading };
}
