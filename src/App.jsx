import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Páginas
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Inventario   from './pages/Inventario';
import Componentes  from './pages/Componentes';
import Tickets      from './pages/Tickets';
import Diagnostico  from './pages/Diagnostico';
import Mantenimiento from './pages/Mantenimiento';
import Reportes     from './pages/Reportes';
import Usuarios     from './pages/Usuarios';
import Prestamos    from './pages/Prestamos';
import Usuario      from './pages/Usuario';

/**
 * HomeRedirect — Redirige al panel correcto según el rol del usuario autenticado.
 */
function HomeRedirect() {
    const { user, rol, loading } = useAuth();
    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
    if (!user)   return <Navigate to="/login" replace />;
    if (rol === 'admin')   return <Navigate to="/admin" replace />;
    if (rol === 'tecnico') return <Navigate to="/tecnico" replace />;
    return <Navigate to="/usuario" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Raíz */}
                <Route path="/"      element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />

                {/* ── ADMIN ── */}
                <Route path="/admin"               element={<Dashboard />} />
                <Route path="/admin/inventario"    element={<Inventario />} />
                <Route path="/admin/componentes"   element={<Componentes />} />
                <Route path="/admin/tickets"       element={<Tickets />} />
                <Route path="/admin/diagnostico"   element={<Diagnostico />} />
                <Route path="/admin/mantenimiento" element={<Mantenimiento />} />
                <Route path="/admin/reportes"      element={<Reportes />} />
                <Route path="/admin/prestamos"     element={<Prestamos />} />
                <Route path="/admin/usuarios"      element={<Usuarios />} />

                {/* ── TÉCNICO ── */}
                <Route path="/tecnico"               element={<Dashboard />} />
                <Route path="/tecnico/inventario"    element={<Inventario />} />
                <Route path="/tecnico/tickets"       element={<Tickets />} />
                <Route path="/tecnico/diagnostico"   element={<Diagnostico />} />
                <Route path="/tecnico/mantenimiento" element={<Mantenimiento />} />

                {/* ── USUARIO ── */}
                <Route path="/usuario"             element={<Usuario />} />
                <Route path="/usuario/inventario"  element={<Inventario />} />
                <Route path="/usuario/prestamos"   element={<Prestamos />} />
                <Route path="/usuario/diagnostico" element={<Diagnostico />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
