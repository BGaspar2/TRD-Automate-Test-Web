import { expect } from '@playwright/test';

export class CheckoutPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.codigoPedido = null;

        this.btnCompletar = page.getByRole('button', { name: /^completar/i })
            .or(page.locator('button, [role="button"], a, div[class*="cursor-pointer"], span[class*="cursor-pointer"]').filter({ hasText: /^completar/i }))
            .or(page.locator('.AddressCard, .DeliveryAddressCard, [class*="AddressCard"], [class*="DeliveryAddress"], [class*="FulfillAddress"], [class*="address-card"], [class*="delivery-address"]').locator('button, a, [role="button"], span, div').filter({ hasText: /completar|completar dirección|editar|cambiar|agregar/i }))
            .or(page.getByRole('button', { name: /completar dirección|completar direccion|agregar dirección|agregar direccion/i }))
            .or(page.locator('button:has-text("Completar"), [role="button"]:has-text("Completar"), a:has-text("Completar")'));

        this.btnGuardarDireccion = page.locator('.AddressForm button[type="submit"], form.form button[type="submit"], button:has-text("Guardar dirección"), button:has-text("Guardar"), button:has-text("Salvar")')
            .or(page.getByRole('button', { name: /guardar|salvar/i }));

        this.inputName = page.locator('input[name="name"], #name, input[placeholder*="Nombre"], input[placeholder*="nombre"]').first();
        this.inputLastName = page.locator('input[name="lastName"], #lastName, input[placeholder*="Apellido"], input[placeholder*="apellido"]').first();
        this.inputEmail = page.locator('input[name="email"], input[type="email"], input[placeholder*="email"]').first();
        this.inputPhoneCustomer = page.locator('.PhoneNumber input, input[name="phone"], input[type="tel"], input[placeholder*="Teléfono"], input[placeholder*="telefone"]').first();
        this.inputDocument = page.locator('#document, input[name="document"], input[placeholder*="Documento"], input[placeholder*="DNI"], input[placeholder*="Cédula"]').first();

        // Botón principal de Pagar / Realizar Pedido
        this.btnPagar = page.locator('button.Button, button, [role="button"]')
            .filter({ hasText: /pagar|confirmar pedido|realizar pedido|finalizar pedido|completar compra|hacer pedido/i });

        // Indicadores de Procesando Orden
        this.indicadorProcesando = page.locator('text=/procesando|procesando tu pedido|procesando orden|cargando/i')
            .or(page.locator('[class*="Loading"], [class*="Spinner"], [class*="Processing"]'));

        // Mensaje de Confirmación / Toast de Orden Exitosa
        this.toastOrdenCreada = page.locator('[role="alert"], [role="status"], [class*="Toast"], [class*="Notification"], [class*="Success"], div')
            .filter({ hasText: /orden creada|pedido creado|creada exitosamente|pedido realizado|éxito|exitosamente/i });
    }

    async iniciarCompletar() {
        console.log("Verificando si es necesario completar la dirección de entrega...");

        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.page.waitForTimeout(2000);

        const formAddress = this.page.locator('.AddressForm, form.form, [class*="AddressForm"], [class*="address-form"], .Modal form, [role="dialog"] form, [role="dialog"]').first();
        if (await formAddress.isVisible({ timeout: 1500 }).catch(() => false)) {
            console.log("El formulario de dirección ya se encuentra visible.");
            return;
        }

        const selectoresCompletar = [
            this.page.getByRole('button', { name: /^completar/i }),
            this.page.locator('.AddressCard, .DeliveryAddressCard, [class*="AddressCard"], [class*="DeliveryAddress"], [class*="FulfillAddress"], [class*="address-card"], [class*="delivery-address"]').locator('button, a, [role="button"], span, div').filter({ hasText: /completar|completar dirección|editar|cambiar|agregar/i }),
            this.page.locator('button, [role="button"], a, div[class*="cursor-pointer"], span[class*="cursor-pointer"]').filter({ hasText: /^completar/i }),
            this.page.getByRole('button', { name: /completar dirección|completar direccion|agregar dirección|agregar direccion/i }),
            this.page.locator('button:has-text("Completar"), [role="button"]:has-text("Completar"), a:has-text("Completar")'),
            this.page.locator('[data-testid*="complete"], [data-testid*="address-edit"], [data-testid*="address-button"]')
        ];

        let btnEncontrado = null;
        const inicio = Date.now();
        while (Date.now() - inicio < 8000 && !btnEncontrado) {
            for (const selector of selectoresCompletar) {
                const count = await selector.count().catch(() => 0);
                for (let i = 0; i < count; i++) {
                    const candidato = selector.nth(i);
                    if (await candidato.isVisible().catch(() => false)) {
                        btnEncontrado = candidato;
                        break;
                    }
                }
                if (btnEncontrado) break;
            }

            if (!btnEncontrado) {
                if (await formAddress.isVisible().catch(() => false)) {
                    console.log("El formulario de dirección se abrió automáticamente.");
                    return;
                }
                await this.page.waitForTimeout(500);
            }
        }

        if (btnEncontrado) {
            console.log("Haciendo clic en 'Completar' para abrir el modal de dirección...");
            await btnEncontrado.scrollIntoViewIfNeeded().catch(() => {});

            let modalAbierto = false;
            for (let intento = 1; intento <= 3 && !modalAbierto; intento++) {
                try {
                    await btnEncontrado.click({ timeout: 3000, force: true });
                } catch (e) {
                    await btnEncontrado.evaluate(el => {
                        el.click();
                        const reactKey = Object.keys(el).find(k => k.startsWith('__reactProps'));
                        if (reactKey && el[reactKey] && typeof el[reactKey].onClick === 'function') {
                            el[reactKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                        }
                    }).catch(() => {});
                }

                modalAbierto = await formAddress.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
                if (modalAbierto) {
                    console.log("Modal de dirección abierto con éxito.");
                    break;
                } else if (intento < 3) {
                    console.log(`Reintentando clic en 'Completar' (intento ${intento + 1})...`);
                    await this.page.waitForTimeout(1000);
                }
            }
            await this.page.waitForTimeout(2000);
        } else {
            console.log("No se encontró botón 'Completar' o la modal ya está disponible. Continuando flujo...");
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

        const formAddress = this.page.locator('.AddressForm, form.form, [class*="AddressForm"], [class*="address-form"], .Modal form, [role="dialog"] form, [role="dialog"]').first();
        await formAddress.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

        const btnCasa = this.page.locator('.AddressForm button, form.form button, [class*="AddressForm"] button, [role="dialog"] button')
            .filter({ hasText: /casa|home|casa \/ dpto/i }).first();
        if (await btnCasa.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log("Seleccionando etiqueta 'Casa'...");
            await btnCasa.click().catch(() => {});
        }

        const mapeoCampos = [
            { ids: ['#mainStreet', 'input[name="mainStreet"]', 'input[placeholder*="Calle principal" i]', 'input[placeholder*="Dirección" i]', 'input[placeholder*="Direccion" i]'], valor: direccion.mainStreet, mantener: true },
            { ids: ['#secondaryStreet', 'input[name="secondaryStreet"]', 'input[placeholder*="Calle secundaria" i]', 'input[placeholder*="Intersección" i]', 'input[placeholder*="Entre" i]'], valor: direccion.secondaryStreet },
            { ids: ['#number', 'input[name="number"]', 'input[placeholder*="Número" i]', 'input[placeholder*="Numero" i]', 'input[placeholder*="N°" i]'], valor: direccion.number },
            { ids: ['#reference', 'input[name="reference"]', 'input[placeholder*="Referencia" i]', 'input[placeholder*="Piso" i]', 'input[placeholder*="Dpto" i]', 'input[placeholder*="Apartamento" i]'], valor: direccion.reference },
            { ids: ['form.form #phone', '.AddressForm #phone', '.AddressForm input[name="phone"]', 'input[name="phone"]', 'input[placeholder*="Teléfono" i]', 'input[placeholder*="Telefono" i]'], valor: direccion.phone },
            { ids: ['#instructions', 'textarea[name="instructions"]', 'input[name="instructions"]', 'textarea[placeholder*="instrucciones" i]', 'input[placeholder*="instrucciones" i]', 'textarea'], valor: direccion.instructions }
        ];

        for (const campo of mapeoCampos) {
            if (!campo.valor) continue;
            for (const selector of campo.ids) {
                const el = this.page.locator(selector).first();
                if (await el.isVisible({ timeout: 300 }).catch(() => false)) {
                    await this.llenarCampoSeguro(el, campo.valor, campo.mantener || false);
                    break;
                }
            }
        }

        const inputs = this.page.locator('.AddressForm input, .AddressForm textarea, [class*="AddressForm"] input, [class*="AddressForm"] textarea, form.form input, form.form textarea');
        const count = await inputs.count().catch(() => 0);

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
                } else if (nameAttr === 'instructions' || idAttr === 'instructions' || placeholderAttr.toLowerCase().includes('frente') || placeholderAttr.toLowerCase().includes('instrucciones')) {
                    await this.llenarCampoSeguro(input, direccion.instructions);
                }
            }
        }

        console.log("Guardando dirección de entrega...");
        const btnGuardar = this.btnGuardarDireccion.first()
            .or(this.page.locator('button[type="submit"], button').filter({ hasText: /guardar dirección|guardar direccion|guardar|confirmar|salvar/i })).first();

        await btnGuardar.scrollIntoViewIfNeeded().catch(() => {});
        await btnGuardar.click({ force: true }).catch(async () => {
            await btnGuardar.evaluate(b => b.click()).catch(() => {});
        });
        await this.page.waitForTimeout(4000);
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

    /**
     * Selecciona el método de pago en Venezuela:
     * - 'Punto de venta'
     * - 'Efectivo (Monto exacto)' / 'Efectivo' (con switch de valor total)
     * - 'Efectivo (Con cambio)' (con monto mayor al total ingresado en el input)
     * @param {'punto_venta' | 'efectivo_exacto' | 'efectivo_cambio' | string} metodoPago
     * @param {string|number} [montoCambio]
     */
    async seleccionarMetodoPago(metodoPago = 'Punto de venta', montoCambio = null) {
        const metodoLower = (metodoPago || '').toLowerCase();
        const esPuntoVenta = metodoLower.includes('punto') || metodoLower === 'pos';
        const esEfectivoCambio = metodoLower.includes('cambio') || metodoLower === 'efectivo_cambio';
        const esEfectivoExacto = !esPuntoVenta && !esEfectivoCambio; // Por defecto si es solo 'efectivo' o 'exacto'

        const nombreBuscar = esPuntoVenta ? 'Punto De Venta' : 'Efectivo';
        console.log(`Seleccionando método de pago en Venezuela: "${nombreBuscar}"...`);

        const regexNombre = esPuntoVenta ? /punto de venta|pos/i : /^efectivo$/i;

        for (let intento = 1; intento <= 6; intento++) {
            // 1. Encontrar el texto "Punto De Venta" o "Efectivo"
            const textLocator = this.page.getByText(regexNombre).last();
            if (await textLocator.isVisible().catch(() => false)) {
                await textLocator.scrollIntoViewIfNeeded().catch(() => {});
                
                // Clic en el texto
                await textLocator.click({ force: true }).catch(() => {});
                
                // Clic físico en el círculo del radio (a la izquierda del texto)
                const box = await textLocator.boundingBox().catch(() => null);
                if (box) {
                    await this.page.mouse.click(box.x - 22, box.y + box.height / 2).catch(() => {});
                    await this.page.mouse.click(box.x - 14, box.y + box.height / 2).catch(() => {});
                }
            }

            // 2. Clic en label o contenedor específico
            const labelDirect = this.page.locator('label, [class*="Radio"], [class*="radio"]').filter({ hasText: regexNombre }).last();
            if (await labelDirect.isVisible().catch(() => false)) {
                await labelDirect.click({ force: true }).catch(() => {});
            }

            // 3. Disparo a nivel DOM y React Props enfocado exclusivamente en la opción seleccionada
            await this.page.evaluate((esPuntoVentaFlag) => {
                const targetRegex = esPuntoVentaFlag ? /punto de venta|pos/i : /^efectivo$/i;
                const allNodes = Array.from(document.querySelectorAll('*'));
                
                const matchNode = allNodes.reverse().find(el => {
                    const txt = (el.innerText || el.textContent || '').trim();
                    return targetRegex.test(txt) && txt.length < 25;
                });

                if (matchNode) {
                    const optionContainer = matchNode.closest('label, [role="radio"], div[class*="Radio" i], div[class*="radio" i], div[class*="item" i]') || matchNode;
                    optionContainer.click();
                    
                    const radio = optionContainer.querySelector('input[type="radio"]') || (optionContainer.tagName === 'INPUT' ? optionContainer : null);
                    if (radio) {
                        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set;
                        if (nativeSetter) nativeSetter.call(radio, true);
                        radio.checked = true;
                        radio.dispatchEvent(new Event('input', { bubbles: true }));
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                        radio.click();
                    }

                    const rKey = Object.keys(optionContainer).find(k => k.startsWith('__reactProps'));
                    if (rKey && optionContainer[rKey]) {
                        if (typeof optionContainer[rKey].onClick === 'function') optionContainer[rKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                        if (typeof optionContainer[rKey].onChange === 'function') optionContainer[rKey].onChange({ target: { checked: true } });
                    }
                }
            }, esPuntoVenta).catch(() => {});

            await this.page.waitForTimeout(1000);

            if (!esPuntoVenta) {
                const switchPresente = await this.page.locator('text=/valor exacto|monto exacto|valor total/i').first().isVisible({ timeout: 800 }).catch(() => false);
                if (switchPresente) {
                    console.log(`✅ Confirmado: "Efectivo" seleccionado correctamente.`);
                    break;
                }
            } else {
                console.log(`✅ Confirmado: "Punto De Venta" seleccionado.`);
                break;
            }
        }

        if (!esPuntoVenta) {
            // Localizador estricto del Switch de 'Pagar con el valor exacto' / 'Monto exacto' / 'Valor total'
            const switchRegex = /valor exacto|monto exacto|valor total|total exacto|pago total|monto a pagar/i;
            const rowSwitch = this.page.locator('label, div, p, span, li').filter({ hasText: switchRegex }).last();

            if (esEfectivoExacto) {
                console.log('Configurando Efectivo con monto exacto: Asegurando que el switch esté activo...');
                if (await rowSwitch.isVisible({ timeout: 3000 }).catch(() => false)) {
                    const estaActivo = await rowSwitch.evaluate(cont => {
                        const inp = cont.querySelector('input');
                        if (inp) return inp.checked;
                        const sw = cont.querySelector('[role="switch"], [aria-checked], [data-checked]') || cont;
                        if (sw.getAttribute('aria-checked') !== null) return sw.getAttribute('aria-checked') === 'true';
                        if (sw.getAttribute('data-checked') !== null) return sw.getAttribute('data-checked') === 'true';
                        const circle = cont.querySelector('span, div, [class*="thumb" i], [class*="slider" i], [class*="circle" i]');
                        if (circle) {
                            const cRect = circle.getBoundingClientRect();
                            const pRect = (circle.parentElement || cont).getBoundingClientRect();
                            if (cRect.x > pRect.x + pRect.width / 3) return true;
                        }
                        return /bg-red|bg-primary|active|checked|on\b/i.test(cont.className + ' ' + (sw.className || ''));
                    }).catch(() => false);

                    if (!estaActivo) {
                        console.log('Activando switch de valor exacto...');
                        const toggleBtn = rowSwitch.locator('[role="switch"], input, button, [class*="switch" i], [class*="toggle" i], [class*="slider" i]').last();
                        if (await toggleBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                            await toggleBtn.click({ force: true }).catch(() => {});
                        } else {
                            await rowSwitch.click({ force: true }).catch(() => {});
                        }
                    }
                    console.log('✅ Switch de valor exacto activo.');
                }
            } else if (esEfectivoCambio) {
                console.log('Configurando Efectivo con cambio: Desactivando switch de valor exacto...');

                for (let intentoSwitch = 1; intentoSwitch <= 4; intentoSwitch++) {
                    const isVisible = await rowSwitch.isVisible({ timeout: 2000 }).catch(() => false);
                    if (!isVisible) {
                        await this.page.waitForTimeout(500);
                        continue;
                    }

                    // Verificar si el input de cambio ya apareció
                    const inputMontoExistente = this.page.locator('input[name*="change" i], input[name*="amount" i], input[name*="cash" i], input[placeholder*="monto" i], input[placeholder*="cambio" i], input[placeholder*="cuánto" i], input[placeholder*="cuanto" i], input[placeholder*="con cuánto" i], input[placeholder*="con cuanto" i], input[type="number"]').first();
                    if (await inputMontoExistente.isVisible({ timeout: 800 }).catch(() => false)) {
                        console.log('✅ Input de cambio visible tras desactivar switch.');
                        break;
                    }

                    const estaActivo = await rowSwitch.evaluate(cont => {
                        const inp = cont.querySelector('input');
                        if (inp) return inp.checked;
                        const sw = cont.querySelector('[role="switch"], [aria-checked], [data-checked]') || cont;
                        if (sw.getAttribute('aria-checked') !== null) return sw.getAttribute('aria-checked') === 'true';
                        if (sw.getAttribute('data-checked') !== null) return sw.getAttribute('data-checked') === 'true';
                        const circle = cont.querySelector('span, div, [class*="thumb" i], [class*="slider" i], [class*="circle" i]');
                        if (circle) {
                            const cRect = circle.getBoundingClientRect();
                            const pRect = (circle.parentElement || cont).getBoundingClientRect();
                            if (cRect.x > pRect.x + pRect.width / 3) return true;
                        }
                        return /bg-red|bg-primary|active|checked|on\b/i.test(cont.className + ' ' + (sw.className || ''));
                    }).catch(() => true);

                    if (estaActivo) {
                        console.log(`Intento ${intentoSwitch}: Desactivando switch de 'Pagar con el valor exacto'...`);
                        const toggleBtn = rowSwitch.locator('[role="switch"], input, button, [class*="switch" i], [class*="toggle" i], [class*="slider" i]').last();
                        if (await toggleBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                            await toggleBtn.click({ force: true }).catch(() => {});
                        } else {
                            await rowSwitch.click({ force: true }).catch(() => {});
                        }

                        await rowSwitch.evaluate(cont => {
                            const target = cont.querySelector('[role="switch"], input, button, span, div') || cont;
                            target.click();
                            const rKey = Object.keys(target).find(k => k.startsWith('__reactProps'));
                            if (rKey && target[rKey]?.onClick) target[rKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                            if (rKey && target[rKey]?.onChange) target[rKey].onChange({ target: { checked: false } });
                        }).catch(() => {});

                        await this.page.waitForTimeout(1000);
                    }
                }

                // Llenar el monto para cambio
                await this.page.waitForTimeout(1000);

                let montoADar = montoCambio || '50';
                
                const totalElement = this.page.locator('.OrderSummary, [class*="Total"], [class*="total"], strong, span')
                    .filter({ hasText: /\$\s*\d+|\b\d+[.,]\d{2}\b/ }).last();
                if (await totalElement.isVisible({ timeout: 1500 }).catch(() => false)) {
                    const totalText = await totalElement.innerText().catch(() => '');
                    const matchNum = totalText.match(/(\d+[.,]\d{2}|\d+)/);
                    if (matchNum) {
                        const totalNum = parseFloat(matchNum[1].replace(',', '.'));
                        if (!isNaN(totalNum) && totalNum > 0) {
                            montoADar = String(Math.ceil(totalNum + 10));
                        }
                    }
                }

                const inputMonto = this.page.locator('input[name*="change" i], input[name*="amount" i], input[name*="cash" i], input[placeholder*="monto" i], input[placeholder*="cambio" i], input[placeholder*="cuánto" i], input[placeholder*="cuanto" i], input[placeholder*="con cuánto" i], input[placeholder*="con cuanto" i], input[type="number"]').first()
                    .or(this.page.locator('.PaymentMethods input[type="text"], [class*="Payment"] input[type="text"], input[type="text"]').last());

                if (await inputMonto.isVisible({ timeout: 4000 }).catch(() => false)) {
                    console.log(`Llenando monto que se va a pagar (mayor al total): "$${montoADar}"`);
                    await inputMonto.click();
                    await inputMonto.fill('');
                    await inputMonto.pressSequentially(montoADar, { delay: 40 });
                    await inputMonto.evaluate((el, v) => {
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                        if (setter) setter.call(el, v);
                        else el.value = v;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.dispatchEvent(new Event('blur', { bubbles: true }));
                    }, montoADar).catch(() => {});
                    console.log(`✅ Monto de pago "$${montoADar}" configurado.`);
                }
            }
        }

        await this.page.waitForTimeout(1500);
    }

    /**
     * Procesa el pago, espera a que cargue la pantalla con el 'Código de pedido' o 'Tu pedido ha sido creado con éxito' y lo extrae
     * @returns {Promise<string>} Número / Código de Pedido
     */
    async procesarPagoYConfirmarOrden() {
        console.log("Iniciando proceso de pago y creación de orden en Venezuela...");

        this.codigoPedido = null;

        // Escucha de respuesta de red de creación de orden (API)
        const promesaRespuestaOrden = this.page.waitForResponse(
            response => /order|checkout|transaction|payment|pedido/i.test(response.url()) && response.request().method() === 'POST',
            { timeout: 20000 }
        ).then(async (res) => {
            try {
                const json = await res.json();
                const rawCode = json.orderNumber || json.orderId || json.data?.orderNumber || json.data?.orderId || (json.id && typeof json.id === 'string' && json.id.length > 4 ? json.id : null);
                if (rawCode && !['200', '201', 'ok', 'success', 'true'].includes(String(rawCode).toLowerCase())) {
                    return String(rawCode);
                }
            } catch (e) {}
            return null;
        }).catch(() => null);

        // 1. Hacer clic en el botón de Pagar / Realizar Pedido
        const btnPagar = this.btnPagar.last();
        await btnPagar.waitFor({ state: 'visible', timeout: 10000 });
        await btnPagar.scrollIntoViewIfNeeded().catch(() => {});

        console.log("Haciendo clic en el botón 'Pagar' en Venezuela...");
        await btnPagar.click({ force: true }).catch(async () => {
            await btnPagar.evaluate(b => b.click());
        });

        // 2. Monitorear estado: 'Procesando...'
        console.log("Esperando procesamiento del pedido...");
        if (await this.indicadorProcesando.first().isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log("⏳ [Estado]: Procesando orden en curso...");
        }

        // 3. Monitorear estado: 'Orden creada exitosamente'
        const toastExito = this.toastOrdenCreada.first();
        if (await toastExito.isVisible({ timeout: 8000 }).catch(() => false)) {
            const msg = await toastExito.innerText().catch(() => 'Orden creada exitosamente');
            console.log(`🎉 [Toast Confirmado]: "${msg.trim()}"`);
        }

        // 4. ESPERAR A QUE LA PANTALLA TRANSICIONE AL DETALLE DE LA ORDEN CON EL CÓDIGO DE PEDIDO
        console.log("Esperando a que la pantalla cargue el Detalle de la Orden y el Código del Pedido en Venezuela...");

        // Esperar a que el botón de pagar y el checkout se desmonten
        await this.btnPagar.last().waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});

        const labelCodigoPedido = this.page.locator('text=/c[óo]digo d?e?l?\s*pedido|n[úu]mero d?e?l?\s*pedido|n[úu]mero de orden/i')
            .or(this.page.locator('p, span, div, h1, h2, h3, strong').filter({ hasText: /c[óo]digo d?e?l?\s*pedido|n[úu]mero d?e?l?\s*pedido/i }))
            .or(this.page.locator('[class*="OrderDetail"], [class*="order-detail"], [class*="OrderCard"]'));

        // Monitoreo activo segundo a segundo hasta que aparezca el código o la pantalla de detalle de orden
        for (let seg = 1; seg <= 35; seg++) {
            const visible = await labelCodigoPedido.first().isVisible().catch(() => false);
            
            const textoBody = await this.page.innerText('body').catch(() => '');
            const matchBody = textoBody.match(/c[óo]digo de pedido:\s*([0-9A-Za-z-]+)/i)
                || textoBody.match(/c[óo]digo d?e?l?\s*pedido:\s*([0-9A-Za-z-]+)/i)
                || textoBody.match(/#(VE-[0-9]+|[0-9]{5,}-[0-9]{4,}|[0-9]{6,})/i)
                || textoBody.match(/(\d{8,12}-\d{4,8})/);

            const codigoEncontrado = matchBody && matchBody[1] && !['200', '201', '400', '500', 'procesando'].includes(matchBody[1].toLowerCase());

            if (visible || codigoEncontrado) {
                console.log(`✅ Detalle de la orden y código detectados (segundo ${seg}).`);
                break;
            }

            if (seg % 5 === 0) {
                console.log(`⏳ Esperando renderizado de la pantalla de detalle... (${seg}/35s)`);
            }
            await this.page.waitForTimeout(1000);
        }

        // Dar un tiempo adicional para que los datos del código y la tarjeta terminen de pintarse en el DOM
        await this.page.waitForTimeout(3000);

        // Scroll físico y centrado de la tarjeta de la orden para que salga perfecta en la captura
        console.log("Centrando la tarjeta de la orden en pantalla...");
        const elementoCodigo = this.page.locator('text=/c[óo]digo d?e?l?\s*pedido|n[úu]mero d?e?l?\s*pedido/i').first();
        if (await elementoCodigo.isVisible({ timeout: 2000 }).catch(() => false)) {
            await elementoCodigo.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
        } else {
            await this.page.mouse.wheel(0, 300);
        }

        await this.page.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && /c[óo]digo d?e?l?\s*pedido|n[úu]mero d?e?l?\s*pedido/i.test(e.innerText));
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }).catch(() => {});

        await this.page.waitForTimeout(2000);

        // 5. Extraer el valor exacto del código de pedido (ej. '0000002961-013401')
        console.log("Extrayendo código de pedido de la pantalla de detalle en Venezuela...");

        for (let reintento = 1; reintento <= 8; reintento++) {
            const elemento = this.page.locator('text=/c[óo]digo d?e?l?\s*pedido|n[úu]mero d?e?l?\s*pedido/i')
                .or(this.page.locator('p, span, div, h1, h2, h3, strong').filter({ hasText: /c[óo]digo d?e?l?\s*pedido|n[úu]mero d?e?l?\s*pedido/i })).first();

            if (await elemento.isVisible({ timeout: 1500 }).catch(() => false)) {
                const textoPadre = await elemento.evaluate(el => {
                    return (el.parentElement?.innerText || el.innerText || '').trim();
                }).catch(() => '');

                const match = textoPadre.match(/c[óo]digo de pedido:\s*([0-9A-Za-z-]+)/i)
                    || textoPadre.match(/c[óo]digo d?e?l?\s*pedido:\s*([0-9A-Za-z-]+)/i);
                if (match && match[1] && !['200', '201', 'procesando'].includes(match[1].toLowerCase())) {
                    this.codigoPedido = match[1].trim();
                    break;
                }
            }

            const textoBody = await this.page.innerText('body').catch(() => '');
            const matchBody = textoBody.match(/c[óo]digo de pedido:\s*([0-9A-Za-z-]+)/i)
                || textoBody.match(/c[óo]digo d?e?l?\s*pedido:\s*([0-9A-Za-z-]+)/i)
                || textoBody.match(/#(VE-[0-9]+|[0-9]{5,}-[0-9]{4,}|[0-9]{6,})/i)
                || textoBody.match(/(\d{8,12}-\d{4,8})/);

            if (matchBody && matchBody[1] && !['200', '201', 'procesando'].includes(matchBody[1].toLowerCase())) {
                this.codigoPedido = matchBody[1].trim();
                break;
            }

            await this.page.waitForTimeout(1000);
        }

        if (!this.codigoPedido) {
            const codigoRed = await promesaRespuestaOrden;
            if (codigoRed && !['200', '201', 'ok', 'true'].includes(String(codigoRed).toLowerCase())) {
                this.codigoPedido = codigoRed;
            }
        }

        if (!this.codigoPedido) {
            const urlActual = this.page.url();
            const matchUrl = urlActual.match(/(?:order|pedido|orden|checkout)[\/=]([A-Za-z0-9-]+)/i);
            if (matchUrl && matchUrl[1] && !['success', 'confirm', 'detail', 'order', 'checkout'].includes(matchUrl[1].toLowerCase())) {
                this.codigoPedido = matchUrl[1];
            }
        }

        console.log(`======================================================`);
        console.log(`🎉 ¡PEDIDO CREADO CON ÉXITO EN VENEZUELA!`);
        console.log(`📋 Código de Pedido: [ ${this.codigoPedido || 'CONFIRMADO'} ]`);
        console.log(`======================================================`);

        // Pausa para asegurar la captura completa en el reporte ejecutivo
        await this.page.waitForTimeout(5000);

        return this.codigoPedido;
    }
}
