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
        
        // Esperar cierre del modal y estabilización
        await this.page.locator('.AddressForm, .Modal, [role="dialog"]').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.page.waitForTimeout(3000);
    }

    async asegurarDatosFacturacion() {
        console.log("Verificando checkbox 'Utilizar mi información para la facturación'...");

        const seccionFacturacion = this.page.locator('text=/datos de facturaci[óo]n/i').first();
        if (await seccionFacturacion.isVisible({ timeout: 2000 }).catch(() => false)) {
            await seccionFacturacion.scrollIntoViewIfNeeded().catch(() => {});
        }

        const checkLabel = this.page.locator('label, div, span')
            .filter({ hasText: /utilizar mi informaci[óo]n para la facturaci[óo]n|misma informaci[óo]n para facturaci[óo]n/i })
            .or(this.page.getByText(/utilizar mi informaci[óo]n para la facturaci[óo]n/i))
            .last();

        if (await checkLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
            const inputCheck = checkLabel.locator('input[type="checkbox"]').first()
                .or(this.page.locator('input[type="checkbox"][name*="billing"], input[type="checkbox"][id*="billing"], input[type="checkbox"][name*="same"]').first());

            let isChecked = false;
            if (await inputCheck.isVisible({ timeout: 1000 }).catch(() => false)) {
                isChecked = await inputCheck.isChecked().catch(() => false);
            } else {
                isChecked = await checkLabel.evaluate(el => {
                    const inp = el.querySelector('input[type="checkbox"]');
                    if (inp) return inp.checked;
                    return el.classList.contains('active') || el.classList.contains('checked') || el.getAttribute('aria-checked') === 'true';
                }).catch(() => false);
            }

            if (!isChecked) {
                console.log("Marcando checkbox: 'Utilizar mi información para la facturación'...");
                await checkLabel.click({ force: true }).catch(async () => {
                    await checkLabel.evaluate(el => el.click());
                });
                await this.page.evaluate(() => {
                    const labels = Array.from(document.querySelectorAll('label, div, span'));
                    const match = labels.find(l => /utilizar mi informaci[óo]n para la facturaci[óo]n/i.test(l.innerText || ''));
                    if (match) {
                        match.click();
                        const inp = match.querySelector('input[type="checkbox"]');
                        if (inp) {
                            inp.checked = true;
                            inp.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                }).catch(() => {});
                console.log("✅ Checkbox de facturación marcado.");
            } else {
                console.log("✅ Checkbox de facturación ya se encontraba marcado.");
            }
        }
        await this.page.waitForTimeout(1000);
    }

    async llenarDatosPersonales(cliente) {
        console.log("Llenando datos personales del cliente...");
        await this.llenarCampoSeguro(this.inputName, cliente.name);
        await this.llenarCampoSeguro(this.inputLastName, cliente.lastName);
        await this.llenarCampoSeguro(this.inputEmail, cliente.email);
        await this.llenarCampoSeguro(this.inputPhoneCustomer, cliente.phone);
        await this.llenarCampoSeguro(this.inputDocument, cliente.document);
        
        // Asegurar siempre el check de 'Utilizar mi información para la facturación'
        await this.asegurarDatosFacturacion();

        await this.page.waitForTimeout(2000);
    }

    /**
     * Completa el modal o formulario para agregar una nueva tarjeta de débito/crédito
     * @param {object} cardData Datos de la tarjeta
     */
    async agregarNuevaTarjeta(cardData) {
        console.log("Iniciando proceso para agregar nueva tarjeta...");

        // 1. Localizar y hacer clic en el botón negro '➕ Nueva tarjeta'
        for (let intento = 1; intento <= 5; intento++) {
            console.log(`Intento ${intento}: Haciendo clic en el botón '➕ Nueva tarjeta'...`);

            // Estrategia A: Playwright text selector directo
            await this.page.click('text=/nueva tarjeta/i', { timeout: 3000, force: true }).catch(() => {});
            
            // Estrategia B: Localizador de botón
            const btnNuevaTarjeta = this.page.locator('button, [role="button"], div, a, span')
                .filter({ hasText: /nueva tarjeta/i })
                .last();

            if (await btnNuevaTarjeta.isVisible({ timeout: 2000 }).catch(() => false)) {
                await btnNuevaTarjeta.scrollIntoViewIfNeeded().catch(() => {});
                const box = await btnNuevaTarjeta.boundingBox().catch(() => null);
                if (box) {
                    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
                }
                await btnNuevaTarjeta.click({ force: true }).catch(() => {});
            }

            // Estrategia C: Invocación en todos los ancestros y React Fiber
            await this.page.evaluate(() => {
                const all = Array.from(document.querySelectorAll('*'));
                const textNode = all.reverse().find(el => /nueva tarjeta/i.test((el.innerText || el.textContent || '').trim()) && (el.innerText || '').length < 35);
                if (textNode) {
                    let curr = textNode;
                    let depth = 0;
                    while (curr && curr !== document.body && depth < 5) {
                        curr.click();
                        curr.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                        curr.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                        curr.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                        
                        const rKey = Object.keys(curr).find(k => k.startsWith('__reactProps'));
                        if (rKey && curr[rKey]?.onClick) {
                            curr[rKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                        }

                        const fKey = Object.keys(curr).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
                        if (fKey && curr[fKey]) {
                            let fiber = curr[fKey];
                            let fDepth = 0;
                            while (fiber && fDepth < 6) {
                                if (fiber.memoizedProps?.onClick) {
                                    fiber.memoizedProps.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                                }
                                fiber = fiber.return;
                                fDepth++;
                            }
                        }

                        curr = curr.parentElement;
                        depth++;
                    }
                }
            }).catch(() => {});

            await this.page.waitForTimeout(2000);

            // Verificar si el modal ya abrió
            const modalAbierto = await this.page.locator('.Modal, [role="dialog"], [class*="modal" i], [class*="dialog" i], [class*="drawer" i], input[placeholder*="número" i]').first().isVisible({ timeout: 1000 }).catch(() => false);
            if (modalAbierto) {
                console.log("✅ Modal de tarjeta abierto exitosamente.");
                break;
            }
        }

        // 2. Determinar el contenedor estricto (Modal, Iframe o sección de Pago - NUNCA el formulario de cliente)
        const modalContainer = this.page.locator('.Modal, [role="dialog"], [class*="modal" i], [class*="dialog" i], [class*="CardForm" i]').first();
        const tieneModal = await modalContainer.isVisible({ timeout: 3000 }).catch(() => false);

        // Buscar iframe si aplica
        const iframeCard = this.page.frames().find(f => f !== this.page.mainFrame() && (f.url().includes('card') || f.url().includes('kushki') || f.url().includes('payu') || f.url().includes('payment')));

        let scope = this.page;
        if (iframeCard) {
            console.log("Detectado iframe de pasarela de pago para tarjeta.");
            scope = iframeCard;
        } else if (tieneModal) {
            console.log("Detectado contenedor Modal para formulario de tarjeta.");
            scope = modalContainer;
        } else {
            console.log("Usando contenedor de Métodos de Pago para tarjeta...");
            scope = this.page.locator('.PaymentMethods, [class*="PaymentMethod"], [class*="payment" i]').last();
        }

        // 1. Número de Tarjeta
        console.log(`Ingresando número de tarjeta en el modal: ${cardData.number}...`);
        const inputNumero = scope.locator('input[placeholder*="número" i], input[placeholder*="numero" i], input[name*="number" i], input[name*="card" i], input[id*="card" i], input[autocomplete*="cc-number" i]').first();
        if (await inputNumero.isVisible({ timeout: 5000 }).catch(() => false)) {
            await inputNumero.click();
            await inputNumero.fill(cardData.numberClean || cardData.number);
            await inputNumero.evaluate((el, v) => {
                el.value = v;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('blur', { bubbles: true }));
            }, cardData.numberClean || cardData.number).catch(() => {});
        }

        // 2. Mes de expiración (Placeholder MM o contenedor Mes)
        const mesAEnviar = String(cardData.expiryMonth || '01');
        console.log(`Ingresando Mes de expiración: "${mesAEnviar}"...`);
        const inputMes = scope.locator('input[placeholder="MM"], input[placeholder*="MM" i], input[name*="month" i], input[id*="month" i]').first()
            .or(scope.locator('div:has-text("Mes") input, label:has-text("Mes") input').first());

        if (await inputMes.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inputMes.click();
            await inputMes.fill(mesAEnviar);
            await inputMes.evaluate((el, v) => {
                el.value = v;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('blur', { bubbles: true }));
            }, mesAEnviar).catch(() => {});
        }

        // 3. Año de expiración (Placeholder YYYY o contenedor Año de expiración)
        const anioAEnviar = String(cardData.expiryFullYear || cardData.expiryYear || '2030');
        console.log(`Ingresando Año de expiración (YYYY): "${anioAEnviar}"...`);
        const inputAnio = scope.locator('input[placeholder="YYYY"], input[placeholder*="YYYY" i], input[name*="year" i], input[id*="year" i]').first()
            .or(scope.locator('div:has-text("Año") input, label:has-text("Año") input, div:has-text("Ano") input').first());

        if (await inputAnio.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inputAnio.click();
            await inputAnio.fill(anioAEnviar);
            await inputAnio.evaluate((el, v) => {
                el.value = v;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('blur', { bubbles: true }));
            }, anioAEnviar).catch(() => {});
        }

        // 4. Código de Seguridad CVV
        const cvvAEnviar = String(cardData.cvv || '123');
        console.log(`Ingresando código de seguridad CVV: "${cvvAEnviar}"...`);
        const inputCvv = scope.locator('input[placeholder*="CVV" i], input[placeholder*="CVC" i], input[name*="cvv" i], input[name*="cvc" i], input[placeholder*="seguridad" i], input[id*="cvv" i]').first()
            .or(scope.locator('div:has-text("Código de seguridad") input, label:has-text("Código de seguridad") input, div:has-text("CVV") input').first());

        if (await inputCvv.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inputCvv.click();
            await inputCvv.fill(cvvAEnviar);
            await inputCvv.evaluate((el, v) => {
                el.value = v;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('blur', { bubbles: true }));
            }, cvvAEnviar).catch(() => {});
        }

        // 5. Checkbox "Utilizar mismos datos de la compra" (asegurar que esté marcado)
        const checkMismosDatos = scope.locator('input[type="checkbox"], [role="checkbox"], label').filter({ hasText: /utilizar mismos datos/i }).first();
        if (await checkMismosDatos.isVisible({ timeout: 2000 }).catch(() => false)) {
            const isChecked = await checkMismosDatos.evaluate(el => {
                const inp = el.querySelector('input[type="checkbox"]') || (el.tagName === 'INPUT' ? el : null);
                return inp ? inp.checked : el.classList.contains('active') || el.classList.contains('checked');
            }).catch(() => true);

            if (!isChecked) {
                console.log("Marcando casilla 'Utilizar mismos datos de la compra'...");
                await checkMismosDatos.click({ force: true }).catch(() => {});
            }
        }

        await this.page.waitForTimeout(1000);

        // 6. Guardar Tarjeta en el Modal (botón rojo 'Guardar tarjeta')
        console.log("Guardando tarjeta...");
        const btnGuardarTarjeta = scope.locator('button')
            .filter({ hasText: /guardar tarjeta|guardar|confirmar/i })
            .first()
            .or(scope.locator('button[type="submit"]').first());

        if (await btnGuardarTarjeta.isVisible({ timeout: 3000 }).catch(() => false)) {
            await btnGuardarTarjeta.click({ force: true }).catch(async () => {
                await btnGuardarTarjeta.evaluate(b => b.click());
            });
        }

        // Esperar cierre del modal
        await this.page.locator('.Modal, [role="dialog"]').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(2000);
        console.log("✅ Proceso de adición de tarjeta finalizado.");
    }

    /**
     * Selecciona el método de pago en Colombia:
     * - 'Tarjeta' / 'Tarjeta Débito / Crédito'
     * - 'Datáfono'
     * - 'Efectivo (Monto exacto)'
     * - 'Efectivo (Con cambio)'
     * @param {'tarjeta' | 'datafono' | 'efectivo_exacto' | 'efectivo_cambio' | string} metodoPago
     * @param {string|number|object} [montoCambioOCard]
     */
    async seleccionarMetodoPago(metodoPago = 'Datáfono', montoCambioOCard = null) {
        const metodoLower = (metodoPago || '').toLowerCase();
        const esTarjeta = metodoLower.includes('tarjeta') || metodoLower.includes('debito') || metodoLower.includes('débito') || metodoLower.includes('credito') || metodoLower.includes('crédito') || metodoLower === 'card';
        const esDatafono = !esTarjeta && (metodoLower.includes('datafono') || metodoLower.includes('datáfono') || metodoLower.includes('punto') || metodoLower === 'pos');
        const esEfectivoCambio = !esTarjeta && (metodoLower.includes('cambio') || metodoLower === 'efectivo_cambio');
        const esEfectivoExacto = !esTarjeta && !esDatafono && !esEfectivoCambio;

        // 1. Esperar a que la página esté estable y hacer scroll
        await this.page.locator('.Modal, [role="dialog"], .Loading').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(1000);

        const seccionMetodoPago = this.page.locator('text=/método de pago|metodo de pago/i').first();
        await seccionMetodoPago.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(1000);

        if (esTarjeta) {
            console.log('Seleccionando método de pago en Colombia: "Tarjeta" -> "Débito / Crédito"...');

            // PASO 1: Seleccionar el Radio Button Principal 'Tarjeta'
            console.log('1. Seleccionando Radio Button Principal: "Tarjeta"...');
            const textoTarjeta = this.page.getByText(/^tarjeta$/i).first();
            if (await textoTarjeta.isVisible({ timeout: 3000 }).catch(() => false)) {
                await textoTarjeta.scrollIntoViewIfNeeded().catch(() => {});
                await textoTarjeta.click({ force: true }).catch(() => {});
                const boxT = await textoTarjeta.boundingBox().catch(() => null);
                if (boxT) {
                    await this.page.mouse.click(boxT.x - 22, boxT.y + boxT.height / 2).catch(() => {});
                    await this.page.mouse.click(boxT.x - 14, boxT.y + boxT.height / 2).catch(() => {});
                }
            }

            await this.page.evaluate(() => {
                const nodes = Array.from(document.querySelectorAll('*'));
                const el = nodes.find(e => /^tarjeta$/i.test((e.innerText || e.textContent || '').trim()));
                if (el) {
                    el.click();
                    const parent = el.closest('label') || el.parentElement;
                    if (parent) parent.click();
                }
            }).catch(() => {});

            await this.page.waitForTimeout(1000);

            // PASO 2: Seleccionar el Sub-Radio Button 'Débito / Crédito'
            console.log('2. Seleccionando Sub-Radio Button: "Débito / Crédito"...');
            for (let intento = 1; intento <= 6; intento++) {
                // Obtener coordenadas exactas del elemento y su círculo
                const coords = await this.page.evaluate(() => {
                    const all = Array.from(document.querySelectorAll('*'));
                    const match = all.reverse().find(el => {
                        const txt = (el.innerText || el.textContent || '').trim();
                        return /d[eé]bito\s*\/\s*cr[eé]dito/i.test(txt) && txt.length < 50;
                    });
                    if (!match) return null;

                    let row = match;
                    while (row.parentElement && row.parentElement !== document.body) {
                        if (row.parentElement.querySelectorAll('svg, img, [class*="visa" i], [class*="card" i]').length > 0) {
                            row = row.parentElement;
                            break;
                        }
                        if (row.tagName === 'LABEL' || row.getAttribute('role') === 'radio') break;
                        row = row.parentElement;
                    }

                    const rect = row.getBoundingClientRect();
                    const circle = row.querySelector('input[type="radio"], [class*="radio" i], [class*="circle" i], svg, span:first-child');
                    const circleRect = circle ? circle.getBoundingClientRect() : null;

                    return {
                        row: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                        circle: circleRect && circleRect.width > 0 ? { x: circleRect.x, y: circleRect.y, width: circleRect.width, height: circleRect.height } : null
                    };
                }).catch(() => null);

                if (coords) {
                    if (coords.circle) {
                        console.log(`Haciendo clic físico en el círculo de Débito/Crédito en (${coords.circle.x + coords.circle.width / 2}, ${coords.circle.y + coords.circle.height / 2})...`);
                        await this.page.mouse.click(coords.circle.x + coords.circle.width / 2, coords.circle.y + coords.circle.height / 2).catch(() => {});
                    } else {
                        console.log(`Haciendo clic físico en el extremo izquierdo de la fila en (${coords.row.x + 15}, ${coords.row.y + coords.row.height / 2})...`);
                        await this.page.mouse.click(coords.row.x + 15, coords.row.y + coords.row.height / 2).catch(() => {});
                    }
                    // Clic en el texto
                    await this.page.mouse.click(coords.row.x + 60, coords.row.y + coords.row.height / 2).catch(() => {});
                } else {
                    // Fallback con locators de Playwright
                    const debitoLoc = this.page.getByText(/d[eé]bito\s*\/\s*cr[eé]dito/i).first();
                    if (await debitoLoc.isVisible({ timeout: 2000 }).catch(() => false)) {
                        await debitoLoc.click({ force: true }).catch(() => {});
                    }
                }

                // Invocación exhaustiva en DOM y React Fiber
                await this.page.evaluate(() => {
                    const all = Array.from(document.querySelectorAll('*'));
                    const match = all.reverse().find(el => {
                        const txt = (el.innerText || el.textContent || '').trim();
                        return /d[eé]bito\s*\/\s*cr[eé]dito/i.test(txt) && txt.length < 50;
                    });
                    if (!match) return;

                    let curr = match;
                    for (let i = 0; i < 5; i++) {
                        if (!curr) break;

                        curr.click();
                        curr.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                        curr.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                        curr.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                        const rKey = Object.keys(curr).find(k => k.startsWith('__reactProps'));
                        if (rKey && curr[rKey]) {
                            if (typeof curr[rKey].onClick === 'function') curr[rKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                            if (typeof curr[rKey].onChange === 'function') curr[rKey].onChange({ target: { checked: true } });
                        }

                        const fKey = Object.keys(curr).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
                        if (fKey && curr[fKey]) {
                            let fiber = curr[fKey];
                            let depth = 0;
                            while (fiber && depth < 6) {
                                if (fiber.memoizedProps?.onClick) fiber.memoizedProps.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                                if (fiber.memoizedProps?.onChange) fiber.memoizedProps.onChange({ target: { checked: true } });
                                fiber = fiber.return;
                                depth++;
                            }
                        }

                        const radio = curr.querySelector('input[type="radio"]') || (curr.tagName === 'INPUT' ? curr : null);
                        if (radio) {
                            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set;
                            if (nativeSetter) nativeSetter.call(radio, true);
                            radio.checked = true;
                            radio.dispatchEvent(new Event('input', { bubbles: true }));
                            radio.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        curr = curr.parentElement;
                    }
                }).catch(() => {});

                await this.page.waitForTimeout(1500);

                // Verificar si apareció el botón de agregar tarjeta o el formulario
                const btnNuevaPresente = await this.page.locator('button, [role="button"], a, div, span')
                    .filter({ hasText: /agregar nueva tarjeta|nueva tarjeta|agregar tarjeta|añadir tarjeta|\+ agregar/i })
                    .first().isVisible({ timeout: 1000 }).catch(() => false);

                if (btnNuevaPresente) {
                    console.log('✅ Sub-radio "Débito / Crédito" seleccionado correctamente (botón nueva tarjeta visible).');
                    break;
                } else {
                    console.log(`Aviso (Intento ${intento}): Reintentando selección de "Débito / Crédito"...`);
                }
            }

            await this.page.waitForTimeout(1000);

            // PASO 3: Abrir modal y completar datos de tarjeta
            const cardData = (typeof montoCambioOCard === 'object' && montoCambioOCard !== null) ? montoCambioOCard : {
                number: "4111 1111 1111 1111",
                numberClean: "4111111111111111",
                expiry: "01/30",
                expiryMonth: "01",
                expiryYear: "30",
                cvv: "123",
                name: "APRO APRO",
                document: "123456789"
            };

            await this.agregarNuevaTarjeta(cardData);

            // Re-verificar que el checkbox de facturación permanezca marcado
            await this.asegurarDatosFacturacion();
            return;
        }

        const nombreBuscar = esDatafono ? 'Datáfono' : 'Efectivo';
        console.log(`Seleccionando método de pago en Colombia: "${nombreBuscar}"...`);

        const regexNombre = esDatafono ? /dat[aá]fono/i : /^efectivo$/i;

        for (let intento = 1; intento <= 6; intento++) {
            // 1. Encontrar el texto "Datáfono" o "Efectivo"
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

            // 2. Clic en label o contenedor
            const labelDirect = this.page.locator('label, [class*="Radio"], [class*="radio"]').filter({ hasText: regexNombre }).last();
            if (await labelDirect.isVisible().catch(() => false)) {
                await labelDirect.click({ force: true }).catch(() => {});
            }

            // 3. Disparo a nivel DOM y React Props
            await this.page.evaluate((esDatafonoFlag) => {
                const targetRegex = esDatafonoFlag ? /dat[aá]fono/i : /^efectivo$/i;
                const allNodes = Array.from(document.querySelectorAll('*'));
                
                const matchNode = allNodes.reverse().find(el => {
                    const txt = (el.innerText || el.textContent || '').trim();
                    return targetRegex.test(txt) && txt.length < 25;
                });

                if (matchNode) {
                    matchNode.click();
                    let parent = matchNode.parentElement;
                    let depth = 0;
                    while (parent && parent !== document.body && depth < 4) {
                        parent.click();
                        
                        const reactKey = Object.keys(parent).find(k => k.startsWith('__reactProps'));
                        if (reactKey && parent[reactKey] && typeof parent[reactKey].onClick === 'function') {
                            parent[reactKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                        }

                        const radio = parent.querySelector('input[type="radio"]');
                        if (radio) {
                            radio.checked = true;
                            radio.click();
                            radio.dispatchEvent(new Event('input', { bubbles: true }));
                            radio.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        parent = parent.parentElement;
                        depth++;
                    }
                }
            }, esDatafono).catch(() => {});

            await this.page.waitForTimeout(1500);

            // 4. Verificar si 'Débito / Crédito' y 'No olvides ingresar tu tarjeta' desaparecieron
            const advertenciaTarjeta = this.page.locator('text=/no olvides ingresar tu tarjeta|débito \\/ crédito/i');
            const sigueTarjeta = await advertenciaTarjeta.first().isVisible({ timeout: 1000 }).catch(() => false);
            if (!sigueTarjeta) {
                console.log(`✅ Confirmado: "${nombreBuscar}" seleccionado correctamente.`);
                break;
            } else {
                console.log(`Aviso (Intento ${intento}): Tarjeta sigue activa. Reintentando selección de "${nombreBuscar}"...`);
            }
        }

        if (!esDatafono) {
            // Localizador estricto del Switch de 'Pagar con valor total / Monto exacto' (NUNCA tocar el checkbox de facturación)
            const switchValorTotal = this.page.locator('label, div, p')
                .filter({ hasText: /valor total|monto exacto|total exacto|pago total|monto a pagar/i })
                .locator('input, [role="switch"], .Switch, [class*="switch"], [class*="Toggle"], [class*="checkbox"]')
                .or(this.page.locator('label').filter({ hasText: /valor total|monto exacto|total exacto|pago total/i }));

            const switchEl = switchValorTotal.first();

            const switchPresente = await switchEl.isVisible({ timeout: 2000 }).catch(() => false);
            if (switchPresente) {
                const estaActivo = await switchEl.evaluate(node => {
                    if (node.tagName === 'INPUT') return node.checked;
                    if (node.getAttribute('aria-checked') !== null) return node.getAttribute('aria-checked') === 'true';
                    if (node.getAttribute('data-checked') !== null) return node.getAttribute('data-checked') === 'true';
                    const inputInside = node.querySelector('input[type="checkbox"]');
                    if (inputInside) return inputInside.checked;
                    return node.classList.contains('active') || node.classList.contains('checked') || node.classList.contains('on');
                }).catch(() => false);

                if (esEfectivoExacto && !estaActivo) {
                    console.log('Activando switch de valor total (monto exacto)...');
                    await switchEl.click({ force: true }).catch(async () => {
                        await switchEl.evaluate(el => el.click());
                    });
                    console.log('✅ Switch de valor total activado.');
                } else if (esEfectivoCambio && estaActivo) {
                    console.log('Desactivando switch de valor total para habilitar input de cambio...');
                    await switchEl.click({ force: true }).catch(async () => {
                        await switchEl.evaluate(el => el.click());
                    });
                    console.log('✅ Switch de valor total desactivado.');
                }
            }

            if (esEfectivoCambio) {
                await this.page.waitForTimeout(1000);

                let montoADar = montoCambio || '100000';
                
                const totalElement = this.page.locator('.OrderSummary, [class*="Total"], [class*="total"], strong, span')
                    .filter({ hasText: /\$\s*\d+|\b\d+[.,]\d{2}\b/ }).last();
                if (await totalElement.isVisible({ timeout: 1500 }).catch(() => false)) {
                    const totalText = await totalElement.innerText().catch(() => '');
                    const matchNum = totalText.match(/(\d+[.,]\d{2}|\d+)/);
                    if (matchNum) {
                        const totalNum = parseFloat(matchNum[1].replace(/[\.,]/g, ''));
                        if (!isNaN(totalNum) && totalNum > 0) {
                            montoADar = String(totalNum + 20000);
                        }
                    }
                }

                const inputMonto = this.page.locator('input[name*="change"], input[name*="amount"], input[name*="cash"], input[placeholder*="monto"], input[placeholder*="cambio"], input[type="number"], input[placeholder*="con cuánto" i], input[placeholder*="con cuanto" i]').first()
                    .or(this.page.locator('.PaymentMethods input[type="text"], [class*="Payment"] input[type="text"], input[type="text"]').last());

                if (await inputMonto.isVisible({ timeout: 4000 }).catch(() => false)) {
                    console.log(`Llenando monto que se va a pagar (mayor al total): "$${montoADar}"`);
                    await inputMonto.click();
                    await inputMonto.fill(montoADar);
                    await inputMonto.evaluate((el, v) => {
                        el.value = v;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.dispatchEvent(new Event('blur', { bubbles: true }));
                    }, montoADar).catch(() => {});
                    console.log(`✅ Monto de pago "$${montoADar}" configurado.`);
                }
            }
        }

        // Re-verificar que el checkbox de facturación permanezca marcado
        await this.asegurarDatosFacturacion();

        await this.page.waitForTimeout(1500);
    }

    /**
     * Procesa el pago, espera a que cargue la pantalla con el 'Código de pedido' y lo extrae con exactitud
     * @returns {Promise<string>} Número / Código de Pedido
     */
    async procesarPagoYConfirmarOrden() {
        console.log("Iniciando proceso de pago y creación de orden...");

        this.codigoPedido = null;

        // Asegurar una última vez que los datos de facturación estén marcados
        await this.asegurarDatosFacturacion();

        // 1. Hacer clic en el botón de Pagar / Realizar Pedido
        const btnPagar = this.btnPagar.last();
        await btnPagar.waitFor({ state: 'visible', timeout: 10000 });
        await btnPagar.scrollIntoViewIfNeeded().catch(() => {});

        console.log("Haciendo clic en el botón 'Pagar'...");
        await btnPagar.click({ force: true }).catch(async () => {
            await btnPagar.evaluate(b => b.click());
        });

        // 2. Monitorear estado: 'Procesando...'
        console.log("Esperando procesamiento del pedido...");
        if (await this.indicadorProcesando.first().isVisible({ timeout: 4000 }).catch(() => false)) {
            console.log("⏳ [Estado]: Procesando orden en curso...");
        }

        // 3. Monitorear estado: 'Orden creada exitosamente'
        const toastExito = this.toastOrdenCreada.first();
        if (await toastExito.isVisible({ timeout: 15000 }).catch(() => false)) {
            const msg = await toastExito.innerText().catch(() => 'Orden creada exitosamente');
            console.log(`🎉 [Toast Confirmado]: "${msg.trim()}"`);
        }

        // 4. ESPERAR A QUE CARGUE LA PANTALLA DE DETALLE CON EL TEXTO "Código de pedido:"
        console.log("Esperando a que la pantalla de Detalle de la Orden cargue por completo...");

        const labelCodigoPedido = this.page.locator('text=/código de pedido|codigo de pedido|código del pedido|número de pedido/i')
            .or(this.page.locator('p, span, div, h1, h2, h3, strong').filter({ hasText: /código de pedido|codigo de pedido|número de pedido/i }));

        await labelCodigoPedido.first().waitFor({ state: 'visible', timeout: 40000 }).catch(() => {
            console.log("Aviso: Esperando renderizado de la tarjeta de pedido...");
        });

        // Scroll físico y centrado de la tarjeta de la orden
        console.log("Haciendo scroll para centrar la tarjeta de pedido en pantalla...");
        await labelCodigoPedido.first().scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
        await this.page.mouse.wheel(0, 450);
        await this.page.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && /código de pedido|código del pedido/i.test(e.innerText));
            if (el) {
                el.scrollIntoView({ behavior: 'instant', block: 'center' });
            }
        }).catch(() => {});

        await this.page.waitForTimeout(2000);

        // 5. Extraer el valor exacto del código de pedido
        console.log("Extrayendo código de pedido de la pantalla de detalle...");

        const elemento = labelCodigoPedido.first();
        if (await elemento.isVisible().catch(() => false)) {
            const textoPadre = await elemento.evaluate(el => {
                return (el.parentElement?.innerText || el.innerText || '').trim();
            }).catch(() => '');

            console.log(`Texto capturado del elemento: "${textoPadre}"`);

            const match = textoPadre.match(/c[óo]digo d?e?l?\s*pedido:\s*([0-9A-Za-z-]+)/i);
            if (match && match[1]) {
                this.codigoPedido = match[1].trim();
            }
        }

        if (!this.codigoPedido) {
            const textoBody = await this.page.innerText('body').catch(() => '');
            const matchBody = textoBody.match(/c[óo]digo d?e?l?\s*pedido:\s*([0-9A-Za-z-]+)/i)
                || textoBody.match(/#(CO-[0-9]+|[0-9]{5,}-[0-9]{4,}|[0-9]{6,})/i);

            if (matchBody && matchBody[1]) {
                this.codigoPedido = matchBody[1].trim();
            }
        }

        console.log(`======================================================`);
        console.log(`🎉 ¡PEDIDO CREADO CON ÉXITO EN COLOMBIA!`);
        console.log(`📋 Código de Pedido: [ ${this.codigoPedido || 'CONFIRMADO'} ]`);
        console.log(`======================================================`);

        await this.page.waitForTimeout(5000);

        return this.codigoPedido;
    }
}
