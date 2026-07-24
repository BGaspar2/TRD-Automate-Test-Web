# TRD-Automate-Test-Web

Automatización de pruebas E2E para el flujo de compra y checkout de KFC (Ecuador) utilizando **Playwright Test Runner**.

---

## 🚀 Características

- **Pruebas End-to-End con Playwright Test Runner:** Cobertura de flujos completos utilizando la sintaxis oficial de `@playwright/test`.
- **Soporte para Usuario Anónimo e Invitado:** Automatización del proceso de compra sin iniciar sesión.
- **Soporte para Usuario Registrado:** Manejo de sesiones persistentes con Google (`user_data_chrome`).
- **Validaciones Dinámicas:**
  - Selección inteligente de modificadores obligatorios en combos y productos.
  - Verificación condicional de dirección y datos de facturación guardados.
- **Grabación de Video y Reportes:** Generación automática de videos `.webm` y reportes HTML de Playwright.

---

## 📋 Requisitos Previos

- **Node.js** (v18 o superior recomendado)
- **Google Chrome** instalado

---

## 🛠️ Instalación

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   npx playwright install
   ```

---

## 📁 Estructura del Proyecto

```
TRD-Automate-Test-Web/
├── tests/
│   ├── auth.js                 # Script interactivo para iniciar sesión en Google
│   ├── flujoAnonimoDel.js       # Test E2E Playwright a domicilio para usuario anónimo
│   └── flujoRegistradoDel.js    # Test E2E Playwright a domicilio para usuario registrado
├── playwright.config.ts        # Configuración del Runner de Playwright
├── package.json
└── README.md
```

---

## ⚙️ Ejecución de Pruebas

### 1. Autenticación (Solo primera vez para usuario registrado)
Para guardar la sesión de Google en la carpeta `user_data_chrome`:
```bash
node .\tests\auth.js
```
> *Sigue las instrucciones en la consola para iniciar sesión manualmente en la ventana de Chrome y presiona Enter.*

---

### 2. Ejecutar Pruebas con Playwright Test Runner (`npx playwright test`)

- **Ejecutar todos los tests:**
  ```bash
  npx playwright test
  ```

- **Ejecutar en modo visible (con navegador abierto):**
  ```bash
  npx playwright test --headed
  ```

- **Ejecutar un flujo específico:**
  - *Flujo Anónimo:*
    ```bash
    npx playwright test tests/flujoAnonimoDel.js --headed
    ```
  - *Flujo Registrado:*
    ```bash
    npx playwright test tests/flujoRegistradoDel.js --headed
    ```

---

### 📊 Ver Reportes HTML
Después de la ejecución, puedes visualizar el reporte interactivo de Playwright:
```bash
npx playwright show-report
```
