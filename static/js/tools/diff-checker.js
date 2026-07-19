document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const inputOrig = document.getElementById('diff-input-orig');
    const inputMod = document.getElementById('diff-input-mod');
    const btnClearOrig = document.getElementById('btn-clear-orig');
    const btnClearMod = document.getElementById('btn-clear-mod');

    const selectMode = document.getElementById('diff-mode-select');
    const selectLayout = document.getElementById('diff-layout-select');
    const btnCompare = document.getElementById('btn-compare-diff');

    const resultsContainer = document.getElementById('diff-results-container');
    const outputSplit = document.getElementById('diff-output-split');
    const outputUnified = document.getElementById('diff-output-unified');
    const listOrig = document.getElementById('diff-orig-output-list');
    const listMod = document.getElementById('diff-mod-output-list');
    const useCaseLabel = document.getElementById('diff-use-case-label');

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const useCase = urlParams.get('use_case') || 'text';
    if (useCaseLabel) {
        useCaseLabel.textContent = useCase;
    }

    // Set initial placeholders based on context
    if (useCase === 'code') {
        inputOrig.placeholder = "function hello() {\n  console.log('Hello World');\n}";
        inputMod.placeholder = "function hello(name) {\n  console.log('Hello ' + name);\n}";
    } else if (useCase === 'json') {
        inputOrig.placeholder = "{\n  \"status\": \"ok\",\n  \"items\": [1, 2]\n}";
        inputMod.placeholder = "{\n  \"status\": \"success\",\n  \"items\": [1, 2, 3]\n}";
    }

    // Clears
    btnClearOrig.addEventListener('click', () => {
        inputOrig.value = '';
        hideResults();
    });
    btnClearMod.addEventListener('click', () => {
        inputMod.value = '';
        hideResults();
    });

    function hideResults() {
        resultsContainer.classList.add('hidden');
    }

    // Compare trigger
    btnCompare.addEventListener('click', () => {
        const origText = inputOrig.value;
        const modText = inputMod.value;

        if (!origText && !modText) {
            alert("Please paste text into at least one input field.");
            return;
        }

        const mode = selectMode.value; // line, word, char
        const layout = selectLayout.value; // split, unified

        let diffs = [];

        // Verify jsdiff is loaded
        if (typeof Diff === 'undefined') {
            alert("Differences engine is still loading. Please refresh in a moment.");
            return;
        }

        if (mode === 'line') {
            diffs = Diff.diffLines(origText, modText);
        } else if (mode === 'word') {
            diffs = Diff.diffWords(origText, modText);
        } else {
            diffs = Diff.diffChars(origText, modText);
        }

        resultsContainer.classList.remove('hidden');

        if (layout === 'unified') {
            renderUnified(diffs);
        } else {
            renderSplit(diffs, mode);
        }
    });

    // Unified inline renderer
    function renderUnified(diffs) {
        outputSplit.classList.add('hidden');
        outputUnified.classList.remove('hidden');

        let html = '';
        diffs.forEach(part => {
            const escaped = escapeHtml(part.value);
            if (part.added) {
                html += `<ins class="bg-green-500/20 text-green-400 border-b border-green-500/30 px-0.5 rounded font-bold">${escaped}</ins>`;
            } else if (part.removed) {
                html += `<del class="bg-red-500/20 text-red-400 border-b border-red-500/30 px-0.5 rounded line-through">${escaped}</del>`;
            } else {
                html += escaped;
            }
        });

        outputUnified.innerHTML = html || '<span class="text-gray-500 italic">No differences found.</span>';
    }

    // Split side-by-side aligned renderer
    function renderSplit(diffs, mode) {
        outputUnified.classList.add('hidden');
        outputSplit.classList.remove('hidden');

        listOrig.innerHTML = '';
        listMod.innerHTML = '';

        const leftLines = [];
        const rightLines = [];

        if (mode === 'line') {
            // For line diff, align corresponding lines
            diffs.forEach(part => {
                const lines = part.value.split('\n');
                if (lines[lines.length - 1] === '') lines.pop(); // remove trailing split newline

                if (part.added) {
                    lines.forEach(line => {
                        leftLines.push({ text: '', type: 'empty' });
                        rightLines.push({ text: line, type: 'added' });
                    });
                } else if (part.removed) {
                    lines.forEach(line => {
                        leftLines.push({ text: line, type: 'removed' });
                        rightLines.push({ text: '', type: 'empty' });
                    });
                } else {
                    lines.forEach(line => {
                        leftLines.push({ text: line, type: 'unchanged' });
                        rightLines.push({ text: line, type: 'unchanged' });
                    });
                }
            });
        } else {
            // For words/chars, aggregate full texts and split by lines
            let leftAccum = '';
            let rightAccum = '';

            diffs.forEach(part => {
                const escaped = escapeHtml(part.value);
                if (part.added) {
                    rightAccum += `<ins class="bg-green-500/20 text-green-400 font-bold px-0.5 rounded">${escaped}</ins>`;
                } else if (part.removed) {
                    leftAccum += `<del class="bg-red-500/20 text-red-400 line-through px-0.5 rounded">${escaped}</del>`;
                } else {
                    leftAccum += escaped;
                    rightAccum += escaped;
                }
            });

            // Split accumulators by lines to align side-by-side
            const leftRawLines = leftAccum.split('\n');
            const rightRawLines = rightAccum.split('\n');
            const maxLines = Math.max(leftRawLines.length, rightRawLines.length);

            for (let i = 0; i < maxLines; i++) {
                const leftL = leftRawLines[i] !== undefined ? leftRawLines[i] : '';
                const rightL = rightRawLines[i] !== undefined ? rightRawLines[i] : '';
                
                leftLines.push({ text: leftL, type: leftL === '' ? 'empty' : 'inline' });
                rightLines.push({ text: rightL, type: rightL === '' ? 'empty' : 'inline' });
            }
        }

        // Render aligned DOM lines
        leftLines.forEach((line, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'flex items-start py-0.5 border-r border-white/5 pr-2 min-h-[1.5rem]';
            
            let bgClass = 'bg-transparent';
            let prefix = ' ';
            if (line.type === 'removed') {
                bgClass = 'bg-red-500/10 text-red-400/90 w-full rounded px-1';
                prefix = '-';
            } else if (line.type === 'empty') {
                bgClass = 'opacity-20 select-none';
            }
            
            lineEl.innerHTML = `
                <span class="font-mono text-gray-600 text-[10px] w-6 select-none text-right mr-3">${line.type !== 'empty' ? index + 1 : ''}</span>
                <span class="font-mono text-gray-500 w-3 select-none mr-1.5">${prefix}</span>
                <span class="font-mono break-all whitespace-pre-wrap ${bgClass}">${line.text || ' '}</span>
            `;
            listOrig.appendChild(lineEl);
        });

        rightLines.forEach((line, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'flex items-start py-0.5 pl-2 min-h-[1.5rem]';
            
            let bgClass = 'bg-transparent';
            let prefix = ' ';
            if (line.type === 'added') {
                bgClass = 'bg-green-500/10 text-green-400/90 w-full rounded px-1';
                prefix = '+';
            } else if (line.type === 'empty') {
                bgClass = 'opacity-20 select-none';
            }

            lineEl.innerHTML = `
                <span class="font-mono text-gray-600 text-[10px] w-6 select-none text-right mr-3">${line.type !== 'empty' ? index + 1 : ''}</span>
                <span class="font-mono text-gray-500 w-3 select-none mr-1.5">${prefix}</span>
                <span class="font-mono break-all whitespace-pre-wrap ${bgClass}">${line.text || ' '}</span>
            `;
            listMod.appendChild(lineEl);
        });
    }

    function escapeHtml(string) {
        return String(string)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
