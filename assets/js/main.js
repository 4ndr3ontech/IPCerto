document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTÃO DE TABS E TÍTULO DINÂMICO ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('dynamic-title');

    const tabTitles = {
        'dashboard': 'Diagnóstico de Conexão',
        'dns-lookup': 'DNS Lookup (Dig)',
        'latency': 'Teste de Latência (Ping)',
        'speedtest': 'Teste sua Conexão',
        'cidr': 'Calculadora de Sub-redes',
        'webrtc': 'WebRTC Leak Test',
        'headers': 'HTTP Headers RAW',
        'password-gen': 'Gerador de Senhas',
        'base64': 'Codificador Base64'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            if (pageTitle && tabTitles[targetId]) {
                pageTitle.textContent = tabTitles[targetId];
            }
            
            if(targetId === 'headers') fetchHeaders();
            if(targetId === 'dashboard') window.dispatchEvent(new Event('resize')); 
        });
    });

    // --- FUNÇÃO GLOBAL DE CÓPIA ---
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-copy');
            const textToCopy = document.getElementById(targetId).textContent;
            
            if (textToCopy.includes('carregar') || textToCopy.includes('Não') || textToCopy.includes('Clique_em_Gerar')) return;
            
            await navigator.clipboard.writeText(textToCopy);
            
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            btn.classList.add('success');
            setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('success'); }, 2000);
        });
    });

    const dnsRow = document.getElementById('dns-ptr-info');
    dnsRow.addEventListener('click', async () => {
        const text = dnsRow.dataset.hostname;
        if (!text || text.includes('resolver')) return;
        await navigator.clipboard.writeText(text);
        dnsRow.classList.add('success');
        dnsRow.textContent = '✔ Copiado para a área de transferência';
        setTimeout(() => { dnsRow.classList.remove('success'); dnsRow.textContent = text; }, 2000);
    });

    // --- 2. DASHBOARD ---
    async function loadDashboard() {
        setInterval(() => {
            document.getElementById('time-info').textContent = new Date().toLocaleString('pt-PT');
        }, 1000);

        try {
            const res4 = await fetch('https://api.ipify.org?format=json');
            const data4 = await res4.json();
            document.getElementById('ipv4-address').textContent = data4.ip;
        } catch { document.getElementById('ipv4-address').textContent = 'Indisponível'; }

        try {
            const res6 = await fetch('/api/ip');
            const data6 = await res6.json();
            document.getElementById('ipv6-address').textContent = data6.version === 'IPv6' ? data6.ip : 'Apenas IPv4 detetado';
        } catch { document.getElementById('ipv6-address').textContent = 'Não detetado'; }

        try {
            let geoUrl = 'https://ipapi.co/json/';
            const ipVal = document.getElementById('ipv4-address').textContent;
            if (ipVal && !ipVal.includes('Indisp')) geoUrl = `https://ipapi.co/${ipVal}/json/`;

            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            document.getElementById('isp-info').textContent = geoData.org || geoData.asn || 'ISP Desconhecido';
            document.getElementById('geo-city').textContent = geoData.city || 'Desconhecida';
            document.getElementById('geo-region').textContent = geoData.region || '-';
            document.getElementById('geo-country').textContent = geoData.country_name || '-';
            document.getElementById('geo-asn').textContent = geoData.asn || '-';

            if (geoData.latitude && geoData.longitude) {
                document.getElementById('geo-coords').textContent = `📍 ${geoData.latitude}, ${geoData.longitude}`;
                document.getElementById('google-maps-link').href = `https://maps.google.com/?q=${geoData.latitude},${geoData.longitude}`;
                
                const map = L.map('map').setView([geoData.latitude, geoData.longitude], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
                const customIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });
                L.marker([geoData.latitude, geoData.longitude], {icon: customIcon}).addTo(map).bindPopup(`<b>${geoData.city}</b>`).openPopup();
            }
        } catch (e) { console.error(e); }

        try {
            const ipVal = document.getElementById('ipv4-address').textContent;
            if (!ipVal.includes('Indisp')) {
                const reversedIp = ipVal.split('.').reverse().join('.');
                const dnsRes = await fetch(`https://dns.google/resolve?name=${reversedIp}.in-addr.arpa&type=PTR`);
                const dnsData = await dnsRes.json();
                let ptr = 'Sem hostname reverso';
                if (dnsData.Answer) ptr = dnsData.Answer[0].data.replace(/\.$/, '');
                dnsRow.textContent = ptr; dnsRow.dataset.hostname = ptr;
            }
        } catch { dnsRow.textContent = 'Erro ao resolver DNS'; }
    }

    // --- 3. DNS LOOKUP ---
    document.getElementById('btn-dns-lookup').addEventListener('click', async () => {
        const domain = document.getElementById('dns-domain-input').value.trim();
        const type = document.getElementById('dns-type-input').value;
        const out = document.getElementById('dns-result-output');
        if (!domain) return alert('Insira um domínio (ex: google.com)');
        out.textContent = `A consultar registos ${type} para ${domain}...`;
        
        try {
            const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
            const data = await res.json();
            if (data.Status !== 0 || !data.Answer) {
                out.textContent = `; No records found for ${domain} (${type}).`;
                return;
            }
            let resultStr = `;; ANSWER SECTION:\n`;
            data.Answer.forEach(ans => { resultStr += `${ans.name.padEnd(20)} IN \t ${type.padEnd(5)} ${ans.data}\n`; });
            out.textContent = resultStr;
        } catch (e) { out.textContent = `Erro na resolução DNS.`; }
    });

    // --- 4. TESTE DE LATÊNCIA (PING PRO) ---
    document.getElementById('btn-run-ping').addEventListener('click', async () => {
        const targets = [
            { id: 'ping-cf', url: 'https://cloudflare-dns.com/dns-query' },
            { id: 'ping-gg', url: 'https://dns.google/resolve' },
            { id: 'ping-q9', url: 'https://dns.quad9.net/dns-query' }
        ];
        document.getElementById('btn-run-ping').disabled = true;

        for (const target of targets) {
            const el = document.getElementById(target.id);
            const card = el.closest('.latency-card-pro');
            el.textContent = "Testando..."; el.style.color = "var(--text-muted)";
            card.classList.remove('active');
            try {
                const start = performance.now();
                await fetch(target.url, { mode: 'no-cors', cache: 'no-store' }); 
                const end = performance.now();
                const ms = Math.round(end - start);
                el.textContent = `${ms} ms`;
                el.style.color = ms < 50 ? "var(--success)" : (ms < 100 ? "#fbbf24" : "var(--danger)");
                card.classList.add('active');
            } catch (e) { 
                el.textContent = "Falha"; 
                el.style.color = "var(--danger)"; 
            }
        }
        document.getElementById('btn-run-ping').disabled = false;
    });

    // --- 5. TESTE SUA CONEXÃO (VELOCÍMETRO EM TEMPO REAL) ---
    function updateGauge(mbps, isUpload = false) {
        const liveVal = document.getElementById('speed-live-val');
        const gaugeBar = document.getElementById('gauge-bar');
        
        liveVal.textContent = parseFloat(mbps).toFixed(1);
        
        const maxVisualMbps = 500; 
        let val = Math.min(parseFloat(mbps), maxVisualMbps);
        let percent = val / maxVisualMbps;
        
        const offset = 251.2 - (251.2 * percent);
        gaugeBar.style.strokeDashoffset = offset;

        if (isUpload) {
            gaugeBar.classList.add('uploading');
        } else {
            gaugeBar.classList.remove('uploading');
        }
    }

    function smoothTransitionTo(targetMbps, isUpload, duration = 1200) {
        return new Promise(resolve => {
            const liveValElem = document.getElementById('speed-live-val');
            const startVal = parseFloat(liveValElem.textContent) || 0;
            const startTime = performance.now();

            function step(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentVal = startVal + (targetMbps - startVal) * easeProgress;

                updateGauge(currentVal, isUpload);

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(step);
        });
    }

    document.getElementById('btn-run-speedtest').addEventListener('click', async () => {
        const btn = document.getElementById('btn-run-speedtest');
        const status = document.getElementById('speed-status');
        const elDown = document.getElementById('speed-down');
        const elUp = document.getElementById('speed-up');
        const elPing = document.getElementById('speed-ping');

        btn.disabled = true;
        updateGauge(0);
        elDown.textContent = "-- Mbps"; elDown.style.color = "var(--text-muted)";
        elUp.textContent = "-- Mbps"; elUp.style.color = "var(--text-muted)";
        elPing.textContent = "-- ms"; elPing.style.color = "var(--text-muted)";

        try {
            status.textContent = "A calcular Latência...";
            const pingStart = performance.now();
            await fetch('https://speed.cloudflare.com/__down?bytes=0', { cache: 'no-store' });
            const pingEnd = performance.now();
            const ping = Math.round(pingEnd - pingStart);
            elPing.textContent = `${ping} ms`;
            elPing.style.color = "var(--accent)";

            status.textContent = "Testando Download...";
            const dlSize = 35000000;
            const dlStart = performance.now();
            const dlResponse = await fetch(`https://speed.cloudflare.com/__down?bytes=${dlSize}`, { cache: 'no-store' });
            
            const reader = dlResponse.body.getReader();
            let received = 0;
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                received += value.length;
                const now = performance.now();
                const duration = (now - dlStart) / 1000;
                
                if (duration > 0.1) {
                    const currentMbps = ((received * 8) / duration / 1000000);
                    updateGauge(currentMbps, false);
                }
            }
            
            const finalDlDuration = (performance.now() - dlStart) / 1000;
            const finalDlMbps = parseFloat(((dlSize * 8) / finalDlDuration / 1000000).toFixed(1));
            
            await smoothTransitionTo(finalDlMbps, false, 1200);

            elDown.textContent = `${finalDlMbps} Mbps`;
            elDown.style.color = "var(--success)";
            
            await new Promise(r => setTimeout(r, 1000));

            status.textContent = "Testando Upload...";
            await smoothTransitionTo(0, true, 800);

            const ulSize = 15000000;
            const ulData = new Uint8Array(ulSize);
            const ulStart = performance.now();
            
            let fakeUploadVal = finalDlMbps * 0.3;
            let ulInterval = setInterval(() => {
                fakeUploadVal = fakeUploadVal + (Math.random() * 3 - 1.5);
                if(fakeUploadVal < 0) fakeUploadVal = 0;
                updateGauge(fakeUploadVal, true);
            }, 150);

            await fetch('https://speed.cloudflare.com/__up', {
                method: 'POST',
                body: ulData,
                headers: { 'Content-Type': 'application/octet-stream' },
                cache: 'no-store'
            });
            
            clearInterval(ulInterval);
            const ulEnd = performance.now();
            const ulDuration = (ulEnd - ulStart) / 1000;
            const ulMbps = parseFloat(((ulSize * 8) / ulDuration / 1000000).toFixed(1));
            
            await smoothTransitionTo(ulMbps, true, 1200);

            elUp.textContent = `${ulMbps} Mbps`;
            elUp.style.color = "var(--success)";

            status.textContent = "Teste Concluído";
        } catch (error) {
            status.textContent = "Erro de Ligação. Tente novamente.";
            updateGauge(0);
        }
        
        setTimeout(() => {
            btn.disabled = false;
        }, 2000);
    });

    // --- 6. CIDR E WEBRTC ---
    document.getElementById('btn-calc-cidr').addEventListener('click', () => {
        const input = document.getElementById('cidr-input').value.trim();
        const results = document.getElementById('cidr-results').querySelectorAll('.mono');
        if (!input.includes('/')) return alert('Formato inválido.');
        const [ip, maskStr] = input.split('/');
        const mask = parseInt(maskStr);
        const ipParts = ip.split('.').map(Number);
        const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const maskInt = ~((1 << (32 - mask)) - 1);
        const intToIp = (int) => `${(int >>> 24) & 255}.${(int >>> 16) & 255}.${(int >>> 8) & 255}.${int & 255}`;
        results[0].textContent = intToIp(ipInt & maskInt);
        results[1].textContent = intToIp(maskInt);
        results[2].textContent = mask < 31 ? intToIp((ipInt & maskInt) + 1) : '-';
        results[3].textContent = mask < 31 ? intToIp((ipInt & maskInt | ~maskInt) - 1) : '-';
        results[4].textContent = intToIp(ipInt & maskInt | ~maskInt);
        results[5].textContent = mask < 31 ? Math.pow(2, 32 - mask) - 2 : (mask === 31 ? 2 : 1);
    });

    document.getElementById('btn-test-webrtc').addEventListener('click', () => {
        const ipDisplay = document.getElementById('local-ip-display');
        document.getElementById('webrtc-result').classList.remove('hidden');
        ipDisplay.textContent = "A auditar..."; ipDisplay.className = "mono text-muted";
        const rtc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        rtc.createDataChannel(""); rtc.createOffer().then(o => rtc.setLocalDescription(o));
        rtc.onicecandidate = (e) => {
            if (e.candidate) {
                const ipMatch = e.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                if (ipMatch) { ipDisplay.textContent = ipMatch[1]; ipDisplay.className = "mono text-danger"; rtc.close(); }
            }
        };
        setTimeout(() => { if(ipDisplay.textContent === "A auditar...") { ipDisplay.textContent = "Seguro (Sem Fuga)"; ipDisplay.className = "mono text-success"; } }, 3000);
    });

    async function fetchHeaders() {
        const out = document.getElementById('headers-output');
        try {
            const res = await fetch('https://httpbin.org/headers');
            const data = await res.json();
            out.textContent = JSON.stringify(data.headers, null, 2);
        } catch { out.textContent = 'Erro ao ler os cabeçalhos.'; }
    }

    // --- 7. GERADOR DE SENHAS ---
    const pwdLengthInput = document.getElementById('pwd-length');
    const pwdLengthVal = document.getElementById('pwd-length-val');
    pwdLengthInput.addEventListener('input', (e) => { pwdLengthVal.textContent = e.target.value; });
    
    document.getElementById('btn-generate-pwd').addEventListener('click', () => {
        const length = parseInt(pwdLengthInput.value);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let pwd = "";
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) { pwd += chars[array[i] % chars.length]; }
        document.getElementById('pwd-output').textContent = pwd;
    });

    // --- 8. BASE64 ---
    const b64Input = document.getElementById('base64-input');
    const b64Output = document.getElementById('base64-output');
    
    document.getElementById('btn-b64-encode').addEventListener('click', () => {
        try { b64Output.value = btoa(unescape(encodeURIComponent(b64Input.value))); } 
        catch (e) { b64Output.value = "Erro: Texto inválido para codificação."; }
    });
    
    document.getElementById('btn-b64-decode').addEventListener('click', () => {
        try { b64Output.value = decodeURIComponent(escape(atob(b64Input.value))); } 
        catch (e) { b64Output.value = "Erro: String Base64 inválida."; }
    });

    loadDashboard();
});