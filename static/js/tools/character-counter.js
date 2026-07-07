document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const platform = configEl.getAttribute('data-param-platform');
    
    // Platform configurations
    const platformLimits = {
        'twitter-post': { limit: 280, name: 'Twitter / X Post' },
        'linkedin-post': { limit: 3000, name: 'LinkedIn Post' },
        'instagram-bio': { limit: 150, name: 'Instagram Bio' },
        'google-title': { limit: 60, name: 'Google Meta Title' },
        'google-description': { limit: 160, name: 'Google Meta Description' }
    };
    
    const activePlatform = platformLimits[platform] || { limit: 500, name: 'Custom Platform' };
    
    // UI Elements
    const badgePlatform = document.getElementById('cc-badge-platform');
    const cntChars = document.getElementById('cnt-chars');
    const cntWords = document.getElementById('cnt-words');
    const cntSentences = document.getElementById('cnt-sentences');
    const cntParagraphs = document.getElementById('cnt-paragraphs');
    
    const meterText = document.getElementById('meter-text');
    const meterBar = document.getElementById('meter-bar');
    const txtInput = document.getElementById('cc-input');
    
    const btnClear = document.getElementById('btn-clear-cc');
    const btnCopy = document.getElementById('btn-copy-cc');
    
    // Init display
    badgePlatform.textContent = activePlatform.name;
    
    // Pre-fill demo copy
    const demoTexts = {
        'twitter-post': "Building a high-performance programmatic SEO platform today! 🚀 Client-side execution makes it extremely fast and cost-effective. Check it out at WebUtilities.",
        'google-title': "Free Web Utilities & pSEO Online Tools Matrix",
        'google-description': "Convert images instantly, format JSON objects, build campaign tracking UTM parameters, and manage trade sizes directly in your browser. 100% private."
    };
    
    txtInput.value = demoTexts[platform] || "Type or paste your content here to begin analyzing character thresholds.";
    
    // Event listeners
    txtInput.addEventListener('input', runAnalysis);
    btnClear.addEventListener('click', () => {
        txtInput.value = '';
        runAnalysis();
    });
    
    btnCopy.addEventListener('click', () => {
        const text = txtInput.value;
        if (!text) return;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnCopy.textContent;
            btnCopy.textContent = 'Copied!';
            btnCopy.classList.remove('bg-cyberaccent');
            btnCopy.classList.add('bg-green-600');
            
            setTimeout(() => {
                btnCopy.textContent = originalText;
                btnCopy.classList.add('bg-cyberaccent');
                btnCopy.classList.remove('bg-green-600');
            }, 2000);
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
