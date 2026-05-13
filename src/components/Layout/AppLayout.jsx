import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

/**
 * AppLayout — Layout principal con sidebar + navbar + contenido.
 * Envuelve todas las páginas protegidas del sistema.
 * 
 * Props:
 *   - title: string  → título de la sección en el navbar
 *   - subtitle: string → subtítulo opcional
 *   - allow: string[] → roles permitidos, ej: ['admin', 'tecnico']
 *   - children → contenido de la página
 */
export default function AppLayout({ title, subtitle, allow, children }) {
    const { user, rol, loading } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <span>Cargando SIPREE...</span>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (allow && !allow.includes(rol)) {
        // Redirigir al panel correspondiente según rol
        const redirect = rol === 'admin' ? '/admin' : rol === 'tecnico' ? '/tecnico' : '/usuario';
        return <Navigate to={redirect} replace />;
    }

    return (
        <div className="app-layout">
            <Sidebar
                user={user}
                rol={rol}
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
            />
            <div className={`main-wrapper ${collapsed ? 'main-wrapper-collapsed' : ''}`}>
                <Navbar title={title} subtitle={subtitle} />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
