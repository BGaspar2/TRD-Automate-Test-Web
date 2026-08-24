# TRD-Automate-Test-Web

Automatización de pruebas E2E multi-país para los flujos de compra, tienda y checkout de **KFC LATAM** utilizando **Playwright Test Runner** y la arquitectura **Page Object Model (POM)**.

---

## 🌎 Cobertura Regional LATAM

La suite automatiza el flujo completo de compra en usuario anónimo para **6 países** en los canales de **Delivery (A Domicilio)** y **Pickup (Retiro en Tienda)**:

| País | Carpeta | Canal Pickup (Búsqueda / Tienda) | Canal Delivery (Ubicación) | Documento ID / Registro | URL Base |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **🇦🇷 Argentina** | `tests/argentina/` | `alto palermo` / `CC KFC ALTO PALERMO` | `Av. Corrientes 1234` | DNI / Cédula (`30123456`) | `https://kfc-ar-env-develop-artisn.vercel.app/` |
| **🇧🇷 Brasil** | `tests/brasil/` | `vila olimpa` / `KFC VILA OLIMPIA` | `Av. Paulista 1000` | CPF (`12345678901`) | `https://kfc-br-env-develop-artisn.vercel.app/` |
| **🇨🇱 Chile** | `tests/chile/` | `guarida vieja` / `KFC GUARDIA VIEJA` | `Guardia Vieja 255` | RUT (`12345678-9`) | `https://kfc-cl-devops5-artisn.vercel.app/` |
| **🇨🇴 Colombia** | `tests/colombia/` | `toberin` / `KFC TOBERIN` | `Toberin` | Cédula (`1012345678`) | `https://kfc-co-devops5-artisn.vercel.app/` |
| **🇪🇨 Ecuador** | `tests/ecuador/` | `el inca` / `KFC EL INCA` | `Av. El Inca` | Cédula (`1712345678`) | `https://kfc-ec-devops5-artisn.vercel.app/` |
| **🇻🇪 Venezuela** | `tests/venezuela/` | `sabana grande` / `KFC SABANA GRANDE` | `Sabana Grande` | Cédula (`V12345678`) | `https://kfc-ve-devops5-artisn.vercel.app/` |

---

## 🚀 Características y Estrategia de Selección Resiliente

