/**
 * Motor de Diagnóstico Inteligente Básico
 * Funciona con palabras clave, reglas y una base de conocimientos.
 * NO usa IA avanzada — es un motor de reglas simple y eficaz.
 */

// Base de conocimientos: lista de problemas con sus palabras clave y soluciones
const BASE_CONOCIMIENTO = [
    {
        id: 1,
        problema: 'Rendimiento lento',
        tipo: 'software',
        keywords: ['lenta', 'lento', 'tarda', 'despacio', 'lentitud', 'lerda', 'cargando', 'demora', 'tardo'],
        causas: ['RAM insuficiente (menos de 4 GB)', 'Disco lleno o fragmentado', 'Virus o malware activo', 'Demasiados programas en inicio', 'Sobrecalentamiento del CPU'],
        soluciones: ['Verificar espacio libre en disco (mínimo 15%)', 'Ejecutar antivirus actualizado', 'Abrir Administrador de tareas y cerrar procesos pesados', 'Deshabilitar programas de inicio innecesarios', 'Limpiar ventiladores y aplicar pasta térmica nueva'],
        confianza: 90
    },
    {
        id: 2,
        problema: 'Equipo no enciende',
        tipo: 'hardware',
        keywords: ['no enciende', 'no prende', 'no arranca', 'no inicia', 'no se enciende', 'no prende', 'apagado'],
        causas: ['Fuente de poder dañada', 'RAM mal colocada o defectuosa', 'Problema eléctrico en la toma', 'Botón de encendido defectuoso', 'Tarjeta madre dañada'],
        soluciones: ['Verificar cable de corriente y que el tomacorriente funcione', 'Retirar y recolocar los módulos de RAM', 'Probar con otra toma eléctrica o UPS', 'Revisar la fuente de poder con multímetro', 'Contactar servicio técnico especializado'],
        confianza: 88
    },
    {
        id: 3,
        problema: 'Sistema se congela / Pantalla azul',
        tipo: 'mixto',
        keywords: ['congela', 'cuelga', 'traba', 'freezea', 'pantalla azul', 'bsod', 'pantalla negra', 'no responde', 'colgado'],
        causas: ['RAM defectuosa o mal colocada', 'Sobrecalentamiento del procesador', 'Controladores de video desactualizados', 'Disco duro con sectores dañados', 'Conflicto entre programas instalados'],
        soluciones: ['Ejecutar diagnóstico de memoria RAM (mdsched.exe)', 'Limpiar sistema de enfriamiento y aplicar pasta térmica', 'Actualizar drivers de pantalla y chipset', 'Ejecutar CHKDSK /f en el disco', 'Revisar Visor de eventos de Windows para errores recientes'],
        confianza: 82
    },
    {
        id: 4,
        problema: 'Sin conexión a internet',
        tipo: 'software',
        keywords: ['no internet', 'sin internet', 'no conecta', 'sin red', 'wifi', 'ethernet', 'conexion', 'red', 'no navega', 'sin conexión'],
        causas: ['Adaptador de red desactivado en el sistema', 'Driver de red desactualizado o corrupto', 'Configuración IP incorrecta', 'Problema en el router o switch', 'Firewall bloqueando la conexión'],
        soluciones: ['Verificar que el adaptador de red esté habilitado', 'Actualizar o reinstalar el driver de red', 'Ejecutar: ipconfig /release && ipconfig /renew en cmd', 'Reiniciar el router y el switch', 'Revisar configuración del Firewall de Windows'],
        confianza: 87
    },
    {
        id: 5,
        problema: 'Disco no detectado',
        tipo: 'hardware',
        keywords: ['no detecta disco', 'disco no aparece', 'sin disco', 'disco duro', 'hdd', 'ssd', 'no encuentra disco', 'no detecta unidad'],
        causas: ['Cable SATA desconectado o dañado', 'Disco duro físicamente dañado', 'BIOS no detecta el disco', 'Partición dañada o sin formato', 'Controlador SATA desactivado en BIOS'],
        soluciones: ['Verificar y reconectar cables SATA y de alimentación', 'Probar el disco en otro equipo o con adaptador USB', 'Revisar la configuración del disco en BIOS/UEFI', 'Ejecutar herramienta de diagnóstico del fabricante del disco', 'Respaldar datos urgentemente antes de cualquier intervención'],
        confianza: 85
    },
    {
        id: 6,
        problema: 'Infección por virus / malware',
        tipo: 'software',
        keywords: ['virus', 'malware', 'infectado', 'antivirus', 'ransomware', 'troyano', 'spyware', 'pop-up', 'publicidad'],
        causas: ['Descarga de archivos de fuentes no confiables', 'Dispositivo USB infectado conectado', 'Navegación en sitios maliciosos', 'Software del sistema sin actualizar'],
        soluciones: ['Ejecutar Windows Defender o antivirus actualizado', 'Analizar con Malwarebytes en modo seguro', 'Desconectar de la red durante la limpieza', 'Actualizar sistema operativo y todos los programas', 'Cambiar contraseñas después de la limpieza completa'],
        confianza: 92
    },
    {
        id: 7,
        problema: 'Problemas con impresora',
        tipo: 'mixto',
        keywords: ['no imprime', 'impresora', 'cola impresión', 'atascado papel', 'tinta', 'impresión'],
        causas: ['Driver de impresora no instalado o desactualizado', 'Cola de impresión bloqueada (Print Spooler)', 'Cable USB o conexión de red fallando', 'Sin tinta o papel en la impresora', 'Puerto USB defectuoso'],
        soluciones: ['Reiniciar el servicio "Cola de impresión" (services.msc)', 'Reinstalar el driver oficial de la impresora', 'Verificar cable USB y probar otro puerto', 'Revisar nivel de tinta y carga de papel', 'Usar el solucionador de problemas de impresión de Windows'],
        confianza: 80
    },
    {
        id: 8,
        problema: 'Sin imagen en pantalla / Monitor',
        tipo: 'hardware',
        keywords: ['no hay imagen', 'sin imagen', 'monitor', 'pantalla negra', 'sin video', 'pantalla no funciona', 'no se ve'],
        causas: ['Cable HDMI/VGA/DisplayPort desconectado o dañado', 'Tarjeta gráfica mal asentada en el slot', 'Monitor defectuoso', 'RAM mal colocada impidiendo el POST', 'BIOS reseteada cambiando la salida de video'],
        soluciones: ['Revisar y reconectar el cable de video (HDMI, VGA, DP)', 'Retirar y recolocar la tarjeta gráfica', 'Probar con otro monitor o TV', 'Recolocar módulos de RAM', 'Verificar que la GPU tiene conectores de alimentación'],
        confianza: 83
    },
    {
        id: 9,
        problema: 'Ruidos anómalos en el equipo',
        tipo: 'hardware',
        keywords: ['ruido', 'sonido extraño', 'hace ruido', 'clic clic', 'clic', 'ventilador', 'vibra', 'zumbido', 'rechinido'],
        causas: ['Ventilador con polvo acumulado o cojinetes dañados', 'Disco duro con cabezal defectuoso (clic = peligro)', 'Cable interno rozando algún ventilador', 'Tornillo suelto dentro del gabinete'],
        soluciones: ['Limpiar ventiladores con aire comprimido', '⚠️ Respaldar datos del disco INMEDIATAMENTE si hay clic', 'Organizar y amarrar cables internos con bridas', 'Revisar y apretar todos los tornillos del gabinete', 'Reemplazar el ventilador si es necesario'],
        confianza: 78
    },
    {
        id: 10,
        problema: 'Sobrecalentamiento',
        tipo: 'hardware',
        keywords: ['sobrecalienta', 'caliente', 'temperatura', 'se apaga solo', 'apaga sorpresa', 'muy caliente', 'se reinicia solo', 'temperatura alta'],
        causas: ['Ventilación del gabinete bloqueada', 'Pasta térmica del CPU seca o inexistente', 'Ventilador del CPU dañado o detenido', 'Polvo acumulado en disipadores', 'Ambiente de trabajo muy caluroso'],
        soluciones: ['Limpiar polvo de todo el sistema con aire comprimido', 'Aplicar pasta térmica nueva en el procesador', 'Verificar que el ventilador del CPU gira correctamente', 'Mejorar la ventilación del gabinete (agregar fans)', 'Monitorear temperatura con HWMonitor o Core Temp'],
        confianza: 90
    },
    {
        id: 11,
        problema: 'Error en actualizaciones de Windows',
        tipo: 'software',
        keywords: ['actualización', 'windows update', 'no actualiza', 'falla actualización', 'update error'],
        causas: ['Espacio insuficiente en disco C:', 'Archivos de sistema corruptos', 'Servicio Windows Update desactivado', 'Conexión interrumpida durante la descarga'],
        soluciones: ['Liberar espacio en disco C: (mínimo 20 GB libres)', 'Ejecutar: sfc /scannow en cmd como administrador', 'Usar la herramienta oficial de solución de Windows Update', 'Descargar manualmente el paquete de actualización desde Microsoft'],
        confianza: 78
    },
    {
        id: 12,
        problema: 'Programa o aplicación no funciona',
        tipo: 'software',
        keywords: ['no abre', 'programa no funciona', 'aplicación falla', 'se cierra solo', 'error al abrir', 'no carga programa', 'crashea'],
        causas: ['Instalación del programa corrupta', 'Dependencias faltantes (DLL, .NET, C++)', 'Incompatibilidad con versión de Windows', 'Permisos insuficientes para ejecutar', 'Memoria RAM insuficiente para el programa'],
        soluciones: ['Desinstalar completamente y reinstalar el programa', 'Instalar Visual C++ Redistributable y .NET Framework', 'Ejecutar el programa como administrador (clic derecho)', 'Verificar compatibilidad del software con el SO', 'Revisar el Visor de eventos para el código de error específico'],
        confianza: 82
    },
    {
        id: 13,
        problema: 'Periférico no detectado (teclado/mouse/USB)',
        tipo: 'mixto',
        keywords: ['teclado no funciona', 'mouse no funciona', 'periférico', 'usb no detecta', 'no reconoce', 'no detecta usb', 'ratón'],
        causas: ['Puerto USB dañado o desactivado', 'Driver del controlador USB faltante', 'Dispositivo físicamente dañado', 'Conflicto de controladores en el sistema'],
        soluciones: ['Probar el dispositivo en otro puerto USB (preferir USB 2.0 para periféricos)', 'Probar el periférico en otro equipo para descartar daño físico', 'Actualizar el driver del controlador USB en Administrador de dispositivos', 'Reiniciar el equipo con el dispositivo conectado', 'Verificar en Administrador de dispositivos si hay conflictos (!)'],
        confianza: 80
    },
    {
        id: 14,
        problema: 'Problema de batería (laptop)',
        tipo: 'hardware',
        keywords: ['batería', 'no carga', 'no dura batería', 'laptop no carga', 'adaptador', 'cargador', 'sin carga'],
        causas: ['Batería deteriorada por ciclos de carga', 'Adaptador de corriente dañado', 'Conector de carga del equipo dañado', 'Controlador de batería con error de firmware'],
        soluciones: ['Calibrar batería: descarga total y luego carga ininterrumpida al 100%', 'Probar con otro adaptador de la misma especificación', 'Revisar físicamente el conector de carga', 'Actualizar el driver ACPI y de batería', 'Reemplazar la batería si tiene más de 300 ciclos o 2 años'],
        confianza: 85
    },
    {
        id: 15,
        problema: 'Sin audio',
        tipo: 'software',
        keywords: ['sin sonido', 'no hay audio', 'audio no funciona', 'bocinas', 'altavoces', 'auriculares', 'no se escucha', 'silencio'],
        causas: ['Audio silenciado en sistema o en la aplicación', 'Driver de audio desactualizado o corrupto', 'Dispositivo de reproducción incorrecto seleccionado', 'Conector de audio físicamente dañado'],
        soluciones: ['Verificar volumen del sistema y que no esté silenciado', 'Actualizar o reinstalar el driver de audio (Realtek, etc.)', 'Clic derecho en ícono de sonido → Dispositivos de reproducción → Verificar predeterminado', 'Probar con auriculares en otra salida de audio', 'Ejecutar solucionador de problemas de audio de Windows'],
        confianza: 82
    },
    {
        id: 16,
        problema: 'Falta de memoria RAM',
        tipo: 'hardware',
        keywords: ['memoria', 'ram', 'falta ram', 'poca memoria', 'memoria insuficiente', 'memoria llena'],
        causas: ['RAM instalada insuficiente para las tareas actuales', 'Módulo de RAM defectuoso o mal colocado', 'Memoria virtual (página) mal configurada', 'Programas con fuga de memoria (memory leak)'],
        soluciones: ['Ampliar la RAM (recomendado mínimo 8 GB para uso moderno)', 'Recolocar y limpiar contactos de los módulos RAM', 'Aumentar el tamaño del archivo de paginación', 'Identificar y cerrar programas con alto consumo de RAM en Administrador de tareas'],
        confianza: 85
    }
];

