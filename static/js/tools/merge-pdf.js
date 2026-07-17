document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('pdf-drop-zone');
    const fileInput = document.getElementById('pdf-file-input');
    const queueContainer = document.getElementById('pdf-queue-container');
    const queueList = document.getElementById('pdf-queue-list');
    const queueCount = document.getElementById('pdf-queue-count');
    const btnClearQueue = document.getElementById('btn-clear-pdf-queue');
    const btnMerge = document.getElementById('btn-merge-pdf');
    const alertSuccess = document.getElementById('pdf-merge-success');
    const alertError = document.getElementById('pdf-merge-error');
    const alertErrorMsg = document.getElementById('pdf-merge-error-msg');
    const mergeContext = document.getElementById('pdf-merge-context');

    let queue = [];
    let fileIdCounter = 0;

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const useCase = urlParams.get('use_case') || 'documents';
    if (mergeContext) {
        mergeContext.textContent = useCase.replace('-', ' ');
    }

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
        fileInput.value = ''; // Reset input so same file can be selected again
    });

    function handleFiles(files) {
        let added = false;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                queue.push({
                    id: fileIdCounter++,
                    file: file
                });
                added = true;
            } else {
                alert(`Skipped "${file.name}": Only PDF files are allowed.`);
            }
        }
        if (added) {
            updateQueueUI();
        }
    }

    function updateQueueUI() {
        queueList.innerHTML = '';
        
        if (queue.length === 0) {
            queueContainer.classList.add('hidden');
            btnMerge.setAttribute('disabled', 'true');
            return;
        }

        queueContainer.classList.remove('hidden');
        queueCount.textContent = queue.length;
        
        if (queue.length >= 2) {
            btnMerge.removeAttribute('disabled');
        } else {
            btnMerge.setAttribute('disabled', 'true');
        }

        queue.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-3.5 text-xs text-gray-300 hover:bg-white/5 transition-colors';
            
            li.innerHTML = `
                <div class="flex items-center space-x-3 overflow-hidden mr-4">
                    <span class="font-mono text-gray-500 w-4">${index + 1}</span>
                    <div class="overflow-hidden">
                        <p class="font-medium text-white truncate max-w-[250px] sm:max-w-[400px]">${item.file.name}</p>
                        <p class="text-[10px] text-gray-500 font-mono">${formatBytes(item.file.size)}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-1.5 flex-shrink-0">
                    <button class="btn-move-up p-1.5 rounded bg-white/5 hover:bg-cyberneon/20 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <button class="btn-move-down p-1.5 rounded bg-white/5 hover:bg-cyberneon/20 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none" title="Move Down" ${index === queue.length - 1 ? 'disabled' : ''}>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button class="btn-remove p-1.5 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition" title="Remove File">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;

            // Event Listeners for actions
            li.querySelector('.btn-move-up').addEventListener('click', () => moveItem(index, -1));
            li.querySelector('.btn-move-down').addEventListener('click', () => moveItem(index, 1));
            li.querySelector('.btn-remove').addEventListener('click', () => removeItem(index));

            queueList.appendChild(li);
        });
    }

    function moveItem(index, direction) {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= queue.length) return;
        const temp = queue[index];
        queue[index] = queue[targetIndex];
        queue[targetIndex] = temp;
        updateQueueUI();
        hideAlerts();
    }

    function removeItem(index) {
        queue.splice(index, 1);
        updateQueueUI();
        hideAlerts();
    }

    btnClearQueue.addEventListener('click', () => {
        queue = [];
        updateQueueUI();
        hideAlerts();
    });

    function hideAlerts() {
        alertSuccess.classList.add('hidden');
        alertError.classList.add('hidden');
    }

    // Merge execution logic
    btnMerge.addEventListener('click', async () => {
        if (queue.length < 2) return;

        btnMerge.setAttribute('disabled', 'true');
        btnMerge.textContent = 'Merging Documents...';
        hideAlerts();

        try {
            // Verify PDFLib is loaded
            if (typeof PDFLib === 'undefined') {
                throw new Error("PDF processing engine is still loading or blocked. Please refresh and try again.");
            }

            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const item of queue) {
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const downloadUrl = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `merged_${useCase}_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

            alertSuccess.classList.remove('hidden');
        } catch (err) {
            console.error("PDF Merge Error:", err);
            alertErrorMsg.textContent = err.message || "An unexpected error occurred while combining your documents.";
            alertError.classList.remove('hidden');
        } finally {
            btnMerge.removeAttribute('disabled');
            btnMerge.textContent = 'Merge and Download PDF';
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
