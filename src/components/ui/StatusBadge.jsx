import React from 'react';

/**
 * StatusBadge — Muestra un badge de color según el estado del equipo o ticket.
 * Soporta estados de equipos y de tickets.
 */
const COLORES = {
    // Estados de equipo
    activo:           { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.35)', label: 'Activo' },
    en_mantenimiento: { bg: 'rgba(245,158,11,0.15)', color: '#fde68a', border: 'rgba(245,158,11,0.35)', label: 'Mantenimiento' },
    error_hardware:   { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5', border: 'rgba(239,68,68,0.35)',  label: 'Error Hardware' },
    error_software:   { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.3)',   label: 'Error Software' },
    falta_componente: { bg: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: 'rgba(168,85,247,0.35)',label: 'Falta Componente' },
    fuera_de_servicio:{ bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.4)',label: 'Fuera de Servicio' },
    reparado:         { bg: 'rgba(14,165,233,0.15)', color: '#7dd3fc', border: 'rgba(14,165,233,0.35)', label: 'Reparado' },
    pendiente:        { bg: 'rgba(234,179,8,0.15)',  color: '#fde047', border: 'rgba(234,179,8,0.35)',  label: 'Pendiente' },
    disponible:       { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.35)', label: 'Disponible' },
    prestado:         { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5', border: 'rgba(239,68,68,0.35)',  label: 'Prestado' },
    // Estados de tickets
    abierto:          { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5', border: 'rgba(239,68,68,0.35)',  label: 'Abierto' },
    en_progreso:      { bg: 'rgba(245,158,11,0.15)', color: '#fde68a', border: 'rgba(245,158,11,0.35)', label: 'En Progreso' },
    cerrado:          { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.35)', label: 'Cerrado' },
    // Prioridades
    alta:             { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5', border: 'rgba(239,68,68,0.35)',  label: 'Alta' },
    media:            { bg: 'rgba(245,158,11,0.15)', color: '#fde68a', border: 'rgba(245,158,11,0.35)', label: 'Media' },
    baja:             { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.35)', label: 'Baja' },
    // Mantenimiento
    programado:       { bg: 'rgba(14,165,233,0.15)', color: '#7dd3fc', border: 'rgba(14,165,233,0.35)', label: 'Programado' },
    completado:       { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.35)', label: 'Completado' },
    // Componentes
    dañado:           { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5', border: 'rgba(239,68,68,0.35)',  label: 'Dañado' },
    en_bodega:        { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.4)', label: 'En Bodega' },
    reemplazado:      { bg: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: 'rgba(168,85,247,0.35)', label: 'Reemplazado' },
    // Tipo
    hardware:         { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.3)',   label: 'Hardware' },
    software:         { bg: 'rgba(14,165,233,0.12)', color: '#7dd3fc', border: 'rgba(14,165,233,0.3)',  label: 'Software' },
    mixto:            { bg: 'rgba(168,85,247,0.12)', color: '#d8b4fe', border: 'rgba(168,85,247,0.3)',  label: 'Mixto' },
    // Roles
    admin:            { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5', border: 'rgba(239,68,68,0.35)',  label: 'Admin' },
    tecnico:          { bg: 'rgba(14,165,233,0.15)', color: '#7dd3fc', border: 'rgba(14,165,233,0.35)', label: 'Técnico' },
    usuario:          { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.4)', label: 'Usuario' },
};

export default function StatusBadge({ estado, small }) {
    const cfg = COLORES[estado] || { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.4)', label: estado };
    return (
        <span style={{
            display: 'inline-block',
            padding: small ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
            borderRadius: '999px',
            fontSize: small ? '0.7rem' : '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
        }}>
            {cfg.label}
        </span>
    );
}