/**
 * Normaliza texto: minúsculas, sin acentos, sin caracteres especiales
 */
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita acentos
        .replace(/[^a-z0-9\s]/g, ' ');   // solo letras, números y espacios
}

/**
 * Función principal del motor de diagnóstico.
 * Recibe un texto con la descripción del problema y retorna resultados ordenados por confianza.
 * @param {string} textoPoblema - Descripción del problema escrita por el usuario
 * @returns {Array} - Lista de diagnósticos con causas y soluciones, ordenados por relevancia
 */
export function diagnosticar(textoPoblema) {
    if (!textoPoblema || textoPoblema.trim().length < 3) return [];

    const textoNorm = normalizarTexto(textoPoblema);
    const palabras = textoNorm.split(/\s+/);

    const resultados = BASE_CONOCIMIENTO.map((regla) => {
        let coincidencias = 0;
        let textoCoincide = 0;

        // Buscar cada keyword en el texto completo
        regla.keywords.forEach((kw) => {
            const kwNorm = normalizarTexto(kw);
            if (textoNorm.includes(kwNorm)) {
                // Coincidencia de frase completa vale más
                coincidencias += kwNorm.includes(' ') ? 3 : 1;
                textoCoincide++;
            }
        });

        // Buscar palabras individuales del texto en las keywords
        palabras.forEach((palabra) => {
            if (palabra.length < 3) return;
            regla.keywords.forEach((kw) => {
                if (normalizarTexto(kw).includes(palabra)) {
                    coincidencias += 0.5;
                }
            });
        });

        if (coincidencias === 0) return null;

        // Calcular puntaje final: coincidencias * confianza base
        const puntaje = Math.min(99, Math.round((coincidencias / regla.keywords.length) * regla.confianza));

        return { ...regla, puntaje };
    })
    .filter(Boolean)
    .filter(r => r.puntaje > 10)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 3); // Máximo 3 resultados

    return resultados;
}

/**
 * Clasifica automáticamente si un problema es hardware, software o mixto
 * basado en palabras clave en el texto
 */
export function clasificarTipo(texto) {
    const norm = normalizarTexto(texto);
    const keywordsHW = ['disco', 'ram', 'memoria', 'fuente', 'ventilador', 'tarjeta', 'monitor', 'pantalla', 'teclado', 'mouse', 'bateria', 'cargador', 'componente', 'fisico', 'hardware'];
    const keywordsSW = ['windows', 'programa', 'software', 'virus', 'actualizacion', 'driver', 'sistema', 'aplicacion', 'configuracion', 'internet', 'red', 'archivo'];

    let scoreHW = keywordsHW.filter(k => norm.includes(k)).length;
    let scoreSW = keywordsSW.filter(k => norm.includes(k)).length;

    if (scoreHW > 0 && scoreSW > 0) return 'mixto';
    if (scoreHW > scoreSW) return 'hardware';
    if (scoreSW > scoreHW) return 'software';
    return 'general';
}

export { BASE_CONOCIMIENTO };
