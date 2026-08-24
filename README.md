# TRD-Automate-Test-Web

Suite de automatización de pruebas de extremo a extremo (**E2E**) multi-país para los flujos de compra, tienda, registro y checkout de **KFC LATAM**, construida sobre **Playwright Test Runner** y bajo el patrón de arquitectura **Page Object Model (POM)**.

---

## 🌎 Cobertura Regional LATAM

La suite automatiza los flujos clave de usuario anónimo y registrado para **6 países** en los canales de **Delivery (A Domicilio)** y **Pickup (Retiro en Tienda)**:

| País | Carpeta | Canal Pickup (Búsqueda / Tienda) | Canal Delivery (Ubicación) | Métodos de Pago Automatizados | Documento ID | URL Base |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **🇨🇴 Colombia** | `tests/colombia/` | `toberin` / `KFC TOBERIN` | `Toberin, Bogotá` | • Datáfono<br>• Efectivo (Monto Exacto)<br>• Efectivo (Con Cambio) | Cédula (`1012345678`) | [kfc-co-devops5](https://kfc-co-devops5-artisn.vercel.app/) |
| **🇪🇨 Ecuador** | `tests/ecuador/` | `el inca` / `KFC EL INCA` | `Av. El Inca, Quito` | • Punto de Venta<br>• Efectivo (Monto Exacto)<br>• Efectivo (Con Cambio) | Cédula (`1712345678`) | [kfc-ec-devops5](https://kfc-ec-devops5-artisn.vercel.app/) |
| **🇻🇪 Venezuela** | `tests/venezuela/` | `sabana grande` / `KFC SABANA GRANDE` | `Sabana Grande, Caracas` | • Punto de Venta<br>• Efectivo (Monto Exacto)<br>• Efectivo (Con Cambio) | Cédula (`V12345678`) | [kfc-ve-devops5](https://kfc-ve-devops5-artisn.vercel.app/) |
| **🇨🇱 Chile** | `tests/chile/` | `guarida vieja` / `KFC GUARDIA VIEJA` | `Guardia Vieja 255, Providencia` | • Efectivo / POS | RUT (`12345678-9`) | [kfc-cl-devops5](https://kfc-cl-devops5-artisn.vercel.app/) |
| **🇦🇷 Argentina** | `tests/argentina/` | `alto palermo` / `CC KFC ALTO PALERMO` | `Av. Corrientes 1234, CABA` | • Efectivo / POS | DNI (`30123456`) | [kfc-ar-develop](https://kfc-ar-env-develop-artisn.vercel.app/) |
| **🇧🇷 Brasil** | `tests/brasil/` | `vila olimpa` / `KFC VILA OLIMPIA` | `Av. Paulista 1000, SP` | • Dinheiro / Cartão | CPF (`12345678901`) | [kfc-br-develop](https://kfc-br-env-develop-artisn.vercel.app/) |

---

## 💳 Flujo E2E de Pago y Confirmación de Órdenes

La suite implementa un flujo integral de creación de orden y confirmación de pago para compras a domicilio:

1. **Selección Multi-Método de Pago:**
   - **Punto de Venta / Datáfono:** Selección resiliente mediante cálculo de coordenadas físicas sobre el radio button y disparadores de estado React (`__reactProps`).
   - **Efectivo (Monto Exacto):** Activación del switch *"Pagar con valor total"* para enviar la orden con el monto exacto del carrito.
   - **Efectivo (Con Cambio):** Desactivación automática del switch de valor total e ingreso dinámico de un monto mayor al total de la compra (ej. `$50.00` en Ecuador, `$100.000` en Colombia).
2. **Aseguramiento de Facturación:**
   - Verificación y marcado garantizado de la casilla *"Utilizar mi información para la facturación"*, previniendo bloqueos por formularios fiscales incompletos.
3. **Captura y Extracción del Código de Pedido:**
   - **Intercepción de Red (API Monitoring):** Escucha y captura de payloads de respuesta de endpoints de checkout (`/order`, `/checkout`, `/orders`).
   - **Inspección del DOM:** Extracción de códigos con patrones oficiales (ej. `0000011546-010101`).
4. **Scroll y Evidencia Fotográfica Centrada:**
   - Desplazamiento físico suave (`mouse.wheel`) y alineación visual centrada de la tarjeta de pedido (restaurante, datos de entrega, total y código) para las evidencias del reporte.

---

## 🔐 Flujo de Registro de Usuario y Validación OTP

- Generación dinámica de cuentas de correo temporales vía API (`GuerrillaMail` / `1secmail`).
- Llenado automático de formulario de registro de usuario nuevo con prefijos telefónicos nacionales válidos.
- Consulta en tiempo real a la bandeja de entrada, extracción del **código OTP de 6 dígitos** e ingreso automatizado en la pantalla de verificación.

---

## 📁 Estructura del Proyecto

```text
TRD-Automate-Test-Web/
├── tests/
│   ├── flujoRegionalAnonimo.js       # Suite máster regional E2E (Ejecución LATAM independiente)
│   ├── flujoRegistroOtp.js           # Suite máster regional de registro OTP
│   ├── colombia/
│   │   ├── data/testData.js          # Direcciones, métodos de pago y cliente CO
│   │   ├── pages/                    # HomePage, MenuPage, CartPage, CheckoutPage CO
│   │   ├── delivery/flujoAnonimoDel.js # 3 pruebas independientes (Datáfono, Efectivo Exacto, Efectivo Cambio)
│   │   ├── pickup/flujoAnonimoPickup.js
│   │   └── auth/flujoRegistroOtp.js
│   ├── ecuador/
│   │   ├── data/testData.js          # Direcciones, métodos de pago y cliente EC
│   │   ├── pages/                    # HomePage, MenuPage, CartPage, CheckoutPage EC
│   │   ├── delivery/flujoAnonimoDel.js # 3 pruebas independientes (POS, Efectivo Exacto, Efectivo Cambio)
│   │   ├── pickup/flujoAnonimoPickup.js
│   │   └── auth/flujoRegistroOtp.js
│   ├── venezuela/
│   │   ├── data/testData.js          # Direcciones, métodos de pago y cliente VE
│   │   ├── pages/                    # HomePage, MenuPage, CartPage, CheckoutPage VE
│   │   ├── delivery/flujoAnonimoDel.js # 3 pruebas independientes (POS, Efectivo Exacto, Efectivo Cambio)
│   │   ├── pickup/flujoAnonimoPickup.js
│   │   └── auth/flujoRegistroOtp.js
│   ├── chile/                        # Tests y páginas Chile
│   ├── argentina/                    # Tests y páginas Argentina
│   └── brasil/                       # Tests y páginas Brasil
├── utils/
│   ├── pasos.js                      # Helper de pasos de negocio y capturas de pantalla
│   ├── abrirReporte.js               # Script para abrir informe ejecutivo en el navegador
│   ├── tempEmailService.js           # Servicio de generación de correos y lectura de OTP
│   └── reporters/
│       └── spanish-executive-reporter.js # Reporter oficial ejecutivo en Español
├── playwright.config.ts              # Configuración global de Playwright
├── package.json
└── README.md
```

---

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/BGaspar2/TRD-Automate-Test-Web.git
   cd aut-test
   npm install
   npx playwright install
   ```

---

## ⚙️ Ejecución de Pruebas

### 1. 🇨🇴 Colombia (Delivery & Pickup)

```bash
# Suite completa de Delivery (Tarjeta, Datáfono, Efectivo Exacto, Efectivo Cambio):
npm run test:colombia

# Pruebas individuales por método de pago:
npm run test:colombia:tarjeta
npm run test:colombia:datafono
npm run test:colombia:efectivo:exacto
npm run test:colombia:efectivo:cambio

# Retiro en tienda (Pickup) y Registro OTP:
npm run test:colombia:pickup
npm run test:colombia:registro
```

---

### 2. 🇪🇨 Ecuador (Delivery & Pickup)

```bash
# Suite completa de Delivery (Tarjeta, Punto de Venta, Efectivo Exacto, Efectivo Cambio):
npm run test:ecuador

# Pruebas individuales por método de pago:
npm run test:ecuador:tarjeta
npm run test:ecuador:pos
npm run test:ecuador:efectivo:exacto
npm run test:ecuador:efectivo:cambio

# Retiro en tienda (Pickup) y Registro OTP:
npm run test:ecuador:pickup
npm run test:ecuador:registro
```

---

### 3. 🇻🇪 Venezuela (Delivery & Pickup)

```bash
# Suite completa de Delivery (Punto de Venta, Efectivo Exacto, Efectivo Cambio):
npm run test:venezuela

# Pruebas individuales por método de pago:
npm run test:venezuela:pos
npm run test:venezuela:efectivo:exacto
npm run test:venezuela:efectivo:cambio

# Retiro en tienda (Pickup) y Registro OTP:
npm run test:venezuela:pickup
npm run test:venezuela:registro
```

---

### 4. 🇨🇱 Chile, 🇦🇷 Argentina y 🇧🇷 Brasil

```bash
# Chile (Delivery con Tarjeta y Efectivo, Pickup y Registro):
npm run test:chile:tarjeta
npm run test:chile
npm run test:chile:pickup
npm run test:chile:registro

# Argentina
npm run test:argentina:pickup
npm run test:argentina:registro

# Brasil
npm run test:brasil:pickup
npm run test:brasil:registro
```

---

### 5. 🚀 Ejecución Conjunta de los 3 Países con Pagos (CO, EC, VE)

Para ejecutar secuencialmente los **9 casos de prueba** (3 métodos de pago para cada uno de los 3 países):

```bash
# Modo Visible con navegador abierto:
npm run test:delivery:pagos

# Modo Headless (en segundo plano):
npm run test:delivery:pagos:headless
```

---

### 6. 🌐 Suites Regionales LATAM (Multi-País)

```bash
# Compras Anónimas en toda la región (Modo Visible / Headless):
npm run test:regional
npm run test:regional:headless

# Registro OTP en toda la región:
npm run test:regional:registro
npm run test:regional:registro:headless
```

---

## 📊 Informes y Reportes de Resultados

### 🌟 1. Informe Ejecutivo Oficial en Español

Genera un dashboard visual con enfoque directivo y de calidad:
- **Resumen de KPIs:** Tasa de éxito global (%), pruebas aprobadas, fallidas, omitidas y tiempos.
- **Códigos de Orden y Métodos de Pago:** Indicador visual `💳 [Método de Pago]` y banner `🧾 Orden: [Código de Pedido]` por cada caso.
- **Paso a Paso con Capturas de Pantalla:** Registro fotográfico cronológico en alta resolución con lightbox integrado.
- **Reproductor de Video Embebido:** Reproducción de la grabación de la sesión sin descargar archivos.
- **Exportación a PDF / Imprimir:** Generación directa de reportes compartibles.

Para abrir el **Informe Ejecutivo**:
```bash
npm run report:ejecutivo
```
*(O abrir directamente `playwright-report/informe-ejecutivo.html` en el navegador).*

---

### 🔧 2. Informe Técnico de Playwright

Para depuración profunda de selectores, consola de red y trazas:
```bash
npm run report:tecnico
```
