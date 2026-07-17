document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('pdf-split-drop-zone');
    const fileInput = document.getElementById('pdf-split-file-input');
    const fileInfo = document.getElementById('pdf-split-file-info');
    const infoName = document.getElementById('pdf-split-info-name');
    const infoSize = document.getElementById('pdf-split-info-size');
    const infoPages = document.getElementById('pdf-split-info-pages');
    const btnRemove = document.getElementById('btn-remove-split-pdf');
    const btnSplit = document.getElementById('btn-split-pdf');
    const alertSuccess = document.getElementById('pdf-split-success');
    const alertError = document.getElementById('pdf-split-error');
    const alertErrorMsg = document.getElementById('pdf-split-error-msg');
    const customRangeContainer = document.getElementById('custom-range-container');
    const rangeInput = document.getElementById('pdf-range-input');
    const splitContext = document.getElementById('pdf-split-context');

    let activeFile = null;
    let totalPageCount = 0;

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const useCase = urlParams.get('use_case') || 'pages';
    if (splitContext) {
        splitContext.textContent = useCase.replace('-', ' ');
    }

    // Toggle Range input display based on mode selection
    document.querySelectorAll('input[name="split-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'range') {
                customRangeContainer.classList.remove('hidden');
            } else {
                customRangeContainer.classList.add('hidden');
            }
            hideAlerts();
        });
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

    async function handleFileSelect(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert("Error: Please select a valid PDF document file.");
            return;
        }

        activeFile = file;
        hideAlerts();

        // Show parsing state
        infoName.textContent = file.name;
        infoSize.textContent = formatBytes(file.size);
        infoPages.textContent = "Calculating...";
        fileInfo.classList.remove('hidden');
        dropZone.classList.add('hidden');
        btnSplit.setAttribute('disabled', 'true');

        try {
            if (typeof PDFLib === 'undefined') {
                throw new Error("PDF processing engine is still loading. Please wait a moment.");
            }
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer, { updateMetadata: false });
            totalPageCount = pdf.getPageCount();
            
            infoPages.textContent = totalPageCount;
            btnSplit.removeAttribute('disabled');
        } catch (err) {
            console.error("PDF Load Error:", err);
            alertErrorMsg.textContent = "Could not parse PDF file: " + err.message;
            alertError.classList.remove('hidden');
            activeFile = null;
            fileInfo.classList.add('hidden');
            dropZone.classList.remove('hidden');
        }
    }

    btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        activeFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        dropZone.classList.remove('hidden');
        btnSplit.setAttribute('disabled', 'true');
        hideAlerts();
    });

    function hideAlerts() {
        alertSuccess.classList.add('hidden');
        alertError.classList.add('hidden');
    }

    // Split logic
    btnSplit.addEventListener('click', async () => {
        if (!activeFile) return;

        const mode = document.querySelector('input[name="split-mode"]:checked').value;
        btnSplit.setAttribute('disabled', 'true');
        btnSplit.textContent = 'Processing PDF...';
        hideAlerts();

        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await activeFile.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);

            if (mode === 'all') {
                // ZIP Mode: Split every single page into separate files
                if (typeof JSZip === 'undefined') {
                    throw new Error("ZIP archiving library is still loading. Please refresh and try again.");
                }

                const zip = new JSZip();
                const baseName = activeFile.name.substring(0, activeFile.name.lastIndexOf('.'));

                for (let i = 0; i < totalPageCount; i++) {
                    const newDoc = await PDFDocument.create();
                    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
                    newDoc.addPage(copiedPage);
                    const pdfBytes = await newDoc.save();
                    zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const downloadUrl = URL.createObjectURL(zipBlob);
                
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${baseName}_split_pages.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
                alertSuccess.classList.remove('hidden');

            } else {
                // Range Mode: Extract specific pages into a single combined PDF
                const rawRange = rangeInput.value.trim();
                if (!rawRange) {
                    throw new Error("Please specify a custom range (e.g. 1-3, 5).");
                }

                const pageIndices = parseRange(rawRange, totalPageCount);
                if (pageIndices.length === 0) {
                    throw new Error("No valid pages were resolved from your range input. Verify the numbers are within document bounds.");
                }

                const newDoc = await PDFDocument.create();
                const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
                copiedPages.forEach(page => newDoc.addPage(page));

                const pdfBytes = await newDoc.save();
                const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                const downloadUrl = URL.createObjectURL(pdfBlob);

                const baseName = activeFile.name.substring(0, activeFile.name.lastIndexOf('.'));
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${baseName}_extracted.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
                alertSuccess.classList.remove('hidden');
            }

        } catch (err) {
            console.error("PDF Split Error:", err);
            alertErrorMsg.textContent = err.message || "An error occurred while splitting the PDF document.";
            alertError.classList.remove('hidden');
        } finally {
            btnSplit.removeAttribute('disabled');
            btnSplit.textContent = 'Split and Download';
        }
    });

    // Helper Range Parser
    function parseRange(rangeStr, maxPages) {
        const pages = new Set();
        const parts = rangeStr.split(',');
        
        for (let part of parts) {
            part = part.trim();
            if (!part) continue;
            
            if (part.includes('-')) {
                const bounds = part.split('-');
                if (bounds.length === 2) {
                    const start = parseInt(bounds[0].trim(), 10);
                    const end = parseInt(bounds[1].trim(), 10);
                    if (!isNaN(start) && !isNaN(end)) {
                        const min = Math.min(start, end);
                        const max = Math.max(start, end);
                        for (let p = min; p <= max; p++) {
                            if (p >= 1 && p <= maxPages) {
                                pages.add(p - 1); // convert to 0-index
                            }
                        }
                    }
                }
            } else {
                const p = parseInt(part, 10);
                if (!isNaN(p) && p >= 1 && p <= maxPages) {
                    pages.add(p - 1); // convert to 0-index
                }
            }
        }
        
        return Array.from(pages).sort((a, b) => a - b);
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
