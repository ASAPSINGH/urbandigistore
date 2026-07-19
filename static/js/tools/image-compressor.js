document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('comp-drop-zone');
    const fileInput = document.getElementById('comp-input');
    const workbench = document.getElementById('comp-workbench');
    const sliderQuality = document.getElementById('comp-quality');
    const displayQuality = document.getElementById('comp-quality-val');
    const qualityContainer = document.getElementById('comp-quality-container');

    const inputWidth = document.getElementById('comp-width');
    const inputHeight = document.getElementById('comp-height');
    const checkboxAspect = document.getElementById('comp-aspect');

    const statOrig = document.getElementById('comp-stat-orig');
    const statOpt = document.getElementById('comp-stat-opt');
    const statSavings = document.getElementById('comp-stat-savings');
    const previewImg = document.getElementById('comp-preview-img');

    const btnRemove = document.getElementById('btn-remove-comp');
    const btnDownload = document.getElementById('btn-download-comp');
    const useCaseLabel = document.getElementById('ic-use-case-label');

    let activeFile = null;
    let originalImage = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let originalAspectRatio = 1;
    let compressedBlob = null;
    let previewUrl = null;

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const useCase = urlParams.get('use_case') || 'jpeg'; // jpeg, png, webp
    if (useCaseLabel) {
        useCaseLabel.textContent = useCase;
    }

    // Hide quality slider for PNG since browser Canvas PNG compression is lossless (uses deflate)
    // and toBlob quality param does not apply to PNG.
    if (useCase === 'png' && qualityContainer) {
        qualityContainer.classList.add('hidden');
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
        const typeLower = file.type.toLowerCase();
        if (!typeLower.startsWith('image/')) {
            alert("Error: Please upload a valid image file.");
            return;
        }

        activeFile = file;

        // Show file original stats
        statOrig.textContent = formatBytes(file.size);

        // Load image object
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                originalWidth = img.width;
                originalHeight = img.height;
                originalAspectRatio = img.width / img.height;

                inputWidth.value = img.width;
                inputHeight.value = img.height;

                // Show Workbench
                dropZone.classList.add('hidden');
                workbench.classList.remove('hidden');

                // Perform first compression
                compressImage();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Aspect Ratio lock listeners
    inputWidth.addEventListener('input', () => {
        if (checkboxAspect.checked && originalAspectRatio) {
            const val = parseInt(inputWidth.value, 10);
            if (!isNaN(val) && val > 0) {
                inputHeight.value = Math.round(val / originalAspectRatio);
            }
        }
        compressImage();
    });

    inputHeight.addEventListener('input', () => {
        if (checkboxAspect.checked && originalAspectRatio) {
            const val = parseInt(inputHeight.value, 10);
            if (!isNaN(val) && val > 0) {
                inputWidth.value = Math.round(val * originalAspectRatio);
            }
        }
        compressImage();
    });

    sliderQuality.addEventListener('input', (e) => {
        displayQuality.textContent = `${e.target.value}%`;
        compressImage();
    });

    btnRemove.addEventListener('click', () => {
        activeFile = null;
        originalImage = null;
        compressedBlob = null;
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }
        fileInput.value = '';
        workbench.classList.add('hidden');
        dropZone.classList.remove('hidden');
    });

    function compressImage() {
        if (!originalImage) return;

        statOpt.textContent = "Processing...";
        statSavings.textContent = "--";

        // Get bounds
        let targetWidth = parseInt(inputWidth.value, 10);
        let targetHeight = parseInt(inputHeight.value, 10);

        if (isNaN(targetWidth) || targetWidth <= 0) targetWidth = originalWidth;
        if (isNaN(targetHeight) || targetHeight <= 0) targetHeight = originalHeight;

        const quality = parseFloat(sliderQuality.value) / 100;
        
        // Setup canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Resolve Target MIME
        let mimeType = 'image/jpeg';
        let extension = 'jpg';
        if (useCase === 'png') {
            mimeType = 'image/png';
            extension = 'png';
        } else if (useCase === 'webp') {
            mimeType = 'image/webp';
            extension = 'webp';
        }

        // Draw background (fill white for non-alpha formats if converting transparent images)
        if (useCase === 'jpeg' || useCase === 'jpg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        // Perform local compression to Blob
        canvas.toBlob((blob) => {
            if (!blob) {
                statOpt.textContent = "Compression Error";
                return;
            }

            compressedBlob = blob;

            // Update stats
            statOpt.textContent = formatBytes(blob.size);
            const savings = Math.round(((activeFile.size - blob.size) / activeFile.size) * 100);
            
            if (savings > 0) {
                statSavings.textContent = `${savings}%`;
                statSavings.className = 'block text-sm font-bold text-green-400 mt-1 font-mono';
            } else {
                statSavings.textContent = `+${Math.abs(savings)}%`;
                statSavings.className = 'block text-sm font-bold text-red-400 mt-1 font-mono';
            }

            // Update Preview URL
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            previewUrl = URL.createObjectURL(blob);
            previewImg.src = previewUrl;

        }, mimeType, quality);
    }

    // Download action
    btnDownload.addEventListener('click', () => {
        if (!compressedBlob) return;
        
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        
        const originalName = activeFile.name.substring(0, activeFile.name.lastIndexOf('.'));
        let extension = useCase === 'webp' ? 'webp' : (useCase === 'png' ? 'png' : 'jpg');
        a.download = `${originalName}_optimized.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 200);
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
