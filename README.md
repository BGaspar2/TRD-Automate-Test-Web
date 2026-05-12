# TRD-Automate-Test-Web

Automatización de pruebas E2E para el flujo de checkout de KFC (Ecuador).

## Características
- Pruebas realizadas con **Playwright**.
- Flujo completo: Selección de tienda -> Selección de productos -> Checkout como invitado -> Pago en efectivo.
- Manejo de estados intermedios (`status=processing`).
- Extracción del código de pedido real (`seqval`) desde el panel de detalles.
- Grabación de video y screenshots de cada ejecución.

## Requisitos
- Node.js (v16+)
- Playwright

## Instalación
```bash
npm install
npx playwright install
```

## Ejecución de Pruebas
Para ejecutar el test de Ecuador con efectivo:
```bash
npx playwright test tests/ecuador/checkout-cash.spec.ts
```

Los resultados (videos y screenshots) se guardarán en la carpeta `test-results/`.
