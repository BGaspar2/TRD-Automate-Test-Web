import fs from 'fs';
import path from 'path';

/**
 * Custom Playwright Reporter que genera un informe ejecutivo en español
 * con visualización paso a paso, capturas de pantalla, videos y métricas de negocio.
 */
class SpanishExecutiveReporter {
    /**
     * @param {Object} [options]
     * @param {string} [options.outputFile] - Ruta de salida del archivo HTML
     * @param {string} [options.titulo] - Título del informe
     */
    constructor(options = {}) {
        this.outputFile = options.outputFile || path.join(process.cwd(), 'playwright-report', 'informe-ejecutivo.html');
        this.titulo = options.titulo || 'Reporte Ejecutivo de Pruebas E2E - KFC LATAM';
        this.tests = [];
        this.startTime = null;
        this.endTime = null;
    }

    obtenerBanderaSVG(codigo) {
        const flags = {
            'AR': `<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#74acdf" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><circle cx="320" cy="240" r="32" fill="#f6b40e"/></svg>`,
            'BR': `<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#009b3a" d="M0 0h640v480H0z"/><path fill="#fedf00" d="m320 50 270 190-270 190L50 240z"/><circle cx="320" cy="240" r="75" fill="#002776"/></svg>`,
            'CL': `<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#d52b1e" d="M0 240h640v240H0z"/><path fill="#fff" d="M0 0h640v240H0z"/><path fill="#0039a6" d="M0 0h240v240H0z"/><polygon fill="#fff" points="120,45 142,112 213,112 156,153 177,220 120,179 63,220 84,153 27,112 98,112"/></svg>`,
            'CO': `<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#fcd116" d="M0 0h640v240H0z"/><path fill="#003893" d="M0 240h640v120H0z"/><path fill="#ce1126" d="M0 360h640v120H0z"/></svg>`,
            'EC': `<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#ffdd00" d="M0 0h640v240H0z"/><path fill="#034ea2" d="M0 240h640v120H0z"/><path fill="#ed1c24" d="M0 360h640v120H0z"/><ellipse cx="320" cy="240" rx="34" ry="24" fill="#034ea2"/><ellipse cx="320" cy="240" rx="26" ry="18" fill="#ffdd00"/></svg>`,
            'VE': `<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#fcd116" d="M0 0h640v160H0z"/><path fill="#003893" d="M0 160h640v160H0z"/><path fill="#ce1126" d="M0 320h640v160H0z"/><circle cx="280" cy="225" r="5" fill="#fff"/><circle cx="305" cy="215" r="5" fill="#fff"/><circle cx="335" cy="215" r="5" fill="#fff"/><circle cx="360" cy="225" r="5" fill="#fff"/><circle cx="265" cy="245" r="5" fill="#fff"/><circle cx="375" cy="245" r="5" fill="#fff"/></svg>`,
            'LATAM': `<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><rect width="640" height="480" fill="#e4002b"/><text x="320" y="290" font-size="160" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="900">KFC</text></svg>`
        };
        return flags[codigo] || flags['LATAM'];
    }

    onBegin(config, suite) {
        this.startTime = Date.now();
        this.totalTests = suite.allTests().length;
        console.log(`\n======================================================`);
        console.log(`🚀 Generando: ${this.titulo}`);
        console.log(`📊 Total de pruebas a ejecutar: ${this.totalTests}`);
        console.log(`======================================================\n`);
    }

