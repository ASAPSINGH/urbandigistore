document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const useCase = configEl.getAttribute('data-param-use_case');
    
    // UI Elements
    const badgeUseCase = document.getElementById('json-badge-usecase');
    const txtInput = document.getElementById('json-input');
    const txtOutput = document.getElementById('json-output');
    const selIndent = document.getElementById('json-indent');
    const errorPanel = document.getElementById('json-error-panel');
    const errorMessage = document.getElementById('json-error-message');
    
    const btnFormat = document.getElementById('btn-format-json');
    const btnMinify = document.getElementById('btn-minify-json');
    const btnClear = document.getElementById('btn-clear-json');
    const btnCopy = document.getElementById('btn-copy-json');
    
    // Config titles
    const useCaseNames = {
        'rest-api': 'REST API Payload',
        'config': 'Configuration Files',
        'visualizer': 'Nested Objects Visualizer',
        'prettify': 'Beautification Parser',
        'minify': 'Compact Compression'
    };
    
    badgeUseCase.textContent = useCaseNames[useCase] || 'Standard formatting';
    
    // Demo presets
    const demoPayloads = {
        'rest-api': {
            status: "success",
            code: 200,
            data: {
                user: { id: 481, email: "user@domain.com", role: "administrator" },
                session: { active: true, expires: "2026-12-31T23:59:59Z" }
            }
        },
        'config': {
            app: { name: "Urbandigistore", version: "1.4.0", debug: false },
            database: { driver: "postgres", port: 5432, pool: { min: 2, max: 10 } }
        },
        'visualizer': {
            title: "Nested Demo Structure",
            items: [
                { id: "A", tags: ["dev", "seo"], meta: { score: 9.8 } },
                { id: "B", tags: ["media", "convert"], meta: { score: 8.5 } }
            ]
        }
    };
    
    const defaultDemo = demoPayloads[useCase] || {
        message: "Welcome to the premium client-side JSON formatting engine.",
        features: ["zero server processing", "syntax validation", "instant minification"],
        safe: true
    };
    
    // Prefill demo JSON formatted nicely
    txtInput.value = JSON.stringify(defaultDemo, null, 4);
    
    // Trigger formatting on load
    processJSON('format');
    
    // Event Listeners
    btnFormat.addEventListener('click', () => processJSON('format'));
    btnMinify.addEventListener('click', () => processJSON('minify'));
    btnClear.addEventListener('click', () => {
        txtInput.value = '';
        txtOutput.value = '';
        errorPanel.classList.add('hidden');
    });
    
    btnCopy.addEventListener('click', () => {
        const out = txtOutput.value;
        if (!out) return;
        
        navigator.clipboard.writeText(out).then(() => {
            const orig = btnCopy.textContent;
            btnCopy.textContent = 'Copied!';
            
            setTimeout(() => {
                btnCopy.textContent = orig;
            }, 2000);
        });
    });
    
    function processJSON(mode) {
        const inputStr = txtInput.value.trim();
        if (!inputStr) {
            txtOutput.value = '';
            errorPanel.classList.add('hidden');
            return;
        }
        
        try {
            // Parse input string to validate format
            const parsed = JSON.parse(inputStr);
            errorPanel.classList.add('hidden');
            
            if (mode === 'format') {
                const indentVal = selIndent.value;
                const spacing = indentVal === 'tab' ? '\t' : parseInt(indentVal);
                txtOutput.value = JSON.stringify(parsed, null, spacing);
            } else if (mode === 'minify') {
                txtOutput.value = JSON.stringify(parsed);
            }
        } catch (err) {
            txtOutput.value = '';
            errorMessage.textContent = err.message;
            errorPanel.classList.remove('hidden');
        }
    }
});
