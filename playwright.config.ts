import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/flujo*.js',
  testIgnore: ['**/pages/**', '**/data/**'],
  timeout: 240000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report/tecnico' }],
    ['./utils/reporters/spanish-executive-reporter.js', {
      outputFile: './playwright-report/informe-ejecutivo.html',
      titulo: 'Reporte Ejecutivo de Pruebas E2E - KFC LATAM'
    }],
    ['list']
  ],
  use: {
    baseURL: 'https://kfc-ec-devops5-artisn.vercel.app/',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});

