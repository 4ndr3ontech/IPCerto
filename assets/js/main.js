document.addEventListener('DOMContentLoaded', async () => {
    const ipv4El = document.getElementById('ipv4-address');
    const ipv4Details = document.getElementById('ipv4-details');
    const copyIpv4Btn = document.getElementById('copy-ipv4-btn');

    const ipv6El = document.getElementById('ipv6-address');
    const ipv6Details = document.getElementById('ipv6-details');
    const copyIpv6Btn = document.getElementById('copy-ipv6-btn');

    // Função para buscar IPv4
    async function fetchIPv4() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) throw new Error('Indisponível');
            const data = await response.json();
            ipv4El.textContent = data.ip;
            ipv4Details.innerHTML = `<p>Protocolo: <strong>IPv4</strong></p><p>Estado: Ativo</p>`;
        } catch (e) {
            ipv4El.textContent = 'Não suportado / Indisponível';
            ipv4Details.innerHTML = `<p style="color: #94a3b8;">Rede configurada apenas em IPv6 ou sem suporte.</p>`;
        }
    }

    // Função para buscar IPv6
    async function fetchIPv6() {
        try {
            const response = await fetch('https://api64.ipify.org?format=json');
            if (!response.ok) throw new Error('Indisponível');
            const data = await response.json();
            
            if (data.ip.includes(':')) {
                ipv6El.textContent = data.ip;
                ipv6Details.innerHTML = `<p>Protocolo: <strong>IPv6</strong></p><p>Estado: Ativo</p>`;
            } else {
                throw new Error('Não é IPv6');
            }
        } catch (e) {
            ipv6El.textContent = 'Não detetado';
            ipv6Details.innerHTML = `<p style="color: #94a3b8;">Ligação IPv6 não ativa nesta rede.</p>`;
        }
    }

    // Executa as requisições em paralelo
    await Promise.all([fetchIPv4(), fetchIPv6()]);

    // Copiar IPv4
    copyIpv4Btn.addEventListener('click', async () => {
        const text = ipv4El.textContent;
        if (text.includes('Indisponível') || text.includes('carregar')) return;
        await navigator.clipboard.writeText(text);
        copyIpv4Btn.textContent = 'Copiado!';
        setTimeout(() => copyIpv4Btn.textContent = 'Copiar IPv4', 2000);
    });

    // Copiar IPv6
    copyIpv6Btn.addEventListener('click', async () => {
        const text = ipv6El.textContent;
        if (text.includes('detetado') || text.includes('carregar')) return;
        await navigator.clipboard.writeText(text);
        copyIpv6Btn.textContent = 'Copiado!';
        setTimeout(() => copyIpv6Btn.textContent = 'Copiar IPv6', 2000);
    });
});