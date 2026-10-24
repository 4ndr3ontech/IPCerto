document.addEventListener('DOMContentLoaded', async () => {
    const ipv4El = document.getElementById('ipv4-address');
    const ipv4Details = document.getElementById('ipv4-details');
    const copyIpv4Btn = document.getElementById('copy-ipv4-btn');

    const ipv6El = document.getElementById('ipv6-address');
    const ipv6Details = document.getElementById('ipv6-details');
    const copyIpv6Btn = document.getElementById('copy-ipv6-btn');

    // 1. Força a descoberta do IPv4 através de um endpoint focado em v4
    async function fetchIPv4() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) throw new Error('Falha ao obter IPv4.');
            const data = await response.json();
            
            ipv4El.textContent = data.ip;
            ipv4Details.innerHTML = `Protocolo: <strong>IPv4</strong> • Ativo`;
        } catch (error) {
            ipv4El.textContent = 'Não detetado';
            ipv4Details.innerHTML = `Rede sem suporte a IPv4 público`;
        }
    }

    // 2. Busca o IP principal na nossa API do Cloudflare (geralmente IPv6)
    async function fetchMainIp() {
        try {
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
            } else {
                // Se a Cloudflare retornar IPv4, significa que não há IPv6
                ipv6El.textContent = 'Não detetado';
                ipv6Details.innerHTML = `A ligação atual utiliza apenas IPv4`;
                
                // Aproveita para preencher o IPv4 caso a chamada externa falhe
                if (ipv4El.textContent === 'A carregar...' || ipv4El.textContent === 'Não detetado') {
                    ipv4El.textContent = ip;
                    ipv4Details.innerHTML = `Protocolo: <strong>IPv4</strong> • Ativo`;
                }
            }
        } catch (error) {
            console.error('Erro na requisição interna:', error);
            ipv6El.textContent = 'Indisponível';
            ipv6Details.innerHTML = 'Erro de comunicação';
            
            if (ipv4El.textContent === 'A carregar...') {
                ipv4El.textContent = 'Indisponível';
                ipv4Details.textContent = 'Erro de comunicação';
            }
        }
    }

    // Dispara ambas as requisições ao mesmo tempo
    fetchIPv4();
    fetchMainIp();

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