    onTestEnd(test, result) {
        const filePath = path.relative(process.cwd(), test.location.file).replace(/\\/g, '/');
        const lowerFile = filePath.toLowerCase();
        const lowerTitle = test.title.toLowerCase();
        
        // Detección estricta de País sin falsos positivos
        let pais = 'Regional / LATAM';
        let codigoPais = 'LATAM';

        if (lowerFile.includes('/argentina/') || lowerTitle.includes('argentina') || lowerTitle.includes('🇦🇷')) {
            pais = 'Argentina';
            codigoPais = 'AR';
        } else if (lowerFile.includes('/brasil/') || lowerTitle.includes('brasil') || lowerTitle.includes('brazil') || lowerTitle.includes('🇧🇷')) {
            pais = 'Brasil';
            codigoPais = 'BR';
        } else if (lowerFile.includes('/chile/') || lowerTitle.includes('chile') || lowerTitle.includes('🇨🇱')) {
            pais = 'Chile';
            codigoPais = 'CL';
        } else if (lowerFile.includes('/colombia/') || lowerTitle.includes('colombia') || lowerTitle.includes('🇨🇴')) {
            pais = 'Colombia';
            codigoPais = 'CO';
        } else if (lowerFile.includes('/ecuador/') || lowerTitle.includes('ecuador') || lowerTitle.includes('🇪🇨')) {
            pais = 'Ecuador';
            codigoPais = 'EC';
        } else if (lowerFile.includes('/venezuela/') || lowerTitle.includes('venezuela') || lowerTitle.includes('🇻🇪')) {
            pais = 'Venezuela';
            codigoPais = 'VE';
        }

        // Detectar Canal
        let canal = 'General';
        let iconoCanal = '🛒';
        if (lowerFile.includes('pickup') || lowerTitle.includes('pickup') || lowerTitle.includes('retiro') || lowerTitle.includes('retirada')) {
            canal = 'Pickup (Retiro en Tienda)';
            iconoCanal = '🛍️';
        } else if (lowerFile.includes('del') || lowerTitle.includes('delivery') || lowerTitle.includes('domicilio') || lowerTitle.includes('entrega')) {
            canal = 'Delivery (A Domicilio)';
            iconoCanal = '🛵';
        }

        // Detectar Tipo de Usuario
        let tipoUsuario = 'Usuario Anónimo (Invitado)';
        if (lowerFile.includes('registrado') || lowerTitle.includes('registrado') || lowerFile.includes('auth')) {
            tipoUsuario = 'Usuario Registrado';
        }

        // Limpiar título de banderas de texto redundantes
        const tituloLimpio = test.title.replace(/^[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]\s*/g, '').trim();

        // Procesar attachments (capturas de pantalla y videos)
        const screenshots = [];
        let videoPath = null;
        let tracePath = null;

        const reportDir = path.dirname(this.outputFile);
        const evidenciasDir = path.join(reportDir, 'evidencias');
        if (!fs.existsSync(evidenciasDir)) {
            fs.mkdirSync(evidenciasDir, { recursive: true });
        }

        if (result.attachments && result.attachments.length > 0) {
            result.attachments.forEach((att, idx) => {
                if (att.contentType && att.contentType.startsWith('image/')) {
                    let base64Data = null;
                    let fileName = `screenshot_${Date.now()}_${idx}.png`;
                    let diskPath = path.join(evidenciasDir, fileName);

                    if (att.body) {
                        base64Data = att.body.toString('base64');
                        fs.writeFileSync(diskPath, att.body);
                    } else if (att.path && fs.existsSync(att.path)) {
                        const fileBuf = fs.readFileSync(att.path);
                        base64Data = fileBuf.toString('base64');
                        fs.copyFileSync(att.path, diskPath);
                    }

                    if (base64Data) {
                        screenshots.push({
                            name: att.name || `Captura ${screenshots.length + 1}`,
                            base64: `data:${att.contentType};base64,${base64Data}`,
                            fileName: `evidencias/${fileName}`
                        });
                    }
                } else if (att.contentType && (att.contentType.startsWith('video/') || att.name === 'video')) {
                    if (att.path && fs.existsSync(att.path)) {
                        const videoName = `video_${Date.now()}_${idx}.webm`;
                        const videoDest = path.join(evidenciasDir, videoName);
                        fs.copyFileSync(att.path, videoDest);
                        videoPath = `evidencias/${videoName}`;
                    }
                } else if (att.name === 'trace') {
                    tracePath = att.path;
                }
            });
        }

        // Procesar Pasos (Steps)
        const steps = [];
        if (result.steps && result.steps.length > 0) {
            result.steps.forEach((step, stepIdx) => {
                const isInternalHook = step.category === 'hook' && (step.title.includes('fixture') || step.title.includes('context'));
                if (isInternalHook) return;

                const pasoScreenshot = screenshots.find(s => 
                    s.name.toLowerCase().includes(step.title.toLowerCase()) || 
                    s.name.includes(`Paso ${stepIdx + 1}`) ||
                    (stepIdx === result.steps.length - 1 && s.name.includes('Fallo'))
                ) || null;

                steps.push({
                    index: steps.length + 1,
                    title: step.title,
                    category: step.category,
                    duration: step.duration,
                    error: step.error ? step.error.message : null,
                    status: step.error ? 'failed' : 'passed',
                    screenshot: pasoScreenshot ? pasoScreenshot.base64 : null
                });
            });
        }

        // Traducir estado a Español
        let estadoEspanol = 'Aprobado';
        let estadoClase = 'passed';
        let estadoIcono = '✅';

        if (result.status === 'passed') {
            estadoEspanol = 'Aprobado';
            estadoClase = 'passed';
            estadoIcono = '✅';
        } else if (result.status === 'failed') {
            estadoEspanol = 'Fallido';
            estadoClase = 'failed';
            estadoIcono = '❌';
        } else if (result.status === 'timedOut') {
            estadoEspanol = 'Tiempo Agotado';
            estadoClase = 'failed';
            estadoIcono = '⏱️';
        } else if (result.status === 'skipped') {
            estadoEspanol = 'Omitido';
            estadoClase = 'skipped';
            estadoIcono = '⚠️';
        } else {
            estadoEspanol = result.status;
            estadoClase = 'skipped';
            estadoIcono = 'ℹ️';
        }

        // Formatear error amigable para no-QA
        let errorAmigable = null;
        let errorTecnico = null;

        if (result.error) {
            errorTecnico = result.error.stack || result.error.message || String(result.error);
            const msg = (result.error.message || '').toLowerCase();

            if (msg.includes('timeout') || msg.includes('timed out')) {
                errorAmigable = 'El sitio web tardó más tiempo de lo esperado en responder o cargar un componente requerido.';
            } else if (msg.includes('cerrados') || msg.includes('locales se encuentran cerrados')) {
                errorAmigable = 'Los locales de la zona seleccionada se encuentran fuera de horario de atención comercial.';
            } else if (msg.includes('not visible') || msg.includes('waiting for locator')) {
                errorAmigable = 'Un elemento visual esperado en la pantalla no apareció dentro del tiempo estimado.';
            } else if (msg.includes('click') || msg.includes('intercepted')) {
                errorAmigable = 'No fue posible hacer clic en el botón o elemento debido a un elemento superpuesto o modal abierto.';
            } else {
                errorAmigable = 'Ocurrió una inconsistencia durante el flujo de navegación automatizado.';
            }
        }

        this.tests.push({
            id: test.id,
            title: test.title,
            tituloLimpio,
            file: filePath,
            pais,
            codigoPais,
            canal,
            iconoCanal,
            tipoUsuario,
            duration: result.duration,
            status: result.status,
            estadoEspanol,
            estadoClase,
            estadoIcono,
            retry: result.retry,
            errorAmigable,
            errorTecnico,
            steps,
            screenshots,
            videoPath,
            tracePath
        });
    }

