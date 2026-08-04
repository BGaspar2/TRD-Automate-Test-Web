# TRD-Automate-Test-Web

Automatización de pruebas E2E multi-país para los flujos de compra y checkout de **KFC LATAM** utilizando **Playwright Test Runner** y la arquitectura **Page Object Model (POM)**.

---

## 🌎 Cobertura Regional LATAM

La suite automatiza el flujo completo de compra a domicilio en usuario anónimo para **Ecuador**, **Chile**, **Colombia** y **Venezuela**:

| País | Carpeta | Búsqueda de Ubicación | Documento ID | URL Base |
| :--- | :--- | :--- | :--- | :--- |
| **🇪🇨 Ecuador** | `tests/ecuador/` | `Av. El Inca` | Cédula (`1712345678`) | `https://kfc-ec-devops5-artisn.vercel.app/` |
| **🇨🇱 Chile** | `tests/chile/` | `Guardia Vieja 255` | RUT (`12345678-9`) | `https://kfc-cl-devops5-artisn.vercel.app/` |
| **🇨🇴 Colombia** | `tests/colombia/` | `Toberin` | Cédula (`1012345678`) | `https://kfc-co-devops5-artisn.vercel.app/` |
| **🇻🇪 Venezuela** | `tests/venezuela/` | `Sabana Grande` | Cédula (`V12345678`) | `https://kfc-ve-devops5-artisn.vercel.app/` |

---

## 🚀 Características y Estrategia de Selección Resiliente

- **Arquitectura Page Object Model (POM):** Separación modular de locators, datos de prueba y lógica por páginas (`HomePage`, `MenuPage`, `CartPage`, `CheckoutPage`).
- **Suite Máster Regional:** Ejecución secuencial o paralela de todos los países en una sola corrida (`tests/flujoRegionalAnonimo.js`).
- **Selección Inteligente de Checkout (`OrderTotal`):** Detección dinámica entre botones móviles y de escritorio para evitar fallos por elementos ocultos (`hidden`).
- **Preservación de Google Maps:** Conservación automática del texto completo de la dirección asignado por Google Maps para evitar rechazo de cobertura en la API de la tienda.
- **Disparo de Eventos React Nativos:** Emisión de eventos `input`, `change` y `blur` para notificar a React Hook Form y garantizar la habilitación de los botones de envío.
- **Escáner Dinámico de DOM (0 ms):** Verificación con `count()` instantáneo de los elementos `<input>` y `<textarea>` realmente presentes en cada país.

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

```text
TRD-Automate-Test-Web/
├── tests/
│   ├── flujoRegionalAnonimo.js   # SUITE MÁSTER REGIONAL (Ejecuta EC, CL, CO, VE)
│   ├── ecuador/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   └── flujoAnonimoDel.js
│   ├── chile/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   └── flujoAnonimoDel.js
│   ├── colombia/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   └── flujoAnonimoDel.js
│   ├── venezuela/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   └── flujoAnonimoDel.js
│   ├── auth.js                   # Script para autenticación persistente
│   └── flujoRegistradoDel.js     # Flujo E2E para usuario registrado
├── playwright.config.ts          # Configuración del Runner de Playwright
├── package.json
└── README.md
```

---

## ⚙️ Ejecución de Pruebas

### 1. Ejecutar Suite Regional LATAM (Todos los Países)

- **Modo Visible (Recomendado):**
  ```bash
  npm run test:regional
  ```
  *o directamente:*
  ```bash
  npx playwright test tests/flujoRegionalAnonimo.js --headed
  ```

- **Modo Headless (Sin interfaz):**
  ```bash
  npm run test:regional:headless
  ```

---

### 2. Ejecutar Pruebas por País Individual

- **Ecuador:**
  ```bash
  npm run test:ecuador
  ```
- **Chile:**
  ```bash
  npm run test:chile
  ```
- **Colombia:**
  ```bash
  npm run test:colombia
  ```
- **Venezuela:**
  ```bash
  npm run test:venezuela
  ```

---

## 📊 Ver Reportes HTML

Después de la ejecución, puedes visualizar el reporte gráfico interactivo de Playwright:
```bash
npx playwright show-report
```
