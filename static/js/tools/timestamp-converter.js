document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const liveEpoch = document.getElementById('live-epoch');
    const btnCopyLive = document.getElementById('btn-copy-live-epoch');

    const inputEpoch = document.getElementById('input-epoch');
    const btnEpochNow = document.getElementById('btn-epoch-now');

    const outUtc = document.getElementById('out-utc');
    const outLocal = document.getElementById('out-local');
    const outIso = document.getElementById('out-iso');
    const outRelative = document.getElementById('out-relative');

    const inputDate = document.getElementById('input-date');
    const inputPrecision = document.getElementById('input-precision');
    const outEpoch = document.getElementById('out-epoch');
    const btnCopyOut = document.getElementById('btn-copy-out-epoch');
    const useCaseLabel = document.getElementById('ts-use-case-label');

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const useCase = urlParams.get('use_case') || 'unix';
    if (useCaseLabel) {
        useCaseLabel.textContent = useCase;
    }

    // 1. Live ticking clock
    function updateLiveClock() {
        const seconds = Math.floor(Date.now() / 1000);
        if (liveEpoch) {
            liveEpoch.textContent = seconds;
        }
    }
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    btnCopyLive.addEventListener('click', () => {
        const val = liveEpoch.textContent.trim();
        copyToClipboard(val, btnCopyLive, "Copy Live", "Copied!");
    });

    // 2. Epoch to Date Conversions
    function handleEpochInput() {
        const raw = inputEpoch.value.trim();
        if (!raw) {
            outUtc.textContent = "Enter epoch value";
            outLocal.textContent = "Enter epoch value";
            outIso.textContent = "Enter epoch value";
            outRelative.textContent = "Enter epoch value";
            return;
        }

        // Clean integer value
        const epochNum = parseInt(raw.replace(/[^\d-]/g, ''), 10);
        if (isNaN(epochNum)) {
            outUtc.textContent = "Invalid Number";
            outLocal.textContent = "Invalid Number";
            outIso.textContent = "Invalid Number";
            outRelative.textContent = "Invalid Number";
            return;
        }

        // Heuristic: seconds vs milliseconds
        // Milliseconds are usually 13+ digits, seconds are 10 digits
        let ms = epochNum;
        if (Math.abs(epochNum) < 30000000000) {
            // It's in seconds (until year 2900 or so)
            ms = epochNum * 1000;
        }

        const date = new Date(ms);
        if (isNaN(date.getTime())) {
            outUtc.textContent = "Invalid Date";
            outLocal.textContent = "Invalid Date";
            outIso.textContent = "Invalid Date";
            outRelative.textContent = "Invalid Date";
            return;
        }

        outUtc.textContent = date.toUTCString();
        outLocal.textContent = date.toLocaleString();
        outIso.textContent = date.toISOString();
        outRelative.textContent = getRelativeTimeString(date);
    }

    // Initialize with current time or context
    const nowSecs = Math.floor(Date.now() / 1000);
    if (useCase === 'milliseconds') {
        inputEpoch.value = Date.now();
    } else {
        inputEpoch.value = nowSecs;
    }
    handleEpochInput();

    inputEpoch.addEventListener('input', handleEpochInput);
    
    btnEpochNow.addEventListener('click', () => {
        if (useCase === 'milliseconds') {
            inputEpoch.value = Date.now();
        } else {
            inputEpoch.value = Math.floor(Date.now() / 1000);
        }
        handleEpochInput();
    });

    // 3. Date to Epoch Conversions
    function handleDateInput() {
        const dateStr = inputDate.value;
        if (!dateStr) {
            outEpoch.value = '';
            return;
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            outEpoch.value = 'Invalid Date';
            return;
        }

        const ms = date.getTime();
        const precision = inputPrecision.value;

        if (precision === 's') {
            outEpoch.value = Math.floor(ms / 1000);
        } else {
            outEpoch.value = ms;
        }
    }

    // Set default input date picker to local current time
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    inputDate.value = localISOTime;
    handleDateInput();

    inputDate.addEventListener('input', handleDateInput);
    inputPrecision.addEventListener('change', handleDateInput);

    btnCopyOut.addEventListener('click', () => {
        const val = outEpoch.value;
        if (val && val !== 'Invalid Date') {
            copyToClipboard(val, btnCopyOut, "Copy", "Copied!");
        }
    });

    // Helpers
    function getRelativeTimeString(date) {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const msPerMonth = msPerDay * 30;
        const msPerYear = msPerDay * 365;

        const elapsed = date.getTime() - Date.now();
        const isFuture = elapsed > 0;
        const absElapsed = Math.abs(elapsed);

        let count = 0;
        let unit = '';

        if (absElapsed < msPerMinute) {
            return isFuture ? "just now" : "moments ago";
        } else if (absElapsed < msPerHour) {
            count = Math.round(absElapsed / msPerMinute);
            unit = count === 1 ? 'minute' : 'minutes';
        } else if (absElapsed < msPerDay) {
            count = Math.round(absElapsed / msPerHour);
            unit = count === 1 ? 'hour' : 'hours';
        } else if (absElapsed < msPerMonth) {
            count = Math.round(absElapsed / msPerDay);
            unit = count === 1 ? 'day' : 'days';
        } else if (absElapsed < msPerYear) {
            count = Math.round(absElapsed / msPerDay / 30);
            unit = count === 1 ? 'month' : 'months';
        } else {
            count = Math.round(absElapsed / msPerYear);
            unit = count === 1 ? 'year' : 'years';
        }

        return isFuture ? `in ${count} ${unit}` : `${count} ${unit} ago`;
    }

    function copyToClipboard(text, btnElement, origText, successText) {
        navigator.clipboard.writeText(text).then(() => {
            btnElement.innerHTML = `<span>${successText}</span>`;
            btnElement.classList.remove('border-cyberaccent/20');
            btnElement.classList.add('border-green-500/30', 'text-green-400');
            setTimeout(() => {
                btnElement.innerHTML = `<span>${origText}</span>`;
                btnElement.classList.remove('border-green-500/30', 'text-green-400');
                btnElement.classList.add('border-cyberaccent/20');
            }, 1500);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
        });
    }
});
