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
    paymentMethodId: "#Efectivo",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
