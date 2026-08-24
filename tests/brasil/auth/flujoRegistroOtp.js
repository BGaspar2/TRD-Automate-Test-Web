import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { tempEmailService } from '../../../utils/tempEmailService.js';
import { generarCpfBrasilValido, generarTelefonoBrasil, generarNombreAleatorio } from '../../../utils/documentGenerator.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

test('Flujo E2E - Criação de conta com código OTP (Brasil)', async ({ page }, testInfo) => {
    test.setTimeout(120000);

    const homePage = new HomePage(page);
    const registerPage = new RegisterPage(page);

    let buzonTemporal = null;
    let datosUsuario = null;
    let codigoOtp = null;

    // Passo 1: Navegação e Abertura do Modal de Cadastro
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegação e Abertura do Modal de Cadastro',
        descripcion: 'Acesso ao portal do KFC Brasil e abertura do formulário de autenticação'
    }, async () => {
        await homePage.navegar(testData.baseUrl);
        await homePage.verificarLocalesCerrados();
        await registerPage.abrirModalRegistro();
    });

    // Passo 2: Geração de E-mail Temporário e Preenchimento
    await ejecutarPaso(page, testInfo, {
        numero: 2,
        titulo: 'Geração de E-mail Temporário e Preenchimento',
        descripcion: 'Criação automática de caixa postal via API REST e digitação do e-mail no modal'
    }, async () => {
        buzonTemporal = await tempEmailService.crearBuzon('kfcqa');

        const { nombre, apellido } = generarNombreAleatorio();
        const cpfValido = generarCpfBrasilValido();
        const telefono = generarTelefonoBrasil();

        datosUsuario = {
            nombre,
            apellido,
            email: buzonTemporal.email,
            telefono,
            documento: cpfValido
        };

        console.log("📋 [Dados de Cadastro Gerados - Brasil]:", datosUsuario);

        await registerPage.llenarFormularioRegistro(datosUsuario);
    });

    // Passo 3: Envio de Formulário e Extração Automática de OTP
    await ejecutarPaso(page, testInfo, {
        numero: 3,
        titulo: 'Envio de Formulário e Extração Automática de OTP',
        descripcion: 'Disparo da solicitação e consulta automática da caixa postal via API'
    }, async () => {
        const otpApi = await registerPage.enviarFormulario();

        if (otpApi) {
            codigoOtp = otpApi;
            console.log(`⚡ [OTP Obtido Imediatamente via API]: ${codigoOtp}`);
        } else {
            const resultadoOtp = await tempEmailService.esperarCodigoOtp(buzonTemporal, {
                timeoutMs: 60000,
                intervaloMs: 2500
            });
            codigoOtp = resultadoOtp.codigo;
        }
    });

    // Passo 4: Digitação do Código OTP
    await ejecutarPaso(page, testInfo, {
        numero: 4,
        titulo: 'Validação do Código OTP',
        descripcion: 'Digitação dos 6 dígitos de verificação recebidos por e-mail'
    }, async () => {
        await registerPage.ingresarCodigoOtp(codigoOtp);
    });

    // Passo 5: Conclusão do Cadastro e Tela de Boas-Vindas
    await ejecutarPaso(page, testInfo, {
        numero: 5,
        titulo: 'Conclusão do Cadastro e Tela de Boas-Vindas',
        descripcion: 'Preenchimento de dados pessoais, termos, clique em Criar Conta e validação de BEM-VINDO(A)!'
    }, async () => {
        await registerPage.completarPerfilPostOtp(datosUsuario);
    });
});
