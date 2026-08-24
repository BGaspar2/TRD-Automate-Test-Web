import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { tempEmailService } from '../../../utils/tempEmailService.js';
import { generarCedulaEcuadorValida, generarTelefonoEcuador, generarNombreAleatorio } from '../../../utils/documentGenerator.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

test('Flujo E2E - Creación de cuenta con código OTP (Ecuador)', async ({ page }, testInfo) => {
    test.setTimeout(120000);

    const homePage = new HomePage(page);
    const registerPage = new RegisterPage(page);

    let buzonTemporal = null;
    let datosUsuario = null;
    let codigoOtp = null;

    // Paso 1: Navegación y Apertura de Modal de Registro
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegación y Apertura del Modal de Registro',
        descripcion: 'Ingreso al portal de KFC Ecuador y apertura del formulario de autenticación'
    }, async () => {
        await homePage.navegar(testData.baseUrl);
        await homePage.verificarLocalesCerrados();
        await registerPage.abrirModalRegistro();
    });

    // Paso 2: Generación Autónoma de Buzón Desechable y Solicitud de OTP
    await ejecutarPaso(page, testInfo, {
        numero: 2,
        titulo: 'Generación de Correo Desechable e Ingreso',
        descripcion: 'Creación automática de buzón vía API REST e ingreso de correo en el modal'
    }, async () => {
        // Generar buzón temporal autónomo vía GuerrillaMail API
        buzonTemporal = await tempEmailService.crearBuzon('kfcqa');

        // Generar datos dinámicos ecuatorianos válidos para el registro
        const { nombre, apellido } = generarNombreAleatorio();
        const cedulaValida = generarCedulaEcuadorValida();
        const telefono = generarTelefonoEcuador();

        datosUsuario = {
            nombre,
            apellido,
            email: buzonTemporal.email,
            telefono,
            documento: cedulaValida
        };

        console.log("📋 [Datos de Registro Generados]:", datosUsuario);

        await registerPage.llenarFormularioRegistro(datosUsuario);
    });

    // Paso 3: Envío de Solicitud y Extracción Automática del OTP
    await ejecutarPaso(page, testInfo, {
        numero: 3,
        titulo: 'Envío de Formulario y Extracción Automática de OTP',
        descripcion: 'Disparo de solicitud y sondeo automático de la bandeja vía API (100% sin intervención)'
    }, async () => {
        const otpApi = await registerPage.enviarFormulario();

        if (otpApi) {
            codigoOtp = otpApi;
            console.log(`⚡ [OTP Resuelto Inmediatamente por API]: ${codigoOtp}`);
        } else {
            // Extraer automáticamente el código recibido en el buzón temporal
            const resultadoOtp = await tempEmailService.esperarCodigoOtp(buzonTemporal, {
                timeoutMs: 60000,
                intervaloMs: 2500
            });
            codigoOtp = resultadoOtp.codigo;
        }
    });

    // Paso 4: Ingreso de Código OTP
    await ejecutarPaso(page, testInfo, {
        numero: 4,
        titulo: 'Validación del Código OTP',
        descripcion: 'Ingreso de los 6 dígitos de verificación recibidos por correo'
    }, async () => {
        await registerPage.ingresarCodigoOtp(codigoOtp);
    });

    // Paso 5: Completado de Registro y Pantalla de Bienvenida
    await ejecutarPaso(page, testInfo, {
        numero: 5,
        titulo: 'Completado de Registro y Pantalla de Bienvenida',
        descripcion: 'Llenado de datos personales, activación de términos, clic en Crear Cuenta y validación de ¡BIENVENIDO(A)!'
    }, async () => {
        await registerPage.completarPerfilPostOtp(datosUsuario);
    });
});