    onEnd(result) {
        this.endTime = Date.now();
        const totalDuration = this.endTime - (this.startTime || this.endTime);

        const total = this.tests.length;
        const passed = this.tests.filter(t => t.status === 'passed').length;
        const failed = this.tests.filter(t => t.status === 'failed' || t.status === 'timedOut').length;
        const skipped = this.tests.filter(t => t.status === 'skipped').length;
        const tasaExito = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

        const html = this.generarHTML({
            titulo: this.titulo,
            total,
            passed,
            failed,
            skipped,
            tasaExito,
            totalDuration,
            tests: this.tests,
            fechaGeneracion: new Date().toLocaleString('es-ES', {
                dateStyle: 'full',
                timeStyle: 'medium'
            })
        });

        const reportDir = path.dirname(this.outputFile);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        fs.writeFileSync(this.outputFile, html, 'utf-8');
        console.log(`\n======================================================`);
        console.log(`🎉 ¡Informe Ejecutivo en Español generado con éxito!`);
        console.log(`📁 Ubicación: ${this.outputFile}`);
        console.log(`📊 Tasa de Éxito: ${tasaExito}% | Aprobadas: ${passed} | Fallidas: ${failed} | Omitidas: ${skipped}`);
        console.log(`======================================================\n`);
    }

    formatearDuracion(ms) {
        if (!ms || ms < 0) return '0s';
        const segundos = (ms / 1000).toFixed(1);
        if (segundos < 60) return `${segundos}s`;
        const minutos = Math.floor(segundos / 60);
        const segRestantes = (segundos % 60).toFixed(0);
        return `${minutos}m ${segRestantes}s`;
    }

