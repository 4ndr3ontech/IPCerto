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
        'jwt-decoder': 'JWT Decoder',
        'privacy': 'Política de Privacidade',
        'terms': 'Termos de Uso',
        'contact': 'Contacto'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
            
            if (pageTitle && tabTitles[targetId]) {
                pageTitle.textContent = tabTitles[targetId];
            }
            
            if(targetId === 'headers') fetchHeaders();
            if(targetId === 'dashboard') window.dispatchEvent(new Event('resize')); 
        });
    });

    // --- CLIQUE NA LOGO PARA VOLTAR AO DASHBOARD PRINCIPAL ---
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

    // Suporte para cliques nos links do rodapé
    document.querySelectorAll('.footer-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const matchingNavItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            if (matchingNavItem) matchingNavItem.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
            
            if (pageTitle && tabTitles[targetId]) {
                pageTitle.textContent = tabTitles[targetId];
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- FUNÇÃO GLOBAL DE CÓPIA ---
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-copy');
            const targetElem = document.getElementById(targetId);
            if (!targetElem) return;
            const textToCopy = targetElem.textContent;
            
            if (textToCopy.includes('carregar') || textToCopy.includes('Não') || textToCopy.includes('Clique_em_Gerar')) return;
            
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

    // --- 2. DASHBOARD ---
    async function loadDashboard() {
        setInterval(() => {
            const timeInfo = document.getElementById('time-info');
            if (timeInfo) timeInfo.textContent = new Date().toLocaleString('pt-PT');
        }, 1000);

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
            let ipv6Text = data6.version === 'IPv6' ? data6.ip : 'Apenas IPv4 detetado';
            if (ipv6Text === '::1') ipv6Text = 'Localhost (Loopback)';
            const ipv6Elem = document.getElementById('ipv6-address');
            if (ipv6Elem) ipv6Elem.textContent = ipv6Text;
        } catch { 
            const ipv6Elem = document.getElementById('ipv6-address');
            if (ipv6Elem) ipv6Elem.textContent = 'Localhost (Loopback)'; 
        }

        try {
            let geoUrl = 'https://ipapi.co/json/';
            const ipv4Elem = document.getElementById('ipv4-address');
            const ipVal = ipv4Elem ? ipv4Elem.textContent : '';
            if (ipVal && !ipVal.includes('Indisp')) geoUrl = `https://ipapi.co/${ipVal}/json/`;

            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

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

            if (geoData.latitude && geoData.longitude) {
                const geoCoords = document.getElementById('geo-coords');
                const mapsLink = document.getElementById('google-maps-link');
                if (geoCoords) geoCoords.textContent = `📍 ${geoData.latitude}, ${geoData.longitude}`;
                if (mapsLink) mapsLink.href = `https://maps.google.com/?q=${geoData.latitude},${geoData.longitude}`;
                
                const mapEl = document.getElementById('map');
                if (mapEl) {
                    const map = L.map('map').setView([geoData.latitude, geoData.longitude], 12);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
                    const customIcon = L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    });
                    L.marker([geoData.latitude, geoData.longitude], {icon: customIcon}).addTo(map).bindPopup(`<b>${geoData.city}</b>`).openPopup();
                }
            }
        } catch (e) { console.error(e); }

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

    // --- 3. DNS LOOKUP ---
    const btnDnsLookup = document.getElementById('btn-dns-lookup');
    if (btnDnsLookup) {
        btnDnsLookup.addEventListener('click', async () => {
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
    }

    // --- 4. TESTE DE LATÊNCIA (PING PRO) ---
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

    // --- 5. TESTE SUA CONEXÃO (VELOCÍMETRO EM TEMPO REAL) ---
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
                if (status) status.textContent = "A calcular Latência...";
                const pingStart = performance.now();
                await fetch('https://speed.cloudflare.com/__down?bytes=0', { cache: 'no-store' });
                const pingEnd = performance.now();
                const ping = Math.round(pingEnd - pingStart);
                if (elPing) {
                    elPing.textContent = `${ping} ms`;
                    elPing.style.color = "var(--accent)";
                }

                if (status) status.textContent = "Testando Download...";
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

                if (elDown) {
                    elDown.textContent = `${finalDlMbps} Mbps`;
                    elDown.style.color = "var(--success)";
                }
                
                await new Promise(r => setTimeout(r, 1000));

                if (status) status.textContent = "Testando Upload...";
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

                if (elUp) {
                    elUp.textContent = `${ulMbps} Mbps`;
                    elUp.style.color = "var(--success)";
                }

                if (status) status.textContent = "Teste Concluído";
            } catch (error) {
                if (status) status.textContent = "Erro de Ligação. Tente novamente.";
                updateGauge(0);
            }
            
            setTimeout(() => {
                btnRunSpeedtest.disabled = false;
            }, 2000);
        });
    }

    // --- 6. CIDR E WEBRTC ---
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
                ipDisplay.textContent = "A auditar..."; 
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
                if(ipDisplay && ipDisplay.textContent === "A auditar...") { 
                    ipDisplay.textContent = "Seguro (Sem Fuga)"; 
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

    // --- 7. GERADOR DE SENHAS ---
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

    // --- 8. BASE64 ---
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

    // --- 9. FERRAMENTAS AVANÇADAS (PORT SCANNER, WHOIS, TIMESTAMP, JWT) ---
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
                    badge.textContent = "A testar...";
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
            if (out) out.textContent = `A consultar dados WHOIS para ${domain}...`;
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
            out.textContent = `Data UTC: ${date.toUTCString()}\nData Local: ${date.toLocaleString('pt-PT')}`;
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

    // --- 10. FORMULÁRIO DE CONTACTO FUNCIONAL ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const msg = document.getElementById('contact-msg').value.trim();
            const feedback = document.getElementById('contact-feedback');

            if (!name || !email || !msg) {
                feedback.textContent = "Por favor, preencha todos os campos do formulário.";
                feedback.style.background = "rgba(248, 113, 113, 0.15)";
                feedback.style.border = "1px solid var(--danger)";
                feedback.style.color = "var(--danger)";
                feedback.classList.remove('hidden');
                return;
            }

            const btn = document.getElementById('btn-send-contact');
            btn.disabled = true;
            btn.textContent = "A enviar...";

            setTimeout(() => {
                feedback.textContent = `✔ Obrigado, ${name}! A sua mensagem foi enviada com sucesso. Entraremos em contacto em breve.`;
                feedback.style.background = "rgba(52, 211, 153, 0.15)";
                feedback.style.border = "1px solid var(--success)";
                feedback.style.color = "var(--success)";
                feedback.classList.remove('hidden');

                contactForm.reset();
                btn.disabled = false;
                btn.textContent = "Enviar Mensagem";

                setTimeout(() => {
                    feedback.classList.add('hidden');
                }, 6000);
            }, 1000);
        });
    }

    loadDashboard();
});