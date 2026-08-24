export const testData = {
    baseUrl: "https://kfc-co-devops5-artisn.vercel.app",
    location: {
        searchQuery: "toberin",
        fullAddress: "Toberin, Bogotá, Colombia"
    },
    order: {
        desiredQuantity: 3
    },
    deliveryAddress: {
        mainStreet: "Calle 166",
        secondaryStreet: "Carrera 20",
        number: "#20-45",
        reference: "Apto 501",
        phone: "3001234567",
        instructions: "Dejar con portería."
    },
    customer: {
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "3001234567",
        document: "1012345678"
    },
    paymentMethods: {
        tarjeta: "Tarjeta Débito / Crédito",
        datafono: "Datáfono",
        efectivoExacto: "Efectivo (Monto Exacto)",
        efectivoCambio: "Efectivo (Con Cambio)"
    },
    card: {
        number: "4111 1111 1111 1111",
        numberClean: "4111111111111111",
        expiry: "01/30",
        expiryMonth: "01",
        expiryYear: "2030",
        expiryFullYear: "2030",
        cvv: "123",
        name: "APRO APRO",
        document: "123456789"
    },
    montoCambio: "100000",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
