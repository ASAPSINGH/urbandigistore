document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('utm-platform-select');
    
    // Default mappings for digital platforms
    const platformPresets = {
        'facebook-ads': { source: 'facebook', medium: 'cpc', name: 'Facebook Ads' },
        'google-ads': { source: 'google', medium: 'cpc', name: 'Google Ads' },
        'linkedin-ads': { source: 'linkedin', medium: 'sponsored-post', name: 'LinkedIn Ads' },
        'twitter-ads': { source: 'twitter', medium: 'cpc', name: 'Twitter Ads' },
        'newsletter-email': { source: 'newsletter', medium: 'email', name: 'Newsletter Email' }
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let platform = urlParams.get('platform') || configEl.getAttribute('data-param-platform') || 'facebook-ads';
    if (!platformPresets[platform]) {
        platform = 'facebook-ads';
    }
    
    // Initialize select element value
    if (selectEl) {
        selectEl.value = platform;
    }
    
    let activePreset = platformPresets[platform];
    
    // UI Elements
    const inputUrl = document.getElementById('utm-url');
    const inputSource = document.getElementById('utm-source');
    const inputMedium = document.getElementById('utm-medium');
    const inputName = document.getElementById('utm-name');
    const inputTerm = document.getElementById('utm-term');
    const inputContent = document.getElementById('utm-content');
    const inputResult = document.getElementById('utm-result');
    const btnCopy = document.getElementById('btn-copy-utm');
    
    // Initialize defaults based on current platform
    inputSource.value = activePreset.source;
    inputMedium.value = activePreset.medium;
    inputName.value = 'summer_sale_2026';
    inputUrl.value = 'https://example.com';
    
    // Add real-time event listeners
    const inputs = [inputUrl, inputSource, inputMedium, inputName, inputTerm, inputContent];
    inputs.forEach(element => {
        element.addEventListener('input', generateUrl);
    });
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newPlatform = e.target.value;
            if (platformPresets[newPlatform]) {
                activePreset = platformPresets[newPlatform];
                
                // Update inputs
                inputSource.value = activePreset.source;
                inputMedium.value = activePreset.medium;
                
                // Update URL parameters dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('platform', newPlatform);
                window.history.replaceState(null, '', url.toString());
                
                generateUrl();
            }
        });
    }
    
    // Prepend protocol on blur
    inputUrl.addEventListener('blur', () => {
        let rawUrl = inputUrl.value.trim();
        if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
            inputUrl.value = 'https://' + rawUrl;
            generateUrl();
        }
    });

    function generateUrl() {
        let rawUrl = inputUrl.value.trim();
        const source = inputSource.value.trim();
        const medium = inputMedium.value.trim();
        const name = inputName.value.trim();
        const term = inputTerm.value.trim();
        const content = inputContent.value.trim();
        
        // Return blank if missing required params
        if (!rawUrl || !source || !medium || !name) {
            inputResult.value = '';
            return;
        }
        
        // Prepend https:// if protocol is missing
        if (!/^https?:\/\//i.test(rawUrl)) {
            rawUrl = 'https://' + rawUrl;
        }
        
        try {
            // Basic URL validation & structure checks
            let parsedUrl = new URL(rawUrl);
            
            // Build parameters
            parsedUrl.searchParams.set('utm_source', source);
            parsedUrl.searchParams.set('utm_medium', medium);
            parsedUrl.searchParams.set('utm_campaign', name);
            
            if (term) {
                parsedUrl.searchParams.set('utm_term', term);
            } else {
                parsedUrl.searchParams.delete('utm_term');
            }
            
            if (content) {
                parsedUrl.searchParams.set('utm_content', content);
            } else {
                parsedUrl.searchParams.delete('utm_content');
            }
            
            inputResult.value = parsedUrl.toString();
        } catch (e) {
            // URL parse failed (e.g. invalid prefix)
            inputResult.value = 'Invalid Destination URL';
        }
    }
    
    // Copy link helper
    btnCopy.addEventListener('click', () => {
        const targetText = inputResult.value;
        if (!targetText || targetText.startsWith('Invalid')) {
            alert('Please generate a valid campaign link first.');
            return;
        }
        
        navigator.clipboard.writeText(targetText).then(() => {
            const originalText = btnCopy.textContent;
            btnCopy.textContent = 'Copied!';
            
            setTimeout(() => {
                btnCopy.textContent = originalText;
            }, 2000);
        });
    });
    
    // Initial run
    generateUrl();
});
