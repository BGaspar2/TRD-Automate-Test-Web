export const testData = {
    baseUrl: "https://kfc-ar-env-develop-artisn.vercel.app",
    location: {
        searchQuery: "alto palermo",
        fullAddress: "Alto Palermo Shopping, Avenida Santa Fe, Buenos Aires, Argentina"
    },
    order: {
        desiredQuantity: 3
    },
    deliveryAddress: {
        mainStreet: "Av. Corrientes",
        secondaryStreet: "Florida",
        number: "1234",
        reference: "Piso 4, Dpto. B",
        phone: "9112345678",
        instructions: "Dejar en recepción."
    },
    customer: {
        name: "Carlos",
        lastName: "Gómez",
        email: "test_12345@testuser.com",
        phone: "9112345678",
        document: "30123456"
    },
    customerTarjeta: {
        name: "APRO",
        lastName: "APRO",
        email: "test_12345@testuser.com",
        phone: "9112345678",
        document: "30123456"
    },
    paymentMethods: {
        tarjeta: "Tarjeta Débito / Crédito",
        efectivo: "Efectivo"
    },
    card: {
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
    },
    paymentMethodId: "#Efectivo",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
