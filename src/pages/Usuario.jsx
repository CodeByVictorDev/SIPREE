// Panel del rol 'usuario' — redirige al dashboard técnico si es técnico, 
// o a una vista simplificada si es usuario normal.
// Este componente se usa como panel para usuarios regulares.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { Package, BookOpen, Stethoscope } from 'lucide-react';

export default function Usuario() {
    const navigate = useNavigate();

    const acciones = [
        { icon: Package, label: 'Ver Inventario', desc: 'Consulta los equipos disponibles', color: '#3b82f6', to: '/usuario/inventario' },
        { icon: BookOpen, label: 'Mis Préstamos', desc: 'Solicita y gestiona préstamos de equipos', color: '#10b981', to: '/usuario/prestamos' },
        { icon: Stethoscope, label: 'Diagnóstico', desc: 'Reporta un problema técnico', color: '#8b5cf6', to: '/usuario/diagnostico' },
    ];

    return (
        <AppLayout title="Panel de Usuario" subtitle="Acciones disponibles para tu cuenta" allow={['usuario']}>
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {acciones.map(({ icon: Icon, label, desc, color, to }) => (
                    <div key={to} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem 1.5rem' }}
                        onClick={() => navigate(to)}>
                        <div style={{ background: `${color}18`, borderRadius: 14, width: 56, height: 56,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Icon size={28} color={color} />
                        </div>
                        <p style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: '.35rem' }}>{label}</p>
                        <p className="text-muted">{desc}</p>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
