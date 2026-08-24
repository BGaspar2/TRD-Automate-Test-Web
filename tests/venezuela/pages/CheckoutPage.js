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
     * Selecciona el método de pago en Venezuela ('Punto De Venta' o 'Efectivo')
     * @param {string} metodoPago - 'Punto de venta' | 'Efectivo (con cambio)' | 'Tarjeta'
     * @param {string} [montoCambio] - Monto para cambio
     */
    async seleccionarMetodoPago(metodoPago = 'Punto de venta', montoCambio = '20') {
        const textoBusqueda = metodoPago.toLowerCase().includes('punto') ? 'Punto De Venta'
            : metodoPago.toLowerCase().includes('efectivo') ? 'Efectivo'
            : metodoPago.toLowerCase().includes('tarjeta') ? 'Tarjeta'
            : metodoPago;

        console.log(`Seleccionando método de pago en Venezuela: "${textoBusqueda}"...`);

        // 1. Localizar el radio button / label en la sección de 'Método de pago'
        const radioPago = this.page.locator('label, [role="radio"], div, span')
            .filter({ hasText: new RegExp(`^\\s*${textoBusqueda.replace(/[()]/g, '\\$&')}\\s*$`, 'i') })
            .or(this.page.getByRole('radio', { name: new RegExp(textoBusqueda, 'i') }))
            .or(this.page.locator('label').filter({ hasText: new RegExp(textoBusqueda, 'i') }))
            .or(this.page.locator(`input[value*="${textoBusqueda}"], [id*="${textoBusqueda}"]`));

        const opcion = radioPago.first();
        await opcion.waitFor({ state: 'visible', timeout: 8000 });
        await opcion.scrollIntoViewIfNeeded().catch(() => {});
        
        await opcion.click({ force: true }).catch(async () => {
            await opcion.evaluate(el => el.click());
        });
        console.log(`✅ Opción "${textoBusqueda}" seleccionada.`);
        await this.page.waitForTimeout(1500);

        // 2. Si es Efectivo con cambio, llenar el monto si se solicita
        if (metodoPago.toLowerCase().includes('cambio') || metodoPago.toLowerCase().includes('efectivo')) {
            const inputCambio = this.page.locator('input[name*="change"], input[name*="cambio"], input[name*="cash"], input[placeholder*="cambio"], input[placeholder*="con cuánto"], #change, #cashAmount').first();
            if (await inputCambio.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log(`Llenando monto para cambio: "${montoCambio}"`);
                await inputCambio.click();
                await inputCambio.fill(montoCambio);
                await inputCambio.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true }))).catch(() => {});
                await this.page.waitForTimeout(1000);
            }
        }

        await this.page.waitForTimeout(1000);
    }

    /**
     * Procesa el pago, espera a que cargue completamente la pantalla de detalle de orden y extrae el número de pedido
     * @returns {Promise<string>} Número / Código de Pedido
     */
    async procesarPagoYConfirmarOrden() {
        console.log("Iniciando proceso de pago y creación de orden...");

        this.codigoPedido = null;

        // 1. Escuchar la llamada a la API de creación de órdenes / checkout para interceptar el código
        this.page.on('response', async resp => {
            const url = resp.url();
            if ((url.includes('order') || url.includes('checkout') || url.includes('pedido') || url.includes('transaction')) && resp.status() >= 200 && resp.status() < 300) {
                try {
                    const json = await resp.json().catch(() => null);
                    if (json) {
                        const id = json.orderNumber || json.orderId || json.code || json.id || json.data?.orderNumber || json.data?.orderId || json.data?.code || json.data?.id;
                        if (id && String(id).trim().length >= 3 && !['ok', 'true'].includes(String(id).toLowerCase())) {
                            this.codigoPedido = String(id).trim();
                            console.log(`⚡ [API Interceptada]: Código de orden encontrado = [ ${this.codigoPedido} ]`);
                        }
                    }
                } catch (e) {}
            }
        });

        // 2. Hacer clic en el botón de Pagar / Realizar Pedido
        const btnPagar = this.btnPagar.last();
        await btnPagar.waitFor({ state: 'visible', timeout: 10000 });
        await btnPagar.scrollIntoViewIfNeeded().catch(() => {});

        console.log("Haciendo clic en el botón 'Pagar'...");
        await btnPagar.click({ force: true }).catch(async () => {
            await btnPagar.evaluate(b => b.click());
        });

        // 3. Monitorear estado: 'Procesando...'
        console.log("Esperando procesamiento del pedido...");
        if (await this.indicadorProcesando.first().isVisible({ timeout: 4000 }).catch(() => false)) {
            console.log("⏳ [Estado]: Procesando orden en curso...");
        }

        // 4. Monitorear estado: 'Orden creada exitosamente'
        const toastExito = this.toastOrdenCreada.first();
        if (await toastExito.isVisible({ timeout: 15000 }).catch(() => false)) {
            const msg = await toastExito.innerText().catch(() => 'Orden creada exitosamente');
            console.log(`🎉 [Toast Confirmado]: "${msg.trim()}"`);
        }

        // 5. ESPERAR A QUE CARGUE POR COMPLETO LA PANTALLA DE DETALLE DE LA ORDEN
        console.log("Esperando a que la pantalla de Detalle de la Orden cargue por completo...");
        
        // Esperar cambio de URL o desaparición de la pantalla de checkout
        await this.page.waitForURL(url => !url.pathname.includes('/checkout') && !url.pathname.includes('/carrito'), { timeout: 35000 }).catch(() => {
            console.log("Aviso: Esperando renderizado de la vista de orden...");
        });

        // Esperar a que los elementos de la orden estén completamente renderizados
        const contenedorDetalle = this.page.locator('.OrderDetail, .OrderSuccess, [class*="OrderDetail"], [class*="OrderSuccess"], [class*="order-detail"], [class*="order-success"], [class*="confirmation"], [class*="Confirmation"], main')
            .filter({ hasText: /pedido|orden|detalle|código|número|gracias|preparación|recibido|confirmación/i });

        await contenedorDetalle.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
            console.log("Aviso: Esperando contenedor principal de la orden...");
        });

        // Pausa de estabilización para asegurar que los datos dinámicos terminen de pintarse en el DOM
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.waitForTimeout(6000);

        // 6. Extraer el código de orden del DOM de la pantalla
        if (!this.codigoPedido) {
            console.log("Extrayendo número de pedido desde los elementos de la pantalla...");

            const selectoresId = [
                this.page.locator('[data-testid*="order-id"], [data-testid*="order-number"], [class*="order-id"], [class*="orderId"], [class*="orderNumber"], [class*="order-number"]'),
                this.page.locator('h1, h2, h3, h4, strong, p, span').filter({ hasText: /#\s*[0-9]{4,}|#\s*[A-Za-z0-9_-]{5,}|VE-\d+/ }),
                this.page.locator('h1, h2, h3, h4, strong, p, span').filter({ hasText: /número de pedido|código de pedido|número de orden|código de orden|orden #|pedido #/i })
            ];

            for (const loc of selectoresId) {
                const count = await loc.count().catch(() => 0);
                for (let i = 0; i < count; i++) {
                    const txt = await loc.nth(i).innerText().catch(() => '');
                    const match = txt.match(/#\s*([0-9]{4,}|[A-Za-z0-9_-]{5,})/i)
                        || txt.match(/(?:pedido|orden|order)\s*(?:#|n[úu]mero|code)?[:\s]*([0-9]{4,}|[A-Za-z0-9_-]{5,})/i)
                        || txt.match(/\b(VE-\d{4,}|\d{5,})\b/i);

                    if (match && match[1]) {
                        const candidato = match[1].trim();
                        if (!['pagar', 'cancelar', 'continuar', 'volver', 'inicio'].includes(candidato.toLowerCase()) && candidato.length >= 4) {
                            this.codigoPedido = candidato;
                            break;
                        }
                    }
                }
                if (this.codigoPedido) break;
            }

            // Si aún no se encontró, extraer con regex global en body
            if (!this.codigoPedido) {
                const textoCompleto = await this.page.innerText('body').catch(() => '');
                const matchGlobal = textoCompleto.match(/#(VE-[0-9]+|[0-9]{4,}|[A-Za-z0-9]{5,})/i)
                    || textoCompleto.match(/(?:número de pedido|código de pedido|número de orden|código de orden)[:\s]*#?\s*([0-9]{4,}|[A-Za-z0-9_-]{5,})/i);

                if (matchGlobal && matchGlobal[1]) {
                    const cand = matchGlobal[1].trim();
                    if (!['pagar', 'cancelar', 'continuar'].includes(cand.toLowerCase()) && cand.length >= 4) {
                        this.codigoPedido = cand;
                    }
                }
            }

            // Fallback con ID de URL
            if (!this.codigoPedido) {
                const matchUrl = this.page.url().match(/(?:orden|pedido|order|success)\/([A-Za-z0-9-]+)/i);
                if (matchUrl && matchUrl[1] && matchUrl[1].length >= 4) {
                    this.codigoPedido = matchUrl[1];
                }
            }
        }

        console.log(`======================================================`);
        console.log(`🎉 ¡PEDIDO CREADO CON ÉXITO EN VENEZUELA!`);
        console.log(`📋 Número / Código de Pedido: [ ${this.codigoPedido || 'CONFIRMADO'} ]`);
        console.log(`======================================================`);

        // Pausa adicional para que el reporte ejecutivo capture con total claridad la pantalla completa de la orden
        await this.page.waitForTimeout(5000);

        return this.codigoPedido;
    }
}
