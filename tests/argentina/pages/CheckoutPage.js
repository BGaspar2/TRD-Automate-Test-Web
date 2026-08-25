export class CheckoutPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

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
        this.inputDocument = page.locator('#document, input[name="document"], input[placeholder*="Documento"], input[placeholder*="DNI"], input[placeholder*="CPF"], input[placeholder*="RUT"]').first();

        this.codigoPedido = null;

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

        // 1. Esperar a que la página de Checkout cargue
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.page.waitForTimeout(2000);

        // 2. Si el formulario de dirección ya está visible (ej. modal ya abierto o formulario embebido), no requerir clic
        const formAddress = this.page.locator('.AddressForm, form.form, [class*="AddressForm"], [class*="address-form"], .Modal form, [role="dialog"] form, [role="dialog"]').first();
        if (await formAddress.isVisible({ timeout: 1500 }).catch(() => false)) {
            console.log("El formulario de dirección ya se encuentra visible.");
            return;
        }

        // 3. Lista de selectores priorizados para el botón 'Completar' de la dirección
        const selectoresCompletar = [
            this.page.getByRole('button', { name: /^completar/i }),
            this.page.locator('.AddressCard, .DeliveryAddressCard, [class*="AddressCard"], [class*="DeliveryAddress"], [class*="FulfillAddress"], [class*="address-card"], [class*="delivery-address"]').locator('button, a, [role="button"], span, div').filter({ hasText: /completar|completar dirección|editar|cambiar|agregar/i }),
            this.page.locator('button, [role="button"], a, div[class*="cursor-pointer"], span[class*="cursor-pointer"]').filter({ hasText: /^completar/i }),
            this.page.getByRole('button', { name: /completar dirección|completar direccion|agregar dirección|agregar direccion/i }),
            this.page.locator('button:has-text("Completar"), [role="button"]:has-text("Completar"), a:has-text("Completar")'),
            this.page.locator('[data-testid*="complete"], [data-testid*="address-edit"], [data-testid*="address-button"]')
        ];

        let btnEncontrado = null;

        // Intentar encontrar un botón visible esperando hasta 8 segundos
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

            // Intentar abrir la modal (hasta 3 intentos de clic si React tarda en reaccionar)
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

                // Esperar a que la modal aparezca
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

        // 1. Esperar a que el contenedor de la modal o formulario esté presente
        const formAddress = this.page.locator('.AddressForm, form.form, [class*="AddressForm"], [class*="address-form"], .Modal form, [role="dialog"] form, [role="dialog"]').first();
        await formAddress.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

        // 2. Seleccionar etiqueta 'Casa' si está visible
        const btnCasa = this.page.locator('.AddressForm button, form.form button, [class*="AddressForm"] button, [role="dialog"] button')
            .filter({ hasText: /casa|home|casa \/ dpto/i }).first();
        if (await btnCasa.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log("Seleccionando etiqueta 'Casa'...");
            await btnCasa.click().catch(() => {});
        }

        // 3. Mapeo directo por selectores e IDs estándar
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

        // 4. Barrido general de inputs dentro del formulario para compatibilidad adicional
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

    /**
     * Asegura que la casilla 'Utilizar mi información para la facturación' esté siempre marcada
     */
    async asegurarDatosFacturacion() {
        console.log("Verificando checkbox 'Utilizar mi información para la facturación' en Argentina...");
        const checkFacturacion = this.page.locator('label, div, p')
            .filter({ hasText: /utilizar mi información para la facturación|utilizar mi informacion para la facturacion|mismos datos de facturación|datos de facturación/i })
            .first();

        if (await checkFacturacion.isVisible({ timeout: 2500 }).catch(() => false)) {
            const estaMarcado = await checkFacturacion.evaluate(node => {
                const input = node.querySelector('input[type="checkbox"]') || (node.tagName === 'INPUT' ? node : null);
                if (input) return input.checked;
                return node.classList.contains('active') || node.classList.contains('checked') || node.getAttribute('aria-checked') === 'true';
            }).catch(() => false);

            if (!estaMarcado) {
                console.log("Marcando checkbox de facturación...");
                await checkFacturacion.click({ force: true }).catch(() => {});
                await this.page.evaluate(() => {
                    const all = Array.from(document.querySelectorAll('label, div, p'));
                    const lbl = all.find(e => /utilizar mi informaci[oó]n para la facturaci[oó]n/i.test((e.innerText || '').trim()));
                    if (lbl) {
                        const inp = lbl.querySelector('input[type="checkbox"]');
                        if (inp && !inp.checked) {
                            inp.checked = true;
                            inp.dispatchEvent(new Event('input', { bubbles: true }));
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
        console.log("Llenando datos personales del cliente en Argentina...");
        await this.llenarCampoSeguro(this.inputName, cliente.name);
        await this.llenarCampoSeguro(this.inputLastName, cliente.lastName);
        await this.llenarCampoSeguro(this.inputEmail, cliente.email);
        await this.llenarCampoSeguro(this.inputPhoneCustomer, cliente.phone);
        await this.llenarCampoSeguro(this.inputDocument, cliente.document);
        
        await this.asegurarDatosFacturacion();
        await this.page.waitForTimeout(2000);
    }

    /**
     * Llena el campo de CVV que aparece debajo de la tarjeta seleccionada en la pantalla principal
     * @param {string} cvv
     */
    async llenarCvvExternoSiAplica(cvv = '123') {
        const cvvValor = String(cvv || '123');

        for (let intento = 1; intento <= 4; intento++) {
            await this.page.waitForTimeout(1000);

            // 1. Inyección y detección por DOM estricta
            const resDom = await this.page.evaluate((val) => {
                const allElements = Array.from(document.querySelectorAll('*'));
                const labelNode = allElements.reverse().find(el => {
                    const text = (el.innerText || el.textContent || '').trim();
                    return /ingresa el cvv/i.test(text) && text.length < 50;
                });

                if (labelNode) {
                    let container = labelNode.parentElement;
                    for (let i = 0; i < 4 && container; i++) {
                        const inputs = Array.from(container.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'));
                        for (const inp of inputs) {
                            const idOrName = ((inp.id || '') + ' ' + (inp.name || '') + ' ' + (inp.placeholder || '')).toLowerCase();
                            if (!idOrName.includes('document') && !idOrName.includes('name') && !idOrName.includes('phone') && !idOrName.includes('email') && !idOrName.includes('street') && !idOrName.includes('dni')) {
                                if (inp.value === val) {
                                    return { found: true, alreadyFilled: true };
                                }
                                inp.focus();
                                const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                                if (setter) setter.call(inp, val);
                                else inp.value = val;
                                inp.dispatchEvent(new Event('input', { bubbles: true }));
                                inp.dispatchEvent(new Event('change', { bubbles: true }));
                                inp.dispatchEvent(new Event('blur', { bubbles: true }));
                                const rect = inp.getBoundingClientRect();
                                return { found: true, alreadyFilled: false, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } };
                            }
                        }
                        container = container.parentElement;
                    }
                }

                // Estrategia B: Buscar input con placeholder '012' o 'CVV'
                const input012 = Array.from(document.querySelectorAll('input')).find(inp => (inp.placeholder || '').trim() === '012' || (inp.placeholder || '').toUpperCase() === 'CVV');
                if (input012) {
                    const idOrName = ((input012.id || '') + ' ' + (input012.name || '')).toLowerCase();
                    if (!idOrName.includes('document') && !idOrName.includes('name') && !idOrName.includes('phone') && !idOrName.includes('email')) {
                        if (input012.value === val) {
                            return { found: true, alreadyFilled: true };
                        }
                        input012.focus();
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                        if (setter) setter.call(input012, val);
                        else input012.value = val;
                        input012.dispatchEvent(new Event('input', { bubbles: true }));
                        input012.dispatchEvent(new Event('change', { bubbles: true }));
                        input012.dispatchEvent(new Event('blur', { bubbles: true }));
                        const rect = input012.getBoundingClientRect();
                        return { found: true, alreadyFilled: false, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } };
                    }
                }

                return { found: false };
            }, cvvValor).catch(() => ({ found: false }));

            if (resDom?.alreadyFilled) {
                console.log("✅ CVV externo ya se encuentra diligenciado en Argentina.");
                break;
            }

            if (resDom?.found && resDom.rect && resDom.rect.width > 0) {
                console.log(`Campo de CVV externo detectado en coordenadas (${resDom.rect.x}, ${resDom.rect.y}). Digitando...`);
                await this.page.mouse.click(resDom.rect.x + resDom.rect.w / 2, resDom.rect.y + resDom.rect.h / 2).catch(() => {});
                await this.page.keyboard.press('Control+A').catch(() => {});
                await this.page.keyboard.press('Backspace').catch(() => {});
                await this.page.keyboard.type(cvvValor, { delay: 50 }).catch(() => {});
                console.log("✅ CVV externo completado con éxito en Argentina.");
                break;
            }

            // 2. Localizadores directos de Playwright
            const inputCvvAfuera = this.page.locator('text=/ingresa el cvv/i').locator('..').locator('input:not([name="document"]):not(#document)')
                .or(this.page.locator('input[placeholder="012"]'))
                .first();

            if (await inputCvvAfuera.isVisible({ timeout: 1000 }).catch(() => false)) {
                const valActual = await inputCvvAfuera.inputValue().catch(() => '');
                if (valActual !== cvvValor) {
                    console.log(`Llenando CVV externo vía selector Playwright: "${cvvValor}"...`);
                    await inputCvvAfuera.scrollIntoViewIfNeeded().catch(() => {});
                    await inputCvvAfuera.click();
                    await inputCvvAfuera.fill('');
                    await inputCvvAfuera.pressSequentially(cvvValor, { delay: 50 });
                    await inputCvvAfuera.evaluate((inp, v) => {
                        inp.value = v;
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                        inp.dispatchEvent(new Event('blur', { bubbles: true }));
                    }, cvvValor).catch(() => {});
                }
                console.log("✅ CVV externo completado con éxito en Argentina.");
                break;
            }
        }
    }

    /**
     * Completa el modal para agregar una nueva tarjeta de débito/crédito en Argentina
     * @param {object} cardData Datos de la tarjeta
     */
    async agregarNuevaTarjeta(cardData) {
        console.log("Iniciando proceso para agregar nueva tarjeta en Argentina...");

        // 1. Localizar y hacer clic en el botón negro '➕ Nueva tarjeta'
        for (let intento = 1; intento <= 5; intento++) {
            console.log(`Intento ${intento}: Haciendo clic en el botón '➕ Nueva tarjeta'...`);

            await this.page.click('text=/nueva tarjeta/i', { timeout: 3000, force: true }).catch(() => {});
            
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

            const modalAbierto = await this.page.locator('.Modal, [role="dialog"], [class*="modal" i], [class*="dialog" i], [class*="drawer" i], input[placeholder*="número" i]').first().isVisible({ timeout: 1000 }).catch(() => false);
            if (modalAbierto) {
                console.log("✅ Modal de tarjeta abierto exitosamente en Argentina.");
                break;
            }
        }

        // 2. Determinar el contenedor estricto (Modal o sección de Pago)
        const modalContainer = this.page.locator('.Modal, [role="dialog"], [class*="modal" i], [class*="dialog" i], [class*="CardForm" i]').first();
        const tieneModal = await modalContainer.isVisible({ timeout: 3000 }).catch(() => false);

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

        const anioAEnviar = String(cardData.expiryFullYear || cardData.expiryYear || '2030');
        const mesAEnviar = String(cardData.expiryMonth || '01');
        const cvvAEnviar = String(cardData.cvv || '123');
        const numAEnviar = String(cardData.numberClean || cardData.number);

        console.log(`Llenando formulario de tarjeta en Argentina: Num=${numAEnviar}, Mes=${mesAEnviar}, Año=${anioAEnviar}, CVV=${cvvAEnviar}...`);

        const textInputs = scope.locator('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])');
        const count = await textInputs.count().catch(() => 0);
        console.log(`Total de inputs de texto detectados en el modal: ${count}`);

        // 1. Número de Tarjeta
        const inpCard = count >= 4 ? textInputs.nth(0) : scope.locator('input[placeholder*="número" i], input[name*="number" i], input[name*="card" i]').first();
        if (await inpCard.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inpCard.click();
            await inpCard.fill('');
            await inpCard.pressSequentially(numAEnviar, { delay: 40 });
        }

        // 2. Mes
        const inpMes = count >= 4 ? textInputs.nth(1) : scope.locator('input[placeholder*="MM" i], input[name*="month" i], div:has-text("Mes") input').first();
        if (await inpMes.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inpMes.click();
            await inpMes.fill('');
            await inpMes.pressSequentially(mesAEnviar, { delay: 40 });
        }

        // 3. Año de expiración
        const inpAnio = count >= 4 ? textInputs.nth(2) : scope.locator('input[placeholder*="YYYY" i], input[name*="year" i], div:has-text("Año") input').first();
        if (await inpAnio.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inpAnio.click();
            await inpAnio.fill('');
            await inpAnio.pressSequentially(anioAEnviar, { delay: 40 });
        }

        // 4. CVV
        const inpCvv = count >= 4 ? textInputs.nth(3) : scope.locator('input[placeholder*="CVV" i], input[placeholder*="000" i], input[name*="cvv" i]').first();
        if (await inpCvv.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inpCvv.click();
            await inpCvv.fill('');
            await inpCvv.pressSequentially(cvvAEnviar, { delay: 40 });
        }

        // Inyección de respaldo con React Native Setter en el DOM del modal
        await this.page.evaluate(({ cardNum, mes, anio, cvv }) => {
            const modal = document.querySelector('.Modal, [role="dialog"], [class*="modal" i]') || document;
            const inputs = Array.from(modal.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])'));
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            
            const fillInp = (input, val) => {
                if (!input) return;
                input.focus();
                if (setter) setter.call(input, val);
                else input.value = val;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('blur', { bubbles: true }));
            };

            if (inputs.length >= 4) {
                fillInp(inputs[0], cardNum);
                fillInp(inputs[1], mes);
                fillInp(inputs[2], anio);
                fillInp(inputs[3], cvv);
            }
        }, {
            cardNum: numAEnviar,
            mes: mesAEnviar,
            anio: anioAEnviar,
            cvv: cvvAEnviar
        }).catch(() => {});

        await this.page.waitForTimeout(1000);

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

        // 6. Guardar Tarjeta en el Modal
        console.log("Guardando tarjeta en Argentina...");
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
        console.log("✅ Proceso de adición de tarjeta finalizado en Argentina.");

        // 7. Llenar CVV externo en la página principal si aplica
        await this.llenarCvvExternoSiAplica(cardData.cvv || '123');
    }

    /**
     * Selecciona el método de pago en Argentina:
     * - 'Tarjeta' / 'Tarjeta Débito / Crédito'
     * - 'Efectivo'
     * @param {'tarjeta' | 'efectivo' | string} metodoPago
     * @param {string|number|object} [montoCambioOCard]
     */
    async seleccionarMetodoPago(metodoPago = 'Efectivo', montoCambioOCard = null) {
        const metodoLower = (metodoPago || '').toLowerCase();
        const esTarjeta = metodoLower.includes('tarjeta') || metodoLower.includes('debito') || metodoLower.includes('débito') || metodoLower.includes('credito') || metodoLower.includes('crédito') || metodoLower === 'card';

        // 1. Esperar a que la página esté estable y hacer scroll
        await this.page.locator('.Modal, [role="dialog"], .Loading').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(1000);

        const seccionMetodoPago = this.page.locator('text=/método de pago|metodo de pago/i').first();
        await seccionMetodoPago.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(1000);

        if (esTarjeta) {
            console.log('Seleccionando método de pago en Argentina: "Tarjeta" -> "Débito / Crédito"...');

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
                        await this.page.mouse.click(coords.circle.x + coords.circle.width / 2, coords.circle.y + coords.circle.height / 2).catch(() => {});
                    } else {
                        await this.page.mouse.click(coords.row.x + 15, coords.row.y + coords.row.height / 2).catch(() => {});
                    }
                    await this.page.mouse.click(coords.row.x + 60, coords.row.y + coords.row.height / 2).catch(() => {});
                } else {
                    const debitoLoc = this.page.getByText(/d[eé]bito\s*\/\s*cr[eé]dito/i).first();
                    if (await debitoLoc.isVisible({ timeout: 2000 }).catch(() => false)) {
                        await debitoLoc.click({ force: true }).catch(() => {});
                    }
                }

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

                const btnNuevaPresente = await this.page.locator('button, [role="button"], a, div, span')
                    .filter({ hasText: /agregar nueva tarjeta|nueva tarjeta|agregar tarjeta|añadir tarjeta|\+ agregar/i })
                    .first().isVisible({ timeout: 1000 }).catch(() => false);

                if (btnNuevaPresente) {
                    console.log('✅ Sub-radio "Débito / Crédito" seleccionado correctamente en Argentina.');
                    break;
                } else {
                    console.log(`Aviso (Intento ${intento}): Reintentando selección de "Débito / Crédito"...`);
                }
            }

            await this.page.waitForTimeout(1000);

            // PASO 3: Abrir modal y completar datos de tarjeta
            const cardData = (typeof montoCambioOCard === 'object' && montoCambioOCard !== null) ? montoCambioOCard : {
                number: "4075 5957 1648 3764",
                numberClean: "4075595716483764",
                expiry: "01/30",
                expiryMonth: "01",
                expiryYear: "2030",
                expiryFullYear: "2030",
                cvv: "123",
                name: "APRO APRO",
                document: "30123456",
                email: "test_12345@testuser.com"
            };

            await this.agregarNuevaTarjeta(cardData);

            await this.asegurarDatosFacturacion();
            return;
        }

        console.log(`Seleccionando método de pago en Argentina: "Efectivo"...`);
        const selectorPago = this.page.locator(`input[value*="Efectivo"], label:has-text("Efectivo"), [id*="Efectivo"], label:has-text("Dinheiro"), label:has-text("Efectivo en entrega")`).first();
        if (await selectorPago.isVisible({ timeout: 4000 }).catch(() => false)) {
            await selectorPago.scrollIntoViewIfNeeded().catch(() => {});
            await selectorPago.check().catch(async () => {
                await selectorPago.click();
            });
        }
        await this.asegurarDatosFacturacion();
        await this.page.waitForTimeout(1500);
    }

    /**
     * Procesa el pago, espera a que cargue la pantalla con el 'Código de pedido' y lo extrae con exactitud en Argentina
     * @returns {Promise<string>} Número / Código de Pedido
     */
    async procesarPagoYConfirmarOrden() {
        console.log("Iniciando proceso de pago y creación de orden en Argentina...");

        this.codigoPedido = null;

        // Asegurar una última vez que los datos de facturación estén marcados
        await this.asegurarDatosFacturacion();
        await this.llenarCvvExternoSiAplica('123');

        // Escuchar endpoint de red
        const promesaRespuestaOrden = this.page.waitForResponse(response => {
            const url = response.url().toLowerCase();
            const esEndpointOrden = url.includes('/order') || url.includes('/checkout') || url.includes('/orders') || url.includes('/payment');
            return esEndpointOrden && (response.status() === 200 || response.status() === 201);
        }, { timeout: 45000 }).then(async resp => {
            try {
                const json = await resp.json();
                console.log("Payload JSON interceptado de creación de orden en Argentina:", JSON.stringify(json).slice(0, 300));
                const codigo = json?.id || json?.orderId || json?.code || json?.orderNumber || json?.data?.id || json?.data?.orderId || json?.data?.code;
                if (codigo && typeof codigo === 'string' && !codigo.toLowerCase().includes('proces')) {
                    console.log(`🎯 Código de pedido interceptado en red: ${codigo}`);
                    return String(codigo);
                }
            } catch (e) {}
            return null;
        }).catch(() => null);

        // 1. Hacer clic en el botón de Pagar / Realizar Pedido
        const btnPagar = this.btnPagar.last();
        await btnPagar.waitFor({ state: 'visible', timeout: 10000 });
        await btnPagar.scrollIntoViewIfNeeded().catch(() => {});

        console.log("Haciendo clic en el botón 'Pagar' en Argentina...");
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
        console.log("Esperando a que la pantalla de Detalle de la Orden cargue por completo en Argentina...");

        const labelCodigoPedido = this.page.locator('text=/código de pedido|codigo de pedido|código del pedido|número de pedido/i')
            .or(this.page.locator('p, span, div, h1, h2, h3, strong').filter({ hasText: /código de pedido|codigo de pedido|número de pedido/i }));

        await labelCodigoPedido.first().waitFor({ state: 'visible', timeout: 40000 }).catch(() => {
            console.log("Aviso: Esperando renderizado de la tarjeta de pedido en Argentina...");
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
        console.log("Extrayendo código de pedido de la pantalla de detalle en Argentina...");

        const elemento = labelCodigoPedido.first();
        if (await elemento.isVisible().catch(() => false)) {
            const textoPadre = await elemento.evaluate(el => {
                return (el.parentElement?.innerText || el.innerText || '').trim();
            }).catch(() => '');

            console.log(`Texto capturado del elemento: "${textoPadre}"`);

            const match = textoPadre.match(/c[óo]digo d?e?l?\s*pedido:\s*([0-9A-Za-z-]+)/i);
            if (match && match[1] && !match[1].toLowerCase().includes('proces')) {
                this.codigoPedido = match[1].trim();
            }
        }

        if (!this.codigoPedido) {
            const codigoRed = await promesaRespuestaOrden;
            if (codigoRed) {
                this.codigoPedido = codigoRed;
            }
        }

        if (!this.codigoPedido) {
            const textoBody = await this.page.innerText('body').catch(() => '');
            const matchBody = textoBody.match(/c[óo]digo d?e?l?\s*pedido:\s*([0-9A-Za-z-]+)/i)
                || textoBody.match(/#(AR-[0-9]+|[0-9]{5,}-[0-9]{4,}|[0-9]{6,})/i)
                || textoBody.match(/(\d{8,12}-\d{4,8})/);

            if (matchBody && matchBody[1] && !matchBody[1].toLowerCase().includes('proces')) {
                this.codigoPedido = matchBody[1].trim();
            }
        }

        console.log(`======================================================`);
        console.log(`🎉 ¡PEDIDO CREADO CON ÉXITO EN ARGENTINA!`);
        console.log(`📋 Código de Pedido: [ ${this.codigoPedido || 'CONFIRMADO'} ]`);
        console.log(`======================================================`);

        await this.page.waitForTimeout(5000);

        return this.codigoPedido;
    }
}
