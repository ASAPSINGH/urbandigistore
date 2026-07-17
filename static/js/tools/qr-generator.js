document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const tabButtons = document.querySelectorAll('.qr-tab-btn');
    const inputPanels = document.querySelectorAll('.qr-input-panel');
    const qrcodeContainer = document.getElementById('qrcode-container');
    const modeLabel = document.getElementById('qr-mode-label');

    // Input elements
    const inputUrl = document.getElementById('qr-input-url');
    const inputText = document.getElementById('qr-input-text');
    const wifiSsid = document.getElementById('qr-wifi-ssid');
    const wifiSec = document.getElementById('qr-wifi-sec');
    const wifiPass = document.getElementById('qr-wifi-pass');
    const wifiPassContainer = document.getElementById('qr-wifi-pass-container');
    const emailTo = document.getElementById('qr-email-to');
    const emailSub = document.getElementById('qr-email-sub');
    const emailBody = document.getElementById('qr-email-body');

    // Style elements
    const colorFg = document.getElementById('qr-color-fg');
    const colorFgHex = document.getElementById('qr-color-fg-hex');
    const colorBg = document.getElementById('qr-color-bg');
    const colorBgHex = document.getElementById('qr-color-bg-hex');
    const errorLevel = document.getElementById('qr-error-level');
    const pixelSizeSelect = document.getElementById('qr-pixel-size');

    // Buttons
    const btnDownloadPng = document.getElementById('btn-download-qr-png');
    const btnDownloadSvg = document.getElementById('btn-download-qr-svg');

    let currentType = 'url';
    let canvasElement = null;

    // Synchronize color picker with hex inputs
    colorFg.addEventListener('input', (e) => {
        colorFgHex.value = e.target.value;
        generateQR();
    });
    colorFgHex.addEventListener('change', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorFg.value = e.target.value;
            generateQR();
        }
    });
    colorBg.addEventListener('input', (e) => {
        colorBgHex.value = e.target.value;
        generateQR();
    });
    colorBgHex.addEventListener('change', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorBg.value = e.target.value;
            generateQR();
        }
    });

    // WiFi security change toggles password field visibility
    wifiSec.addEventListener('change', (e) => {
        if (e.target.value === 'nopass') {
            wifiPassContainer.classList.add('hidden');
        } else {
            wifiPassContainer.classList.remove('hidden');
        }
        generateQR();
    });

    // Event listeners for inputs to regenerate live
    const inputs = [
        inputUrl, inputText, wifiSsid, wifiPass, wifiSec, 
        emailTo, emailSub, emailBody, errorLevel, pixelSizeSelect
    ];
    inputs.forEach(el => {
        if (el) el.addEventListener('input', generateQR);
        if (el) el.addEventListener('change', generateQR);
    });

    // Tab buttons click to switch modes
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active', 'text-white', 'bg-cyberaccent/10', 'border-cyberaccent/20'));
            tabButtons.forEach(b => b.classList.add('text-gray-400', 'border-white/5'));
            
            btn.classList.add('active', 'text-white', 'bg-cyberaccent/10', 'border-cyberaccent/20');
            btn.classList.remove('text-gray-400', 'border-white/5');

            currentType = btn.getAttribute('data-qr-type');
            modeLabel.textContent = currentType.toUpperCase();

            inputPanels.forEach(p => p.classList.add('hidden'));
            document.getElementById(`qr-input-${currentType}-panel`).classList.remove('hidden');

            generateQR();
        });
    });

    // Main QR Generator Logic
    function generateQR() {
        try {
            if (typeof qrcode === 'undefined') {
                qrcodeContainer.innerHTML = '<span class="text-xs text-red-400">Loading library...</span>';
                return;
            }

            const dataString = getQRDataString();
            if (!dataString) {
                qrcodeContainer.innerHTML = '<span class="text-xs text-gray-500">Provide input details</span>';
                return;
            }

            const ec = errorLevel.value; // L, M, Q, H
            
            // Generate QR matrix using qrcode-generator
            // 0 auto-detects size (typeNumber)
            const qr = qrcode(0, ec);
            qr.addData(dataString);
            qr.make();

            // Render onto canvas
            const modules = qr.getModuleCount();
            const pxSize = parseInt(pixelSizeSelect.value, 10);
            
            const canvas = document.createElement('canvas');
            canvas.width = pxSize;
            canvas.height = pxSize;
            const ctx = canvas.getContext('2d');
            
            const fg = colorFg.value;
            const bg = colorBg.value;

            // Background
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, pxSize, pxSize);

            // Cells
            ctx.fillStyle = fg;
            const cellSize = pxSize / modules;

            for (let r = 0; r < modules; r++) {
                for (let c = 0; c < modules; c++) {
                    if (qr.isDark(r, c)) {
                        // Math.round and Math.ceil to prevent grid spacing/anti-aliasing gap lines
                        ctx.fillRect(
                            Math.round(c * cellSize), 
                            Math.round(r * cellSize), 
                            Math.ceil(cellSize), 
                            Math.ceil(cellSize)
                        );
                    }
                }
            }

            // Display in container (scale preview down to fit layout)
            qrcodeContainer.innerHTML = '';
            canvas.className = 'w-full h-full object-contain';
            qrcodeContainer.appendChild(canvas);
            canvasElement = canvas;

        } catch (err) {
            console.error("QR Code Generation Error:", err);
            qrcodeContainer.innerHTML = `<span class="text-[10px] text-red-400 text-center font-mono p-2">${err.message || 'Error generating QR'}</span>`;
        }
    }

    function getQRDataString() {
        switch (currentType) {
            case 'url':
                return inputUrl.value.trim();
            case 'text':
                return inputText.value;
            case 'wifi':
                const ssid = wifiSsid.value.trim();
                const type = wifiSec.value;
                const pass = wifiPass.value.trim();
                if (!ssid) return '';
                // Format: WIFI:S:SSID;T:WEP;P:PASSWORD;;
                if (type === 'nopass') {
                    return `WIFI:T:nopass;S:${escapeWifiString(ssid)};H:false;;`;
                }
                return `WIFI:T:${type};S:${escapeWifiString(ssid)};P:${escapeWifiString(pass)};H:false;;`;
            case 'email':
                const to = emailTo.value.trim();
                const sub = emailSub.value.trim();
                const body = emailBody.value.trim();
                if (!to) return '';
                // Format: mailto:test@email.com?subject=test&body=test
                return `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
            default:
                return '';
        }
    }

    function escapeWifiString(val) {
        // Escapes special characters for WIFI QR spec
        return val.replace(/\\/g, '\\\\')
                  .replace(/;/g, '\\;')
                  .replace(/:/g, '\\:')
                  .replace(/,/g, '\\,')
                  .replace(/"/g, '\\"');
    }

    // Download PNG Action
    btnDownloadPng.addEventListener('click', () => {
        if (!canvasElement) return;
        const dataUrl = canvasElement.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `qrcode_${currentType}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Download SVG Action
    btnDownloadSvg.addEventListener('click', () => {
        try {
            const dataString = getQRDataString();
            if (!dataString) return;

            const ec = errorLevel.value;
            const qr = qrcode(0, ec);
            qr.addData(dataString);
            qr.make();

            const modules = qr.getModuleCount();
            const pxSize = parseInt(pixelSizeSelect.value, 10);
            const fg = colorFg.value;
            const bg = colorBg.value;

            // Generate clean standalone SVG content path
            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${modules} ${modules}" width="${pxSize}" height="${pxSize}">`;
            svgContent += `<rect width="${modules}" height="${modules}" fill="${bg}"/>`;
            svgContent += `<path d="`;

            for (let r = 0; r < modules; r++) {
                for (let c = 0; c < modules; c++) {
                    if (qr.isDark(r, c)) {
                        svgContent += `M${c},${r}h1v1h-1z `;
                    }
                }
            }

            svgContent += `" fill="${fg}"/>`;
            svgContent += `</svg>`;

            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qrcode_${currentType}_${Date.now()}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 100);

        } catch (err) {
            console.error("SVG export error:", err);
            alert("Could not export SVG.");
        }
    });

    // Initial QR Code trigger
    setTimeout(generateQR, 500); // Small timeout to ensure libraries are loaded
});
