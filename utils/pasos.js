import { test } from '@playwright/test';

/**
 * Ejecuta un paso de negocio en la prueba, registrándolo en Playwright test.step
 * y adjuntando automáticamente una captura de pantalla de evidencia al reporte.
 *
 * @param {import('@playwright/test').Page} page - Instancia de Page de Playwright
 * @param {import('@playwright/test').TestInfo} [testInfo] - Fixture testInfo de Playwright
 * @param {{ numero?: number, titulo: string, descripcion?: string } | string} pasoInfo - Metadatos del paso
 * @param {() => Promise<void>} accion - Función asíncrona que ejecuta las acciones del Page Object
 */
export async function ejecutarPaso(page, testInfo, pasoInfo, accion) {
    const tituloNormalizado = typeof pasoInfo === 'string' 
        ? pasoInfo 
        : (pasoInfo.numero ? `Paso ${pasoInfo.numero}: ${pasoInfo.titulo}` : pasoInfo.titulo);
    
    const descripcion = typeof pasoInfo === 'object' && pasoInfo.descripcion ? pasoInfo.descripcion : '';

    return await test.step(tituloNormalizado, async () => {
        try {
            console.log(`\n▶️ [INICIO PASO] ${tituloNormalizado}${descripcion ? ` (${descripcion})` : ''}`);
            await accion();

            // Captura de pantalla de evidencia al finalizar el paso con éxito
            if (page && !page.isClosed()) {
                const screenshotBuffer = await page.screenshot({ fullPage: false, timeout: 5000 }).catch(() => null);
                if (screenshotBuffer && testInfo && typeof testInfo.attach === 'function') {
                    await testInfo.attach(`📸 Evidencia - ${tituloNormalizado}`, {
                        body: screenshotBuffer,
                        contentType: 'image/png'
                    });
                }
            }
            console.log(`✅ [PASO EXITOSO] ${tituloNormalizado}`);
        } catch (error) {
            console.error(`❌ [PASO FALLIDO] ${tituloNormalizado}: ${error.message}`);
            // Captura de pantalla del estado en que ocurrió el error
            if (page && !page.isClosed()) {
                const errorScreenshot = await page.screenshot({ fullPage: false, timeout: 5000 }).catch(() => null);
                if (errorScreenshot && testInfo && typeof testInfo.attach === 'function') {
                    await testInfo.attach(`🚨 Fallo en ${tituloNormalizado}`, {
                        body: errorScreenshot,
                        contentType: 'image/png'
                    });
                }
            }
            throw error;
        }
    });
}
