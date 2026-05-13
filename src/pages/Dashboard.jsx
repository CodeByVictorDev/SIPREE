import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import AppLayout from '../components/Layout/AppLayout';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Monitor, Ticket, Wrench, Users, AlertTriangle, CheckCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CHART_OPTS = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }
};

export default function Dashboard() {
    const { rol } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore(app);
    const basePath = rol === 'admin' ? '/admin' : '/tecnico';

    const [equipos,   setEquipos]   = useState([]);
    const [tickets,   setTickets]   = useState([]);
    const [mantos,    setMantos]    = useState([]);
    const [usuarios,  setUsuarios]  = useState([]);

    useEffect(() => {
        const unsubs = [
            onSnapshot(collection(db, 'equipos'),       s => setEquipos(s.docs.map(d => ({ id: d.id, ...d.data() })))),
            onSnapshot(collection(db, 'tickets'),        s => setTickets(s.docs.map(d => ({ id: d.id, ...d.data() })))),
            onSnapshot(collection(db, 'mantenimientos'), s => setMantos(s.docs.map(d => ({ id: d.id, ...d.data() })))),
            onSnapshot(query(collection(db, 'usuarios'), where('rol', '==', 'tecnico')),
                       s => setUsuarios(s.docs.map(d => ({ id: d.id, ...d.data() })))),
        ];
        return () => unsubs.forEach(u => u());
    }, [db]);

    // KPIs
    const activos    = equipos.filter(e => e.estado === 'activo').length;
    const enManto    = equipos.filter(e => e.estado === 'en_mantenimiento').length;
    const conError   = equipos.filter(e => ['error_hardware','error_software','falta_componente','fuera_de_servicio'].includes(e.estado)).length;
    const tickAbiertos = tickets.filter(t => t.estado === 'abierto').length;
    const tickEnProg   = tickets.filter(t => t.estado === 'en_progreso').length;
    const tickCerrados = tickets.filter(t => t.estado === 'cerrado').length;
    const mantoProg  = mantos.filter(m => m.estado === 'programado').length;

    // Gráfica donut — estados de equipos
    const donutData = {
        labels: ['Activo', 'Mantenimiento', 'Con error', 'Otros'],
        datasets: [{
            data: [
                activos, enManto, conError,
                equipos.length - activos - enManto - conError
            ],
            backgroundColor: ['rgba(16,185,129,.7)', 'rgba(245,158,11,.7)', 'rgba(239,68,68,.7)', 'rgba(100,116,139,.5)'],
            borderColor:     ['#10b981','#f59e0b','#ef4444','#64748b'],
            borderWidth: 1,
        }]
    };

    // Gráfica barras — tickets por prioridad
    const prioridades = ['alta', 'media', 'baja'];
    const barData = {
        labels: ['Alta', 'Media', 'Baja'],
        datasets: [
            {
                label: 'Abiertos',
                data: prioridades.map(p => tickets.filter(t => t.prioridad === p && t.estado === 'abierto').length),
                backgroundColor: 'rgba(239,68,68,.6)', borderRadius: 6,
            },
            {
                label: 'En progreso',
                data: prioridades.map(p => tickets.filter(t => t.prioridad === p && t.estado === 'en_progreso').length),
                backgroundColor: 'rgba(245,158,11,.6)', borderRadius: 6,
            },
            {
                label: 'Cerrados',
                data: prioridades.map(p => tickets.filter(t => t.prioridad === p && t.estado === 'cerrado').length),
                backgroundColor: 'rgba(16,185,129,.6)', borderRadius: 6,
            }
        ]
    };
    const barOpts = {
        ...CHART_OPTS,
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#1f2d45' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#1f2d45' } }
        }
    };

    const recentTickets = [...tickets].sort((a, b) => (b.creadoEn?.seconds || 0) - (a.creadoEn?.seconds || 0)).slice(0, 6);

    return (
        <AppLayout title="Dashboard" subtitle="Resumen general del sistema" allow={['admin', 'tecnico']}>
            {/* KPIs */}
            <div className="stats-grid">
                <StatCard title="Equipos activos"    value={activos}      icon={CheckCircle} color="#10b981" subtitle={`${equipos.length} total`} />
                <StatCard title="En mantenimiento"   value={enManto}      icon={Wrench}      color="#f59e0b" subtitle={`${mantoProg} programados`} />
                <StatCard title="Con errores"        value={conError}     icon={AlertTriangle} color="#ef4444" subtitle="Requieren atención" />
                <StatCard title="Tickets abiertos"   value={tickAbiertos} icon={Ticket}      color="#3b82f6" subtitle={`${tickEnProg} en progreso`} />
                <StatCard title="Tickets cerrados"   value={tickCerrados} icon={Monitor}     color="#8b5cf6" subtitle="Total resueltos" />
                {rol === 'admin' && <StatCard title="Técnicos" value={usuarios.length} icon={Users} color="#0ea5e9" subtitle="Activos en el sistema" />}
            </div>

            {/* Gráficas */}
            <div className="grid-2 mb-2">
                <div className="card">
                    <p className="card-title">Estado de equipos</p>
                    <div className="chart-container">
                        <Doughnut data={donutData} options={CHART_OPTS} />
                    </div>
                </div>
                <div className="card">
                    <p className="card-title">Tickets por prioridad</p>
                    <div className="chart-container">
                        <Bar data={barData} options={barOpts} />
                    </div>
                </div>
            </div>

            {/* Tickets recientes */}
            <div className="card">
                <div className="flex items-center justify-between mb-2">
                    <p className="card-title" style={{ marginBottom: 0 }}>Tickets recientes</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`${basePath}/tickets`)}>
                        Ver todos
                    </button>
                </div>
                <div className="dash-recent">
                    {recentTickets.length === 0 && <p className="text-muted text-center" style={{ padding: '2rem' }}>Sin tickets registrados</p>}
                    {recentTickets.map(t => (
                        <div key={t.id} className="dash-recent-item">
                            <div className="dash-recent-left">
                                <span className="dash-recent-title">{t.titulo || 'Sin título'}</span>
                                <span className="dash-recent-sub">{t.equipoNombre || '—'} · {t.creadoPorNombre || '—'}</span>
                            </div>
                            <div className="flex gap-1 items-center">
                                <StatusBadge estado={t.prioridad} small />
                                <StatusBadge estado={t.estado} small />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
