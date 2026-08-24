export const testData = {
    baseUrl: "https://kfc-cl-devops5-artisn.vercel.app/",
    location: {
        searchQuery: "guarida vieja",
        fullAddress: "Guardia Vieja, Providencia, Chile"
    },
    order: {
        desiredQuantity: 3
    },
    deliveryAddress: {
        mainStreet: "Guardia Vieja",
        secondaryStreet: "Av. Providencia",
        number: "255",
        reference: "Depto 402",
        phone: "912345678",
        instructions: "Dejar en recepción con el guardia."
    },
    customer: {
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "912345678",
        document: "12345678-9"
    },
    customerTarjeta: {
        name: "APRO",
        lastName: "APRO",
        email: "juan.perez@example.com",
        phone: "912345678",
        document: "12345678-9"
    },
    paymentMethods: {
        tarjeta: "Tarjeta Débito / Crédito",
        efectivo: "Efectivo"
    },
    card: {
        number: "4013540682746260",
        numberClean: "4013540682746260",
        expiry: "01/30",
        expiryMonth: "01",
        expiryYear: "2030",
        expiryFullYear: "2030",
        cvv: "123",
        name: "APRO APRO",
        document: "123456789"
    },
    paymentMethodId: "#Efectivo",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
