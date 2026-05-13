/**
 * Servicio de Reportes — Genera PDF y Excel de la información del sistema.
 * Usa jsPDF para PDFs y SheetJS (xlsx) para archivos de Excel.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Encabezado estándar para todos los PDFs
function agregarEncabezadoPDF(doc, titulo) {
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SIPREE', 14, 16);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Sistema Institucional de Soporte Técnico', 14, 24);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(96, 165, 250);
    doc.text(titulo, 14, 34);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generado: ${fecha}`, 150, 34);

    doc.setTextColor(30, 41, 59);
}

/** Exportar lista de equipos a PDF */
export function exportarEquiposPDF(equipos) {
    const doc = new jsPDF();
    agregarEncabezadoPDF(doc, 'Reporte de Inventario de Equipos');

    const columnas = ['Nombre', 'Marca', 'Modelo', 'N° Serie', 'RAM', 'Procesador', 'SO', 'Estado'];
    const filas = equipos.map(e => [
        e.nombre || '—',
        e.marca || '—',
        e.modelo || '—',
        e.numeroSerie || '—',
        e.ram || '—',
        e.procesador || '—',
        e.sistemaOperativo || '—',
        e.estado || '—'
    ]);

    autoTable(doc, {
        startY: 46,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [148, 163, 184], fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: 14, right: 14 }
    });

    doc.save(`equipos_${Date.now()}.pdf`);
}

/** Exportar lista de tickets a PDF */
export function exportarTicketsPDF(tickets) {
    const doc = new jsPDF();
    agregarEncabezadoPDF(doc, 'Reporte de Tickets de Soporte');

    const columnas = ['Título', 'Prioridad', 'Estado', 'Tipo', 'Equipo', 'Creado por', 'Fecha'];
    const filas = tickets.map(t => [
        t.titulo || '—',
        t.prioridad || '—',
        t.estado || '—',
        t.tipo || '—',
        t.equipoNombre || '—',
        t.creadoPorNombre || '—',
        t.creadoEn?.toDate?.()?.toLocaleDateString('es-MX') || '—'
    ]);

    autoTable(doc, {
        startY: 46,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [148, 163, 184], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: 14, right: 14 }
    });

    doc.save(`tickets_${Date.now()}.pdf`);
}

/** Exportar lista de mantenimientos a PDF */
export function exportarMantenimientosPDF(mantenimientos) {
    const doc = new jsPDF();
    agregarEncabezadoPDF(doc, 'Reporte de Mantenimientos');

    const columnas = ['Equipo', 'Tipo', 'Estado', 'Técnico', 'Fecha Programada', 'Descripción'];
    const filas = mantenimientos.map(m => [
        m.equipoNombre || '—',
        m.tipo || '—',
        m.estado || '—',
        m.tecnicoNombre || '—',
        m.fechaProgramada?.toDate?.()?.toLocaleDateString('es-MX') || '—',
        m.descripcion?.substring(0, 50) + (m.descripcion?.length > 50 ? '...' : '') || '—'
    ]);

    autoTable(doc, {
        startY: 46,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [148, 163, 184], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: 14, right: 14 }
    });

    doc.save(`mantenimientos_${Date.now()}.pdf`);
}

/** Exportar equipos a Excel */
export function exportarEquiposExcel(equipos) {
    const datos = equipos.map(e => ({
        'Nombre': e.nombre || '',
        'Marca': e.marca || '',
        'Modelo': e.modelo || '',
        'N° Serie': e.numeroSerie || '',
        'Categoría': e.categoria || '',
        'Procesador': e.procesador || '',
        'RAM': e.ram || '',
        'Almacenamiento': e.almacenamiento || '',
        'Sistema Operativo': e.sistemaOperativo || '',
        'Estado': e.estado || '',
        'Descripción': e.descripcion || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
    XLSX.writeFile(wb, `equipos_${Date.now()}.xlsx`);
}

/** Exportar tickets a Excel */
export function exportarTicketsExcel(tickets) {
    const datos = tickets.map(t => ({
        'Título': t.titulo || '',
        'Descripción': t.descripcion || '',
        'Prioridad': t.prioridad || '',
        'Estado': t.estado || '',
        'Tipo': t.tipo || '',
        'Equipo': t.equipoNombre || '',
        'Creado por': t.creadoPorNombre || '',
        'Asignado a': t.asignadoANombre || '',
        'Fecha': t.creadoEn?.toDate?.()?.toLocaleDateString('es-MX') || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    XLSX.writeFile(wb, `tickets_${Date.now()}.xlsx`);
}

/** Exportar mantenimientos a Excel */
export function exportarMantenimientosExcel(mantenimientos) {
    const datos = mantenimientos.map(m => ({
        'Equipo': m.equipoNombre || '',
        'Tipo': m.tipo || '',
        'Estado': m.estado || '',
        'Técnico': m.tecnicoNombre || '',
        'Fecha Programada': m.fechaProgramada?.toDate?.()?.toLocaleDateString('es-MX') || '',
        'Fecha Completado': m.fechaCompletado?.toDate?.()?.toLocaleDateString('es-MX') || '',
        'Descripción': m.descripcion || '',
        'Observaciones': m.observaciones || ''
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mantenimientos');
    XLSX.writeFile(wb, `mantenimientos_${Date.now()}.xlsx`);
}
