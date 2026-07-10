document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('b64-type-select');
    
    // UI Elements
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
    
    // Default demo strings
    const defaultDemos = {
        'pdf-document': 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA2Ngo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZApzZXFlbnRpYWwtYmFzZTY0LWRlY29kZWQtcG9ydGFibGUtZG9jdW1lbnQtZm9ybWF0LVQ1IFRmCihIZWxsbyBmcm9tIFVyYmFuZGlnaXN0b3JlISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAxNyAwMDAwMCBuCjAwMDAwMDAwNzAgMDAwMDAgbgowMDAwMDAwMTIwIDAwMDAwIG4KMDAwMDAwMDIxMiAwMDAwMCBuCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzI5CiUlRU9G',
        'png-image': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'jpeg-image': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
        'plain-text': 'data:text/plain;base64,V2VsY29tZSB0byBvdXIgc2VjdXJlIGxvY2FsIGRlY29kZXIu'
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let fileType = urlParams.get('file_type') || configEl.getAttribute('data-param-file_type') || 'pdf-document';
    if (!defaultDemos[fileType]) {
        fileType = 'pdf-document';
    }
    
    if (selectEl) {
        selectEl.value = fileType;
    }
    
    // Prefill demo strings or simple fallback
    txtInput.value = defaultDemos[fileType];
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newFileType = e.target.value;
            if (defaultDemos[newFileType]) {
                fileType = newFileType;
                
                // Update URL parameters dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('file_type', fileType);
                window.history.replaceState(null, '', url.toString());
                
                // Set demo string
                const currentText = txtInput.value.trim();
                const isPreviousDemo = Object.values(defaultDemos).some(d => d === currentText) || currentText === "" || currentText.startsWith("data:");
                
                if (isPreviousDemo) {
                    txtInput.value = defaultDemos[fileType];
                }
                
                analyzeBase64();
            }
        });
    }
    
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
