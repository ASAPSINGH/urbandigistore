document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('json-use-case-select');
    
    // UI Elements
    const txtInput = document.getElementById('json-input');
    const txtOutput = document.getElementById('json-output');
    const selIndent = document.getElementById('json-indent');
    const errorPanel = document.getElementById('json-error-panel');
    const errorMessage = document.getElementById('json-error-message');
    
    const btnFormat = document.getElementById('btn-format-json');
    const btnMinify = document.getElementById('btn-minify-json');
    const btnClear = document.getElementById('btn-clear-json');
    const btnCopy = document.getElementById('btn-copy-json');
    
    // Mock API Elements
    const btnMock = document.getElementById('btn-mock-json');
    const mockOutputContainer = document.getElementById('mock-output-container');
    const mockUrlOutput = document.getElementById('mock-url-output');
    const btnCopyMockUrl = document.getElementById('btn-copy-mock-url');
    const mockStatusMessage = document.getElementById('mock-status-message');
    
    // Config presets
    const useCaseDefaults = {
        'rest-api': {
            status: "success",
            code: 200,
            data: {
                user: { id: 481, email: "user@domain.com", role: "administrator" },
                session: { active: true, expires: "2026-12-31T23:59:59Z" }
            }
        },
        'config-files': {
            app: { name: "Urbandigistore", version: "1.4.0", debug: false },
            database: { driver: "postgres", port: 5432, pool: { min: 2, max: 10 } }
        },
        'nested-objects': {
            title: "Nested Demo Structure",
            items: [
                { id: "A", tags: ["dev", "seo"], meta: { score: 9.8 } },
                { id: "B", tags: ["media", "convert"], meta: { score: 8.5 } }
            ]
        }
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let useCase = urlParams.get('use_case') || configEl.getAttribute('data-param-use_case') || 'rest-api';
    // Mapping legacy use cases if they exist
    if (useCase === 'config') useCase = 'config-files';
    if (useCase === 'visualizer') useCase = 'nested-objects';
    if (useCase === 'prettify' || useCase === 'minify') useCase = 'rest-api';
    
    if (!useCaseDefaults[useCase]) {
        useCase = 'rest-api';
    }
    
    // Initialize select element value
    if (selectEl) {
        selectEl.value = useCase;
    }
    
    // Prefill demo JSON formatted nicely
    const defaultDemo = useCaseDefaults[useCase];
    txtInput.value = JSON.stringify(defaultDemo, null, 4);
    
    // Trigger formatting on load
    processJSON('format');
    
    // Event Listeners
    btnFormat.addEventListener('click', () => processJSON('format'));
    btnMinify.addEventListener('click', () => processJSON('minify'));
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newUseCase = e.target.value;
            if (useCaseDefaults[newUseCase]) {
                useCase = newUseCase;
                
                // Set preset JSON if input is currently holding another preset
                const currentText = txtInput.value.trim();
                const isPreviousPreset = Object.values(useCaseDefaults).some(d => JSON.stringify(d, null, 4) === currentText || JSON.stringify(d) === currentText);
                
                if (isPreviousPreset || currentText === "") {
                    txtInput.value = JSON.stringify(useCaseDefaults[useCase], null, 4);
                }
                
                // Update URL parameters dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('use_case', useCase);
                window.history.replaceState(null, '', url.toString());
                
                // Hide mock elements on change
                if (mockOutputContainer) mockOutputContainer.classList.add('hidden');
                if (mockStatusMessage) mockStatusMessage.classList.add('hidden');
                
                processJSON('format');
            }
        });
    }
    
    btnClear.addEventListener('click', () => {
        txtInput.value = '';
        txtOutput.value = '';
        errorPanel.classList.add('hidden');
        if (mockOutputContainer) mockOutputContainer.classList.add('hidden');
        if (mockStatusMessage) mockStatusMessage.classList.add('hidden');
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
    
    // Mock API generation handler
    if (btnMock) {
        btnMock.addEventListener('click', () => {
            const rawInput = txtInput.value.trim();
            if (!rawInput) {
                alert('Please enter a valid JSON payload first.');
                return;
            }
            
            let parsedPayload;
            try {
                parsedPayload = JSON.parse(rawInput);
            } catch (err) {
                alert('Invalid JSON: ' + err.message);
                return;
            }
            
            // Post payload to mock endpoint creator
            fetch('/api/mock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(parsedPayload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    mockOutputContainer.classList.remove('hidden');
                    mockUrlOutput.value = data.mock_url;
                    mockStatusMessage.textContent = "🟢 Mock API Endpoint successfully generated! It is now live.";
                    mockStatusMessage.classList.remove('hidden');
                } else {
                    alert('Error creating Mock: ' + data.message);
                }
            })
            .catch(err => {
                alert('Network error connecting to API Mock hub: ' + err);
            });
        });
    }
    
    if (btnCopyMockUrl) {
        btnCopyMockUrl.addEventListener('click', () => {
            const url = mockUrlOutput.value;
            if (!url) return;
            
            navigator.clipboard.writeText(url).then(() => {
                const orig = btnCopyMockUrl.textContent;
                btnCopyMockUrl.textContent = 'Copied!';
                setTimeout(() => {
                    btnCopyMockUrl.textContent = orig;
                }, 2000);
            });
        });
    }
    
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
