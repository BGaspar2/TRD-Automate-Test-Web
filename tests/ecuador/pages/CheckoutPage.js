export class CheckoutPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        this.btnCompletar = page.getByRole('button', { name: /completar|continuar|siguiente/i })
            .or(page.locator('button, [role="button"]').filter({ hasText: /completar|continuar/i }));

        this.btnGuardarDireccion = page.locator('.AddressForm button[type="submit"], form.form button[type="submit"], button:has-text("Guardar dirección"), button:has-text("Guardar")')
            .or(page.getByRole('button', { name: /guardar/i }));

        this.inputName = page.locator('input[name="name"], #name, input[placeholder*="Nombre"], input[placeholder*="nombre"]').first();
        this.inputLastName = page.locator('input[name="lastName"], #lastName, input[placeholder*="Apellido"], input[placeholder*="apellido"]').first();
        this.inputEmail = page.locator('input[name="email"], input[type="email"], input[placeholder*="email"]').first();
        this.inputPhoneCustomer = page.locator('.PhoneNumber input, input[name="phone"], input[type="tel"], input[placeholder*="Teléfono"], input[placeholder*="telefone"]').first();
        this.inputDocument = page.locator('#document, input[name="document"], input[placeholder*="Documento"], input[placeholder*="DNI"], input[placeholder*="CPF"], input[placeholder*="RUT"]').first();
    }

    async iniciarCompletar() {
        const btn = this.btnCompletar.first();
        if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log("Haciendo clic en 'Completar'...");
            await btn.evaluate(node => node.click()).catch(async () => {
                await btn.click();
            });
            await this.page.waitForTimeout(3000);
        } else {
            console.log("No se requiere clic en 'Completar' (Modo Pickup o formulario ya visible). Continuidad directa.");
        }
    }

    async llenarCampoSeguro(input, valor, mantenerSiExiste = false) {
        if (!valor) return;
        const valActual = await input.inputValue().catch(() => '');
        if (mantenerSiExiste && valActual && valActual.length > 3) {
            console.log(`Conservando valor prellenado: "${valActual}"`);
            return;
        }

        await input.scrollIntoViewIfNeeded().catch(() => {});
        await input.focus().catch(() => {});
        await input.fill(valor).catch(() => {});
        await input.evaluate((el, v) => {
            el.value = v;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('blur', { bubbles: true }));
        }, valor).catch(() => {});
    }

    async llenarDireccionEntrega(direccion) {
        console.log("Llenando información de la dirección...");

        // 1. Esperar a que el contenedor de la modal esté presente
        const formAddress = this.page.locator('.AddressForm, form.form').first();
        await formAddress.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

        // 2. Seleccionar etiqueta 'Casa' si está visible
        const btnCasa = this.page.locator('.AddressForm button, form.form button').filter({ hasText: /casa|home/i }).first();
        if (await btnCasa.isVisible({ timeout: 500 }).catch(() => false)) {
            await btnCasa.click().catch(() => {});
        }

        // 3. Inspeccionar los elementos <input> y <textarea> específicos de .AddressForm
        const inputs = this.page.locator('.AddressForm input, .AddressForm textarea');
        const count = await inputs.count();

        for (let i = 0; i < count; i++) {
            const input = inputs.nth(i);
            if (await input.isVisible({ timeout: 200 }).catch(() => false)) {
                const nameAttr = (await input.getAttribute('name').catch(() => '')) || '';
                const placeholderAttr = (await input.getAttribute('placeholder').catch(() => '')) || '';
                const idAttr = (await input.getAttribute('id').catch(() => '')) || '';

                if (nameAttr === 'mainStreet' || idAttr === 'mainStreet') {
                    await this.llenarCampoSeguro(input, direccion.mainStreet, true);
                } else if (nameAttr === 'secondaryStreet' || idAttr === 'secondaryStreet') {
                    await this.llenarCampoSeguro(input, direccion.secondaryStreet);
                } else if (nameAttr === 'number' || idAttr === 'number') {
                    await this.llenarCampoSeguro(input, direccion.number);
                } else if (nameAttr === 'reference' || idAttr === 'reference' || placeholderAttr.toLowerCase().includes('piso') || placeholderAttr.toLowerCase().includes('dpto')) {
                    await this.llenarCampoSeguro(input, direccion.reference);
                } else if (nameAttr === 'phone' || idAttr === 'phone') {
                    await this.llenarCampoSeguro(input, direccion.phone);
                } else if (nameAttr === 'instructions' || idAttr === 'instructions' || placeholderAttr.toLowerCase().includes('frente')) {
                    await this.llenarCampoSeguro(input, direccion.instructions);
                }
            }
        }

        console.log("Guardando dirección de entrega...");
        const btnGuardar = this.btnGuardarDireccion.first();
        await btnGuardar.scrollIntoViewIfNeeded().catch(() => {});
        await btnGuardar.click().catch(async () => {
            await btnGuardar.evaluate(b => b.click()).catch(() => {});
        });
        await this.page.waitForTimeout(5000);
    }

    async llenarDatosPersonales(cliente) {
        console.log("Llenando datos personales del cliente...");
        await this.llenarCampoSeguro(this.inputName, cliente.name);
        await this.llenarCampoSeguro(this.inputLastName, cliente.lastName);
        await this.llenarCampoSeguro(this.inputEmail, cliente.email);
        await this.llenarCampoSeguro(this.inputPhoneCustomer, cliente.phone);
        await this.llenarCampoSeguro(this.inputDocument, cliente.document);
        await this.page.waitForTimeout(3000);
    }

    async seleccionarMetodoPago(paymentMethodId) {
        console.log(`Seleccionando método de pago...`);
        const selectorPago = this.page.locator(`${paymentMethodId}, input[value*="Efectivo"], label:has-text("Efectivo"), [id*="Efectivo"], label:has-text("Dinheiro"), label:has-text("Efectivo en entrega")`).first();
        if (await selectorPago.isVisible({ timeout: 4000 }).catch(() => false)) {
            await selectorPago.scrollIntoViewIfNeeded().catch(() => {});
            await selectorPago.check().catch(async () => {
                await selectorPago.click();
            });
        } else {
            const primerOpcionPago = this.page.locator('.PaymentMethods label, [class*="PaymentMethod"] label, input[type="radio"] + label').first();
            if (await primerOpcionPago.isVisible({ timeout: 2000 }).catch(() => false)) {
                await primerOpcionPago.click().catch(() => {});
            }
        }
        await this.page.waitForTimeout(3000);
    }
}