    generarHTML(data) {
        const testsJson = JSON.stringify(data.tests).replace(/</g, '\\u003c');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.titulo}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --kfc-red: #e4002b;
            --kfc-dark-red: #b80022;
            --kfc-black: #111111;
            --bg-main: #f8fafc;
            --bg-card: #ffffff;
            --border-color: #e2e8f0;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #94a3b8;
            --color-passed: #10b981;
            --color-passed-bg: #ecfdf5;
            --color-passed-border: #a7f3d0;
            --color-failed: #ef4444;
            --color-failed-bg: #fef2f2;
            --color-failed-border: #fecaca;
            --color-skipped: #f59e0b;
            --color-skipped-bg: #fffbeb;
            --color-skipped-border: #fde68a;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --radius-md: 12px;
            --radius-lg: 16px;
            --radius-full: 9999px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-main);
            color: var(--text-primary);
            line-height: 1.5;
            padding-bottom: 80px;
        }

        h1, h2, h3, h4, .brand-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
        }

        /* Top Header */
        .top-header {
            background: linear-gradient(135deg, #111111 0%, #1e1e1e 50%, #e4002b 100%);
            color: white;
            padding: 24px 32px;
            box-shadow: var(--shadow-md);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }

        .brand-section {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .kfc-badge {
            background-color: var(--kfc-red);
            color: white;
            font-family: 'Outfit', sans-serif;
            font-weight: 800;
            font-size: 20px;
            padding: 6px 14px;
            border-radius: 8px;
            letter-spacing: 1px;
            border: 2px solid rgba(255,255,255,0.2);
        }

        .header-titles h1 {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .header-titles p {
            font-size: 13px;
            color: #cbd5e1;
            margin-top: 2px;
        }

        .header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .btn-action {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.12);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.25);
            padding: 8px 16px;
            border-radius: var(--radius-full);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            backdrop-filter: blur(8px);
        }

        .btn-action:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-1px);
        }

        .btn-action.btn-primary {
            background: var(--kfc-red);
            border-color: var(--kfc-red);
        }

        .btn-action.btn-primary:hover {
            background: var(--kfc-dark-red);
        }

        /* Main Container */
        .main-container {
            max-width: 1400px;
            margin: 32px auto 0;
            padding: 0 24px;
        }

        /* KPI Dashboard */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .kpi-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 20px;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .kpi-title {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .kpi-value {
            font-size: 32px;
            font-family: 'Outfit', sans-serif;
            font-weight: 800;
            color: var(--text-primary);
            margin: 8px 0 4px;
        }

        .kpi-subtitle {
            font-size: 12px;
            color: var(--text-muted);
        }

        .kpi-card.kpi-success .kpi-value { color: var(--color-passed); }
        .kpi-card.kpi-danger .kpi-value { color: var(--color-failed); }
        .kpi-card.kpi-warning .kpi-value { color: var(--color-skipped); }
        .kpi-card.kpi-rate .kpi-value { color: var(--kfc-red); }

        /* Resumen Regional */
        .section-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: var(--shadow-sm);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .regional-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 16px;
        }

        .country-pill {
            background: #f8fafc;
            border-radius: var(--radius-md);
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 2px solid #e2e8f0;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .country-pill:hover {
            background: #ffffff;
            border-color: #cbd5e1;
            box-shadow: var(--shadow-sm);
            transform: translateY(-1px);
        }

        .country-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .flag-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .country-name {
            font-weight: 700;
            font-size: 14px;
            color: var(--text-primary);
        }

        .country-status-badge {
            font-size: 12px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: var(--radius-full);
        }

        /* Filter Controls */
        .filters-toolbar {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 18px 24px;
            margin-bottom: 24px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            box-shadow: var(--shadow-sm);
        }

        .filter-group {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }

        .filter-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-right: 4px;
        }

        .filter-btn {
            background: #f1f5f9;
            border: 1px solid var(--border-color);
            padding: 6px 14px;
            border-radius: var(--radius-full);
            font-size: 13px;
            font-weight: 500;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .filter-btn:hover {
            background: #e2e8f0;
            color: var(--text-primary);
        }

        .filter-btn.active {
            background: var(--kfc-black);
            color: white;
            border-color: var(--kfc-black);
            font-weight: 600;
        }

        .search-box {
            position: relative;
            min-width: 260px;
        }

        .search-input {
            width: 100%;
            padding: 8px 14px 8px 36px;
            border-radius: var(--radius-full);
            border: 1px solid var(--border-color);
            background: #f8fafc;
            font-size: 13px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input:focus {
            border-color: var(--kfc-red);
            background: white;
            box-shadow: 0 0 0 3px rgba(228, 0, 43, 0.1);
        }

        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 14px;
        }

        /* Test Scenario Cards */
        .test-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .test-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .test-card:hover {
            border-color: #cbd5e1;
            box-shadow: var(--shadow-md);
        }

        .test-header {
            padding: 18px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            background: white;
            user-select: none;
            transition: background 0.15s ease;
        }

        .test-header:hover {
            background: #f8fafc;
        }

        .test-title-section {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            flex-wrap: wrap;
        }

        .test-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: var(--radius-full);
            font-size: 12px;
            font-weight: 600;
        }

        .tag-country {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #dbeafe;
        }

        .tag-channel {
            background: #f3e8ff;
            color: #7e22ce;
            border: 1px solid #f3e8ff;
        }

        .tag-user {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
        }

        .test-meta {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .test-duration {
            font-size: 13px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: var(--radius-full);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }

        .status-badge.passed {
            background: var(--color-passed-bg);
            color: #065f46;
            border: 1px solid var(--color-passed-border);
        }

        .status-badge.failed {
            background: var(--color-failed-bg);
            color: #991b1b;
            border: 1px solid var(--color-failed-border);
        }

        .status-badge.skipped {
            background: var(--color-skipped-bg);
            color: #92400e;
            border: 1px solid var(--color-skipped-border);
        }

        .toggle-icon {
            font-size: 16px;
            color: var(--text-muted);
            transition: transform 0.2s ease;
        }

        .test-card.open .toggle-icon {
            transform: rotate(180deg);
        }

        .test-content {
            display: none;
            padding: 24px;
            border-top: 1px solid var(--border-color);
            background: #fafafa;
        }

        .test-card.open .test-content {
            display: block;
        }

        /* Friendly Error Box */
        .error-box {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-left: 4px solid var(--color-failed);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .error-title {
            font-size: 14px;
            font-weight: 700;
            color: #c53030;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
        }

        .error-friendly-msg {
            font-size: 13px;
            color: #742a2a;
            line-height: 1.5;
        }

        .tech-error-toggle {
            margin-top: 10px;
            font-size: 12px;
            color: #9b2c2c;
            background: none;
            border: none;
            text-decoration: underline;
            cursor: pointer;
            padding: 0;
            font-weight: 600;
        }

        .tech-error-content {
            display: none;
            margin-top: 10px;
            padding: 12px;
            background: #2d3748;
            color: #edf2f7;
            border-radius: 6px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            overflow-x: auto;
            white-space: pre-wrap;
        }

        .tech-error-content.show {
            display: block;
        }

        /* Step Timeline */
        .steps-timeline {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 24px;
        }

        .step-item {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 18px 20px;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .step-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }

        .step-title-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .step-number-badge {
            background: var(--kfc-black);
            color: white;
            font-weight: 700;
            font-size: 12px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .step-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .step-duration {
            font-size: 12px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
        }

        .step-screenshot-container {
            margin-top: 8px;
            background: #0f172a;
            border-radius: 8px;
            padding: 8px;
            display: inline-block;
            max-width: 100%;
        }

        .step-screenshot-img {
            max-width: 480px;
            max-height: 280px;
            width: 100%;
            height: auto;
            object-fit: cover;
            border-radius: 6px;
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease;
            display: block;
        }

        .step-screenshot-img:hover {
            transform: scale(1.01);
            opacity: 0.95;
        }

        .step-screenshot-caption {
            margin-top: 6px;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .btn-zoom {
            background: rgba(255,255,255,0.15);
            color: white;
            border: none;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
        }

        .btn-zoom:hover {
            background: rgba(255,255,255,0.3);
        }

        /* Video Section */
        .video-section {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 18px 20px;
            margin-top: 16px;
        }

        .video-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .video-player {
            width: 100%;
            max-width: 720px;
            border-radius: 8px;
            background: black;
            box-shadow: var(--shadow-md);
        }

        /* Lightbox Modal */
        .lightbox-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.92);
            z-index: 1000;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 24px;
        }

        .lightbox-modal.active {
            display: flex;
        }

        .lightbox-header {
            width: 100%;
            max-width: 1200px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
            margin-bottom: 16px;
        }

        .lightbox-title {
            font-size: 16px;
            font-weight: 600;
        }

        .lightbox-close {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            font-size: 20px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .lightbox-close:hover {
            background: rgba(255,255,255,0.4);
        }

        .lightbox-body {
            position: relative;
            max-width: 1200px;
            max-height: 80vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .lightbox-img {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 8px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            object-fit: contain;
        }

        .lightbox-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .lightbox-nav-btn:hover {
            background: rgba(228, 0, 43, 0.8);
        }

        .lightbox-nav-prev { left: -60px; }
        .lightbox-nav-next { right: -60px; }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: var(--radius-lg);
            border: 1px dashed var(--border-color);
            color: var(--text-muted);
        }

        /* Print Media */
        @media print {
            .top-header, .filters-toolbar, .header-actions, .lightbox-modal {
                display: none !important;
            }
            .test-content {
                display: block !important;
            }
            body {
                background: white;
                color: black;
                padding: 0;
            }
            .main-container {
                margin: 0;
                padding: 0;
                max-width: 100%;
            }
            .kpi-card, .test-card, .section-card {
                border: 1px solid #ccc;
                box-shadow: none;
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>

    <!-- Header Superior -->
    <header class="top-header">
        <div class="header-content">
            <div class="brand-section">
                <span class="kfc-badge">KFC</span>
                <div class="header-titles">
                    <h1>🍗 ${data.titulo}</h1>
                    <p>📅 Ejecución: ${data.fechaGeneracion} | Duración Total: ${this.formatearDuracion(data.totalDuration)}</p>
                </div>
            </div>
            <div class="header-actions">
                <button class="btn-action" onclick="window.print()">🖨️ Imprimir / PDF</button>
                <button class="btn-action btn-primary" onclick="expandirTodos()">📂 Expandir Todo</button>
            </div>
        </div>
    </header>

    <div class="main-container">

        <!-- Dashboard Ejecutivo KPIs -->
        <section class="dashboard-grid">
            <div class="kpi-card kpi-rate">
                <div class="kpi-title">Tasa de Éxito Regional <span>📈</span></div>
                <div class="kpi-value">${data.tasaExito}%</div>
                <div class="kpi-subtitle">${data.passed} de ${data.total} pruebas aprobadas</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-title">Total de Pruebas <span>🧪</span></div>
                <div class="kpi-value">${data.total}</div>
                <div class="kpi-subtitle">Flujos E2E automatizados</div>
            </div>

            <div class="kpi-card kpi-success">
                <div class="kpi-title">Aprobadas <span>✅</span></div>
                <div class="kpi-value">${data.passed}</div>
                <div class="kpi-subtitle">Comportamiento esperado</div>
            </div>

            <div class="kpi-card kpi-danger">
                <div class="kpi-title">Fallidas <span>❌</span></div>
                <div class="kpi-value">${data.failed}</div>
                <div class="kpi-subtitle">Requieren revisión técnica</div>
            </div>

            <div class="kpi-card kpi-warning">
                <div class="kpi-title">Omitidas / Fuera de Horario <span>⚠️</span></div>
                <div class="kpi-value">${data.skipped}</div>
                <div class="kpi-subtitle">Locales cerrados / Saltados</div>
            </div>
        </section>

        <!-- Resumen por País -->
        <section class="section-card">
            <div class="section-header">
                <div class="section-title">🌎 Cobertura por País (KFC LATAM)</div>
                <span style="font-size: 13px; color: var(--text-muted);">Haz clic en un país para filtrar resultados</span>
            </div>
            <div class="regional-grid" id="regionalGrid">
                <!-- Se rellena dinámicamente con JS -->
            </div>
        </section>

        <!-- Barra de Filtros y Búsqueda -->
        <section class="filters-toolbar">
            <div class="filter-group">
                <span class="filter-label">Estado:</span>
                <button class="filter-btn active" data-filter-status="todos" onclick="filtrarEstado('todos', this)">Todos (${data.total})</button>
                <button class="filter-btn" data-filter-status="passed" onclick="filtrarEstado('passed', this)">✅ Aprobados (${data.passed})</button>
                <button class="filter-btn" data-filter-status="failed" onclick="filtrarEstado('failed', this)">❌ Fallidos (${data.failed})</button>
                <button class="filter-btn" data-filter-status="skipped" onclick="filtrarEstado('skipped', this)">⚠️ Omitidos (${data.skipped})</button>
            </div>

            <div class="filter-group">
                <span class="filter-label">Canal:</span>
                <button class="filter-btn active" data-filter-channel="todos" onclick="filtrarCanal('todos', this)">Todos</button>
                <button class="filter-btn" data-filter-channel="pickup" onclick="filtrarCanal('pickup', this)">🛍️ Pickup</button>
                <button class="filter-btn" data-filter-channel="delivery" onclick="filtrarCanal('delivery', this)">🛵 Delivery</button>
            </div>

            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="buscador" class="search-input" placeholder="Buscar prueba, país o paso..." oninput="ejecutarFiltros()">
            </div>
        </section>

        <!-- Lista Detallada de Pruebas -->
        <section class="test-list" id="testContainer">
            ${data.tests.map((t, idx) => `
                <article class="test-card" data-country="${t.pais.toLowerCase()}" data-channel="${t.canal.toLowerCase()}" data-status="${t.status}" id="test-card-${idx}">
                    <div class="test-header" onclick="toggleTestCard(${idx})">
                        <div class="test-title-section">
                            <span class="flag-wrapper">${this.obtenerBanderaSVG(t.codigoPais)}</span>
                            <span class="test-title">${t.tituloLimpio}</span>
                            <span class="tag tag-country">${t.pais}</span>
                            <span class="tag tag-channel">${t.iconoCanal} ${t.canal}</span>
                            <span class="tag tag-user">👤 ${t.tipoUsuario}</span>
                        </div>
                        <div class="test-meta">
                            <span class="test-duration">⏱️ ${this.formatearDuracion(t.duration)}</span>
                            <span class="status-badge ${t.estadoClase}">${t.estadoIcono} ${t.estadoEspanol}</span>
                            <span class="toggle-icon">▼</span>
                        </div>
                    </div>

                    <div class="test-content">
                        ${t.errorAmigable ? `
                            <div class="error-box">
                                <div class="error-title">⚠️ Motivo del fallo (Explicación para Negocio):</div>
                                <p class="error-friendly-msg">${t.errorAmigable}</p>
                                ${t.errorTecnico ? `
                                    <button class="tech-error-toggle" onclick="toggleErrorTecnico(${idx})">Ver detalles técnicos para soporte/desarrollo ▼</button>
                                    <div class="tech-error-content" id="tech-error-${idx}">${t.errorTecnico}</div>
                                ` : ''}
                            </div>
                        ` : ''}

                        <!-- Paso a Paso con Capturas -->
                        <h4 style="font-size: 15px; margin-bottom: 14px; color: var(--text-primary);">📸 Paso a Paso Visual de la Experiencia:</h4>
                        
                        ${t.steps && t.steps.length > 0 ? `
                            <div class="steps-timeline">
                                ${t.steps.map((st) => `
                                    <div class="step-item">
                                        <div class="step-header">
                                            <div class="step-title-wrapper">
                                                <span class="step-number-badge">${st.index}</span>
                                                <span class="step-title">${st.title}</span>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <span class="step-duration">${this.formatearDuracion(st.duration)}</span>
                                                <span class="status-badge ${st.status}" style="padding: 2px 8px; font-size: 11px;">
                                                    ${st.status === 'passed' ? '✅ Exitoso' : '❌ Falló'}
                                                </span>
                                            </div>
                                        </div>

                                        ${st.screenshot ? `
                                            <div class="step-screenshot-container">
                                                <img src="${st.screenshot}" class="step-screenshot-img" alt="${st.title}" onclick="abrirLightbox('${st.screenshot}', '${st.title.replace(/'/g, "\\'")}')" />
                                                <div class="step-screenshot-caption">
                                                    <span>📸 Captura tomada al completar el paso</span>
                                                    <button class="btn-zoom" onclick="abrirLightbox('${st.screenshot}', '${st.title.replace(/'/g, "\\'")}')">🔍 Ampliar</button>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">No se registraron pasos detallados individuales para esta prueba.</p>
                        `}

                        <!-- Galería de Capturas Adicionales si existen -->
                        ${t.screenshots && t.screenshots.length > 0 ? `
                            <div style="margin-top: 16px;">
                                <h5 style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px;">Evidencias fotográficas adicionales:</h5>
                                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                                    ${t.screenshots.map((sc, scIdx) => `
                                        <div style="background: #1e293b; padding: 6px; border-radius: 8px;">
                                            <img src="${sc.base64}" style="width: 140px; height: 90px; object-fit: cover; border-radius: 4px; cursor: pointer;" onclick="abrirLightbox('${sc.base64}', '${sc.name}')" title="${sc.name}" />
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Video de la Prueba -->
                        ${t.videoPath ? `
                            <div class="video-section">
                                <div class="video-title">🎥 Grabación Completa de la Prueba:</div>
                                <video controls class="video-player">
                                    <source src="${t.videoPath}" type="video/webm">
                                    Tu navegador no soporta el reproductor de video HTML5.
                                </video>
                            </div>
                        ` : ''}
                    </div>
                </article>
            `).join('')}

            <div class="empty-state" id="emptyState" style="display: none;">
                <h3>🔍 No se encontraron pruebas</h3>
                <p>Intenta ajustar los filtros de búsqueda o restablecer los criterios.</p>
            </div>
        </section>

    </div>

    <!-- Lightbox Modal para Visualizar Capturas en Pantalla Completa -->
    <div class="lightbox-modal" id="lightboxModal" onclick="cerrarLightbox(event)">
        <div class="lightbox-header" onclick="event.stopPropagation()">
            <div class="lightbox-title" id="lightboxTitle">📸 Evidencia de Prueba</div>
            <button class="lightbox-close" onclick="cerrarLightbox()">✕</button>
        </div>
        <div class="lightbox-body" onclick="event.stopPropagation()">
            <button class="lightbox-nav-btn lightbox-nav-prev" onclick="navegarLightbox(-1)">◀</button>
            <img src="" class="lightbox-img" id="lightboxImg" alt="Captura ampliada" />
            <button class="lightbox-nav-btn lightbox-nav-next" onclick="navegarLightbox(1)">▶</button>
        </div>
    </div>

    <script>
        const testsData = ${testsJson};
        let filtroEstadoActual = 'todos';
        let filtroCanalActual = 'todos';
        let filtroPaisActual = 'todos';
        let galeriaActual = [];
        let indexGaleriaActual = 0;

        const flagsSvg = {
            'AR': \`<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#74acdf" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><circle cx="320" cy="240" r="32" fill="#f6b40e"/></svg>\`,
            'BR': \`<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#009b3a" d="M0 0h640v480H0z"/><path fill="#fedf00" d="m320 50 270 190-270 190L50 240z"/><circle cx="320" cy="240" r="75" fill="#002776"/></svg>\`,
            'CL': \`<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#d52b1e" d="M0 240h640v240H0z"/><path fill="#fff" d="M0 0h640v240H0z"/><path fill="#0039a6" d="M0 0h240v240H0z"/><polygon fill="#fff" points="120,45 142,112 213,112 156,153 177,220 120,179 63,220 84,153 27,112 98,112"/></svg>\`,
            'CO': \`<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#fcd116" d="M0 0h640v240H0z"/><path fill="#003893" d="M0 240h640v120H0z"/><path fill="#ce1126" d="M0 360h640v120H0z"/></svg>\`,
            'EC': \`<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#ffdd00" d="M0 0h640v240H0z"/><path fill="#034ea2" d="M0 240h640v120H0z"/><path fill="#ed1c24" d="M0 360h640v120H0z"/><ellipse cx="320" cy="240" rx="34" ry="24" fill="#034ea2"/><ellipse cx="320" cy="240" rx="26" ry="18" fill="#ffdd00"/></svg>\`,
            'VE': \`<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><path fill="#fcd116" d="M0 0h640v160H0z"/><path fill="#003893" d="M0 160h640v160H0z"/><path fill="#ce1126" d="M0 320h640v160H0z"/><circle cx="280" cy="225" r="5" fill="#fff"/><circle cx="305" cy="215" r="5" fill="#fff"/><circle cx="335" cy="215" r="5" fill="#fff"/><circle cx="360" cy="225" r="5" fill="#fff"/><circle cx="265" cy="245" r="5" fill="#fff"/><circle cx="375" cy="245" r="5" fill="#fff"/></svg>\`,
            'LATAM': \`<svg class="flag-icon" viewBox="0 0 640 480" width="28" height="20" style="border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block; vertical-align: middle;"><rect width="640" height="480" fill="#e4002b"/><text x="320" y="290" font-size="160" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="900">KFC</text></svg>\`
        };

        // Construir Resumen Regional Dinámico con Banderas Reales
        function renderizarResumenRegional() {
            const container = document.getElementById('regionalGrid');
            const paises = [
                { nombre: 'Argentina', codigo: 'AR' },
                { nombre: 'Brasil', codigo: 'BR' },
                { nombre: 'Chile', codigo: 'CL' },
                { nombre: 'Colombia', codigo: 'CO' },
                { nombre: 'Ecuador', codigo: 'EC' },
                { nombre: 'Venezuela', codigo: 'VE' }
            ];

            let html = '';
            paises.forEach(p => {
                const testsPais = testsData.filter(t => t.pais.toLowerCase() === p.nombre.toLowerCase());
                if (testsPais.length === 0) return;

                const pasados = testsPais.filter(t => t.status === 'passed').length;
                const fallados = testsPais.filter(t => t.status === 'failed' || t.status === 'timedOut').length;
                const omitidos = testsPais.filter(t => t.status === 'skipped').length;

                let badgeColor = '#ecfdf5';
                let badgeText = '#065f46';
                let estadoLabel = '100% OK';

                if (fallados > 0) {
                    badgeColor = '#fef2f2';
                    badgeText = '#991b1b';
                    estadoLabel = fallados + ' Fallo(s)';
                } else if (omitidos > 0 && pasados === 0) {
                    badgeColor = '#fffbeb';
                    badgeText = '#92400e';
                    estadoLabel = 'Cerrados';
                }

                html += \`
                    <div class="country-pill" onclick="filtrarPais('\${p.nombre.toLowerCase()}', this)">
                        <div class="country-info">
                            <span class="flag-wrapper">\${flagsSvg[p.codigo] || ''}</span>
                            <div>
                                <div class="country-name">\${p.nombre}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">\${testsPais.length} prueba(s)</div>
                            </div>
                        </div>
                        <span class="country-status-badge" style="background: \${badgeColor}; color: \${badgeText};">
                            \${estadoLabel}
                        </span>
                    </div>
                \`;
            });

            container.innerHTML = html;
        }

        function toggleTestCard(idx) {
            const card = document.getElementById('test-card-' + idx);
            if (card) {
                card.classList.toggle('open');
            }
        }

        let todosAbiertos = false;
        function expandirTodos() {
            const cards = document.querySelectorAll('.test-card');
            todosAbiertos = !todosAbiertos;
            cards.forEach(c => {
                if (todosAbiertos) c.classList.add('open');
                else c.classList.remove('open');
            });
            const btn = document.querySelector('.btn-action.btn-primary');
            if (btn) {
                btn.textContent = todosAbiertos ? '📁 Colapsar Todo' : '📂 Expandir Todo';
            }
        }

        function toggleErrorTecnico(idx) {
            const el = document.getElementById('tech-error-' + idx);
            if (el) {
                el.classList.toggle('show');
            }
        }

        function filtrarEstado(estado, btn) {
            filtroEstadoActual = estado;
            document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            ejecutarFiltros();
        }

        function filtrarCanal(canal, btn) {
            filtroCanalActual = canal;
            document.querySelectorAll('[data-filter-channel]').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            ejecutarFiltros();
        }

        function filtrarPais(pais, element) {
            if (filtroPaisActual === pais) {
                filtroPaisActual = 'todos';
                element.style.borderColor = '#e2e8f0';
            } else {
                filtroPaisActual = pais;
                document.querySelectorAll('.country-pill').forEach(el => el.style.borderColor = '#e2e8f0');
                element.style.borderColor = 'var(--kfc-red)';
            }
            ejecutarFiltros();
        }

        function ejecutarFiltros() {
            const busqueda = (document.getElementById('buscador').value || '').toLowerCase().trim();
            const cards = document.querySelectorAll('.test-card');
            let visibles = 0;

            cards.forEach((card, idx) => {
                const test = testsData[idx];
                const cCountry = (card.getAttribute('data-country') || '').toLowerCase();
                const cChannel = (card.getAttribute('data-channel') || '').toLowerCase();
                const cStatus = card.getAttribute('data-status') || '';

                let coincideEstado = (filtroEstadoActual === 'todos') || (cStatus === filtroEstadoActual) || (filtroEstadoActual === 'failed' && cStatus === 'timedOut');
                let coincideCanal = (filtroCanalActual === 'todos') || (cChannel.includes(filtroCanalActual));
                let coincidePais = (filtroPaisActual === 'todos') || (cCountry.includes(filtroPaisActual));

                let coincideTexto = true;
                if (busqueda.length > 0) {
                    const textoTotal = (test.title + ' ' + test.pais + ' ' + test.canal + ' ' + (test.steps ? test.steps.map(s => s.title).join(' ') : '')).toLowerCase();
                    coincideTexto = textoTotal.includes(busqueda);
                }

                if (coincideEstado && coincideCanal && coincidePais && coincideTexto) {
                    card.style.display = 'block';
                    visibles++;
                } else {
                    card.style.display = 'none';
                }
            });

            document.getElementById('emptyState').style.display = visibles === 0 ? 'block' : 'none';
        }

        // Lightbox Modal Functions
        function recolectarGaleria() {
            galeriaActual = [];
            document.querySelectorAll('.step-screenshot-img').forEach(img => {
                galeriaActual.push({
                    src: img.src,
                    title: img.alt || 'Captura de evidencia'
                });
            });
        }

        function abrirLightbox(src, title) {
            recolectarGaleria();
            indexGaleriaActual = galeriaActual.findIndex(item => item.src === src);
            if (indexGaleriaActual === -1) {
                galeriaActual.push({ src, title });
                indexGaleriaActual = galeriaActual.length - 1;
            }

            document.getElementById('lightboxImg').src = src;
            document.getElementById('lightboxTitle').textContent = '📸 ' + (title || 'Evidencia');
            document.getElementById('lightboxModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function cerrarLightbox(e) {
            if (e && e.target && e.target.id !== 'lightboxModal' && !e.target.classList.contains('lightbox-close')) return;
            document.getElementById('lightboxModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        function navegarLightbox(delta) {
            if (galeriaActual.length === 0) return;
            indexGaleriaActual = (indexGaleriaActual + delta + galeriaActual.length) % galeriaActual.length;
            const item = galeriaActual[indexGaleriaActual];
            document.getElementById('lightboxImg').src = item.src;
            document.getElementById('lightboxTitle').textContent = '📸 ' + item.title;
        }

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lightboxModal').classList.contains('active')) {
                if (e.key === 'Escape') cerrarLightbox();
                if (e.key === 'ArrowLeft') navegarLightbox(-1);
                if (e.key === 'ArrowRight') navegarLightbox(1);
            }
        });

        // Inicializar
        renderizarResumenRegional();
    </script>
</body>
</html>`;
    }
}

export default SpanishExecutiveReporter;
