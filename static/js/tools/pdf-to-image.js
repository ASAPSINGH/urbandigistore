document.addEventListener('DOMContentLoaded', () => {
    // Set pdf.js worker URL
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // UI Elements
    const dropZone = document.getElementById('p2i-drop-zone');
    const fileInput = document.getElementById('p2i-file-input');
    const workbench = document.getElementById('p2i-workbench');
    const btnRemove = document.getElementById('btn-remove-pdf');
    const selectFormat = document.getElementById('p2i-format');
    const selectDpi = document.getElementById('p2i-dpi');
    const pageCount = document.getElementById('p2i-page-count');
    const selectAll = document.getElementById('btn-select-all-pages');
    const deselectAll = document.getElementById('btn-deselect-all-pages');
    const pagesGrid = document.getElementById('p2i-pages-grid');
    const progressBlock = document.getElementById('p2i-progress-block');
    const progressStatus = document.getElementById('p2i-progress-status');
    const progressVal = document.getElementById('p2i-progress-val');
    const progressBar = document.getElementById('p2i-progress-bar');
    const btnDownloadZip = document.getElementById('btn-download-zip');
    const outputLabel = document.getElementById('pdf-to-image-output-label');

    let pdfDoc = null;
    let pdfFile = null;
    let renderedBlobs = {}; // pageNumber -> Blob

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const outputFormat = urlParams.get('output_format') || 'jpg';
    if (selectFormat) {
        selectFormat.value = outputFormat;
    }
    if (outputLabel) {
        outputLabel.textContent = outputFormat.toUpperCase();
    }

    selectFormat.addEventListener('change', () => {
        const fmt = selectFormat.value;
        outputLabel.textContent = fmt.toUpperCase();
        
        // Update URL query param
        const url = new URL(window.location.href);
        url.searchParams.set('output_format', fmt);
        window.history.replaceState(null, '', url.toString());
    });

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
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handlePdfFile(files[0]);
        } else {
            alert("Error: Please drop a valid PDF file.");
        }
    });

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePdfFile(e.target.files[0]);
        }
    });

    function handlePdfFile(file) {
        pdfFile = file;
        renderedBlobs = {};
        dropZone.classList.add('hidden');
        workbench.classList.remove('hidden');
        pagesGrid.innerHTML = '';
        btnDownloadZip.setAttribute('disabled', 'true');

        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            try {
                pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
                pageCount.textContent = pdfDoc.numPages;
                loadPreviews();
            } catch (err) {
                console.error("PDF load failed:", err);
                alert("Failed to load PDF file. The document may be corrupted or password-protected.");
                removePdf();
            }
        };
        fileReader.readAsArrayBuffer(file);
    }

    btnRemove.addEventListener('click', removePdf);

    function removePdf() {
        pdfDoc = null;
        pdfFile = null;
        renderedBlobs = {};
        fileInput.value = '';
        workbench.classList.add('hidden');
        dropZone.classList.remove('hidden');
        resetProgress();
    }

    function resetProgress() {
        progressBlock.classList.add('hidden');
        progressBar.style.width = '0%';
        progressVal.textContent = '0%';
        btnDownloadZip.removeAttribute('disabled');
    }

    function updateProgress(status, pct) {
        progressBlock.classList.remove('hidden');
        progressStatus.textContent = status;
        progressBar.style.width = `${pct}%`;
        progressVal.textContent = `${pct}%`;
    }

    // Load previews in low resolution first to display page grid instantly
    async function loadPreviews() {
        updateProgress("Generating page previews...", 10);
        btnDownloadZip.setAttribute('disabled', 'true');

        const totalPages = pdfDoc.numPages;

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdfDoc.getPage(i);
            
            // Render thumbnail at 0.5x scale
            const viewport = page.getViewport({ scale: 0.4 });
            const canvas = document.createElement('canvas');
            canvas.className = 'w-full h-auto object-contain rounded border border-white/5 bg-black/40';
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');

            const card = document.createElement('div');
            card.className = 'bg-black/35 rounded-xl border border-white/5 p-3 flex flex-col justify-between items-center text-center space-y-2 relative group';
            card.innerHTML = `
                <div class="absolute top-2 left-2 z-10">
                    <input type="checkbox" data-page="${i}" checked class="i2p-page-check rounded border-white/10 bg-transparent text-cyberneon w-4 h-4 accent-cyberneon cursor-pointer" />
                </div>
                <div class="w-full flex-1 flex items-center justify-center p-1">
                    <!-- Thumbnail canvas -->
                </div>
                <div class="flex justify-between items-center w-full pt-1.5 border-t border-white/5">
                    <span class="text-[10px] text-gray-500 font-semibold font-mono">Page ${i}</span>
                    <button class="btn-single-download text-[9px] text-cyberneon hover:underline font-bold">Download</button>
                </div>
            `;

            // Draw to thumbnail canvas
            await page.render({ canvasContext: context, viewport }).promise;
            card.querySelector('.w-full.flex-1').appendChild(canvas);

            // Bind individual page download
            card.querySelector('.btn-single-download').addEventListener('click', (e) => {
                e.preventDefault();
                downloadSinglePage(i);
            });

            pagesGrid.appendChild(card);
            
            const pct = Math.round((i / totalPages) * 40) + 10;
            updateProgress("Generating page previews...", pct);
        }

        resetProgress();
        btnDownloadZip.removeAttribute('disabled');
        
        // Listen to checkbox adjustments
        document.querySelectorAll('.i2p-page-check').forEach(cb => {
            cb.addEventListener('change', checkZipButtonState);
        });
    }

    selectAll.addEventListener('click', () => {
        document.querySelectorAll('.i2p-page-check').forEach(cb => cb.checked = true);
        checkZipButtonState();
    });

    deselectAll.addEventListener('click', () => {
        document.querySelectorAll('.i2p-page-check').forEach(cb => cb.checked = false);
        checkZipButtonState();
    });

    function checkZipButtonState() {
        const checkedCount = document.querySelectorAll('.i2p-page-check:checked').length;
        if (checkedCount > 0) {
            btnDownloadZip.removeAttribute('disabled');
        } else {
            btnDownloadZip.setAttribute('disabled', 'true');
        }
    }

    // Individual page downloader
    async function downloadSinglePage(pageNum) {
        const format = selectFormat.value;
        const scale = parseFloat(selectDpi.value);
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const extension = format === 'png' ? 'png' : 'jpg';

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        // Draw white background for JPEG rendering
        if (format === 'jpg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: ctx, viewport }).promise;

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const originalName = pdfFile.name.substring(0, pdfFile.name.lastIndexOf('.'));
            a.download = `${originalName}_page_${pageNum}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 200);
        }, mimeType, 0.95);
    }

    // Bulk download (ZIP format)
    btnDownloadZip.addEventListener('click', async () => {
        const checkedCbs = Array.from(document.querySelectorAll('.i2p-page-check:checked'));
        if (checkedCbs.length === 0) return;

        btnDownloadZip.setAttribute('disabled', 'true');
        updateProgress("Rendering pages...", 10);

        try {
            if (typeof JSZip === 'undefined') {
                throw new Error("ZIP packaging engine is still loading. Please check your internet connection.");
            }

            const zip = new JSZip();
            const format = selectFormat.value;
            const scale = parseFloat(selectDpi.value);
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            const extension = format === 'png' ? 'png' : 'jpg';

            const total = checkedCbs.length;

            for (let idx = 0; idx < total; idx++) {
                const cb = checkedCbs[idx];
                const pageNum = parseInt(cb.getAttribute('data-page'), 10);
                
                updateProgress(`Rendering page ${pageNum} of ${pdfDoc.numPages}...`, Math.round((idx / total) * 70) + 10);

                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                // Draw white background for JPEG rendering
                if (format === 'jpg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                await page.render({ canvasContext: ctx, viewport }).promise;

                // Capture blob directly
                const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, 0.92));
                zip.file(`page_${pageNum}.${extension}`, blob);
            }

            updateProgress("Packaging files into ZIP...", 85);
            const zipContent = await zip.generateAsync({ type: 'blob' });

            const url = URL.createObjectURL(zipContent);
            const a = document.createElement('a');
            a.href = url;
            const originalName = pdfFile.name.substring(0, pdfFile.name.lastIndexOf('.'));
            a.download = `${originalName}_images.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 200);

            updateProgress("Done!", 100);
            setTimeout(resetProgress, 1000);

        } catch (err) {
            console.error("ZIP Generation Failed:", err);
            alert("An error occurred during ZIP creation: " + err.message);
            resetProgress();
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
