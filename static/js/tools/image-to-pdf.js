document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('i2p-drop-zone');
    const fileInput = document.getElementById('i2p-file-input');
    const workbench = document.getElementById('i2p-workbench');
    const queueList = document.getElementById('i2p-queue-list');
    const queueCount = document.getElementById('i2p-queue-count');
    const btnClear = document.getElementById('btn-clear-i2p');
    const btnGenerate = document.getElementById('btn-generate-pdf');

    const selectSize = document.getElementById('i2p-page-size');
    const selectOrientation = document.getElementById('i2p-orientation');
    const selectMargins = document.getElementById('i2p-margins');
    const inputLabel = document.getElementById('image-to-pdf-input-label');

    let queue = []; // Array of { file: File, id: number, dataUrl: string }
    let idCounter = 0;

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const inputFormat = urlParams.get('input_format') || 'jpg';
    if (inputLabel) {
        inputLabel.textContent = inputFormat.toUpperCase();
    }

    // Drag & Drop
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
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset input to allow selecting same file
    });

    function handleFiles(files) {
        let added = false;
        const total = files.length;
        let loadedCount = 0;

        for (let i = 0; i < total; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                alert(`Skipped "${file.name}": Only image files are supported.`);
                continue;
            }

            const reader = new FileReader();
            const currentId = idCounter++;
            
            reader.onload = (e) => {
                queue.push({
                    id: currentId,
                    file: file,
                    dataUrl: e.target.result
                });
                
                loadedCount++;
                if (loadedCount === total || i === total - 1) {
                    updateQueueUI();
                }
            };
            reader.readAsDataURL(file);
            added = true;
        }

        if (added) {
            dropZone.classList.add('hidden');
            workbench.classList.remove('hidden');
        }
    }

    function updateQueueUI() {
        queueList.innerHTML = '';
        queueCount.textContent = queue.length;

        if (queue.length === 0) {
            workbench.classList.add('hidden');
            dropZone.classList.remove('hidden');
            return;
        }

        queue.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-3 text-xs text-gray-300 hover:bg-white/5 transition-colors';
            
            li.innerHTML = `
                <div class="flex items-center space-x-3 overflow-hidden mr-4">
                    <span class="font-mono text-gray-500 w-4">${index + 1}</span>
                    <img src="${item.dataUrl}" class="w-10 h-10 object-cover rounded bg-black/40 border border-white/5 flex-shrink-0" />
                    <div class="overflow-hidden">
                        <p class="font-medium text-white truncate max-w-[200px] sm:max-w-[320px]">${item.file.name}</p>
                        <p class="text-[9px] text-gray-500 font-mono">${formatBytes(item.file.size)}</p>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <button class="btn-move-up p-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none" ${index === 0 ? 'disabled' : ''}>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <button class="btn-move-down p-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none" ${index === queue.length - 1 ? 'disabled' : ''}>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button class="btn-delete p-1 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;

            li.querySelector('.btn-move-up').addEventListener('click', () => moveItem(index, -1));
            li.querySelector('.btn-move-down').addEventListener('click', () => moveItem(index, 1));
            li.querySelector('.btn-delete').addEventListener('click', () => deleteItem(index));

            queueList.appendChild(li);
        });
    }

    function moveItem(index, delta) {
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= queue.length) return;

        const temp = queue[index];
        queue[index] = queue[targetIndex];
        queue[targetIndex] = temp;

        updateQueueUI();
    }

    function deleteItem(index) {
        queue.splice(index, 1);
        updateQueueUI();
    }

    btnClear.addEventListener('click', () => {
        queue = [];
        updateQueueUI();
    });

    // Compilation engine
    btnGenerate.addEventListener('click', async () => {
        if (queue.length === 0) return;

        btnGenerate.setAttribute('disabled', 'true');
        btnGenerate.textContent = 'Generating PDF...';

        try {
            if (typeof window.jspdf === 'undefined') {
                throw new Error("PDF compilation engine is still loading. Please check your internet connection.");
            }

            const { jsPDF } = window.jspdf;
            const pageSizeParam = selectSize.value; // a4, letter, match
            const orientationParam = selectOrientation.value; // auto, p, l
            const marginParam = selectMargins.value; // none, small, normal

            // Margins in mm
            let margin = 0;
            if (marginParam === 'small') margin = 10;
            else if (marginParam === 'normal') margin = 20;

            let doc = null;

            for (let idx = 0; idx < queue.length; idx++) {
                const item = queue[idx];

                // Load image dimensions
                const img = await loadImage(item.dataUrl);
                const imgW = img.width;
                const imgH = img.height;

                // Resolve orientation
                let orientation = 'p';
                if (orientationParam === 'auto') {
                    orientation = imgW > imgH ? 'l' : 'p';
                } else {
                    orientation = orientationParam;
                }

                // Resolve format
                let format = [210, 297]; // default A4 dimensions in mm
                if (pageSizeParam === 'letter') {
                    format = [215.9, 279.4];
                } else if (pageSizeParam === 'match') {
                    // Convert pixels to mm approx (assuming 72 or 96 DPI standard wrapper coordinates)
                    const pxToMm = 0.264583;
                    format = [imgW * pxToMm, imgH * pxToMm];
                }

                // Swap format array bounds to match target orientation if explicit
                if (pageSizeParam !== 'match') {
                    const minD = Math.min(format[0], format[1]);
                    const maxD = Math.max(format[0], format[1]);
                    format = orientation === 'p' ? [minD, maxD] : [maxD, minD];
                }

                const pageW = format[0];
                const pageH = format[1];

                // Instantiate document on first page
                if (idx === 0) {
                    doc = new jsPDF({
                        orientation: orientation,
                        unit: 'mm',
                        format: format
                    });
                } else {
                    doc.addPage(format, orientation);
                }

                // Render image to offscreen canvas to align/scale safely and output clean JPG
                const canvas = document.createElement('canvas');
                canvas.width = imgW;
                canvas.height = imgH;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const cleanJpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);

                // Compute scale matching printable boundaries
                const printableW = pageW - margin * 2;
                const printableH = pageH - margin * 2;

                const scaleW = printableW / imgW;
                const scaleH = printableH / imgH;
                const scale = Math.min(scaleW, scaleH);

                const finalW = imgW * scale;
                const finalH = imgH * scale;

                // Center coordinates inside page margins
                const x = margin + (printableW - finalW) / 2;
                const y = margin + (printableH - finalH) / 2;

                doc.addImage(cleanJpgDataUrl, 'JPEG', x, y, finalW, finalH, undefined, 'FAST');
            }

            // Save completed document
            if (doc) {
                doc.save('consolidated_document.pdf');
            }
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("An error occurred during PDF compilation: " + err.message);
        } finally {
            btnGenerate.removeAttribute('disabled');
            btnGenerate.textContent = 'Generate and Download PDF';
        }
    });

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error("Failed to parse image source data."));
            img.src = src;
        });
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
