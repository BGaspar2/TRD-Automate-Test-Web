---
name: playwright-kfc-latam
description: Guía, directrices y estándares de QA para la automatización E2E de KFC Web LATAM (TRD) con Playwright y POM.
---

# Skill: QA Playwright - KFC Web LATAM (TRD)

## Objetivo

Esta skill está diseñada para asistir en el desarrollo, mantenimiento y ampliación de las pruebas automatizadas del proyecto:

```
C:\Users\Usuario\Downloads\KFC-Webs-LATAM-main\KFC-Webs-LATAM-main
```

utilizando como referencia y fuente principal el proyecto de automatización:

```
TRD-Automate-Test-Web
```

El objetivo NO es crear una nueva arquitectura de automatización.

Siempre se debe reutilizar el patrón existente, respetando la organización actual del proyecto y manteniendo consistencia con los Page Objects existentes.

---

# Contexto del Proyecto

El proyecto automatiza pruebas E2E para KFC LATAM utilizando:

- Playwright Test Runner
- Page Object Model (POM)
- JavaScript
- Arquitectura modular por país

Actualmente existen flujos para:

- Ecuador
- Chile
- Colombia
- Venezuela

Todos los países comparten la misma filosofía de implementación.

---

# Estructura esperada

La estructura del proyecto debe mantenerse.

```
tests/

    flujoRegionalAnonimo.js

    ecuador/
        data/
        pages/
            HomePage
            MenuPage
            CartPage
            CheckoutPage
        flujoAnonimoDel.js

    chile/
        ...

    colombia/
        ...

    venezuela/
        ...

auth.js

flujoRegistradoDel.js
```

Nunca mover archivos si no es estrictamente necesario.

Siempre extender la arquitectura existente.

---

# Cobertura actual

Actualmente existen pruebas para:

- Delivery
- Usuario anónimo
- Usuario registrado
- Checkout
- Carrito
- Menú
- Dirección
- Cobertura

---

# Próximos objetivos

Los siguientes módulos serán implementados sobre la misma arquitectura.

Prioridad:

1. Pickup
2. Pagos

Toda nueva automatización debe prepararse para soportar ambos flujos.

---

# Arquitectura obligatoria

Siempre utilizar Page Object Model.

Separar:

- Selectores
- Acciones
- Datos
- Casos de prueba

Nunca colocar grandes bloques de lógica dentro de los tests.

Toda lógica debe vivir en los Page Objects.

---

# Estrategias ya implementadas

La automatización existente ya posee estrategias resilientes.

Siempre reutilizarlas.

Entre ellas:

## Checkout inteligente

Detección automática entre:

- Desktop
- Mobile

sin depender de un selector fijo.

---

## React Forms

Cuando un input sea llenado manualmente mediante JavaScript, disparar:

- input
- change
- blur

para garantizar la actualización de React Hook Form.

---

## Google Maps

Nunca reemplazar el texto completo de la dirección.

Siempre preservar el valor generado por Google Maps.

---

## DOM dinámico

Antes de interactuar con elementos opcionales:

usar

```
locator.count()
```

para validar existencia.

No asumir que todos los países poseen exactamente el mismo DOM.

---

# Convenciones

Preferir:

```
getByRole()

getByLabel()

getByPlaceholder()

getByTestId()
```

sobre CSS complejos.

Usar CSS únicamente cuando no exista otra alternativa.

---

# Esperas

Nunca utilizar:

```
waitForTimeout()
```

salvo para depuración.

Preferir:

```
expect()

waitFor()

waitForSelector()

waitForLoadState()

locator.waitFor()
```

---

# Código

Generar código limpio.

Métodos pequeños.

Responsabilidad única.

Evitar duplicación.

Si una acción es utilizada por varios países, convertirla en método reutilizable.

---

# Compatibilidad regional

Antes de agregar una automatización validar diferencias entre:

- Ecuador
- Chile
- Colombia
- Venezuela

No asumir que todos utilizan:

- mismo documento
- mismo placeholder
- mismo checkout
- mismo texto

Utilizar los archivos:

```
data/testData.js
```

como fuente de datos.

Nunca hardcodear información del país.

---

# Nuevos módulos

Las futuras implementaciones serán:

## Pickup

La automatización deberá soportar:

- Cambio Delivery → Pickup
- Selección de tienda
- Confirmación
- Checkout Pickup
- Validaciones específicas

Manteniendo compatibilidad con Delivery.

---

## Pagos

Se implementarán pruebas para:

- Tarjeta
- OneClick
- DeUna
- Nequi
- PIX
- Métodos futuros

La automatización debe diseñarse para permitir agregar nuevos métodos de pago sin modificar el flujo principal.

La selección de pago debe abstraerse dentro de un PaymentPage o equivalente.

---

# Al modificar el proyecto fuente

Siempre analizar primero:

```
C:\Users\Usuario\Downloads\KFC-Webs-LATAM-main\KFC-Webs-LATAM-main
```

para identificar:

- componentes
- ids
- data-testid
- formularios
- hooks
- comportamiento React
- rutas
- servicios

Las pruebas deben construirse tomando como referencia el código fuente real y no únicamente el comportamiento visual.

---

# Buenas prácticas

Siempre:

✔ reutilizar Page Objects

✔ reutilizar helpers existentes

✔ reutilizar utilidades

✔ reutilizar selectores

✔ mantener consistencia

✔ minimizar duplicación

✔ documentar métodos complejos

✔ escribir código legible

✔ **Ejecución manual por el usuario**: Las pruebas (`npm run test:...`, `npx playwright test ...`) SIEMPRE las ejecuta el USUARIO en su terminal para probar. El asistente NUNCA debe ejecutar los comandos de prueba por su cuenta.

---

# Nunca

No crear una arquitectura distinta.

No cambiar el patrón existente.

No mover carpetas.

No duplicar lógica.

No crear Page Objects innecesarios.

No hardcodear información regional.

No utilizar esperas fijas.

No ejecutar automáticamente las pruebas por cuenta propia (el usuario las ejecuta siempre manualmente).

---

# Objetivo final

Mantener una suite de automatización escalable que cubra completamente:

- Delivery
- Pickup
- Checkout
- Carrito
- Pagos
- Promociones
- Cupones
- OneClick
- Usuarios registrados
- Usuarios invitados

para todos los países LATAM soportados por KFC Web, reutilizando el código fuente del proyecto principal como referencia para generar automatizaciones robustas y mantenibles.
