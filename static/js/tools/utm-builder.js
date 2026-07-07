document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const platform = configEl.getAttribute('data-param-platform');
    
    // Default mappings for digital platforms
    const platformPresets = {
        'facebook-ads': { source: 'facebook', medium: 'cpc', name: 'Facebook Ads' },
        'google-ads': { source: 'google', medium: 'cpc', name: 'Google Ads' },
        'linkedin-ads': { source: 'linkedin', medium: 'sponsored-post', name: 'LinkedIn Ads' },
        'twitter-ads': { source: 'twitter', medium: 'cpc', name: 'Twitter Ads' },
        'tiktok-ads': { source: 'tiktok', medium: 'cpc', name: 'TikTok Ads' },
        'pinterest-ads': { source: 'pinterest', medium: 'cpc', name: 'Pinterest Ads' }
    };
    
    const activePreset = platformPresets[platform] || { source: 'social', medium: 'social-ads', name: 'Paid Ads' };
    
    // UI Elements
    const badgePlatform = document.getElementById('utm-badge-platform');
    const inputUrl = document.getElementById('utm-url');
    const inputSource = document.getElementById('utm-source');
    const inputMedium = document.getElementById('utm-medium');
    const inputName = document.getElementById('utm-name');
    const inputTerm = document.getElementById('utm-term');
    const inputContent = document.getElementById('utm-content');
    const inputResult = document.getElementById('utm-result');
    const btnCopy = document.getElementById('btn-copy-utm');
    
    // Initialize defaults based on current platform
    badgePlatform.textContent = activePreset.name;
    inputSource.value = activePreset.source;
    inputMedium.value = activePreset.medium;
    
    // Add real-time event listeners
    const inputs = [inputUrl, inputSource, inputMedium, inputName, inputTerm, inputContent];
    inputs.forEach(element => {
        element.addEventListener('input', generateUrl);
    });
    
    function generateUrl() {
        const rawUrl = inputUrl.value.trim();
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
            btnCopy.classList.remove('bg-cyberaccent');
            btnCopy.classList.add('bg-green-600');
            
            setTimeout(() => {
                btnCopy.textContent = originalText;
                btnCopy.classList.add('bg-cyberaccent');
                btnCopy.classList.remove('bg-green-600');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed: ', err);
        });
    });
});
