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

        this.inputName = page.locator('.FulfillUser input[name="name"], #name').first();
        this.inputLastName = page.locator('.FulfillUser input[name="lastName"], #lastName').first();
        this.inputEmail = page.locator('.FulfillUser input[name="email"], input[type="email"]').first();
        this.inputPhoneCustomer = page.locator('.FulfillUser .PhoneNumber input, .FulfillUser input[name="phone"]').first();
        this.inputDocument = page.locator('#document, .FulfillUser input[name="document"]').first();
    }

    async iniciarCompletar() {
        console.log("Haciendo clic en 'Completar'...");
        const btn = this.btnCompletar.first();
        await btn.evaluate(node => node.click()).catch(async () => {
            await btn.click();
        });
        await this.page.waitForTimeout(3000);
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

        const formAddress = this.page.locator('.AddressForm, form.form').first();
        await formAddress.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

        const btnCasa = this.page.locator('.AddressForm button, form.form button').filter({ hasText: /casa|home/i }).first();
        if (await btnCasa.isVisible({ timeout: 500 }).catch(() => false)) {
            await btnCasa.click().catch(() => {});
        }

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
        await this.page.waitForTimeout(5000);
    }

    async seleccionarMetodoPago(paymentMethodId) {
        console.log(`Seleccionando método de pago: ${paymentMethodId}...`);
        const selectorPago = this.page.locator(`${paymentMethodId}, input[value*="Efectivo"], label:has-text("Efectivo"), [id*="Efectivo"]`).first();
        if (await selectorPago.isVisible({ timeout: 3000 }).catch(() => false)) {
            await selectorPago.check().catch(async () => {
                await selectorPago.click();
            });
        }
        await this.page.waitForTimeout(5000);
    }
}
