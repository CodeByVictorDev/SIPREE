import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import AppLayout from '../components/Layout/AppLayout';
import { exportarEquiposPDF, exportarTicketsPDF, exportarMantenimientosPDF, exportarEquiposExcel, exportarTicketsExcel, exportarMantenimientosExcel } from '../services/reportesService';
import { FileText, Table, Download } from 'lucide-react';

export default function Reportes() {
    const db = getFirestore(app);
    const [equipos,  setEquipos]  = useState([]);
    const [tickets,  setTickets]  = useState([]);
    const [mantos,   setMantos]   = useState([]);
    const [filtroEstEq, setFiltroEstEq] = useState('');
    const [filtroEstTk, setFiltroEstTk] = useState('');

    useEffect(() => {
        const u1 = onSnapshot(collection(db, 'equipos'),        s => setEquipos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u2 = onSnapshot(collection(db, 'tickets'),        s => setTickets(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u3 = onSnapshot(collection(db, 'mantenimientos'), s => setMantos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => { u1(); u2(); u3(); };
    }, [db]);

    const equiposFiltrados = filtroEstEq ? equipos.filter(e => e.estado === filtroEstEq) : equipos;
    const ticketsFiltrados = filtroEstTk ? tickets.filter(t => t.estado === filtroEstTk) : tickets;

    const ESTADOS_EQ = ['activo','en_mantenimiento','error_hardware','error_software','falta_componente','fuera_de_servicio','reparado','pendiente'];
    const ESTADOS_TK = ['abierto','en_progreso','cerrado'];

    const reportes = [
        {
            titulo: 'Inventario de Equipos',
            desc:   `${equiposFiltrados.length} equipos ${filtroEstEq ? `en estado "${filtroEstEq.replace(/_/g,' ')}"` : 'en total'}`,
            color:  '#3b82f6',
            filtro: (
                <select className="form-select" style={{ fontSize: '.8rem' }} value={filtroEstEq} onChange={e => setFiltroEstEq(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {ESTADOS_EQ.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
            ),
            onPDF:   () => exportarEquiposPDF(equiposFiltrados),
            onExcel: () => exportarEquiposExcel(equiposFiltrados),
        },
        {
            titulo: 'Tickets de Soporte',
            desc:   `${ticketsFiltrados.length} tickets ${filtroEstTk ? `"${filtroEstTk.replace(/_/g,' ')}"` : 'en total'}`,
            color:  '#8b5cf6',
            filtro: (
                <select className="form-select" style={{ fontSize: '.8rem' }} value={filtroEstTk} onChange={e => setFiltroEstTk(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {ESTADOS_TK.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
            ),
            onPDF:   () => exportarTicketsPDF(ticketsFiltrados),
            onExcel: () => exportarTicketsExcel(ticketsFiltrados),
        },
        {
            titulo: 'Mantenimientos',
            desc:   `${mantos.length} registros de mantenimiento`,
            color:  '#f59e0b',
            filtro: null,
            onPDF:   () => exportarMantenimientosPDF(mantos),
            onExcel: () => exportarMantenimientosExcel(mantos),
        },
    ];

    return (
        <AppLayout title="Reportes" subtitle="Exportar datos del sistema en PDF o Excel" allow={['admin']}>
            {/* Resumen rápido */}
            <div className="stats-grid mb-3">
                {[
                    { label: 'Total equipos',  val: equipos.length,  color: '#3b82f6' },
                    { label: 'Tickets abiertos', val: tickets.filter(t => t.estado === 'abierto').length, color: '#ef4444' },
                    { label: 'Mantenimientos completados', val: mantos.filter(m => m.estado === 'completado').length, color: '#10b981' },
                    { label: 'Equipos activos', val: equipos.filter(e => e.estado === 'activo').length, color: '#0ea5e9' },
                ].map(({ label, val, color }) => (
                    <div key={label} className="stat-card">
                        <div className="stat-card-info">
                            <span className="stat-card-title">{label}</span>
                            <span className="stat-card-value" style={{ color }}>{val}</span>
                        </div>
                    </div>
                ))}
            </div>

            <p className="card-title mb-2">Exportar reportes</p>
            <div className="report-grid">
                {reportes.map(r => (
                    <div key={r.titulo} className="report-card">
                        <div className="report-card-icon" style={{ background: `${r.color}18`, border: `1px solid ${r.color}30` }}>
                            <FileText size={24} color={r.color} />
                        </div>
                        <div>
                            <p className="report-card-title">{r.titulo}</p>
                            <p className="report-card-desc">{r.desc}</p>
                        </div>
                        {r.filtro && <div>{r.filtro}</div>}
                        <div className="report-card-actions">
                            <button className="btn btn-danger btn-sm" onClick={r.onPDF}>
                                <Download size={14} /> PDF
                            </button>
                            <button className="btn btn-success btn-sm" onClick={r.onExcel}>
                                <Table size={14} /> Excel
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
