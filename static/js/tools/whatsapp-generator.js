document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const countrySelect = document.getElementById('wa-country-select');
    const selectPrefix = document.getElementById('wa-prefix');
    
    // Country to dial prefix mappings
    const countryPrefixes = {
        'india': { code: '91', name: 'India' },
        'united-states': { code: '1', name: 'United States' },
        'united-kingdom': { code: '44', name: 'United Kingdom' },
        'australia': { code: '61', name: 'Australia' },
        'germany': { code: '49', name: 'Germany' }
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let country = urlParams.get('country') || configEl.getAttribute('data-param-country') || 'united-states';
    // Legacy maps
    if (country === 'usa') country = 'united-states';
    if (country === 'uk') country = 'united-kingdom';
    
    if (!countryPrefixes[country]) {
        country = 'united-states';
    }
    
    // Initialize presets
    if (countrySelect) countrySelect.value = country;
    selectPrefix.value = countryPrefixes[country].code;
    
    // UI Elements
    const inputPhone = document.getElementById('wa-phone');
    const txtMessage = document.getElementById('wa-message');
    const inputResult = document.getElementById('wa-result');
    const btnCopy = document.getElementById('btn-copy-wa');
    const btnTest = document.getElementById('btn-test-wa');
    const btnQR = document.getElementById('btn-qr-wa');
    
    // QR Code inline preview elements
    const qrContainer = document.getElementById('wa-qr-container');
    const qrImage = document.getElementById('wa-qr-image');
    const qrDownload = document.getElementById('wa-qr-download');
    
    // Listeners
    if (countrySelect) {
        countrySelect.addEventListener('change', (e) => {
            const newCountry = e.target.value;
            if (countryPrefixes[newCountry]) {
                country = newCountry;
                selectPrefix.value = countryPrefixes[country].code;
                
                // Update URL parameter dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('country', country);
                window.history.replaceState(null, '', url.toString());
                
                generateWALink();
            }
        });
    }
    
    // If the prefix changes manually, match the country select if possible
    selectPrefix.addEventListener('change', () => {
        const currentCode = selectPrefix.value;
        const matched = Object.keys(countryPrefixes).find(k => countryPrefixes[k].code === currentCode);
        if (matched && countrySelect) {
            countrySelect.value = matched;
            country = matched;
            
            // Update URL
            const url = new URL(window.location.href);
            url.searchParams.set('country', country);
            window.history.replaceState(null, '', url.toString());
        }
    });
    
    // Listeners
    [selectPrefix, inputPhone, txtMessage].forEach(el => {
        el.addEventListener('input', generateWALink);
    });

    let hasTrackedInput = false;
    inputPhone.addEventListener('input', () => {
        if (!hasTrackedInput && inputPhone.value.trim().length > 0) {
            hasTrackedInput = true;
            if (typeof gtag === 'function') {
                gtag('event', 'use_tool', { 'tool_name': 'whatsapp-generator', 'action': 'input_phone' });
            }
        }
    });
    
    function generateWALink() {
        const prefix = selectPrefix.value;
        let phone = inputPhone.value.replace(/\D/g, ''); // strip non-numeric characters
        
        // Remove leading zeroes if user typed them
        if (phone.startsWith('0')) {
            phone = phone.substring(1);
        }
        
        const message = txtMessage.value.trim();
        
        if (!phone) {
            inputResult.value = '';
            btnTest.setAttribute('disabled', 'true');
            btnQR.classList.add('hidden');
            qrContainer.classList.add('hidden');
            return;
        }
        
        // Build raw phone target
        const fullPhone = prefix + phone;
        let waUrl = `https://wa.me/${fullPhone}`;
        
        if (message) {
            waUrl += `?text=${encodeURIComponent(message)}`;
        }
        
        inputResult.value = waUrl;
        btnTest.removeAttribute('disabled');
        btnQR.classList.remove('hidden');
    }
    
    // QR Code Button Click
    btnQR.addEventListener('click', () => {
        const waUrl = inputResult.value;
        if (!waUrl) return;
        
        const qrSize = 300;
        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(waUrl)}`;
        
        // Set image source and reveal container
        qrImage.src = qrApi;
        qrDownload.href = qrApi;
        qrContainer.classList.remove('hidden');
        
        if (typeof gtag === 'function') {
            gtag('event', 'use_tool', { 'tool_name': 'whatsapp-generator', 'action': 'generate_qr' });
        }
    });
    
    // Copy Action
    btnCopy.addEventListener('click', () => {
        const target = inputResult.value;
        if (!target) return;
        
        navigator.clipboard.writeText(target).then(() => {
            const originalText = btnCopy.textContent;
            btnCopy.textContent = 'Copied!';
            btnCopy.classList.remove('bg-cyberaccent');
            btnCopy.classList.add('bg-green-600');
            
            setTimeout(() => {
                btnCopy.textContent = originalText;
                btnCopy.classList.add('bg-cyberaccent');
                btnCopy.classList.remove('bg-green-600');
            }, 2000);
            
            if (typeof gtag === 'function') {
                gtag('event', 'use_tool', { 'tool_name': 'whatsapp-generator', 'action': 'copy_link' });
            }
        });
    });
    
    // Test Action
    btnTest.addEventListener('click', () => {
        const target = inputResult.value;
        if (target) {
            window.open(target, '_blank');
            if (typeof gtag === 'function') {
                gtag('event', 'use_tool', { 'tool_name': 'whatsapp-generator', 'action': 'test_chat' });
            }
        }
    });
});
