document.addEventListener('DOMContentLoaded', async () => {
    const ipv4El = document.getElementById('ipv4-address');
    const ipv4Details = document.getElementById('ipv4-details');
    const copyIpv4Btn = document.getElementById('copy-ipv4-btn');

    const ipv6El = document.getElementById('ipv6-address');
    const ipv6Details = document.getElementById('ipv6-details');
    const copyIpv6Btn = document.getElementById('copy-ipv6-btn');

    async function fetchClientIp() {
        try {
            // Requisição para a nossa rota do Cloudflare Pages /api/ip
            const response = await fetch('/api/ip');
            
            if (!response.ok) {
                throw new Error('Falha ao obter IP do servidor.');
            }

            const data = await response.json();
            const ip = data.ip;
            const version = data.version;

            if (version === 'IPv6' || ip.includes(':')) {
                ipv6El.textContent = ip;
                ipv6Details.innerHTML = `Protocolo: <strong>IPv6</strong> • Ativo`;
                
                ipv4El.textContent = 'Não detetado nesta rota';
                ipv4Details.innerHTML = `A ligação atual utiliza IPv6`;
            } else {
                ipv4El.textContent = ip;
                ipv4Details.innerHTML = `Protocolo: <strong>IPv4</strong> • Ativo`;
                
                ipv6El.textContent = 'Não detetado nesta rota';
                ipv6Details.innerHTML = `A ligação atual utiliza IPv4`;
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            ipv4El.textContent = 'Indisponível';
            ipv6El.textContent = 'Indisponível';
            ipv4Details.textContent = 'Erro de comunicação';
            ipv6Details.textContent = 'Erro de comunicação';
        }
    }

    await fetchClientIp();

    // Copiar IPv4
    copyIpv4Btn.addEventListener('click', async () => {
        const text = ipv4El.textContent;
        if (text.includes('Indisponível') || text.includes('carregar') || text.includes('Não detetado')) return;
        await navigator.clipboard.writeText(text);
        copyIpv4Btn.textContent = 'Copiado!';
        setTimeout(() => copyIpv4Btn.textContent = 'Copiar IPv4', 2000);
    });

    // Copiar IPv6
    copyIpv6Btn.addEventListener('click', async () => {
        const text = ipv6El.textContent;
        if (text.includes('Indisponível') || text.includes('carregar') || text.includes('Não detetado')) return;
        await navigator.clipboard.writeText(text);
        copyIpv6Btn.textContent = 'Copiado!';
        setTimeout(() => copyIpv6Btn.textContent = 'Copiar IPv6', 2000);
    });
});