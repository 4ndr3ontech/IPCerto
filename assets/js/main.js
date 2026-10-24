document.addEventListener('DOMContentLoaded', async () => {
    const ipAddressEl = document.getElementById('ip-address');
    const ipDetailsEl = document.getElementById('ip-details');
    const copyBtn = document.getElementById('copy-btn');

    async function fetchClientIp() {
        try {
            ipAddressEl.textContent = 'Buscando...';
            
            // Tenta buscar da API do Worker
            const response = await fetch('/api/ip');
            
            if (!response.ok) {
                throw new Error('API não disponível');
            }

            const data = await response.json();
            
            ipAddressEl.textContent = data.ip;
            
            if (ipDetailsEl) {
                ipDetailsEl.innerHTML = `
                    <p>Versão do Protocolo: <strong>${data.version}</strong></p>
                    <p>Consulta realizada em: ${new Date(data.timestamp).toLocaleTimeString()}</p>
                `;
            }
        } catch (error) {
            console.warn('API /api/ip não respondendo diretamente no modo estático. Usando IP simulado de teste local.');
            // Fallback elegante para testes visuais locais sem o worker ativo
            ipAddressFictitious();
        }
    }

    function ipAddressFictitious() {
        ipAddressEl.textContent = '177.182.99.15'; // Exemplo de IP público brasileiro simulado para teste
        if (ipDetailsEl) {
            ipDetailsEl.innerHTML = `
                <p>Versão do Protocolo: <strong>IPv4</strong></p>
                <p style="color: #38bdf8;">Ambiente de homologação local (Simulação de IP Público)</p>
            `;
        }
    }

    await fetchClientIp();

    copyBtn.addEventListener('click', async () => {
        const textToCopy = ipAddressEl.textContent;
        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copiado!';
            copyBtn.style.backgroundColor = '#22c55e';
            copyBtn.style.color = '#ffffff';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.color = '';
            }, 2000);
        } catch (err) {
            console.error('Erro ao copiar IP: ', err);
        }
    });
});