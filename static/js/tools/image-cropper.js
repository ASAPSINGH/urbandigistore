document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('cropper-platform-select');
    
    // Preset configurations
    const presets = {
        'instagram-post': { width: 1080, height: 1080, ratio: 1, name: 'Instagram Feed Post' },
        'instagram-story': { width: 1080, height: 1920, ratio: 9/16, name: 'Instagram Story' },
        'youtube-banner': { width: 2560, height: 1440, ratio: 16/9, name: 'YouTube Banner' },
        'twitter-header': { width: 1500, height: 500, ratio: 3/1, name: 'Twitter Header' },
        'linkedin-cover': { width: 1584, height: 396, ratio: 4/1, name: 'LinkedIn Cover' }
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let platformSize = urlParams.get('platform_size') || configEl.getAttribute('data-param-platform_size') || 'instagram-post';
    // Mapping legacy presets if they exist
    if (platformSize === 'youtube-thumbnail') platformSize = 'youtube-banner';
    if (platformSize === 'facebook-cover') platformSize = 'linkedin-cover';
    if (platformSize === 'tiktok-video') platformSize = 'instagram-story';
    
    if (!presets[platformSize]) {
        platformSize = 'instagram-post';
    }
    
    if (selectEl) {
        selectEl.value = platformSize;
    }
    
    let activePreset = presets[platformSize];
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newPlatformSize = e.target.value;
            if (presets[newPlatformSize]) {
                platformSize = newPlatformSize;
                activePreset = presets[platformSize];
                
                // Update URL parameters dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('platform_size', platformSize);
                window.history.replaceState(null, '', url.toString());
                
                // Redraw if image is loaded
                if (sourceImage) {
                    drawPreview();
                }
            }
        });
    }
    
    // UI Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('image-input');
    const cropWorkspace = document.getElementById('crop-workspace');
    const cropCanvas = document.getElementById('crop-canvas');
    const ctx = cropCanvas.getContext('2d');
    
    const sliderX = document.getElementById('crop-x');
    const sliderY = document.getElementById('crop-y');
    const sliderZoom = document.getElementById('crop-zoom');
    const btnDownload = document.getElementById('btn-crop-download');
    
    let sourceImage = null;
    
    // Handle File Drop & Selection
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-cyberneon/60', 'bg-cyberneon/5');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-cyberneon/60', 'bg-cyberneon/5');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-cyberneon/60', 'bg-cyberneon/5');
        if (e.dataTransfer.files.length > 0) {
            loadImage(e.dataTransfer.files[0]);
        }
    });
    
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadImage(e.target.files[0]);
        }
    });
    
    function loadImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            sourceImage = new Image();
            sourceImage.onload = () => {
                // Show workspace
                dropZone.classList.add('hidden');
                cropWorkspace.classList.remove('hidden');
                cropCanvas.style.cursor = 'grab';
                
                // Initialize canvas sizing
                drawPreview();
            };
            sourceImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Live Draw Preview function
    function drawPreview() {
        if (!sourceImage) return;
        
        // Define preview dimensions
        const previewMaxH = 300;
        const targetRatio = activePreset.ratio;
        
        // Set preview canvas size according to target ratio
        let displayHeight = previewMaxH;
        let displayWidth = previewMaxH * targetRatio;
        
        // Ensure it doesn't overflow horizontal space
        const maxDisplayW = Math.min(window.innerWidth - 64, 500);
        if (displayWidth > maxDisplayW) {
            displayWidth = maxDisplayW;
            displayHeight = maxDisplayW / targetRatio;
        }
        
        cropCanvas.width = displayWidth;
        cropCanvas.height = displayHeight;
        
        // Calculations for source cropping region
        const zoom = sliderZoom.value / 100;
        
        // The crop box width and height inside the original image
        let cropW, cropH;
        if (sourceImage.width / sourceImage.height > targetRatio) {
            // Image is wider than crop aspect ratio
            cropH = sourceImage.height / zoom;
            cropW = cropH * targetRatio;
        } else {
            // Image is taller than crop aspect ratio
            cropW = sourceImage.width / zoom;
            cropH = cropW / targetRatio;
        }
        
        // Calculate offsets based on sliders (0-100%)
        const maxOffsetX = sourceImage.width - cropW;
        const maxOffsetY = sourceImage.height - cropH;
        
        const sx = maxOffsetX * (sliderX.value / 100);
        const sy = maxOffsetY * (sliderY.value / 100);
        
        // Clear canvas
        ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
        
        // Draw image section onto preview canvas
        ctx.drawImage(
            sourceImage,
            sx, sy, cropW, cropH, // Source rectangle
            0, 0, cropCanvas.width, cropCanvas.height // Destination rectangle
        );
    }
    
    // Sliders event listeners
    [sliderX, sliderY, sliderZoom].forEach(slider => {
        slider.addEventListener('input', drawPreview);
    });
    
    // Render high-res image and download
    btnDownload.addEventListener('click', () => {
        if (!sourceImage) return;
        
        btnDownload.setAttribute('disabled', 'true');
        btnDownload.textContent = 'Processing Crop...';
        
        // Setup output canvas using target preset resolutions
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = activePreset.width;
        outputCanvas.height = activePreset.height;
        const outCtx = outputCanvas.getContext('2d');
        
        // Re-calculate coordinates for original image size
        const targetRatio = activePreset.ratio;
        const zoom = sliderZoom.value / 100;
        
        let cropW, cropH;
        if (sourceImage.width / sourceImage.height > targetRatio) {
            cropH = sourceImage.height / zoom;
            cropW = cropH * targetRatio;
        } else {
            cropW = sourceImage.width / zoom;
            cropH = cropW / targetRatio;
        }
        
        const maxOffsetX = sourceImage.width - cropW;
        const maxOffsetY = sourceImage.height - cropH;
        
        const sx = maxOffsetX * (sliderX.value / 100);
        const sy = maxOffsetY * (sliderY.value / 100);
        
        // Draw high-res crop
        outCtx.drawImage(
            sourceImage,
            sx, sy, cropW, cropH,
            0, 0, outputCanvas.width, outputCanvas.height
        );
        
        // Trigger download
        outputCanvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cropped_${platformSize}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('Failed to generate cropped image.');
            }
            
            btnDownload.removeAttribute('disabled');
            btnDownload.textContent = 'Crop & Download Optimized Image';
        }, 'image/png');
    });

    // --- Direct Drag-to-Move Canvas Controls ---
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    cropCanvas.addEventListener('mousedown', (e) => {
        if (!sourceImage) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        cropCanvas.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !sourceImage) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        if (deltaX !== 0 || deltaY !== 0) {
            handleDrag(deltaX, deltaY);
            startX = e.clientX;
            startY = e.clientY;
        }
    });
    
    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            cropCanvas.style.cursor = 'grab';
        }
    });

    cropCanvas.addEventListener('touchstart', (e) => {
        if (!sourceImage || e.touches.length === 0) return;
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    cropCanvas.addEventListener('touchmove', (e) => {
        if (!isDragging || !sourceImage || e.touches.length === 0) return;
        
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        if (deltaX !== 0 || deltaY !== 0) {
            handleDrag(deltaX, deltaY);
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    });

    cropCanvas.addEventListener('touchend', () => {
        isDragging = false;
    });

    function handleDrag(deltaX, deltaY) {
        const targetRatio = activePreset.ratio;
        const zoom = sliderZoom.value / 100;
        
        let cropW, cropH;
        if (sourceImage.width / sourceImage.height > targetRatio) {
            cropH = sourceImage.height / zoom;
            cropW = cropH * targetRatio;
        } else {
            cropW = sourceImage.width / zoom;
            cropH = cropW / targetRatio;
        }
        
        const scaleX = cropW / cropCanvas.width;
        const scaleY = cropH / cropCanvas.height;
        
        const imageDeltaX = -deltaX * scaleX;
        const imageDeltaY = -deltaY * scaleY;
        
        const maxOffsetX = sourceImage.width - cropW;
        const maxOffsetY = sourceImage.height - cropH;
        
        if (maxOffsetX <= 0 && maxOffsetY <= 0) return;
        
        let sx = maxOffsetX * (parseFloat(sliderX.value) / 100);
        let sy = maxOffsetY * (parseFloat(sliderY.value) / 100);
        
        sx = Math.max(0, Math.min(maxOffsetX, sx + imageDeltaX));
        sy = Math.max(0, Math.min(maxOffsetY, sy + imageDeltaY));
        
        if (maxOffsetX > 0) {
            sliderX.value = (sx / maxOffsetX) * 100;
        }
        if (maxOffsetY > 0) {
            sliderY.value = (sy / maxOffsetY) * 100;
        }
        
        drawPreview();
    }

    // Zoom value display updater
    const zoomValueText = document.getElementById('zoom-value');
    if (zoomValueText) {
        sliderZoom.addEventListener('input', () => {
            zoomValueText.textContent = `${sliderZoom.value}%`;
        });
    }
});
