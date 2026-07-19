document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('heic-drop-zone');
    const fileInput = document.getElementById('heic-input');
    const queueContainer = document.getElementById('heic-queue-container');
    const queueList = document.getElementById('heic-queue-list');
    const queueCount = document.getElementById('heic-queue-count');
    const btnClear = document.getElementById('btn-clear-heic');
    const btnConvert = document.getElementById('btn-convert-heic');
    const alertSuccess = document.getElementById('heic-alert-success');
    const alertError = document.getElementById('heic-alert-error');
    const errorMessage = document.getElementById('heic-error-message');
    const outputFormatSelect = document.getElementById('heic-output-select');

    let queue = [];
    let fileIdCounter = 0;

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const outputFormat = urlParams.get('output_format') || 'jpg';
    if (outputFormatSelect) {
        outputFormatSelect.value = outputFormat;
    }

    outputFormatSelect.addEventListener('change', () => {
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('output_format', outputFormatSelect.value);
        window.history.replaceState(null, '', url.toString());
        hideAlerts();
    });

    // Drag & Drop Handlers
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
        handleFiles(files);
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset input
    });

    function handleFiles(files) {
        let added = false;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const nameLower = file.name.toLowerCase();
            if (nameLower.endsWith('.heic') || nameLower.endsWith('.heif')) {
                queue.push({
                    id: fileIdCounter++,
                    file: file,
                    status: 'pending', // pending, converting, completed, error
                    errorMsg: ''
                });
                added = true;
            } else {
                alert(`Skipped "${file.name}": Only .heic and .heif files are supported.`);
            }
        }
        if (added) {
            updateQueueUI();
            hideAlerts();
        }
    }

    function updateQueueUI() {
        queueList.innerHTML = '';
        
        if (queue.length === 0) {
            queueContainer.classList.add('hidden');
            btnConvert.setAttribute('disabled', 'true');
            return;
        }

        queueContainer.classList.remove('hidden');
        queueCount.textContent = queue.length;
        btnConvert.removeAttribute('disabled');

        queue.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-3 text-xs text-gray-300 hover:bg-white/5 transition-colors';
            
            let statusBadge = '';
            if (item.status === 'pending') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 text-gray-400 uppercase">Ready</span>';
            } else if (item.status === 'converting') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyberneon/10 text-cyberneon uppercase animate-pulse">Converting...</span>';
            } else if (item.status === 'completed') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-400 uppercase">Done</span>';
            } else if (item.status === 'error') {
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400 uppercase" title="${item.errorMsg}">Error</span>`;
            }

            li.innerHTML = `
                <div class="flex items-center space-x-3 overflow-hidden mr-4">
                    <span class="font-mono text-gray-500 w-4">${index + 1}</span>
                    <div class="overflow-hidden">
                        <p class="font-medium text-white truncate max-w-[200px] sm:max-w-[350px]">${item.file.name}</p>
                        <p class="text-[9px] text-gray-500 font-mono">${formatBytes(item.file.size)}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3 flex-shrink-0">
                    ${statusBadge}
                    <button class="btn-remove-item p-1 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition" title="Remove">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;

            li.querySelector('.btn-remove-item').addEventListener('click', (e) => {
                e.stopPropagation();
                removeItem(index);
            });

            queueList.appendChild(li);
        });
    }

    function removeItem(index) {
        queue.splice(index, 1);
        updateQueueUI();
        hideAlerts();
    }

    btnClear.addEventListener('click', () => {
        queue = [];
        updateQueueUI();
        hideAlerts();
    });

    function hideAlerts() {
        alertSuccess.classList.add('hidden');
        alertError.classList.add('hidden');
    }

    // Convert function
    btnConvert.addEventListener('click', async () => {
        if (queue.length === 0) return;

        btnConvert.setAttribute('disabled', 'true');
        btnConvert.textContent = 'Converting...';
        hideAlerts();

        try {
            if (typeof heic2any === 'undefined') {
                throw new Error("HEIC conversion library is still loading. Please check your internet connection.");
            }

            const targetFmt = outputFormatSelect.value;
            const mimeType = targetFmt === 'png' ? 'image/png' : 'image/jpeg';
            
            for (let item of queue) {
                if (item.status === 'completed') continue;

                item.status = 'converting';
                updateQueueUI();

                try {
                    const blob = await heic2any({
                        blob: item.file,
                        toType: mimeType,
                        quality: 0.92
                    });

                    const finalBlob = Array.isArray(blob) ? blob[0] : blob;
                    const url = URL.createObjectURL(finalBlob);

                    const a = document.createElement('a');
                    a.href = url;
                    const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.'));
                    a.download = `${baseName}.${targetFmt}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    setTimeout(() => URL.revokeObjectURL(url), 200);

                    item.status = 'completed';
                } catch (err) {
                    console.error("Individual conversion error:", err);
                    item.status = 'error';
                    item.errorMsg = err.message || "Parse failed";
                }
                updateQueueUI();
            }

            const hasError = queue.some(i => i.status === 'error');
            if (hasError) {
                alertErrorMsg("Some files failed to convert. Hover over their error badges for details.");
                alertError.classList.remove('hidden');
            } else {
                alertSuccess.classList.remove('hidden');
            }

        } catch (err) {
            console.error("Overall HEIC conversion failed:", err);
            errorMessage.textContent = err.message || "An error occurred during bulk conversion.";
            alertError.classList.remove('hidden');
        } finally {
            btnConvert.removeAttribute('disabled');
            btnConvert.textContent = 'Convert and Download';
        }
    });

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
