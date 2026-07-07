document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const fileType = configEl.getAttribute('data-param-file_type');
    
    // UI Elements
    const badgeType = document.getElementById('b64-badge-type');
    const txtInput = document.getElementById('b64-input');
    const btnClear = document.getElementById('btn-clear-b64');
    const btnDecode = document.getElementById('btn-decode-b64');
    
    const metaPanel = document.getElementById('b64-meta-panel');
    const metaMime = document.getElementById('meta-b64-mime');
    const metaSize = document.getElementById('meta-b64-size');
    const metaExt = document.getElementById('meta-b64-ext');
    
    const errorPanel = document.getElementById('b64-error-panel');
    const errorMessage = document.getElementById('b64-error-message');
    
    const previewContainer = document.getElementById('b64-preview-container');
    const previewImg = document.getElementById('b64-preview-img');
    
    // Configure default badge
    badgeType.textContent = fileType.toUpperCase();
    
    // Demo base64 presets matching the target formats
    const demoStrings = {
        'png': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'svg': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzUiIGZpbGw9IiMwNmI2ZDQiLz48L3N2Zz4=',
        'json': 'data:application/json;base64,ewogICAgInN0YXR1cyI6ICJkZWNvZGVkIiwKICAgICJzYWZlIjogdHJ1ZSwKICAgICJsb2NhbCI6IHRydWUKfQ=='
    };
    
    // Prefill demo strings or simple fallback
    txtInput.value = demoStrings[fileType] || 'data:text/plain;base64,V2VsY29tZSB0byBvdXIgc2VjdXJlIGxvY2FsIGRlY29kZXIu';
    
    // Listeners
    txtInput.addEventListener('input', analyzeBase64);
    btnClear.addEventListener('click', () => {
        txtInput.value = '';
        analyzeBase64();
    });
    
    btnDecode.addEventListener('click', decodeAndDownload);
    
    let activeMime = '';
    let activeExt = '';
    let activePayload = '';
    
    function analyzeBase64() {
        let inputStr = txtInput.value.trim();
        
        if (!inputStr) {
            metaPanel.classList.add('hidden');
            previewContainer.classList.add('hidden');
            errorPanel.classList.add('hidden');
            btnDecode.setAttribute('disabled', 'true');
            return;
        }
        
        try {
            let mime = '';
            let payload = inputStr;
            
            // Check for MIME header prefix (e.g. data:image/png;base64,)
            if (inputStr.startsWith('data:')) {
                const headerEnd = inputStr.indexOf(';base64,');
                if (headerEnd !== -1) {
                    mime = inputStr.substring(5, headerEnd);
                    payload = inputStr.substring(headerEnd + 8);
                }
            }
            
            // Remove all white spaces and newlines from payload
            payload = payload.replace(/\s/g, '');
            
            // Validate base64 structure regex
            const b64Regex = /^[a-zA-Z0-9+/]*={0,2}$/;
            if (!b64Regex.test(payload) || payload.length % 4 !== 0) {
                throw new Error("Invalid character sequence or bad padding configuration.");
            }
            
            // Deduce mime type if missing
            if (!mime) {
                const firstChar = payload.charAt(0);
                const firstTwo = payload.substring(0, 2);
                
                if (firstChar === 'i') mime = 'image/png';
                else if (firstChar === '/') mime = 'image/jpeg';
                else if (firstChar === 'R') mime = 'image/gif';
                else if (firstChar === 'J') mime = 'application/pdf';
                else if (firstChar === 'e' || firstChar === 'f') mime = 'application/json';
                else if (firstTwo === 'PH') mime = 'image/svg+xml';
                else mime = 'application/octet-stream';
            }
            
            // Resolve file extension
            const mimeToExt = {
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/gif': 'gif',
                'image/svg+xml': 'svg',
                'application/pdf': 'pdf',
                'application/json': 'json',
                'text/plain': 'txt',
                'text/html': 'html'
            };
            
            activeMime = mime;
            activeExt = mimeToExt[mime] || fileType || 'bin';
            activePayload = payload;
            
            // Calculate size
            const sizeBytes = Math.floor(payload.length * 0.75);
            
            // Update metadata panel
            metaMime.textContent = mime;
            metaSize.textContent = formatBytes(sizeBytes);
            metaExt.textContent = activeExt.toUpperCase();
            
            metaPanel.classList.remove('hidden');
            errorPanel.classList.add('hidden');
            btnDecode.removeAttribute('disabled');
            
            // Handle image preview
            if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(activeExt)) {
                previewImg.src = `data:${mime};base64,${payload}`;
                previewContainer.classList.remove('hidden');
            } else {
                previewContainer.classList.add('hidden');
            }
            
        } catch (err) {
            metaPanel.classList.add('hidden');
            previewContainer.classList.add('hidden');
            btnDecode.setAttribute('disabled', 'true');
            
            errorMessage.textContent = err.message || "Malformed base64 character blocks.";
            errorPanel.classList.remove('hidden');
        }
    }
    
    function decodeAndDownload() {
        if (!activePayload) return;
        
        try {
            // Convert base64 characters back into binary strings
            const binaryString = atob(activePayload);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Create Blob and trigger browser download
            const blob = new Blob([bytes], { type: activeMime });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `decoded_file.${activeExt}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Failed to decode binary structure: ' + e.message);
        }
    }
    
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Initial run
    analyzeBase64();
});
