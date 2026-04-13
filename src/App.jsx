import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';
import MenuPrincipal from './pages/MenuPrincipal';
import Login from './pages/Login';
import Inventario from './pages/Inventario';
import Prestamos from './pages/Prestamos';
import Admin from './pages/Admin';
import Usuario from './pages/Usuario';

function RoleGuard({ allow, children }) {
    const [status, setStatus] = useState('loading');
    const [role, setRole] = useState(null);

    useEffect(() => {
        const auth = getAuth(app);
        const db = getFirestore(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setStatus('guest');
                return;
            }
            try {
                const snap = await getDoc(doc(db, 'usuarios', user.uid));
                const data = snap.data();
                setRole(data?.rol || 'usuario');
                setStatus('ok');
            } catch (e) {
                console.error(e);
                setRole('usuario');
                setStatus('ok');
            }
        });
        return () => unsubscribe();
    }, []);

    if (status === 'loading') return <div>Cargando...</div>;
    if (status === 'guest') return <Navigate to="/login" replace />;
    if (!allow.includes(role)) {
        return <Navigate to={role === 'admin' ? '/admin' : '/usuario'} replace />;
    }
    return children;
}

function HomeRedirect() {
    const [status, setStatus] = useState('loading');
    const [role, setRole] = useState(null);

    useEffect(() => {
        const auth = getAuth(app);
        const db = getFirestore(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setStatus('guest');
                return;
            }
            try {
                const snap = await getDoc(doc(db, 'usuarios', user.uid));
                const data = snap.data();
                setRole(data?.rol || 'usuario');
                setStatus('ok');
            } catch (e) {
                console.error(e);
                setRole('usuario');
                setStatus('ok');
            }
        });
        return () => unsubscribe();
    }, []);

    if (status === 'loading') return <div>Cargando...</div>;
    if (status === 'guest') return <Navigate to="/login" replace />;
    return <Navigate to={role === 'admin' ? '/admin' : '/usuario'} replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={
                    <RoleGuard allow={['admin']}>
                        <Admin />
                    </RoleGuard>
                } />
                <Route path="/admin/inventario" element={
                    <RoleGuard allow={['admin']}>
                        <Inventario />
                    </RoleGuard>
                } />
                <Route path="/admin/prestamos" element={
                    <RoleGuard allow={['admin']}>
                        <Prestamos />
                    </RoleGuard>
                } />
                <Route path="/usuario" element={
                    <RoleGuard allow={['usuario']}>
                        <Usuario />
                    </RoleGuard>
                } />
                <Route path="/usuario/inventario" element={
                    <RoleGuard allow={['usuario']}>
                        <Inventario />
                    </RoleGuard>
                } />
                <Route path="/usuario/prestamos" element={
                    <RoleGuard allow={['usuario']}>
                        <Prestamos />
                    </RoleGuard>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;
