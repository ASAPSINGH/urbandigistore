document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details from config tag or query params
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('cc-platform-select');
    
    // Platform configurations
    const platformLimits = {
        'twitter-post': { limit: 280, name: 'Twitter / X Post' },
        'linkedin-post': { limit: 3000, name: 'LinkedIn Post' },
        'instagram-bio': { limit: 150, name: 'Instagram Bio' },
        'google-title': { limit: 60, name: 'Google Meta Title' },
        'google-description': { limit: 160, name: 'Google Meta Description' }
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let platform = urlParams.get('platform') || configEl.getAttribute('data-param-platform') || 'twitter-post';
    if (!platformLimits[platform]) {
        platform = 'twitter-post';
    }
    
    // Initialize select element value
    if (selectEl) {
        selectEl.value = platform;
    }
    
    let activePlatform = platformLimits[platform];
    
    // UI Elements
    const cntChars = document.getElementById('cnt-chars');
    const cntWords = document.getElementById('cnt-words');
    const cntSentences = document.getElementById('cnt-sentences');
    const cntParagraphs = document.getElementById('cnt-paragraphs');
    
    const meterText = document.getElementById('meter-text');
    const meterBar = document.getElementById('meter-bar');
    const txtInput = document.getElementById('cc-input');
    
    const btnClear = document.getElementById('btn-clear-cc');
    const btnCopy = document.getElementById('btn-copy-cc');
    
    // Pre-fill demo copy
    const demoTexts = {
        'twitter-post': "Building a high-performance programmatic SEO platform today! 🚀 Client-side execution makes it extremely fast and cost-effective. Check it out at Urbandigistore.",
        'linkedin-post': "We are pivoting our programmatic SEO model today. The 2026 Google Spam Update targets thin, low-information pages. By consolidating parameters into dynamic hubs and providing deep industry context, we ensure long-term indexing growth.",
        'instagram-bio': "Modern web utilities built for developers, marketers, and active traders. 100% secure in-browser sandboxed processing. 🌐💻📉",
        'google-title': "Free Web Utilities & pSEO Online Tools Dashboard",
        'google-description': "Convert images instantly, format JSON objects, build campaign tracking UTM parameters, and manage trade sizes directly in your browser. 100% private."
    };
    
    txtInput.value = demoTexts[platform] || "Type or paste your content here to begin analyzing character thresholds.";
    
    // Event listeners and debouncing
    let analysisTimeout;
    let hasTrackedInput = false;
    
    txtInput.addEventListener('input', () => {
        clearTimeout(analysisTimeout);
        analysisTimeout = setTimeout(runAnalysis, 50);
        
        if (!hasTrackedInput && txtInput.value.trim().length > 0) {
            hasTrackedInput = true;
            if (typeof gtag === 'function') {
                gtag('event', 'use_tool', { 'tool_name': 'character-counter', 'action': 'input_text' });
            }
        }
    });
    
    btnClear.addEventListener('click', () => {
        txtInput.value = '';
        runAnalysis();
        if (typeof gtag === 'function') {
            gtag('event', 'use_tool', { 'tool_name': 'character-counter', 'action': 'clear_text' });
        }
    });
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newPlatform = e.target.value;
            if (platformLimits[newPlatform]) {
                activePlatform = platformLimits[newPlatform];
                
                // Update URL parameters dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('platform', newPlatform);
                window.history.replaceState(null, '', url.toString());
                
                // Pre-fill new demo text if textarea is empty or holds another demo text
                const currentText = txtInput.value.strip ? txtInput.value.trim() : txtInput.value;
                const isPreviousDemo = Object.values(demoTexts).some(d => d === currentText) || currentText === "" || currentText.startsWith("Type or paste your content");
                
                if (isPreviousDemo) {
                    txtInput.value = demoTexts[newPlatform];
                }
                
                runAnalysis();
                
                if (typeof gtag === 'function') {
                    gtag('event', 'use_tool', { 'tool_name': 'character-counter', 'action': 'select_platform', 'platform': newPlatform });
                }
            }
        });
    }
    
    btnCopy.addEventListener('click', () => {
        const text = txtInput.value;
        if (!text) return;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnCopy.textContent;
            btnCopy.textContent = 'Copied!';
            
            setTimeout(() => {
                btnCopy.textContent = originalText;
            }, 2000);
            
            if (typeof gtag === 'function') {
                gtag('event', 'use_tool', { 'tool_name': 'character-counter', 'action': 'copy_text', 'char_count': text.length });
            }
        });
    });
    
    function runAnalysis() {
        const text = txtInput.value;
        const totalChars = text.length;
        
        // Word counter
        const wordsArray = text.trim().split(/\s+/).filter(word => word.length > 0);
        const totalWords = wordsArray.length;
        
        // Sentence counter
        const sentencesArray = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const totalSentences = sentencesArray.length;
        
        // Paragraph counter
        const paragraphsArray = text.split(/\n+/).filter(p => p.trim().length > 0);
        const totalParagraphs = paragraphsArray.length;
        
        // Update display text
        cntChars.textContent = totalChars;
        cntWords.textContent = totalWords;
        cntSentences.textContent = totalSentences;
        cntParagraphs.textContent = totalParagraphs;
        
        // Progress bar calculations
        const limit = activePlatform.limit;
        const pct = Math.min((totalChars / limit) * 100, 100);
        
        meterText.textContent = `${totalChars} / ${limit} Characters`;
        meterBar.style.width = `${pct}%`;
        
        if (totalChars > limit) {
            // Overlimit styling
            meterBar.classList.remove('bg-cyberaccent');
            meterBar.classList.add('bg-red-500');
            meterText.classList.add('text-red-400');
        } else {
            // Under limit styling
            meterBar.classList.add('bg-cyberaccent');
            meterBar.classList.remove('bg-red-500');
            meterText.classList.remove('text-red-400');
        }
    }
    
    // Initial run
    runAnalysis();
});
