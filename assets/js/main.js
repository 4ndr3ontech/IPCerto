document.addEventListener('DOMContentLoaded', async () => {
    const ipAddressEl = document.getElementById('ip-address');
    const ipDetailsEl = document.getElementById('ip-details');
    const copyBtn = document.getElementById('copy-btn');

    async function fetchClientIp() {
        try {
            ipAddressEl.textContent = 'Buscando...';
            
            // Requisição para a API do Worker
            const response = await fetch('/api/ip');
            
            if (!response.ok) {
                throw new Error('Não foi possível obter o endereço IP.');
            }

            const data = await response.json();
            
            // Exibe o IP real retornado pelo servidor
            ipAddressEl.textContent = data.ip;
            
            if (ipDetailsEl) {
                ipDetailsEl.innerHTML = `
                    <p>Versão do Protocolo: <strong>${data.version}</strong></p>
                    <p>Consulta realizada em: ${new Date(data.timestamp).toLocaleTimeString()}</p>
                `;
            }
        } catch (error) {
            console.error('Erro ao buscar IP:', error);
            ipAddressEl.textContent = 'Indisponível';
            if (ipDetailsEl) {
                ipDetailsEl.innerHTML = `<p style="color: #ef4444;">Falha ao comunicar com o servidor de IP.</p>`;
            }
        }
    }

    await fetchClientIp();

    copyBtn.addEventListener('click', async () => {
        const textToCopy = ipAddressEl.textContent;
        if (!textToCopy || textToCopy === 'Buscando...' || textToCopy === 'Indisponível') return;
        
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