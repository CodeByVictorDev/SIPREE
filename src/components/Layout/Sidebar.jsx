import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import {
    LayoutDashboard, Package, Cpu, Ticket, Stethoscope,
    Wrench, BarChart2, BookOpen, LogOut, ChevronLeft, ChevronRight, Users
} from 'lucide-react';

/**
 * Sidebar — Barra lateral de navegación.
 * Muestra distintos enlaces según el rol: admin | tecnico | usuario
 */
const NAV_ADMIN = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/inventario', icon: Package, label: 'Inventario' },
    { to: '/admin/componentes', icon: Cpu, label: 'Componentes' },
    { to: '/admin/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/admin/diagnostico', icon: Stethoscope, label: 'Diagnóstico' },
    { to: '/admin/mantenimiento', icon: Wrench, label: 'Mantenimiento' },
    { to: '/admin/reportes', icon: BarChart2, label: 'Reportes' },
    { to: '/admin/prestamos', icon: BookOpen, label: 'Préstamos' },
    { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
];

const NAV_TECNICO = [
    { to: '/tecnico', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/tecnico/inventario', icon: Package, label: 'Inventario' },
    { to: '/tecnico/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/tecnico/diagnostico', icon: Stethoscope, label: 'Diagnóstico' },
    { to: '/tecnico/mantenimiento', icon: Wrench, label: 'Mantenimiento' },
];

const NAV_USUARIO = [
    { to: '/usuario', icon: LayoutDashboard, label: 'Panel', end: true },
    { to: '/usuario/inventario', icon: Package, label: 'Inventario' },
    { to: '/usuario/prestamos', icon: BookOpen, label: 'Préstamos' },
    { to: '/usuario/diagnostico', icon: Stethoscope, label: 'Diagnóstico' },
];

function getNav(rol) {
    if (rol === 'admin') return NAV_ADMIN;
    if (rol === 'tecnico') return NAV_TECNICO;
    return NAV_USUARIO;
}

function getRolLabel(rol) {
    if (rol === 'admin') return 'Administrador';
    if (rol === 'tecnico') return 'Técnico';
    return 'Usuario';
}

export default function Sidebar({ user, rol, collapsed, onToggle }) {
    const navigate = useNavigate();
    const nav = getNav(rol);

    const handleLogout = async () => {
        const auth = getAuth(app);
        const db = getFirestore(app);
        const u = auth.currentUser;
        try {
            if (u) {
                await updateDoc(doc(db, 'usuarios', u.uid), {
                    online: false, ultimoActivo: serverTimestamp()
                });
            }
            await signOut(auth);
            navigate('/login');
        } catch (e) { console.error(e); }
    };

    const avatarUrl = user?.photoURL || null;
    const displayName = user?.displayName || user?.email || 'Usuario';

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                {!collapsed && (
                    <div className="sidebar-logo-text">
                        <span className="sidebar-logo-main">SIPREE</span>
                        <span className="sidebar-logo-sub">Soporte Técnico</span>
                    </div>
                )}
                <button className="sidebar-toggle" onClick={onToggle} aria-label="Colapsar sidebar">
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Usuario */}
            {!collapsed && (
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {avatarUrl
                            ? <img src={avatarUrl} alt="avatar" className="sidebar-avatar-img" />
                            : <span className="sidebar-avatar-letter">{displayName[0].toUpperCase()}</span>
                        }
                        <span className="sidebar-user-online" />
                    </div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{displayName.split(' ')[0]}</span>
                        <span className="sidebar-user-role">{getRolLabel(rol)}</span>
                    </div>
                </div>
            )}

            {/* Navegación */}
            <nav className="sidebar-nav">
                {!collapsed && <span className="sidebar-nav-section">MENÚ</span>}
                {nav.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={20} className="sidebar-link-icon" />
                        {!collapsed && <span className="sidebar-link-label">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Cerrar sesión */}
            <div className="sidebar-footer">
                <button className="sidebar-logout" onClick={handleLogout} title={collapsed ? 'Cerrar sesión' : undefined}>
                    <LogOut size={18} />
                    {!collapsed && <span>Cerrar sesión</span>}
                </button>
            </div>
        </aside>
    );
}
