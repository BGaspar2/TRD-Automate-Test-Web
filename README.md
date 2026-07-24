# TRD-Automate-Test-Web

Automatización de pruebas E2E para el flujo de compra y checkout de KFC (Ecuador) utilizando **Playwright**.

---

## 🚀 Características

- **Pruebas End-to-End con Playwright:** Cobertura de flujos completos desde la selección de canal hasta el checkout.
- **Soporte para Usuario Anónimo e Invitado:** Automatización del proceso de compra sin iniciar sesión.
- **Soporte para Usuario Registrado:** Manejo de sesiones persistentes con Google (`user_data_chrome`).
- **Validaciones Dinámicas:**
  - Selección inteligente de modificadores obligatorios en combos y productos.
  - Verificación condicional de dirección y datos de facturación guardados.
- **Grabación de Video:** Registro en video `.webm` de cada ejecución guardado en `tests/video_result/`.

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
│   ├── auth.js                 # Script para iniciar sesión en Google y guardar el perfil
│   ├── flujoAnonimoDel.js       # Flujo E2E a domicilio para usuario anónimo
│   ├── flujoRegistradoDel.js    # Flujo E2E a domicilio para usuario registrado
│   └── video_result/           # Carpeta donde se almacenan las grabaciones en video
├── playwright.config.ts        # Configuración global de Playwright
├── package.json
└── README.md
```

---

## ⚙️ Ejecución de los Scripts

### 1. Autenticación (Solo primera vez para usuario registrado)
Para guardar la sesión de Google en la carpeta `user_data_chrome`:
```bash
node .\tests\auth.js
```
> *Sigue las instrucciones en la consola para iniciar sesión manualmente en la ventana de Chrome y presiona Enter.*

### 2. Flujo Usuario Anónimo (Domicilio)
Ejecuta la compra E2E completa como usuario anónimo / invitado:
```bash
node .\tests\flujoAnonimoDel.js
```

### 3. Flujo Usuario Registrado (Domicilio)
Ejecuta la compra E2E utilizando la sesión previamente guardada:
```bash
node .\tests\flujoRegistradoDel.js
```

---

## 📹 Grabación de Pantalla
Los videos de cada prueba se guardan automáticamente en formato `.webm` en la siguiente ruta:
`tests/video_result/`
