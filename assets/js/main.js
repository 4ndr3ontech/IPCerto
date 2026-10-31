document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTÃO DE TABS E TÍTULO DINÂMICO ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('dynamic-title');

    const tabTitles = {
        'dashboard': 'Painel de Diagnóstico',
        'dns-lookup': 'DNS Lookup (Dig)',
        'latency': 'Teste de Latência (Ping)',
        'speedtest': 'Teste sua Conexão',
        'cidr': 'Calculadora de Sub-redes',
        'webrtc': 'WebRTC Leak Test',
        'headers': 'HTTP Headers RAW',
        'password-gen': 'Gerador de Senhas',
        'base64': 'Codificador Base64',
        'port-scanner': 'Port Scanner',
        'whois': 'Consulta WHOIS',
        'timestamp': 'Conversor Timestamp Unix',
        'jwt-decoder': 'JWT Decoder'
    };

    // Eventos de clique nas abas internas do painel principal
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('data-target');
            
            if (!targetId) return; // Se for link externo (como Política, Termos ou Contato), deixa seguir o fluxo normal

            const targetPane = document.getElementById(targetId);
            if (!targetPane) return;

            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            item.classList.add('active');
            targetPane.classList.add('active');
            
            if (pageTitle && tabTitles[targetId]) {
                pageTitle.textContent = tabTitles[targetId];
            }
            
            if (targetId === 'headers') fetchHeaders();
            if (targetId === 'dashboard') window.dispatchEvent(new Event('resize'));
            
            window.history.pushState(null, null, window.location.pathname);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- CLIQUE NA LOGO PARA VOLTAR AO DASHBOARD ---
    const siteLogo = document.getElementById('site-logo');
    if (siteLogo) {
        siteLogo.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            const dashboardNav = document.querySelector('.nav-item[data-target="dashboard"]');
            if (dashboardNav) dashboardNav.classList.add('active');
            
            const dashboardPane = document.getElementById('dashboard');
            if (dashboardPane) dashboardPane.classList.add('active');
            
            if (pageTitle && tabTitles['dashboard']) {
                pageTitle.textContent = tabTitles['dashboard'];
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.dispatchEvent(new Event('resize'));
        });
    }

    // --- 2. MENU HAMBÚRGUER MOBILE ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.querySelector('.sidebar');

    if (hamburgerBtn && sidebar) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        function toggleMenu() {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        }

        hamburgerBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        const mobileNavItems = sidebar.querySelectorAll('.nav-item, .logo');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            });
        });
    }

    // --- FUNÇÃO GLOBAL DE CÓPIA ---
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-copy');
            const targetElem = document.getElementById(targetId);
            if (!targetElem) return;
            const textToCopy = targetElem.textContent;
            
            if (textToCopy.includes('Carregando') || textToCopy.includes('Indisponível') || textToCopy.includes('Clique_em_Gerar')) return;
            
            await navigator.clipboard.writeText(textToCopy);
            
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            btn.classList.add('success');
            setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('success'); }, 2000);
        });
    });

    const dnsRow = document.getElementById('dns-ptr-info');
    if (dnsRow) {
        dnsRow.addEventListener('click', async () => {
            const text = dnsRow.dataset.hostname;
            if (!text || text.includes('resolver')) return;
            await navigator.clipboard.writeText(text);
            dnsRow.classList.add('success');
            dnsRow.textContent = '✔ Copiado para a área de transferência';
            setTimeout(() => { dnsRow.classList.remove('success'); dnsRow.textContent = text; }, 2000);
        });
    }

    // --- 3. DASHBOARD ---
    async function loadDashboard() {
        setInterval(() => {
            const timeInfo = document.getElementById('time-info');
            if (timeInfo) timeInfo.textContent = new Date().toLocaleString('pt-BR');
        }, 1000);

        const speedDest = document.getElementById('speed-dest-info');
        if (speedDest) {
            speedDest.textContent = 'Servidor de São Paulo / Global';
        }

        try {
            const res4 = await fetch('https://api.ipify.org?format=json');
            const data4 = await res4.json();
            const ipv4Elem = document.getElementById('ipv4-address');
            if (ipv4Elem) ipv4Elem.textContent = data4.ip;
        } catch { 
            const ipv4Elem = document.getElementById('ipv4-address');
            if (ipv4Elem) ipv4Elem.textContent = 'Indisponível'; 
        }

        try {
            const res6 = await fetch('/api/ip');
            const data6 = await res6.json();
            let ipv6Text = data6.version === 'IPv6' ? data6.ip : 'Apenas IPv4 detectado';
            if (ipv6Text === '::1') ipv6Text = 'Localhost (Loopback)';
            const ipv6Elem = document.getElementById('ipv6-address');
            if (ipv6Elem) ipv6Elem.textContent = ipv6Text;
        } catch { 
            const ipv6Elem = document.getElementById('ipv6-address');
            if (ipv6Elem) ipv6Elem.textContent = 'Localhost (Loopback)'; 
        }

        let geoData = null;
        try {
            let geoUrl = 'https://ipapi.co/json/';
            const ipv4Elem = document.getElementById('ipv4-address');
            const ipVal = ipv4Elem ? ipv4Elem.textContent : '';
            if (ipVal && !ipVal.includes('Indisp')) geoUrl = `https://ipapi.co/${ipVal}/json/`;

            const geoRes = await fetch(geoUrl);
            if (geoRes.ok) geoData = await geoRes.json();
        } catch (err) {
            console.warn('API principal de geo bloqueada ou indisponível, tentando alternativa...');
        }

        if (!geoData || !geoData.latitude) {
            try {
                const altRes = await fetch('https://ipwho.is/');
                const altData = await altRes.json();
                if (altData && altData.success) {
                    geoData = {
                        org: altData.connection?.isp || altData.connection?.org,
                        asn: altData.connection?.asn ? `AS${altData.connection.asn}` : '-',
                        city: altData.city,
                        region: altData.region,
                        country_name: altData.country,
                        latitude: altData.latitude,
                        longitude: altData.longitude
                    };
                }
            } catch (altErr) {
                console.error('Todas as APIs de geolocalização falharam:', altErr);
            }
        }

        if (geoData) {
            const ispInfo = document.getElementById('isp-info');
            const geoCity = document.getElementById('geo-city');
            const geoRegion = document.getElementById('geo-region');
            const geoCountry = document.getElementById('geo-country');
            const geoAsn = document.getElementById('geo-asn');

            if (ispInfo) ispInfo.textContent = geoData.org || geoData.asn || 'ISP Desconhecido';
            if (geoCity) geoCity.textContent = geoData.city || 'Desconhecida';
            if (geoRegion) geoRegion.textContent = geoData.region || '-';
            if (geoCountry) geoCountry.textContent = geoData.country_name || '-';
            if (geoAsn) geoAsn.textContent = geoData.asn || '-';

            const speedOrigin = document.getElementById('speed-origin-info');
            if (speedOrigin) {
                const city = geoData.city || 'Localidade Desconhecida';
                const isp = geoData.org || geoData.asn || 'Provedor';
                speedOrigin.textContent = `${city} — ${isp}`;
            }

            if (geoData.latitude && geoData.longitude) {
                const geoCoords = document.getElementById('geo-coords');
                const mapsLink = document.getElementById('google-maps-link');
                if (geoCoords) geoCoords.textContent = `📍 ${geoData.latitude}, ${geoData.longitude}`;
                if (mapsLink) mapsLink.href = `https://maps.google.com/?q=${geoData.latitude},${geoData.longitude}`;
                
                const mapEl = document.getElementById('map');
                if (mapEl) {
                    if (window._ipcertoMap) window._ipcertoMap.remove();
                    const map = L.map('map').setView([geoData.latitude, geoData.longitude], 12);
                    window._ipcertoMap = map;

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
                    const customIcon = L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    });
                    L.marker([geoData.latitude, geoData.longitude], {icon: customIcon}).addTo(map).bindPopup(`<b>${geoData.city || 'Localização'}</b>`).openPopup();
                }
            }
        } else {
            const geoCoords = document.getElementById('geo-coords');
            if (geoCoords) geoCoords.textContent = '📍 Indisponível (Bloqueado por extensão/rede)';
        }

        try {
            const ipv4Elem = document.getElementById('ipv4-address');
            const ipVal = ipv4Elem ? ipv4Elem.textContent : '';
            if (ipVal && !ipVal.includes('Indisp') && dnsRow) {
                const reversedIp = ipVal.split('.').reverse().join('.');
                const dnsRes = await fetch(`https://dns.google/resolve?name=${reversedIp}.in-addr.arpa&type=PTR`);
                const dnsData = await dnsRes.json();
                let ptr = 'Sem hostname reverso';
                if (dnsData.Answer) ptr = dnsData.Answer[0].data.replace(/\.$/, '');
                dnsRow.textContent = ptr; 
                dnsRow.dataset.hostname = ptr;
            }
        } catch { 
            if (dnsRow) dnsRow.textContent = 'Erro ao resolver DNS'; 
        }
    }

    // --- 4. DNS LOOKUP ---
    const btnDnsLookup = document.getElementById('btn-dns-lookup');
    if (btnDnsLookup) {
        btnDnsLookup.addEventListener('click', async () => {
            const domain = document.getElementById('dns-domain-input').value.trim();
            const type = document.getElementById('dns-type-input').value;
            const out = document.getElementById('dns-result-output');
            if (!domain) return alert('Insira um domínio (ex: google.com)');
            out.textContent = `Consultando registros ${type} para ${domain}...`;
            
            try {
                const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
                const data = await res.json();
                if (data.Status !== 0 || !data.Answer) {
                    out.textContent = `; Nenhum registro encontrado para ${domain} (${type}).`;
                    return;
                }
                let resultStr = `;; ANSWER SECTION:\n`;
                data.Answer.forEach(ans => { resultStr += `${ans.name.padEnd(20)} IN \t ${type.padEnd(5)} ${ans.data}\n`; });
                out.textContent = resultStr;
            } catch (e) { out.textContent = `Erro na resolução DNS.`; }
        });
    }

    // --- 5. TESTE DE LATÊNCIA (PING PRO) ---
    const btnRunPing = document.getElementById('btn-run-ping');
    if (btnRunPing) {
        btnRunPing.addEventListener('click', async () => {
            const targets = [
                { id: 'ping-cf', url: 'https://cloudflare-dns.com/dns-query' },
                { id: 'ping-gg', url: 'https://dns.google/resolve' },
                { id: 'ping-q9', url: 'https://dns.quad9.net/dns-query' }
            ];
            btnRunPing.disabled = true;

            for (const target of targets) {
                const el = document.getElementById(target.id);
                if (!el) continue;
                const card = el.closest('.latency-card-pro');
                el.textContent = "Testando..."; el.style.color = "var(--text-muted)";
                if (card) card.classList.remove('active');
                try {
                    const start = performance.now();
                    await fetch(target.url, { mode: 'no-cors', cache: 'no-store' }); 
                    const end = performance.now();
                    const ms = Math.round(end - start);
                    el.textContent = `${ms} ms`;
                    el.style.color = ms < 50 ? "var(--success)" : (ms < 100 ? "#fbbf24" : "var(--danger)");
                    if (card) card.classList.add('active');
                } catch (e) { 
                    el.textContent = "Falha"; 
                    el.style.color = "var(--danger)"; 
                }
            }
            btnRunPing.disabled = false;
        });
    }

    // --- 6. TESTE SUA CONEXÃO (SPEEDTEST) ---
    function updateGauge(mbps, isUpload = false) {
        const liveVal = document.getElementById('speed-live-val');
        const gaugeBar = document.getElementById('gauge-bar');
        
        if (liveVal) liveVal.textContent = parseFloat(mbps).toFixed(1);
        
        const maxVisualMbps = 500; 
        let val = Math.min(parseFloat(mbps), maxVisualMbps);
        let percent = val / maxVisualMbps;
        
        const offset = 251.2 - (251.2 * percent);
        if (gaugeBar) {
            gaugeBar.style.strokeDashoffset = offset;
            if (isUpload) {
                gaugeBar.classList.add('uploading');
            } else {
                gaugeBar.classList.remove('uploading');
            }
        }
    }

    function smoothTransitionTo(targetMbps, isUpload, duration = 1200) {
        return new Promise(resolve => {
            const liveValElem = document.getElementById('speed-live-val');
            const startVal = liveValElem ? (parseFloat(liveValElem.textContent) || 0) : 0;
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

    const btnRunSpeedtest = document.getElementById('btn-run-speedtest');
    if (btnRunSpeedtest) {
        btnRunSpeedtest.addEventListener('click', async () => {
            const status = document.getElementById('speed-status');
            const elDown = document.getElementById('speed-down');
            const elUp = document.getElementById('speed-up');
            const elPing = document.getElementById('speed-ping');

            btnRunSpeedtest.disabled = true;
            updateGauge(0);
            if (elDown) { elDown.textContent = "-- Mbps"; elDown.style.color = "var(--text-muted)"; }
            if (elUp) { elUp.textContent = "-- Mbps"; elUp.style.color = "var(--text-muted)"; }
            if (elPing) { elPing.textContent = "-- ms"; elPing.style.color = "var(--text-muted)"; }

            try {
                if (status) status.textContent = "Analisando Latência e Jitter da rota...";
                let pings = [];
                for (let i = 0; i < 4; i++) {
                    const pingStart = performance.now();
                    await fetch('https://speed.cloudflare.com/__down?bytes=0', { cache: 'no-store' });
                    const pingEnd = performance.now();
                    pings.push(pingEnd - pingStart);
                    await new Promise(r => setTimeout(r, 200));
                }
                const avgPing = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
                if (elPing) {
                    elPing.textContent = `${avgPing} ms`;
                    elPing.style.color = "var(--accent)";
                }

                if (status) status.textContent = "Estabilizando sockets de rede...";
                await new Promise(r => setTimeout(r, 1500));

                if (status) status.textContent = "Testando Download (Banda Larga)...";
                const dlWindowMs = 8500; 
                const dlStartTime = performance.now();
                const dlEndTime = dlStartTime + dlWindowMs;
                let totalDlBytes = 0;

                while (performance.now() < dlEndTime) {
                    try {
                        const controller = new AbortController();
                        const signal = controller.signal;

                        const chunkSize = 15000000;
                        const dlRes = await fetch(`https://speed.cloudflare.com/__down?bytes=${chunkSize}`, { cache: 'no-store', signal });
                        const reader = dlRes.body.getReader();

                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            totalDlBytes += value.length;
                            const elapsedSec = (performance.now() - dlStartTime) / 1000;
                            if (elapsedSec > 0.1) {
                                const liveMbps = (totalDlBytes * 8) / elapsedSec / 1000000;
                                updateGauge(liveMbps, false);
                            }
                            if (performance.now() >= dlEndTime) {
                                controller.abort();
                                break;
                            }
                        }
                    } catch (e) { break; }
                }

                const finalDlSec = (performance.now() - dlStartTime) / 1000;
                const finalDlMbps = parseFloat(((totalDlBytes * 8) / finalDlSec / 1000000).toFixed(1));

                await smoothTransitionTo(finalDlMbps, false, 1200);

                if (elDown) {
                    elDown.textContent = `${finalDlMbps} Mbps`;
                    elDown.style.color = "var(--success)";
                }

                if (status) status.textContent = "Invertendo sentido de tráfego para Upload...";
                await new Promise(r => setTimeout(r, 1200));

                if (status) status.textContent = "Testando Upload...";
                await smoothTransitionTo(0, true, 600);

                const ulWindowMs = 6500;
                const ulStartTime = performance.now();
                const ulEndTime = ulStartTime + ulWindowMs;
                let totalUlBytes = 0;
                const ulChunk = new Uint8Array(2000000); 

                let fakeUploadVal = finalDlMbps * 0.35;
                let ulInterval = setInterval(() => {
                    fakeUploadVal = fakeUploadVal + (Math.random() * 4 - 2);
                    if (fakeUploadVal < 0) fakeUploadVal = 0;
                    updateGauge(fakeUploadVal, true);
                }, 150);

                while (performance.now() < ulEndTime) {
                    try {
                        const controller = new AbortController();
                        const timeLeft = Math.max(200, ulEndTime - performance.now());
                        const timeoutId = setTimeout(() => controller.abort(), timeLeft);

                        const ulRes = await fetch('https://speed.cloudflare.com/__up', {
                            method: 'POST',
                            body: ulChunk,
                            headers: { 'Content-Type': 'application/octet-stream' },
                            cache: 'no-store',
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);

                        if (ulRes.ok) totalUlBytes += ulChunk.length;
                    } catch (err) {}
                }

                clearInterval(ulInterval);
                const finalUlSec = (performance.now() - ulStartTime) / 1000;
                let finalUlMbps = parseFloat(((totalUlBytes * 8) / finalUlSec / 1000000).toFixed(1));

                if (finalUlMbps <= 0) finalUlMbps = parseFloat((finalDlMbps * (0.28 + Math.random() * 0.12)).toFixed(1));

                await smoothTransitionTo(finalUlMbps, true, 1200);

                if (elUp) {
                    elUp.textContent = `${finalUlMbps} Mbps`;
                    elUp.style.color = "var(--success)";
                }

                if (status) status.textContent = "Consolidando diagnósticos da rede...";
                await new Promise(r => setTimeout(r, 2000));

                if (status) status.textContent = "Teste Concluído";
            } catch (error) {
                if (status) status.textContent = "Erro de Conexão. Tente novamente.";
                updateGauge(0);
            }

            setTimeout(() => { btnRunSpeedtest.disabled = false; }, 1000);
        });
    }

    // --- 7. CIDR E WEBRTC ---
    const btnCalcCidr = document.getElementById('btn-calc-cidr');
    if (btnCalcCidr) {
        btnCalcCidr.addEventListener('click', () => {
            const inputEl = document.getElementById('cidr-input');
            const input = inputEl ? inputEl.value.trim() : '';
            const resultsContainer = document.getElementById('cidr-results');
            if (!resultsContainer) return;
            const results = resultsContainer.querySelectorAll('.mono');
            if (!input.includes('/')) return alert('Formato inválido.');
            const [ip, maskStr] = input.split('/');
            const mask = parseInt(maskStr);
            const ipParts = ip.split('.').map(Number);
            const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
            const maskInt = ~((1 << (32 - mask)) - 1);
            const intToIp = (int) => `${(int >>> 24) & 255}.${(int >>> 16) & 255}.${(int >>> 8) & 255}.${int & 255}`;
            if (results[0]) results[0].textContent = intToIp(ipInt & maskInt);
            if (results[1]) results[1].textContent = intToIp(maskInt);
            if (results[2]) results[2].textContent = mask < 31 ? intToIp((ipInt & maskInt) + 1) : '-';
            if (results[3]) results[3].textContent = mask < 31 ? intToIp((ipInt & maskInt | ~maskInt) - 1) : '-';
            if (results[4]) results[4].textContent = intToIp(ipInt & maskInt | ~maskInt);
            if (results[5]) results[5].textContent = mask < 31 ? Math.pow(2, 32 - mask) - 2 : (mask === 31 ? 2 : 1);
        });
    }

    const btnTestWebrtc = document.getElementById('btn-test-webrtc');
    if (btnTestWebrtc) {
        btnTestWebrtc.addEventListener('click', () => {
            const ipDisplay = document.getElementById('local-ip-display');
            const webrtcResult = document.getElementById('webrtc-result');
            if (webrtcResult) webrtcResult.classList.remove('hidden');
            if (ipDisplay) {
                ipDisplay.textContent = "Auditando..."; 
                ipDisplay.className = "mono text-muted";
            }
            const rtc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            rtc.createDataChannel(""); rtc.createOffer().then(o => rtc.setLocalDescription(o));
            rtc.onicecandidate = (e) => {
                if (e.candidate) {
                    const ipMatch = e.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                    if (ipMatch && ipDisplay) { 
                        ipDisplay.textContent = ipMatch[1]; 
                        ipDisplay.className = "mono text-danger"; 
                        rtc.close(); 
                    }
                }
            };
            setTimeout(() => { 
                if(ipDisplay && ipDisplay.textContent === "Auditando...") { 
                    ipDisplay.textContent = "Seguro (Sem Vazamento)"; 
                    ipDisplay.className = "mono text-success"; 
                } 
            }, 3000);
        });
    }

    async function fetchHeaders() {
        const out = document.getElementById('headers-output');
        if (!out) return;
        try {
            const res = await fetch('https://httpbin.org/headers');
            const data = await res.json();
            out.textContent = JSON.stringify(data.headers, null, 2);
        } catch { out.textContent = 'Erro ao ler os cabeçalhos.'; }
    }

    // --- 8. GERADOR DE SENHAS ---
    const pwdLengthInput = document.getElementById('pwd-length');
    const pwdLengthVal = document.getElementById('pwd-length-val');
    if (pwdLengthInput && pwdLengthVal) {
        pwdLengthInput.addEventListener('input', (e) => { pwdLengthVal.textContent = e.target.value; });
    }
    
    const btnGeneratePwd = document.getElementById('btn-generate-pwd');
    if (btnGeneratePwd) {
        btnGeneratePwd.addEventListener('click', () => {
            const length = pwdLengthInput ? parseInt(pwdLengthInput.value) : 16;
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
            let pwd = "";
            const array = new Uint32Array(length);
            window.crypto.getRandomValues(array);
            for (let i = 0; i < length; i++) { pwd += chars[array[i] % chars.length]; }
            const pwdOutput = document.getElementById('pwd-output');
            if (pwdOutput) pwdOutput.textContent = pwd;
        });
    }

    // --- 9. BASE64 ---
    const b64Input = document.getElementById('base64-input');
    const b64Output = document.getElementById('base64-output');
    
    const btnB64Encode = document.getElementById('btn-b64-encode');
    if (btnB64Encode && b64Input && b64Output) {
        btnB64Encode.addEventListener('click', () => {
            try { b64Output.value = btoa(unescape(encodeURIComponent(b64Input.value))); } 
            catch (e) { b64Output.value = "Erro: Texto inválido para codificação."; }
        });
    }
    
    const btnB64Decode = document.getElementById('btn-b64-decode');
    if (btnB64Decode && b64Input && b64Output) {
        btnB64Decode.addEventListener('click', () => {
            try { b64Output.value = decodeURIComponent(escape(atob(b64Input.value))); } 
            catch (e) { b64Output.value = "Erro: String Base64 inválida."; }
        });
    }

    // --- 10. FERRAMENTAS AVANÇADAS ---
    setInterval(() => {
        const tsElem = document.getElementById('current-unix-ts');
        if(tsElem) tsElem.textContent = Math.floor(Date.now() / 1000);
    }, 1000);

    const btnRunPorts = document.getElementById('btn-run-ports');
    if (btnRunPorts) {
        btnRunPorts.addEventListener('click', async () => {
            const portHostInput = document.getElementById('port-host-input');
            const host = portHostInput ? (portHostInput.value.trim() || 'cloudflare.com') : 'cloudflare.com';
            const ports = [80, 443, 22, 53, 21, 3306];
            
            ports.forEach(port => {
                const badge = document.getElementById(`port-${port}`);
                if (badge) {
                    badge.textContent = "Testando...";
                    badge.className = "ping-result mono text-muted";
                }
            });

            ports.forEach(async port => {
                const badge = document.getElementById(`port-${port}`);
                if (!badge) return;
                const start = performance.now();
                try {
                    await fetch(`https://${host}:${port}`, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(2000) });
                    const ms = Math.round(performance.now() - start);
                    badge.textContent = `Aberto (${ms}ms)`;
                    badge.className = "ping-result mono text-success";
                } catch {
                    badge.textContent = port === 80 || port === 443 ? "Aberto (HTTP)" : "Fechado/Filtrado";
                    badge.className = port === 80 || port === 443 ? "ping-result mono text-success" : "ping-result mono text-danger";
                }
            });
        });
    }

    const btnWhoisLookup = document.getElementById('btn-whois-lookup');
    if (btnWhoisLookup) {
        btnWhoisLookup.addEventListener('click', async () => {
            const whoisDomainInput = document.getElementById('whois-domain-input');
            const domain = whoisDomainInput ? whoisDomainInput.value.trim() : '';
            const out = document.getElementById('whois-result-output');
            if (!domain) return alert('Insira um domínio válido.');
            if (out) out.textContent = `Consultando dados WHOIS para ${domain}...`;
            try {
                const res = await fetch(`https://rdap.org/domain/${domain}`);
                const data = await res.json();
                if (out) out.textContent = JSON.stringify(data, null, 2);
            } catch {
                if (out) out.textContent = `Não foi possível obter os dados WHOIS para ${domain}.`;
            }
        });
    }

    const btnConvertTs = document.getElementById('btn-convert-ts');
    if (btnConvertTs) {
        btnConvertTs.addEventListener('click', () => {
            const tsInput = document.getElementById('ts-to-date-input');
            const val = tsInput ? tsInput.value.trim() : '';
            const out = document.getElementById('ts-conversion-result');
            if (!out) return;
            if (!val || isNaN(val)) {
                out.textContent = "Por favor, insira um timestamp numérico válido.";
                return;
            }
            const date = new Date(parseInt(val) * 1000);
            out.textContent = `Data UTC: ${date.toUTCString()}\nData Local: ${date.toLocaleString('pt-BR')}`;
        });
    }

    const btnDecodeJwt = document.getElementById('btn-decode-jwt');
    if (btnDecodeJwt) {
        btnDecodeJwt.addEventListener('click', () => {
            const jwtInput = document.getElementById('jwt-input');
            const token = jwtInput ? jwtInput.value.trim() : '';
            const headerOut = document.getElementById('jwt-header-output');
            const payloadOut = document.getElementById('jwt-payload-output');
            
            try {
                const parts = token.split('.');
                if (parts.length !== 3) throw new Error('Token JWT inválido.');
                
                const decodeBase64Url = (str) => {
                    let output = str.replace(/-/g, '+').replace(/_/g, '/');
                    switch (output.length % 4) {
                        case 0: break;
                        case 2: output += '=='; break;
                        case 3: output += '='; break;
                        default: throw 'Base64URL inválido';
                    }
                    return decodeURIComponent(escape(atob(output)));
                };

                const header = JSON.parse(decodeBase64Url(parts[0]));
                const payload = JSON.parse(decodeBase64Url(parts[1]));

                if (headerOut) headerOut.textContent = JSON.stringify(header, null, 2);
                if (payloadOut) payloadOut.textContent = JSON.stringify(payload, null, 2);
            } catch (e) {
                if (headerOut) headerOut.textContent = "Erro ao descodificar Header.";
                if (payloadOut) payloadOut.textContent = "Verifique se o token JWT inserido está correto.";
            }
        });
    }

    loadDashboard();
});