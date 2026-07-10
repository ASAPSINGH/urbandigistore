document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const inputSelect = document.getElementById('ic-input-select');
    const outputSelect = document.getElementById('ic-output-select');
    
    // Type mapping helpers
    const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'webp': 'image/webp',
        'gif': 'image/gif'
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let inputFormat = urlParams.get('input_format') || configEl.getAttribute('data-param-input_format') || 'png';
    let outputFormat = urlParams.get('output_format') || configEl.getAttribute('data-param-output_format') || 'webp';
    
    // Set drop-downs
    if (inputSelect) inputSelect.value = inputFormat;
    if (outputSelect) outputSelect.value = outputFormat;
    
    let inputMime = mimeTypes[inputFormat] || 'image/*';
    let outputMime = mimeTypes[outputFormat] || 'image/png';
    
    // UI Elements
    const labelInputFmt = document.getElementById('label-input-fmt');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('image-input');
    const fileInfo = document.getElementById('file-info');
    const infoName = document.getElementById('info-name');
    const infoSize = document.getElementById('info-size');
    const btnRemove = document.getElementById('btn-remove-file');
    const btnConvert = document.getElementById('btn-convert');
    const alertSuccess = document.getElementById('alert-success');
    
    // Set text labels based on parameters
    if (labelInputFmt) labelInputFmt.textContent = `.${inputFormat.toLowerCase()}`;
    fileInput.setAttribute('accept', inputMime);
    
    let activeFile = null;
    
    // Change handlers
    const updateFormats = () => {
        inputFormat = inputSelect.value;
        outputFormat = outputSelect.value;
        inputMime = mimeTypes[inputFormat] || 'image/*';
        outputMime = mimeTypes[outputFormat] || 'image/png';
        
        if (labelInputFmt) labelInputFmt.textContent = `.${inputFormat.toLowerCase()}`;
        fileInput.setAttribute('accept', inputMime);
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('input_format', inputFormat);
        url.searchParams.set('output_format', outputFormat);
        window.history.replaceState(null, '', url.toString());
        
        // Remove current files if type changes
        activeFile = null;
        fileInfo.classList.add('hidden');
        dropZone.classList.remove('hidden');
        alertSuccess.classList.add('hidden');
    };
    
    if (inputSelect) inputSelect.addEventListener('change', updateFormats);
    if (outputSelect) outputSelect.addEventListener('change', updateFormats);
    
    // Drag & Drop event listeners
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('border-cyberneon/60', 'bg-cyberneon/5');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('border-cyberneon/60', 'bg-cyberneon/5');
        }, false);
    });
    
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    function handleFileSelect(file) {
        // Validate file extension / mime type
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        // Skip validation check if input format is generic, otherwise verify match
        if (inputFormat !== 'image' && fileExt !== inputFormat && file.type !== inputMime) {
            alert(`Error: Please select a valid .${inputFormat} image file.`);
            return;
        }
        
        activeFile = file;
        
        // Show file info details
        infoName.textContent = file.name;
        infoSize.textContent = formatBytes(file.size);
        
        fileInfo.classList.remove('hidden');
        dropZone.classList.add('hidden');
        btnConvert.removeAttribute('disabled');
        alertSuccess.classList.add('hidden');
    }
    
    btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        activeFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        dropZone.classList.remove('hidden');
        btnConvert.setAttribute('disabled', 'true');
        alertSuccess.classList.add('hidden');
    });
    
    btnConvert.addEventListener('click', () => {
        if (!activeFile) return;
        
        btnConvert.setAttribute('disabled', 'true');
        btnConvert.textContent = 'Processing...';
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Setup canvas matching image dimensions
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                
                // Draw image on canvas (handling transparency if output is JPEG)
                if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                
                // Convert to Blob and trigger download
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        // Replace original extension with output extension
                        const originalName = activeFile.name.substring(0, activeFile.name.lastIndexOf('.'));
                        a.download = `${originalName}.${outputFormat}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        // Show success alerts
                        alertSuccess.classList.remove('hidden');
                    } else {
                        alert('Error processing image. Conversion failed.');
                    }
                    
                    // Reset Button State
                    btnConvert.removeAttribute('disabled');
                    btnConvert.textContent = 'Convert and Download';
                }, outputMime, 0.95);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(activeFile);
    });
    
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
