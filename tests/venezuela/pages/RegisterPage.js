import { expect } from '@playwright/test';

export class RegisterPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.otpInterceptado = null;

        // Botón principal 'Ingresar' en la cabecera
        this.botonIngresarHeader = page.getByRole('button', { name: /^ingresar$|^entrar$|^acessar$|^login$/i })
            .or(page.locator('header button, nav button, [class*="Header"] button').filter({ hasText: /^ingresar$|^entrar$|^acessar$|^login$/i }))
            .or(page.getByRole('button', { name: /ingresar|iniciar sesión|entrar|acessar|login/i }));

        // Contenedor del diálogo modal de autenticación
        this.dialogAuth = page.getByRole('dialog').or(page.locator('.Modal, [class*="Modal"], .Overlay, div[role="dialog"]'));

        // Opción estricta: "Continuar con correo electrónico" (NUNCA Google)
        this.botonContinuarCorreo = this.dialogAuth.getByRole('button', { name: /continuar con correo electrónico|continuar con correo|correo electrónico/i })
            .or(this.dialogAuth.locator('button, [role="button"], a').filter({ hasText: /continuar con correo electrónico|correo electrónico/i }))
            .or(page.getByRole('button', { name: /continuar con correo electrónico/i }));

        // Input de Correo Electrónico
        this.inputEmail = this.dialogAuth.locator('input[type="email"], input[name="email"], input#email, input[placeholder*="email"], input[placeholder*="correo"]')
            .or(this.dialogAuth.getByPlaceholder(/hola@email\.com/i))
            .or(page.getByPlaceholder('hola@email.com'));

        // Botón Continuar (Paso 1 Correo)
        this.botonContinuarModal = this.dialogAuth.locator('button').filter({ hasText: /^continuar$/i })
            .or(this.dialogAuth.getByRole('button', { name: /^continuar$/i }));

        // Inputs del Código OTP
        this.inputsOtpIndividuales = this.dialogAuth.locator('.OtpInput input, [class*="otp"] input, [class*="Otp"] input, input[maxlength="1"], input[inputmode="numeric"]');
        this.inputOtpUnico = this.dialogAuth.locator('input[name*="otp"], input[name*="code"], input[placeholder*="código"], input[placeholder*="codigo"]');

        // Botón Confirmar OTP (si existiera)
        this.botonConfirmarOtp = this.dialogAuth.getByRole('button', { name: /verificar|confirmar|validar/i });

        // === Campos del Paso 2: Datos Personales de Registro ===
        this.inputNombre = this.dialogAuth.locator('#name, #firstName, input[name="name"], input[name="firstName"]')
            .or(this.dialogAuth.getByPlaceholder(/nombre/i));

        this.inputApellido = this.dialogAuth.locator('#lastName, #surName, input[name="lastName"], input[name="surname"]')
            .or(this.dialogAuth.getByPlaceholder(/apellido/i));

        this.inputTelefono = this.dialogAuth.locator('#phone, input[type="tel"], input[name="phone"]')
            .or(this.dialogAuth.getByPlaceholder(/teléfono|celular/i));

        this.inputDocumento = this.dialogAuth.locator('#document, #dni, #ci, #cedula, input[name="document"]')
            .or(this.dialogAuth.getByPlaceholder(/cédula|documento/i));

        // Checkboxes obligatorios
        this.checkboxesTerminos = this.dialogAuth.locator('input[type="checkbox"]');

        // Botón estricto 'Crear cuenta' dentro del modal
        this.botonCrearCuenta = this.dialogAuth.locator('button').filter({ hasText: /^crear cuenta$/i })
            .or(this.dialogAuth.getByRole('button', { name: /^crear cuenta$/i }))
            .or(this.dialogAuth.locator('button[type="submit"]'));

        // Tarjeta / Pantalla roja final de Bienvenida ("¡BIENVENIDO(A) [NOMBRE]!")
        this.modalBienvenida = page.locator('.Modal, [class*="Modal"], div').filter({ hasText: /¡BIENVENIDO/i })
            .or(page.getByText(/¡BIENVENIDO/i));
    }

    /**
     * Abre el modal de autenticación y selecciona estrictamente 'Continuar con correo electrónico'
     */
    async abrirModalRegistro() {
        console.log("Buscando y abriendo modal de autenticación...");

        // Cerrar cualquier popup inesperado de Google
        this.page.context().on('page', async popup => {
            if (popup.url().includes('google') || popup.url().includes('firebase')) {
                console.log("⚠️ Detectada ventana de Google no solicitada. Cerrando...");
                await popup.close().catch(() => {});
            }
        });

        // 1. Clic en 'Ingresar' en la cabecera
        const btnIngresar = this.botonIngresarHeader.first();
        await btnIngresar.waitFor({ state: 'visible', timeout: 8000 });
        await btnIngresar.click();
        console.log("Clic en 'Ingresar' realizado en la cabecera.");
        await this.page.waitForTimeout(2000);

        // 2. Clic exclusivo en 'Continuar con correo electrónico'
        console.log("Buscando opción 'Continuar con correo electrónico'...");
        const btnContinuarCorreo = this.botonContinuarCorreo.first();
        await btnContinuarCorreo.waitFor({ state: 'visible', timeout: 8000 });
        
        await btnContinuarCorreo.click({ force: true });
        console.log("Clic en 'Continuar con correo electrónico' realizado.");
        await this.page.waitForTimeout(2000);
    }

    /**
     * Llena el correo electrónico en el modal
     * @param {{ email: string }} datos
     */
    async llenarFormularioRegistro(datos) {
        console.log(`Ingresando correo: ${datos.email}...`);

        const inputMail = this.inputEmail.first();
        await inputMail.waitFor({ state: 'visible', timeout: 10000 });
        
        await inputMail.click();
        await inputMail.fill('');
        await inputMail.pressSequentially(datos.email, { delay: 25 });
        await this.dispararEventosReact(inputMail);
        await this.page.waitForTimeout(800);
    }

    /**
     * Envía la solicitud de OTP y escucha la respuesta del endpoint
     * @returns {Promise<string|null>} Código OTP si fue interceptado
     */
    async enviarFormulario() {
        console.log("Enviando formulario para solicitud de OTP...");

        this.otpInterceptado = null;
        const btnContinuar = this.botonContinuarModal.first();
        await btnContinuar.waitFor({ state: 'visible', timeout: 5000 });

        const promesaApiOtp = this.page.waitForResponse(
            resp => resp.url().includes('code-generator') || resp.url().includes('sign-in/generate'),
            { timeout: 15000 }
        ).then(async resp => {
            const body = await resp.text().catch(() => '');
            try {
                const json = JSON.parse(body);
                const codigo = json.code || json.otp || json.data?.code || json.data?.otp;
                if (codigo) {
                    this.otpInterceptado = String(codigo);
                    console.log(`⚡ [OTP Obtenido por API]: [ ${this.otpInterceptado} ]`);
                }
            } catch (e) {}
            return body;
        }).catch(() => null);

        await btnContinuar.click({ force: true });
        await promesaApiOtp;
        await this.page.waitForTimeout(2000);

        return this.otpInterceptado;
    }

    /**
     * Ingresa el código OTP en las casillas correspondientes
     * @param {string} codigoOtp - Código numérico
     */
    async ingresarCodigoOtp(codigoOtp) {
        const codigoLimpio = String(codigoOtp).trim().replace(/\D/g, '');
        console.log(`Ingresando código OTP: [ ${codigoLimpio} ]...`);

        await this.page.waitForTimeout(1000);

        const inputsIndividuales = this.inputsOtpIndividuales;
        const totalInputs = await inputsIndividuales.count().catch(() => 0);

        if (totalInputs >= 6) {
            for (let i = 0; i < codigoLimpio.length && i < totalInputs; i++) {
                const digito = codigoLimpio[i];
                const input = inputsIndividuales.nth(i);
                await input.click().catch(() => {});
                await input.fill(digito);
                await this.dispararEventosReact(input);
                await this.page.waitForTimeout(100);
            }
        } else if (await this.inputOtpUnico.first().isVisible({ timeout: 4000 }).catch(() => false)) {
            const input = this.inputOtpUnico.first();
            await input.fill(codigoLimpio);
            await this.dispararEventosReact(input);
        } else {
            await this.page.keyboard.type(codigoLimpio, { delay: 100 });
        }

        await this.page.waitForTimeout(1500);

        const btnConfirmar = this.botonConfirmarOtp.first();
        if (await btnConfirmar.isVisible({ timeout: 2000 }).catch(() => false)) {
            await btnConfirmar.click();
            await this.page.waitForTimeout(2000);
        }
    }

    /**
     * Paso 2: Completa los datos personales del usuario, hace clic en 'Crear cuenta'
     * y espera la aparición de la pantalla roja de confirmación: ¡BIENVENIDO(A) [NOMBRE]!
     * 
     * @param {{ nombre: string, apellido: string, telefono: string, documento: string }} datos
     */
    async completarPerfilPostOtp(datos) {
        console.log("Esperando formulario del Paso 2: Datos Personales y Checkboxes...");

        // Esperar a que el modal cargue los inputs de datos personales
        await this.page.waitForTimeout(3000);

        const inputNombre = this.inputNombre.first();
        const inputApellido = this.inputApellido.first();
        const inputTelefono = this.inputTelefono.first();
        const inputDocumento = this.inputDocumento.first();

        // 1. Nombre
        if (await inputNombre.isVisible({ timeout: 8000 }).catch(() => false)) {
            console.log(`Llenando Nombre: "${datos.nombre}"`);
            await inputNombre.click();
            await inputNombre.fill(datos.nombre);
            await this.dispararEventosReact(inputNombre);
            await this.page.waitForTimeout(200);
        }

        // 2. Apellido
        if (await inputApellido.isVisible({ timeout: 4000 }).catch(() => false)) {
            console.log(`Llenando Apellido: "${datos.apellido}"`);
            await inputApellido.click();
            await inputApellido.fill(datos.apellido);
            await this.dispararEventosReact(inputApellido);
            await this.page.waitForTimeout(200);
        }

        // 3. Teléfono
        if (await inputTelefono.isVisible({ timeout: 4000 }).catch(() => false)) {
            console.log(`Llenando Teléfono: "${datos.telefono}"`);
            await inputTelefono.click();
            await inputTelefono.fill(datos.telefono);
            await this.dispararEventosReact(inputTelefono);
            await this.page.waitForTimeout(200);
        }

        // 4. Cédula / Documento
        if (await inputDocumento.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log(`Llenando Cédula: "${datos.documento}"`);
            await inputDocumento.click();
            await inputDocumento.fill(datos.documento);
            await this.dispararEventosReact(inputDocumento);
            await this.page.waitForTimeout(200);
        }

        // 5. Marcar Checkboxes obligatorios
        console.log("Activando checkboxes obligatorios...");
        const checkboxes = this.checkboxesTerminos;
        const totalCheckboxes = await checkboxes.count().catch(() => 0);

        for (let i = 0; i < totalCheckboxes; i++) {
            const chk = checkboxes.nth(i);
            await chk.setChecked(true, { force: true }).catch(() => {});
            await chk.evaluate(el => {
                el.checked = true;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }).catch(() => {});
            await this.page.waitForTimeout(150);
        }

        await this.page.waitForTimeout(1000);

        // 6. Clic DIRECTO en el botón 'Crear cuenta' dentro del modal
        console.log("Haciendo clic en el botón 'Crear cuenta' dentro del modal...");
        const btnCrear = this.botonCrearCuenta.first();
        await btnCrear.waitFor({ state: 'visible', timeout: 8000 });
        await btnCrear.click({ force: true });
        console.log("✅ Clic en 'Crear cuenta' realizado con éxito.");

        // 7. Esperar a que aparezca la tarjeta roja de confirmación: ¡BIENVENIDO(A) [NOMBRE]!
        console.log(`Esperando pantalla roja de confirmación: '¡BIENVENIDO(A) ${datos.nombre.toUpperCase()}!'...`);
        const pantallaBienvenida = this.modalBienvenida.first();
        await pantallaBienvenida.waitFor({ state: 'visible', timeout: 20000 });
        
        console.log(`🎉 ¡PANTALLA DE BIENVENIDA CONFIRMADA!: ¡BIENVENIDO(A) ${datos.nombre.toUpperCase()}!`);

        // Pausa de 4 segundos para capturar nítidamente la tarjeta roja en el reporte ejecutivo
        await this.page.waitForTimeout(4000);
    }

    /**
     * Dispara eventos DOM estándar de React para forzar actualización de estado
     * @param {import('@playwright/test').Locator} locator
     */
    async dispararEventosReact(locator) {
        await locator.evaluate(node => {
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.dispatchEvent(new Event('change', { bubbles: true }));
            node.dispatchEvent(new Event('blur', { bubbles: true }));
        }).catch(() => {});
    }
}
