import React from 'react';
import { Bell, Search } from 'lucide-react';

/**
 * Navbar — Barra superior de navegación dentro del layout principal.
 * Muestra el título de la sección actual, buscador y notificaciones.
 */
export default function Navbar({ title, subtitle }) {
    return (
        <header className="navbar-top">
            <div className="navbar-left">
                <h1 className="navbar-title">{title}</h1>
                {subtitle && <span className="navbar-subtitle">{subtitle}</span>}
            </div>
            <div className="navbar-right">
                <div className="navbar-search">
                    <Search size={15} className="navbar-search-icon" />
                    <input type="text" placeholder="Buscar..." className="navbar-search-input" />
                </div>
                <button className="navbar-icon-btn" aria-label="Notificaciones">
                    <Bell size={18} />
                    <span className="navbar-badge">3</span>
                </button>
            </div>
        </header>
    );
}
