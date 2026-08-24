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
        email: "carlos.gomez@example.com",
        phone: "9112345678",
        document: "30123456"
    },
    paymentMethodId: "#Efectivo",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
