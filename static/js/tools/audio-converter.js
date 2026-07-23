document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('ac-drop-zone');
    const fileInput = document.getElementById('ac-file-input');
    const workbench = document.getElementById('ac-workbench');
    const fileName = document.getElementById('ac-file-name');
    const fileSize = document.getElementById('ac-file-size');
    const btnRemove = document.getElementById('btn-remove-audio');

    const selectFormat = document.getElementById('ac-format-select');
    const selectBitrate = document.getElementById('ac-bitrate-select');
    const bitrateContainer = document.getElementById('ac-bitrate-container');

    const progressBlock = document.getElementById('ac-progress-block');
    const progressStatus = document.getElementById('ac-progress-status');
    const progressVal = document.getElementById('ac-progress-val');
    const progressBar = document.getElementById('ac-progress-bar');
    const btnConvert = document.getElementById('btn-convert-audio');
    const inputLabel = document.getElementById('ac-input-label');

    let activeFile = null;
    let audioContext = null;

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const inputFormat = urlParams.get('input_format') || 'wav';
    if (inputLabel) {
        inputLabel.textContent = inputFormat.toUpperCase();
    }

    selectFormat.addEventListener('change', () => {
        const fmt = selectFormat.value;
        if (fmt === 'wav') {
            bitrateContainer.classList.add('hidden');
        } else {
            bitrateContainer.classList.remove('hidden');
        }
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
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        activeFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);

        // Update context label
        const ext = file.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase();
        inputLabel.textContent = ext || 'AUDIO';

        // Update URL query param to match input format dynamically
        if (ext) {
            const url = new URL(window.location.href);
            url.searchParams.set('input_format', ext.toLowerCase());
            window.history.replaceState(null, '', url.toString());
        }

        dropZone.classList.add('hidden');
        workbench.classList.remove('hidden');
        resetProgress();
    }

    btnRemove.addEventListener('click', () => {
        activeFile = null;
        fileInput.value = '';
        workbench.classList.add('hidden');
        dropZone.classList.remove('hidden');
        resetProgress();
    });

    function resetProgress() {
        progressBlock.classList.add('hidden');
        progressBar.style.width = '0%';
        progressVal.textContent = '0%';
        btnConvert.removeAttribute('disabled');
        btnConvert.textContent = 'Convert & Download';
    }

    btnConvert.addEventListener('click', () => {
        if (!activeFile) return;

        btnConvert.setAttribute('disabled', 'true');
        btnConvert.textContent = 'Processing...';
        progressBlock.classList.remove('hidden');
        
        updateProgress("Reading audio file...", 10);

        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            updateProgress("Decoding audio samples...", 25);

            try {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                // Decode raw audio channels
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                updateProgress("Analyzing channels...", 50);

                const format = selectFormat.value;
                if (format === 'wav') {
                    exportWav(audioBuffer);
                } else {
                    exportMp3(audioBuffer);
                }
            } catch (err) {
                console.error("Decoding audio failed:", err);
                alert("Could not decode audio. Make sure the file is a valid audio format.");
                resetProgress();
            }
        };

        fileReader.readAsArrayBuffer(activeFile);
    });

    function updateProgress(status, pct) {
        progressStatus.textContent = status;
        progressBar.style.width = `${pct}%`;
        progressVal.textContent = `${pct}%`;
    }

    // WAV Export Web Worker
    function exportWav(audioBuffer) {
        updateProgress("Writing WAV headers...", 75);
        const workerCode = `
            self.onmessage = function(e) {
                const { channels, sampleRate } = e.data;
                const buffer = writeWav(channels, sampleRate);
                self.postMessage({ buffer }, [buffer]);
            };

            function writeWav(channels, sampleRate) {
                const len = channels[0].length;
                const numOfChan = channels.length;
                const buffer = new ArrayBuffer(44 + len * numOfChan * 2);
                const view = new DataView(buffer);

                writeString(view, 0, 'RIFF');
                view.setUint32(4, 36 + len * numOfChan * 2, true);
                writeString(view, 8, 'WAVE');

                writeString(view, 12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true); 
                view.setUint16(22, numOfChan, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate * numOfChan * 2, true);
                view.setUint16(32, numOfChan * 2, true);
                view.setUint16(34, 16, true); 

                writeString(view, 36, 'data');
                view.setUint32(40, len * numOfChan * 2, true);

                let offset = 44;
                for (let i = 0; i < len; i++) {
                    for (let c = 0; c < numOfChan; c++) {
                        let sample = channels[c][i];
                        sample = Math.max(-1, Math.min(1, sample));
                        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                        offset += 2;
                    }
                }
                return buffer;
            }

            function writeString(view, offset, string) {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const channels = [];
        for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
            channels.push(audioBuffer.getChannelData(c));
        }

        worker.onmessage = (e) => {
            const wavBlob = new Blob([e.data.buffer], { type: 'audio/wav' });
            triggerDownload(wavBlob, 'wav');
            updateProgress("Done!", 100);
            setTimeout(resetProgress, 1000);
        };

        worker.postMessage({
            channels,
            sampleRate: audioBuffer.sampleRate
        });
    }

    // MP3 Encoder Worker
    function exportMp3(audioBuffer) {
        updateProgress("Encoding to MP3...", 60);

        const workerCode = `
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js');

            self.onmessage = function(e) {
                const { channels, sampleRate, bitrate } = e.data;
                const numOfChan = channels.length;
                const mp3encoder = new lamejs.Mp3Encoder(numOfChan, sampleRate, bitrate);

                const leftInt = floatTo16BitPCM(channels[0]);
                const rightInt = numOfChan > 1 ? floatTo16BitPCM(channels[1]) : null;

                const mp3Data = [];
                const sampleBlockSize = 1152;

                let progressOffset = 0;
                const totalSamples = leftInt.length;

                for (let i = 0; i < totalSamples; i += sampleBlockSize) {
                    const leftChunk = leftInt.subarray(i, i + sampleBlockSize);
                    let mp3buf;
                    if (rightInt) {
                        const rightChunk = rightInt.subarray(i, i + sampleBlockSize);
                        mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                    } else {
                        mp3buf = mp3encoder.encodeBuffer(leftChunk);
                    }

                    if (mp3buf.length > 0) {
                        mp3Data.push(new Uint8Array(mp3buf));
                    }

                    if (i - progressOffset > totalSamples / 10) {
                        self.postMessage({ type: 'progress', pct: Math.round((i / totalSamples) * 40) + 60 });
                        progressOffset = i;
                    }
                }

                const endBuf = mp3encoder.flush();
                if (endBuf.length > 0) {
                    mp3Data.push(new Uint8Array(endBuf));
                }

                self.postMessage({ type: 'done', data: mp3Data });
            };

            function floatTo16BitPCM(input) {
                const output = new Int16Array(input.length);
                for (let i = 0; i < input.length; i++) {
                    let s = Math.max(-1, Math.min(1, input[i]));
                    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                return output;
            }
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const channels = [];
        for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
            channels.push(audioBuffer.getChannelData(c));
        }

        worker.onmessage = (e) => {
            if (e.data.type === 'progress') {
                updateProgress("Encoding MP3...", e.data.pct);
            } else if (e.data.type === 'done') {
                const mp3Blob = new Blob(e.data.data, { type: 'audio/mp3' });
                triggerDownload(mp3Blob, 'mp3');
                updateProgress("Done!", 100);
                setTimeout(resetProgress, 1000);
            }
        };

        const bitrate = parseInt(selectBitrate.value, 10);
        worker.postMessage({
            channels,
            sampleRate: audioBuffer.sampleRate,
            bitrate: bitrate
        });
    }

    function triggerDownload(blob, extension) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const originalName = activeFile.name.substring(0, activeFile.name.lastIndexOf('.'));
        a.download = `${originalName}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 200);
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