- **Arquitectura Page Object Model (POM):** Separación modular de locators, datos de prueba y lógica por páginas (`HomePage`, `MenuPage`, `CartPage`, `CheckoutPage`).
- **Paso a Paso de Negocio con Capturas Automáticas:** Integración mediante `ejecutarPaso(...)` que captura evidencia fotográfica en cada etapa del flujo (Ubicación, Selección de Producto, Carrito y Checkout).
- **Ejecución Regional Resiliente:** La suite regional ejecuta todos los países de forma secuencial pero independiente; si un país falla, se registra la evidencia y continúa con los siguientes países sin detener la suite.
- **Soporte Bicanal (Delivery & Pickup):** Pruebas ajustadas según las particularidades de cada modo (mapas, listados de tiendas, datos de envío o retiro directo).
- **Selección Directa de Tienda en React:** Disparo de eventos nativos sintéticos (`__reactProps`) e interacción resiliente con los elementos de la tienda para activar los manipuladores globales (`moveCartHandler` / `selectStoreHandler`).
- **Análisis Dinámico de Modificadores (Fracción X / Y):** Cálculo automático de opciones faltantes en grupos obligatorios (ej. `1 / 2` o `0 / 1`), agregando ítems dinámicamente hasta erradicar la alerta *"Debes escoger N opciones"*.
- **Ajuste de Monto Mínimo de Carrito:** Validación automática del total del carrito contra el umbral mínimo del país, incrementando cantidades si no se alcanza el mínimo para ir a pagar.
- **Preservación de Google Maps & Geocoding:** Conservación del texto completo de dirección para evitar rechazos en las sugerencias de la API de geolocalización.
- **Formularios de Checkout Adaptativos:** Manejo inteligente de datos personales (Nombre, Apellido, Email, Celular con prefijos nacionales válidos como `9` en Argentina) y método de pago (Efectivo/Digital).

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
│   ├── flujoRegionalAnonimo.js   # SUITE MÁSTER REGIONAL (Ejecución LATAM independiente)
│   ├── argentina/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   └── pickup/flujoAnonimoPickup.js
│   ├── brasil/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   └── pickup/flujoAnonimoPickup.js
│   ├── chile/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   ├── delivery/flujoAnonimoDel.js
│   │   └── pickup/flujoAnonimoPickup.js
│   ├── colombia/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   ├── delivery/flujoAnonimoDel.js
│   │   └── pickup/flujoAnonimoPickup.js
│   ├── ecuador/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   ├── delivery/flujoAnonimoDel.js
│   │   └── pickup/flujoAnonimoPickup.js
│   ├── venezuela/
│   │   ├── data/testData.js
│   │   ├── pages/ (HomePage, MenuPage, CartPage, CheckoutPage)
│   │   ├── delivery/flujoAnonimoDel.js
│   │   └── pickup/flujoAnonimoPickup.js
│   ├── auth.js                   # Autenticación persistente
│   └── flujoRegistradoDel.js     # Flujo E2E usuario registrado
├── utils/
│   ├── pasos.js                  # Helper de pasos de negocio y capturas de pantalla
│   ├── abrirReporte.js           # Script para abrir informe ejecutivo en el navegador
│   └── reporters/
│       └── spanish-executive-reporter.js # Custom Reporter oficial en Español
├── playwright.config.ts          # Configuración del Runner de Playwright
├── package.json
└── README.md
```

---

## ⚙️ Ejecución de Pruebas

### 1. Ejecutar Suite Regional LATAM (Todos los Países)

- **Modo Visible (Headed):**
  ```bash
  npm run test:regional
  ```

- **Modo Headless (Sin Interfaz):**
  ```bash
  npm run test:regional:headless
  ```

---

### 2. Ejecutar Pruebas por País y Canal

#### 🇦🇷 Argentina
- **Pickup:**
  ```bash
  npm run test:argentina:pickup
  ```

#### 🇧🇷 Brasil
- **Pickup:**
  ```bash
  npm run test:brasil:pickup
  ```

#### 🇨🇱 Chile
- **Delivery:**
  ```bash
  npm run test:chile
  ```
- **Pickup:**
  ```bash
  npm run test:chile:pickup
  ```

#### 🇨🇴 Colombia
- **Delivery:**
  ```bash
  npm run test:colombia
  ```
- **Pickup:**
  ```bash
  npm run test:colombia:pickup
  ```

#### 🇪🇨 Ecuador
- **Delivery:**
  ```bash
  npm run test:ecuador
  ```
- **Pickup:**
  ```bash
  npm run test:ecuador:pickup
  ```

#### 🇻🇪 Venezuela
- **Delivery:**
  ```bash
  npm run test:venezuela
  ```
- **Pickup:**
  ```bash
  npm run test:venezuela:pickup
  ```

---

## 📊 Informes de Pruebas (Reportes en Español y Paso a Paso)

El proyecto cuenta con un sistema de reportes enriquecido diseñado tanto para **equipos técnicos (QA/Desarrollo)** como para **perfiles de negocio y no técnicos (Product Managers, Stakeholders, Gerencia)**.

### 🌟 1. Informe Ejecutivo en Español (Recomendado para Negocio y QA)

Genera un dashboard visual, moderno y 100% en español que incluye:
- **Resumen Ejecutivo (KPIs):** Tasa de éxito global (%), pruebas aprobadas, fallidas, omitidas y duración total.
- **Matriz de Cobertura Regional con Banderas Oficiales SVG:** Indicadores de salud en tiempo real por país (🇦🇷 AR, 🇧🇷 BR, 🇨🇱 CL, 🇨🇴 CO, 🇪🇨 EC, 🇻🇪 VE) y por canal (🛵 Delivery, 🛍️ Pickup).
- **Paso a Paso Visual con Capturas (Screenshots):** Cada prueba muestra la cronología de pasos de negocio con su duración, estado y **fotografía de evidencia** en alta resolución.
- **Visor Lightbox Integrado:** Haz clic en cualquier captura para verla en pantalla completa, hacer zoom y navegar con flechas paso a paso como una galería secuencial.
- **Reproductor de Video Embebido:** Visualiza el video completo de la navegación directamente en el informe sin necesidad de abrir archivos locales.
- **Explicación Amigable de Errores:** En caso de fallos, explica el motivo en lenguaje natural claro (ej: local cerrado, lentitud de red), manteniendo una sección técnica colapsable para desarrolladores.
- **Filtros Dinámicos y Búsqueda:** Filtra por país, canal, resultado y busca por texto al instante.
- **Exportación a PDF / Imprimir:** Botón optimizado para generar minutas o reportes ejecutivos listos para compartir.

Para abrir el **Informe Ejecutivo** tras ejecutar tus pruebas:
```bash
npm run report:ejecutivo
```
*(O abre directamente el archivo `playwright-report/informe-ejecutivo.html` en cualquier navegador).*

---

### 🔧 2. Informe Técnico Nativo de Playwright

Para inspeccionar trazas profundas, árbol de red y detalles de bajo nivel:
```bash
npm run report:tecnico
```
*(O mediante `npx playwright show-report playwright-report/tecnico`).*
