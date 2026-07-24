import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
    console.log("Iniciando Google Chrome en modo persistente...");

    // Ruta donde se creará la carpeta para guardar las cookies y el perfil de Chrome
    const userDataDir = path.join(process.cwd(), 'user_data_chrome');

    // Lanzamos Chrome real (canal 'chrome') evadiendo la bandera de automatización
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        channel: 'chrome', // Usa el Chrome real instalado en Windows/Mac
        args: [
            '--disable-blink-features=AutomationControlled' // Oculta que es controlado por Playwright
        ]
    });

    // En launchPersistentContext la página ya viene creada en el contexto
    const page = context.pages()[0] || await context.newPage();

    await page.goto("https://kfc-ec-devops5-artisn.vercel.app");

    console.log("\n========================================================");
    console.log("👉 INSTRUCCIONES:");
    console.log("1. Inicia sesión con Google en la ventana de Chrome que se abrió.");
    console.log("2. Una vez que hayas iniciado sesión y veas tu perfil cargado...");
    console.log("3. Regresa a esta consola y presiona ENTER.");
    console.log("========================================================\n");

    // Esperar a que presiones ENTER tras hacer login
    await new Promise(resolve => process.stdin.once('data', resolve));

    console.log("✅ Perfil y sesión guardados correctamente en la carpeta 'user_data_chrome'.");

    await context.close();
    process.exit(0);
})();