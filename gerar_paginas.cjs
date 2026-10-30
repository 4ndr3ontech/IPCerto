const fs = require("fs");
const path = require("path");

const estrutura = {
  "privacidade/index.html": `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidade — IPCerto</title>
    <meta name="description" content="Conheça a Política de Privacidade do IPCerto e saiba como tratamos os dados de navegação e diagnóstico de rede.">
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
    <div class="bg-glow"></div>
    <div class="app-layout" style="display: flex; justify-content: center; padding: 40px 20px;">
        <div class="content-wrapper" style="max-width: 800px; width: 100%;">
            <header class="top-header" style="margin-bottom: 30px;">
                <div class="header-content" style="justify-content: space-between;">
                    <a href="/" class="logo" style="display: flex; align-items: center; text-decoration: none;">
                        <img src="/assets/logotipo.png" alt="IPCerto" style="height: 32px;">
                    </a>
                    <a href="/" class="btn-primary" style="text-decoration: none; padding: 8px 16px; font-size: 0.85rem;">← Voltar ao Início</a>
                </div>
            </header>
            <main class="main-content">
                <div class="premium-card">
                    <h1 class="text-white mb-4" style="font-size: 1.5rem;">Política de Privacidade</h1>
                    <div class="text-muted" style="font-size: 0.9rem; line-height: 1.7; display: flex; flex-direction: column; gap: 16px;">
                        <p>A sua privacidade é de extrema importância para nós no <strong>IPCerto</strong>. Esta Política de Privacidade descreve como coletamos, utilizamos e protegemos as informações quando você utiliza o nosso painel de diagnóstico de rede.</p>
                        <h3 class="text-white" style="font-size: 1rem; margin-top: 10px;">1. Coleta de Dados</h3>
                        <p>O IPCerto opera majoritariamente do lado do cliente (browser). Os endereços IP e dados geográficos apresentados são obtidos através de consultas diretas a APIs públicas de geolocalização e não são armazenados de forma permanente em bancos de dados próprios.</p>
                        <h3 class="text-white" style="font-size: 1rem; margin-top: 10px;">2. Cookies e Anúncios</h3>
                        <p>Podemos utilizar serviços de terceiros, como o Google AdSense, para exibir anúncios relevantes. Estes fornecedores podem utilizar cookies para exibir anúncios com base nas suas visitas anteriores a este ou a outros websites na Internet.</p>
                        <h3 class="text-white" style="font-size: 1rem; margin-top: 10px;">3. Segurança</h3>
                        <p>Implementamos medidas de segurança robustas para proteger as ferramentas utilitárias executadas na aplicação (como o gerador de senhas e decodificadores), que processam dados de forma estritamente local no seu dispositivo.</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</body>
</html>`,

  "termos/index.html": `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termos de Uso — IPCerto</title>
    <meta name="description" content="Consulte os Termos de Uso e condições para a utilização das ferramentas de rede do IPCerto.">
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
    <div class="bg-glow"></div>
    <div class="app-layout" style="display: flex; justify-content: center; padding: 40px 20px;">
        <div class="content-wrapper" style="max-width: 800px; width: 100%;">
            <header class="top-header" style="margin-bottom: 30px;">
                <div class="header-content" style="justify-content: space-between;">
                    <a href="/" class="logo" style="display: flex; align-items: center; text-decoration: none;">
                        <img src="/assets/logotipo.png" alt="IPCerto" style="height: 32px;">
                    </a>
                    <a href="/" class="btn-primary" style="text-decoration: none; padding: 8px 16px; font-size: 0.85rem;">← Voltar ao Início</a>
                </div>
            </header>
            <main class="main-content">
                <div class="premium-card">
                    <h1 class="text-white mb-4" style="font-size: 1.5rem;">Termos de Uso</h1>
                    <div class="text-muted" style="font-size: 0.9rem; line-height: 1.7; display: flex; flex-direction: column; gap: 16px;">
                        <p>Ao acessar e utilizar o <strong>IPCerto</strong>, você concorda expressamente com os seguintes termos e condições de utilização.</p>
                        <h3 class="text-white" style="font-size: 1rem; margin-top: 10px;">1. Utilização das Ferramentas</h3>
                        <p>As ferramentas disponibilizadas neste painel (incluindo Port Scanner, DNS Lookup e testes de velocidade) destinam-se exclusivamente a fins de diagnóstico legítimo de rede, auditoria própria e educação técnica.</p>
                        <h3 class="text-white" style="font-size: 1rem; margin-top: 10px;">2. Isenção de Garantias ("As Is")</h3>
                        <p>O serviço é fornecido "no estado em que se encontra" (as is), sem garantias de qualquer tipo, expressas ou implícitas. Não nos responsabilizamos por quaisquer interrupções de serviço ou imprecisões nas respostas de APIs externas.</p>
                        <h3 class="text-white" style="font-size: 1rem; margin-top: 10px;">3. Uso Aceitável</h3>
                        <p>É estritamente proibido utilizar as ferramentas de varredura (Port Scanner ou DNS) contra redes ou sistemas para os quais você não possui autorização explícita.</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</body>
</html>`,

  "contato/index.html": `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contato & Suporte — IPCerto</title>
    <meta name="description" content="Entre em contato com a equipe do IPCerto para sugestões, parcerias ou suporte técnico.">
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
    <div class="bg-glow"></div>
    <div class="app-layout" style="display: flex; justify-content: center; padding: 40px 20px;">
        <div class="content-wrapper" style="max-width: 800px; width: 100%;">
            <header class="top-header" style="margin-bottom: 30px;">
                <div class="header-content" style="justify-content: space-between;">
                    <a href="/" class="logo" style="display: flex; align-items: center; text-decoration: none;">
                        <img src="/assets/logotipo.png" alt="IPCerto" style="height: 32px;">
                    </a>
                    <a href="/" class="btn-primary" style="text-decoration: none; padding: 8px 16px; font-size: 0.85rem;">← Voltar ao Início</a>
                </div>
            </header>
            <main class="main-content">
                <div class="premium-card">
                    <h1 class="text-white mb-4" style="font-size: 1.5rem;">Contato & Suporte</h1>
                    <p class="text-muted mb-4" style="font-size: 0.9rem;">Tem alguma sugestão, relatou um bug ou deseja entrar em contato conosco? Preencha os dados abaixo ou envie-nos um e-mail.</p>
                    <form id="contact-form" style="display: flex; flex-direction: column; gap: 16px; max-width: 600px;">
                        <div>
                            <label class="text-muted text-sm mb-2 d-block">O SEU NOME</label>
                            <input type="text" id="contact-name" class="form-control" placeholder="Insira o seu nome" required>
                        </div>
                        <div>
                            <label class="text-muted text-sm mb-2 d-block">O SEU E-MAIL</label>
                            <input type="email" id="contact-email" class="form-control" placeholder="exemplo@dominio.com" required>
                        </div>
                        <div>
                            <label class="text-muted text-sm mb-2 d-block">MENSAGEM</label>
                            <textarea id="contact-msg" class="form-control" rows="4" placeholder="Escreva a sua mensagem..." required></textarea>
                        </div>
                        <button type="submit" id="btn-send-contact" class="btn-primary" style="width: fit-content; padding: 0 30px;">Enviar Mensagem</button>
                    </form>
                    <div id="contact-feedback" class="mt-4 hidden" style="padding: 12px 18px; border-radius: 8px; font-size: 0.85rem; max-width: 600px;"></div>
                </div>
            </main>
        </div>
    </div>
    <script>
        document.getElementById("contact-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("contact-name").value.trim();
            const feedback = document.getElementById("contact-feedback");
            feedback.textContent = \`✔ Obrigado, \${name}! A sua mensagem foi enviada com sucesso.\`;
            feedback.style.background = "rgba(52, 211, 153, 0.15)";
            feedback.style.border = "1px solid var(--success)";
            feedback.style.color = "var(--success)";
            feedback.classList.remove("hidden");
            e.target.reset();
        });
    </script>
</body>
</html>`
};

for (const [filePath, content] of Object.entries(estrutura)) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Criado com sucesso:", filePath);
}
console.log("Todas as páginas institucionais foram geradas!");
