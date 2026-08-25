# TRD-Automate-Test-Web

Suite de automatización de pruebas de extremo a extremo (**E2E**) multi-país para los flujos de compra, tienda, registro y checkout de **KFC LATAM**, construida sobre **Playwright Test Runner** y bajo el patrón de arquitectura **Page Object Model (POM)**.

---

## 🌎 Cobertura Regional LATAM

La suite automatiza los flujos clave de usuario anónimo y registrado para **6 países** en los canales de **Delivery (A Domicilio)** y **Pickup (Retiro en Tienda)**:

| País | Carpeta | Canal Pickup (Búsqueda / Tienda) | Canal Delivery (Ubicación) | Métodos de Pago Automatizados | Documento ID | URL Base |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **🇨🇴 Colombia** | `tests/colombia/` | `toberin` / `KFC TOBERIN` | `Toberin, Bogotá` | • Tarjeta Débito / Crédito<br>• Datáfono<br>• Efectivo (Monto Exacto)<br>• Efectivo (Con Cambio) | Cédula (`1012345678`) | [kfc-co-devops5](https://kfc-co-devops5-artisn.vercel.app/) |
| **🇪🇨 Ecuador** | `tests/ecuador/` | `el inca` / `KFC EL INCA` | `Av. El Inca, Quito` | • Tarjeta Débito / Crédito<br>• Punto de Venta<br>• Efectivo (Monto Exacto)<br>• Efectivo (Con Cambio) | Cédula (`1712345678`) | [kfc-ec-devops5](https://kfc-ec-devops5-artisn.vercel.app/) |
| **🇻🇪 Venezuela** | `tests/venezuela/` | `sabana grande` / `KFC SABANA GRANDE` | `Sabana Grande, Caracas` | • Punto de Venta<br>• Efectivo (Monto Exacto)<br>• Efectivo (Con Cambio) | Cédula (`V12345678`) | [kfc-ve-devops5](https://kfc-ve-devops5-artisn.vercel.app/) |
| **🇨🇱 Chile** | `tests/chile/` | `guarida vieja` / `KFC GUARDIA VIEJA` | `Guardia Vieja 255, Providencia` | • Tarjeta Débito / Crédito<br>• Efectivo / POS | RUT (`12345678-9`) | [kfc-cl-devops5](https://kfc-cl-devops5-artisn.vercel.app/) |
| **🇦🇷 Argentina** | `tests/argentina/` | `alto palermo` / `CC KFC ALTO PALERMO` | `Av. Corrientes 1234, CABA` | • Tarjeta Débito / Crédito<br>• Efectivo / POS | DNI (`30123456`) | [kfc-ar-develop](https://kfc-ar-env-develop-artisn.vercel.app/) |
| **🇧🇷 Brasil** | `tests/brasil/` | `vila olimpa` / `KFC VILA OLIMPIA` | `Av. Paulista 1000, SP` | • Dinheiro / Cartão | CPF (`12345678901`) | [kfc-br-develop](https://kfc-br-env-develop-artisn.vercel.app/) |

---

## 💳 Contexto de Tarjetas y Pasarelas de Pago (Débito / Crédito)

La automatización incorpora soporte integral para pruebas de pago con tarjeta en pasarelas integradas (Kushki, Webpay/Transbank, etc.), manejando modales dinámicos, iframes y sincronización con el estado de React:

### 1. Datos de Tarjetas de Prueba por País (`testData.js`)

| País | Tipo / Red | Número de Tarjeta | Expiración | CVV | Nombre Titular | Documento |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **🇨🇴 Colombia** | Visa (Test) | `4111 1111 1111 1111` | `01/30` | `123` | `APRO APRO` | `123456789` |
| **🇪🇨 Ecuador** | Visa (Test) | `4111 1111 1111 1111` | `01/30` | `123` | `APRO APRO` | `123456789` |
| **🇨🇱 Chile** | Webpay / Transbank | `4013 5406 8274 6260` | `01/30` | `123` | `APRO APRO` | `12345678-9` |
| **🇦🇷 Argentina** | Visa (Test) | `4075 5957 1648 3764` | `01/30` | `123` | `APRO APRO` | `30123456` |

### 2. Flujo Automatizado de Agregar y Procesar Tarjeta

El Page Object `CheckoutPage` gestiona de manera resiliente el flujo completo de pago con tarjeta:

1. **Selección Jerárquica de Método:**
   - Selección del radio button principal `"Tarjeta"`.
   - Selección del sub-radio button `"Débito / Crédito"`, calculando coordenadas físicas del círculo interactivo y disparando eventos a nivel de React Fiber (`__reactProps` / `__reactFiber`).
2. **Apertura del Formulario de Tarjeta:**
   - Detección y clic robusto sobre el botón `"➕ Nueva tarjeta"` / `"Agregar tarjeta"`.
   - Resolución automática de contexto: detección de si el formulario vive en un `Modal` del DOM o dentro de un `iframe` externo de pasarela (Kushki / Webpay / PayU).
3. **Llenado Secuencial y Disparo de Eventos React:**
   - Ingreso del **Número de Tarjeta**, **Mes (MM)**, **Año (YYYY/YY)** y **CVV** mediante `pressSequentially` para respetar las máscaras de entrada.
   - Inyección de respaldo con React Native Setter (`HTMLInputElement.prototype`) disparando eventos `input`, `change` y `blur` para actualizar React Hook Form.
4. **Vinculación de Datos y Guardado:**
   - Verificación y marcado del checkbox *"Utilizar mismos datos de la compra"*.
   - Guardado de tarjeta (`"Guardar tarjeta"`), esperando el cierre limpio del modal.
   - Aseguramiento de la casilla de facturación antes del envío final de la orden.

---

## 💵 Flujo E2E de Pago y Confirmación de Órdenes

La suite implementa un flujo integral de creación de orden y confirmación de pago para compras a domicilio y retiro en tienda:

1. **Selección Multi-Método de Pago:**
   - **Tarjeta Débito / Crédito:** Flujo completo de registro de tarjeta en pasarela/modal con datos de prueba aprobados.
   - **Punto de Venta / Datáfono:** Selección resiliente mediante cálculo de coordenadas físicas sobre el radio button y disparadores de estado React (`__reactProps`).
   - **Efectivo (Monto Exacto):** Activación del switch *"Pagar con valor total"* para enviar la orden con el monto exacto del carrito.
   - **Efectivo (Con Cambio):** Desactivación automática del switch de valor total e ingreso dinámico de un monto mayor al total de la compra (ej. `$50.00` en Ecuador, `$100.000` en Colombia).
2. **Aseguramiento de Facturación:**
   - Verificación y marcado garantizado de la casilla *"Utilizar mi información para la facturación"*, previniendo bloqueos por formularios fiscales incompletos.
3. **Captura y Extracción del Código de Pedido:**
   - **Intercepción de Red (API Monitoring):** Escucha y captura de payloads de respuesta de endpoints de checkout (`/order`, `/checkout`, `/orders`).
   - **Inspección del DOM:** Extracción de códigos con patrones oficiales (ej. `0000011546-010101`, `#CO-12345`).
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
│   │   ├── data/testData.js          # Direcciones, datos de tarjeta (card), métodos de pago y cliente CO
│   │   ├── pages/                    # HomePage, MenuPage, CartPage, CheckoutPage CO
│   │   ├── delivery/flujoAnonimoDel.js # 4 pruebas independientes (Tarjeta, Datáfono, Efectivo Exacto, Efectivo Cambio)
│   │   ├── pickup/flujoAnonimoPickup.js  # 2 pruebas de retiro (Tarjeta y Efectivo)
│   │   └── auth/flujoRegistroOtp.js
│   ├── ecuador/
│   │   ├── data/testData.js          # Direcciones, datos de tarjeta (card), métodos de pago y cliente EC
│   │   ├── pages/                    # HomePage, MenuPage, CartPage, CheckoutPage EC
│   │   ├── delivery/flujoAnonimoDel.js # 4 pruebas independientes (Tarjeta, POS, Efectivo Exacto, Efectivo Cambio)
│   │   ├── pickup/flujoAnonimoPickup.js  # 2 pruebas de retiro (Tarjeta y Efectivo)
│   │   └── auth/flujoRegistroOtp.js
│   ├── venezuela/
│   │   ├── data/testData.js          # Direcciones, métodos de pago y cliente VE
│   │   ├── pages/                    # HomePage, MenuPage, CartPage, CheckoutPage VE
│   │   ├── delivery/flujoAnonimoDel.js # 3 pruebas independientes (POS, Efectivo Exacto, Efectivo Cambio)
│   │   ├── pickup/flujoAnonimoPickup.js
│   │   └── auth/flujoRegistroOtp.js
│   ├── chile/                        # Tests y páginas Chile (Tarjeta, Efectivo, Delivery y Pickup)
│   ├── argentina/                    # Tests y páginas Argentina (Tarjeta, Efectivo, Pickup)
│   └── brasil/                       # Tests y páginas Brasil (Dinheiro/Cartão, Pickup)
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

> [!NOTE]
> Las pruebas automatizadas son ejecutadas manualmente por el usuario en su terminal a través de los siguientes comandos de `npm`:

### 1. 🇨🇴 Colombia (Delivery & Pickup)

```bash
# Suite completa de Delivery (Tarjeta, Datáfono, Efectivo Exacto, Efectivo Cambio):
npm run test:colombia

# Pruebas individuales de Delivery por método de pago:
npm run test:colombia:tarjeta
npm run test:colombia:datafono
npm run test:colombia:efectivo:exacto
npm run test:colombia:efectivo:cambio

# Retiro en tienda (Pickup: Tarjeta y Efectivo) y Registro OTP:
npm run test:colombia:pickup:tarjeta
npm run test:colombia:pickup:efectivo
npm run test:colombia:pickup
npm run test:colombia:registro
```

---

### 2. 🇪🇨 Ecuador (Delivery & Pickup)

```bash
# Suite completa de Delivery (Tarjeta, Punto de Venta, Efectivo Exacto, Efectivo Cambio):
npm run test:ecuador

# Pruebas individuales de Delivery por método de pago:
npm run test:ecuador:tarjeta
npm run test:ecuador:pos
npm run test:ecuador:efectivo:exacto
npm run test:ecuador:efectivo:cambio

# Retiro en tienda (Pickup: Tarjeta y Efectivo) y Registro OTP:
npm run test:ecuador:pickup:tarjeta
npm run test:ecuador:pickup:efectivo
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
# Chile (Delivery y Pickup con Tarjeta y Efectivo, Registro):
npm run test:chile
npm run test:chile:tarjeta
npm run test:chile:pickup:tarjeta
npm run test:chile:pickup
npm run test:chile:registro

# Argentina (Pickup con Tarjeta y Efectivo, Registro):
npm run test:argentina:pickup:tarjeta
npm run test:argentina:pickup
npm run test:argentina:registro

# Brasil (Pickup Dinheiro/Cartão y Registro):
npm run test:brasil:pickup
npm run test:brasil:registro
```

---

### 5. 🚀 Ejecución Conjunta de Países con Métodos de Pago

```bash
# 🛵 1. Todos los pagos en Delivery (CO, EC, VE):
npm run test:delivery:pagos              # Visible
npm run test:delivery:pagos:headless     # En segundo plano (Headless)

# 🛍️ 2. Todos los pagos en Pickup (CO, EC):
npm run test:pickup:pagos                # Visible
npm run test:pickup:pagos:headless       # En segundo plano (Headless)

# 💳 3. Absolutamente TODOS los pagos (Delivery + Pickup juntos):
npm run test:pagos:todos                 # Visible
npm run test:pagos:todos:headless        # En segundo plano (Headless)
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
