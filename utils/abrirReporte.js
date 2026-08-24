import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const reportPath = path.resolve(process.cwd(), 'playwright-report', 'informe-ejecutivo.html');

if (!fs.existsSync(reportPath)) {
    console.log(`\n⚠️ No se encontró el informe ejecutivo en: ${reportPath}`);
    console.log(`Por favor ejecuta primero tus pruebas (por ejemplo: npm run test:ecuador:pickup o npm run test:regional).\n`);
    process.exit(1);
}

console.log(`\n🚀 Abriendo Informe Ejecutivo en tu navegador predeterminado: ${reportPath}\n`);

const command = process.platform === 'win32'
    ? `start "" "${reportPath}"`
    : process.platform === 'darwin'
        ? `open "${reportPath}"`
        : `xdg-open "${reportPath}"`;

exec(command, (error) => {
    if (error) {
        console.error(`Error al intentar abrir el reporte: ${error.message}`);
    }
});
