document.addEventListener('DOMContentLoaded', async () => {
    const ipv4El = document.getElementById('ipv4-address');
    const ipv4Details = document.getElementById('ipv4-details');
    const copyIpv4Btn = document.getElementById('copy-ipv4-btn');

    const ipv6El = document.getElementById('ipv6-address');
    const ipv6Details = document.getElementById('ipv6-details');
    const copyIpv6Btn = document.getElementById('copy-ipv6-btn');

    // 1. Força a descoberta do IPv4
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

    // 2. Busca o IP principal na API interna (geralmente IPv6 se Dual Stack ativo)
    async function fetchMainIp() {
        try {
            const response = await fetch('/api/ip');
            if (!response.ok) throw new Error('Falha ao obter IP do servidor.');

            const data = await response.json();
            const ip = data.ip;
            const version = data.version;

            if (version === 'IPv6' || ip.includes(':')) {
                ipv6El.textContent = ip;
                ipv6Details.innerHTML = `Protocolo: <strong>IPv6</strong> • Ativo`;
            } else {
                ipv6El.textContent = 'Não detetado';
                ipv6Details.innerHTML = `A ligação atual utiliza apenas IPv4`;
                
                if (ipv4El.textContent === 'A carregar...' || ipv4El.textContent === 'Não detetado') {
                    ipv4El.textContent = ip;
                    ipv4Details.innerHTML = `Protocolo: <strong>IPv4</strong> • Ativo`;
                }
            }
        } catch (error) {
            ipv6El.textContent = 'Indisponível';
            ipv6Details.innerHTML = 'Erro de comunicação';
            
            if (ipv4El.textContent === 'A carregar...') {
                ipv4El.textContent = 'Indisponível';
                ipv4Details.textContent = 'Erro de comunicação';
            }
        }
    }

    // 3. Atualiza a Data e Hora na interface
    function updateTime() {
        const now = new Date();
        const horas = String(now.getHours()).padStart(2, '0');
        const minutos = String(now.getMinutes()).padStart(2, '0');
        const dia = String(now.getDate()).padStart(2, '0');
        const mes = String(now.getMonth() + 1).padStart(2, '0');
        const ano = now.getFullYear();
        
        document.getElementById('time-info').textContent = `${horas}h${minutos}min - ${dia}/${mes}/${ano}`;
    }

    // 4. Nova Lógica de Localização Geográfica (Geo IP) e Mapa Leaflet
    async function fetchGeoLocation() {
        try {
            // Utilizamos a API do ipapi.co para obter os dados completos
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('Falha na API de GeoIP');
            const data = await response.json();
            
            // Atualiza o painel superior de ISP
            const provider = data.org || data.asn || 'Provedor não identificado';
            document.getElementById('isp-info').textContent = provider;

            // Preenche a grelha de 6 blocos do Geo IP
            document.getElementById('geo-ip').textContent = data.ip || 'Indisponível';
            document.getElementById('geo-hostname').textContent = data.asn || 'Sem hostname reverso';
            document.getElementById('geo-city').textContent = data.city || 'Desconhecida';
            document.getElementById('geo-region').textContent = data.region || 'Desconhecido';
            document.getElementById('geo-country').textContent = data.country_name || 'Desconhecido';
            document.getElementById('geo-isp').textContent = provider;
            
            const lat = data.latitude;
            const lon = data.longitude;
            
            if (lat && lon) {
                document.getElementById('geo-coords').textContent = `📍 Coordenadas: ${lat}, ${lon}`;
                document.getElementById('google-maps-link').href = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                
                // Inicializa o mapa Leaflet
                const map = L.map('map').setView([lat, lon], 13);
                
                // Carrega os blocos do mapa OpenStreetMap
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);
                
                // Adiciona o marcador personalizado verde no mapa
                const customIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                
                L.marker([lat, lon], {icon: customIcon}).addTo(map)
                    .bindPopup(`<b>${data.city}</b><br>${data.region}`)
                    .openPopup();
            } else {
                document.getElementById('geo-coords').textContent = `📍 Coordenadas: Não encontradas`;
                document.getElementById('map').innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#94a3b8;">Mapa indisponível.</div>';
            }

        } catch (error) {
            console.error('Erro ao buscar Geo IP:', error);
            document.getElementById('isp-info').textContent = 'Informação indisponível';
        }
    }

    // Dispara todas as funções de inicialização simultaneamente
    fetchIPv4();
    fetchMainIp();
    updateTime();
    fetchGeoLocation();

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