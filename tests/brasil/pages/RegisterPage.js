import { expect } from '@playwright/test';

export class RegisterPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.otpInterceptado = null;

        // Botão principal 'Entrar' / 'Acessar' no cabeçalho
        this.botonIngresarHeader = page.getByRole('button', { name: /^entrar$|^acessar$|^ingresar$|^login$/i })
            .or(page.locator('header button, nav button, [class*="Header"] button').filter({ hasText: /^entrar$|^acessar$|^ingresar$|^login$/i }))
            .or(page.getByRole('button', { name: /entrar|acessar|iniciar sessão|login/i }));

        // Contêiner do diálogo modal de autenticação
        this.dialogAuth = page.getByRole('dialog').or(page.locator('.Modal, [class*="Modal"], .Overlay, div[role="dialog"]'));

        // Opção estrita: "Continuar com e-mail" / "Continuar con correo electrónico" (NUNCA Google)
        this.botonContinuarCorreo = this.dialogAuth.getByRole('button', { name: /continuar com e-mail|e-mail|continuar con correo electrónico|correo electrónico/i })
            .or(this.dialogAuth.locator('button, [role="button"], a').filter({ hasText: /continuar com e-mail|e-mail|continuar con correo electrónico/i }))
            .or(page.getByRole('button', { name: /continuar com e-mail|e-mail/i }));

        // Input de E-mail
        this.inputEmail = this.dialogAuth.locator('input[type="email"], input[name="email"], input#email, input[placeholder*="email"], input[placeholder*="e-mail"]')
            .or(this.dialogAuth.getByPlaceholder(/seu@email\.com|hola@email\.com/i))
            .or(page.getByPlaceholder('seu@email.com'));

        // Botão Continuar (Passo 1 E-mail)
        this.botonContinuarModal = this.dialogAuth.locator('button').filter({ hasText: /^avançar$|^continuar$/i })
            .or(this.dialogAuth.getByRole('button', { name: /^avançar$|^continuar$/i }));

        // Inputs do Código OTP
        this.inputsOtpIndividuales = this.dialogAuth.locator('.OtpInput input, [class*="otp"] input, [class*="Otp"] input, input[maxlength="1"], input[inputmode="numeric"]');
        this.inputOtpUnico = this.dialogAuth.locator('input[name*="otp"], input[name*="code"], input[placeholder*="código"], input[placeholder*="codigo"]');

        // Botão Confirmar OTP
        this.botonConfirmarOtp = this.dialogAuth.getByRole('button', { name: /verificar|confirmar|validar/i });

        // === Campos do Passo 2: Dados Pessoais de Cadastro ===
        this.inputNombre = this.dialogAuth.locator('#name, #firstName, input[name="name"], input[name="firstName"]')
            .or(this.dialogAuth.getByPlaceholder(/primeiro nome|nome|seu nome/i));

        this.inputApellido = this.dialogAuth.locator('#lastName, #surName, input[name="lastName"], input[name="surname"]')
            .or(this.dialogAuth.getByPlaceholder(/sobrenome|seu sobrenome/i));

        this.inputTelefono = this.dialogAuth.locator('#phone, input[type="tel"], input[name="phone"], input[name="telephone"]')
            .or(this.dialogAuth.getByPlaceholder(/telefone|celular/i));

        this.inputDocumento = this.dialogAuth.locator('#document, #cpf, input[name="document"], input[name="cpf"]')
            .or(this.dialogAuth.getByPlaceholder(/cpf|documento/i));

        // Checkboxes obrigatórios
        this.checkboxesTerminos = this.dialogAuth.locator('input[type="checkbox"]');

        // Botão estrito 'Criar conta' / 'Cadastrar'
        this.botonCrearCuenta = this.dialogAuth.locator('button').filter({ hasText: /^criar conta$|^cadastrar$|^continuar$/i })
            .or(this.dialogAuth.getByRole('button', { name: /^criar conta$|^cadastrar$/i }))
            .or(this.dialogAuth.locator('button[type="submit"]'));

        // Cartão vermelho final de Boas-Vindas ("BEM-VINDO(A) [NOME]!" / "¡BIENVENIDO(A)!")
        this.modalBienvenida = page.locator('.Modal, [class*="Modal"], div').filter({ hasText: /BEM-VINDO|BEM-VINDA|BIENVENIDO/i })
            .or(page.getByText(/BEM-VINDO|BIENVENIDO/i));
    }

    /**
     * Abre o modal de autenticação e seleciona estritamente 'Continuar com e-mail'
     */
    async abrirModalRegistro() {
        console.log("Buscando e abrindo modal de autenticação...");

        // Fechar popup do Google se aparecer
        this.page.context().on('page', async popup => {
            if (popup.url().includes('google') || popup.url().includes('firebase')) {
                console.log("⚠️ Detectada janela do Google não solicitada. Fechando...");
                await popup.close().catch(() => {});
            }
        });

        // 1. Clicar em 'Entrar' / 'Acessar'
        const btnIngresar = this.botonIngresarHeader.first();
        await btnIngresar.waitFor({ state: 'visible', timeout: 8000 });
        await btnIngresar.click();
        console.log("Clique em 'Entrar' no cabeçalho realizado.");
        await this.page.waitForTimeout(2000);

        // 2. Clicar em 'Continuar com e-mail'
        console.log("Buscando opção 'Continuar com e-mail'...");
        const btnContinuarCorreo = this.botonContinuarCorreo.first();
        await btnContinuarCorreo.waitFor({ state: 'visible', timeout: 8000 });
        
        await btnContinuarCorreo.click({ force: true });
        console.log("Clique em 'Continuar com e-mail' realizado.");
        await this.page.waitForTimeout(2000);
    }

    /**
     * Preenche o e-mail no modal
     * @param {{ email: string }} datos
     */
    async llenarFormularioRegistro(datos) {
        console.log(`Preenchendo e-mail: ${datos.email}...`);

        const inputMail = this.inputEmail.first();
        await inputMail.waitFor({ state: 'visible', timeout: 10000 });
        
        await inputMail.click();
        await inputMail.fill('');
        await inputMail.pressSequentially(datos.email, { delay: 25 });
        await this.dispararEventosReact(inputMail);
        await this.page.waitForTimeout(800);
    }

    /**
     * Envia a solicitação de OTP
     * @returns {Promise<string|null>} Código OTP se interceptado
     */
    async enviarFormulario() {
        console.log("Enviando formulário de solicitação de OTP...");

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
                    console.log(`⚡ [OTP Obtido por API]: [ ${this.otpInterceptado} ]`);
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
     * Digita o código OTP nos campos correspondentes
     * @param {string} codigoOtp - Código numérico
     */
    async ingresarCodigoOtp(codigoOtp) {
        const codigoLimpio = String(codigoOtp).trim().replace(/\D/g, '');
        console.log(`Digitando código OTP: [ ${codigoLimpio} ]...`);

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
     * Passo 2: Preenche dados pessoais, clica em Criar conta e aguarda cartão de confirmação
     * @param {{ nombre: string, apellido: string, telefono: string, documento: string }} datos
     */
    async completarPerfilPostOtp(datos) {
        console.log("Aguardando formulário do Passo 2: Dados Pessoais e Termos...");

        await this.page.waitForTimeout(3000);

        const inputNombre = this.inputNombre.first();
        const inputApellido = this.inputApellido.first();
        const inputTelefono = this.inputTelefono.first();
        const inputDocumento = this.inputDocumento.first();

        // 1. Nome
        if (await inputNombre.isVisible({ timeout: 8000 }).catch(() => false)) {
            console.log(`Preenchendo Nome: "${datos.nombre}"`);
            await inputNombre.click();
            await inputNombre.fill(datos.nombre);
            await this.dispararEventosReact(inputNombre);
            await this.page.waitForTimeout(200);
        }

        // 2. Sobrenome
        if (await inputApellido.isVisible({ timeout: 4000 }).catch(() => false)) {
            console.log(`Preenchendo Sobrenome: "${datos.apellido}"`);
            await inputApellido.click();
            await inputApellido.fill(datos.apellido);
            await this.dispararEventosReact(inputApellido);
            await this.page.waitForTimeout(200);
        }

        // 3. Telefone
        if (await inputTelefono.isVisible({ timeout: 4000 }).catch(() => false)) {
            console.log(`Preenchendo Telefone: "${datos.telefono}"`);
            await inputTelefono.click();
            await inputTelefono.fill(datos.telefono);
            await this.dispararEventosReact(inputTelefono);
            await this.page.waitForTimeout(200);
        }

        // 4. CPF
        if (await inputDocumento.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log(`Preenchendo CPF: "${datos.documento}"`);
            await inputDocumento.click();
            await inputDocumento.fill(datos.documento);
            await this.dispararEventosReact(inputDocumento);
            await this.page.waitForTimeout(200);
        }

        // 5. Marcar Checkboxes
        console.log("Marcando termos e políticas...");
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

        // 6. Clicar em 'Criar conta' / 'Cadastrar'
        console.log("Clicando em 'Criar conta'...");
        const btnCrear = this.botonCrearCuenta.first();
        await btnCrear.waitFor({ state: 'visible', timeout: 8000 });
        await btnCrear.click({ force: true });
        console.log("✅ Clique em 'Criar conta' realizado.");

        // 7. Aguardar tela vermelha de boas-vindas
        console.log(`Aguardando cartão de confirmação: 'BEM-VINDO(A) ${datos.nombre.toUpperCase()}!'...`);
        const pantallaBienvenida = this.modalBienvenida.first();
        await pantallaBienvenida.waitFor({ state: 'visible', timeout: 20000 });
        
        console.log(`🎉 ¡CARTÃO DE BOAS-VINDAS CONFIRMADO!: BEM-VINDO(A) ${datos.nombre.toUpperCase()}!`);

        await this.page.waitForTimeout(4000);
    }

    /**
     * Dispara eventos DOM do React
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
