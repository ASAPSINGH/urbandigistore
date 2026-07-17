document.addEventListener('DOMContentLoaded', () => {
    // Mode tabs
    const btnModeRand = document.getElementById('pwd-mode-rand-btn');
    const btnModePhrase = document.getElementById('pwd-mode-phrase-btn');
    const panelRand = document.getElementById('pwd-panel-rand');
    const panelPhrase = document.getElementById('pwd-panel-phrase');
    const securityLabel = document.getElementById('pwd-security-label');

    // Display elements
    const outputText = document.getElementById('pwd-output-text');
    const entropyDisplay = document.getElementById('pwd-entropy-display');
    const strengthText = document.getElementById('pwd-strength-text');
    const strengthPercent = document.getElementById('pwd-strength-percent');
    const strengthBar = document.getElementById('pwd-strength-bar');

    // Controls: Random mode
    const sliderRandLen = document.getElementById('pwd-rand-len');
    const displayRandLen = document.getElementById('pwd-rand-len-display');
    const optUpper = document.getElementById('pwd-opt-upper');
    const optLower = document.getElementById('pwd-opt-lower');
    const optNumber = document.getElementById('pwd-opt-number');
    const optSymbol = document.getElementById('pwd-opt-symbol');
    const optSimilar = document.getElementById('pwd-opt-similar');

    // Controls: Passphrase mode
    const sliderPhraseWords = document.getElementById('pwd-phrase-words');
    const displayPhraseWords = document.getElementById('pwd-phrase-words-display');
    const inputPhraseSep = document.getElementById('pwd-phrase-sep');
    const optPhraseCap = document.getElementById('pwd-phrase-cap');
    const optPhraseNum = document.getElementById('pwd-phrase-num');

    // Actions
    const btnCopy = document.getElementById('btn-copy-pwd');
    const btnRefresh = document.getElementById('btn-refresh-pwd');
    const copyToast = document.getElementById('pwd-copy-toast');

    let currentMode = 'random'; // or 'phrase'

    // Word dictionary for passphrase generation (100 easy to read/type words)
    const dictionary = [
        "about", "alert", "apple", "armor", "arrow", "bacon", "badge", "baker", "banana", "beach",
        "beast", "block", "brick", "bright", "brown", "cabin", "camel", "candy", "cargo", "castle",
        "chief", "claim", "clock", "cloud", "coach", "coast", "craft", "crane", "creek", "crown",
        "cycle", "dance", "depth", "dirty", "draft", "dream", "dress", "drift", "drink", "dwarf",
        "eagle", "early", "earth", "elbow", "empty", "entry", "fancy", "feast", "fiber", "field",
        "flame", "flash", "flute", "focus", "force", "forest", "frost", "fruit", "giant", "glass",
        "globe", "glory", "grand", "grape", "grass", "green", "grill", "guide", "happy", "haste",
        "heart", "heavy", "honey", "horse", "house", "image", "index", "irony", "issue", "ivory",
        "jelly", "joint", "judge", "juice", "jungle", "lemon", "light", "liver", "local", "logic",
        "lucky", "lunch", "magic", "major", "maple", "march", "match", "metal", "model", "money"
    ];

    // Synchronize sliders
    sliderRandLen.addEventListener('input', (e) => {
        displayRandLen.textContent = `${e.target.value} characters`;
        generate();
    });

    sliderPhraseWords.addEventListener('input', (e) => {
        displayPhraseWords.textContent = `${e.target.value} words`;
        generate();
    });

    // Tab buttons toggle
    const switchMode = (mode) => {
        currentMode = mode;
        if (mode === 'random') {
            btnModeRand.classList.add('active', 'text-white', 'bg-cyberaccent/10', 'border-cyberaccent/20');
            btnModeRand.classList.remove('text-gray-400', 'border-white/5');
            btnModePhrase.classList.remove('active', 'text-white', 'bg-cyberaccent/10', 'border-cyberaccent/20');
            btnModePhrase.classList.add('text-gray-400', 'border-white/5');
            panelRand.classList.remove('hidden');
            panelPhrase.classList.add('hidden');
        } else {
            btnModePhrase.classList.add('active', 'text-white', 'bg-cyberaccent/10', 'border-cyberaccent/20');
            btnModePhrase.classList.remove('text-gray-400', 'border-white/5');
            btnModeRand.classList.remove('active', 'text-white', 'bg-cyberaccent/10', 'border-cyberaccent/20');
            btnModeRand.classList.add('text-gray-400', 'border-white/5');
            panelPhrase.classList.remove('hidden');
            panelRand.classList.add('hidden');
        }
        generate();
    };

    btnModeRand.addEventListener('click', () => switchMode('random'));
    btnModePhrase.addEventListener('click', () => switchMode('phrase'));

    // Input listeners for live updates
    const inputs = [
        optUpper, optLower, optNumber, optSymbol, optSimilar,
        inputPhraseSep, optPhraseCap, optPhraseNum
    ];
    inputs.forEach(el => {
        if (el) el.addEventListener('change', generate);
        if (el) el.addEventListener('input', generate);
    });

    // Refresh action
    btnRefresh.addEventListener('click', generate);

    // Copy to clipboard
    btnCopy.addEventListener('click', () => {
        const text = outputText.textContent;
        if (text === 'Click Generate to start' || !text) return;
        
        navigator.clipboard.writeText(text).then(() => {
            copyToast.classList.remove('hidden');
            setTimeout(() => copyToast.classList.add('hidden'), 2000);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
            // Fallback selection
            const range = document.createRange();
            range.selectNode(outputText);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            alert("Clipboard permission blocked. You can manually copy the highlighted text.");
        });
    });

    // Core Generation routines
    function generate() {
        if (currentMode === 'random') {
            generateRandom();
        } else {
            generatePhrase();
        }
    }

    function generateRandom() {
        const length = parseInt(sliderRandLen.value, 10);
        const includeUpper = optUpper.checked;
        const includeLower = optLower.checked;
        const includeNumber = optNumber.checked;
        const includeSymbol = optSymbol.checked;
        const avoidSimilar = optSimilar.checked;

        // Character sets
        let upperChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Similar chars O, I, L removed optionally below
        let lowerChars = "abcdefghijkmnopqrstuvwxyz"; // Similar char l removed optionally below
        let numberChars = "23456789";                  // Similar chars 0, 1 removed optionally below
        let symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        if (!avoidSimilar) {
            upperChars += "IOL";
            lowerChars += "l";
            numberChars += "01";
        }

        let charPool = "";
        const mandatorySets = [];

        if (includeUpper) {
            charPool += upperChars;
            mandatorySets.push(upperChars);
        }
        if (includeLower) {
            charPool += lowerChars;
            mandatorySets.push(lowerChars);
        }
        if (includeNumber) {
            charPool += numberChars;
            mandatorySets.push(numberChars);
        }
        if (includeSymbol) {
            charPool += symbolChars;
            mandatorySets.push(symbolChars);
        }

        if (charPool === "") {
            outputText.textContent = "Select at least 1 character set";
            updateStrengthIndicator(0, "NONE");
            entropyDisplay.textContent = "Entropy: 0 bits";
            return;
        }

        let password = "";
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);

        // First step: Guarantee at least one character from each selected check box
        let pwdChars = [];
        mandatorySets.forEach((set, idx) => {
            const val = randomValues[idx];
            pwdChars.push(set[val % set.length]);
        });

        // Second step: Fill remaining characters
        for (let i = pwdChars.length; i < length; i++) {
            const val = randomValues[i];
            pwdChars.push(charPool[val % charPool.length]);
        }

        // Shuffle the array to disperse mandatory characters
        const shuffleValues = new Uint32Array(length);
        window.crypto.getRandomValues(shuffleValues);
        for (let i = length - 1; i > 0; i--) {
            const j = shuffleValues[i] % (i + 1);
            const temp = pwdChars[i];
            pwdChars[i] = pwdChars[j];
            pwdChars[j] = temp;
        }

        password = pwdChars.join('');
        outputText.textContent = password;

        // Calculate Entropy
        // Entropy = Length * log2(poolSize)
        const entropy = Math.round(length * Math.log2(charPool.length));
        entropyDisplay.textContent = `Entropy: ${entropy} bits`;

        evaluateStrength(entropy);
    }

    function generatePhrase() {
        const wordsCount = parseInt(sliderPhraseWords.value, 10);
        const separator = inputPhraseSep.value;
        const capitalize = optPhraseCap.checked;
        const insertNumber = optPhraseNum.checked;

        let selectedWords = [];
        const randomValues = new Uint32Array(wordsCount);
        window.crypto.getRandomValues(randomValues);

        for (let i = 0; i < wordsCount; i++) {
            let word = dictionary[randomValues[i] % dictionary.length];
            if (capitalize) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            selectedWords.push(word);
        }

        // Optionally inject a number
        if (insertNumber) {
            const numVal = new Uint32Array(1);
            window.crypto.getRandomValues(numVal);
            const randNum = (numVal[0] % 90) + 10; // 10 to 99
            const indexVal = new Uint32Array(1);
            window.crypto.getRandomValues(indexVal);
            const insertIndex = indexVal[0] % (selectedWords.length + 1);
            selectedWords.splice(insertIndex, 0, randNum.toString());
        }

        const passphrase = selectedWords.join(separator);
        outputText.textContent = passphrase;

        // Entropy: Log2(dictSize ^ wordCount) + optional number entropy
        let entropy = Math.round(wordsCount * Math.log2(dictionary.length));
        if (insertNumber) {
            entropy += Math.round(Math.log2(90)); // ~6.5 bits for random number 10-99
        }
        entropyDisplay.textContent = `Entropy: ${entropy} bits`;

        evaluateStrength(entropy);
    }

    function evaluateStrength(entropy) {
        let label = "WEAK";
        if (entropy >= 80) {
            label = "VERY SECURE";
        } else if (entropy >= 60) {
            label = "STRONG";
        } else if (entropy >= 40) {
            label = "MEDIUM";
        }

        updateStrengthIndicator(entropy, label);
    }

    function updateStrengthIndicator(entropy, label) {
        // Map entropy to percentage (cap at 120 bits as 100%)
        const maxEntropy = 100;
        const percent = Math.min(100, Math.round((entropy / maxEntropy) * 100));

        strengthPercent.textContent = `${percent}%`;
        strengthText.textContent = label;
        
        // Remove existing colors
        strengthBar.className = "h-full transition-all duration-300 rounded-full";
        securityLabel.className = "text-xs font-semibold uppercase";

        if (label === "NONE") {
            strengthBar.classList.add("bg-white/5");
            strengthBar.style.width = `0%`;
            securityLabel.classList.add("text-gray-400");
        } else if (label === "WEAK") {
            strengthBar.classList.add("bg-red-500");
            strengthBar.style.width = `${percent}%`;
            securityLabel.classList.add("text-red-500");
            securityLabel.textContent = "Weak";
        } else if (label === "MEDIUM") {
            strengthBar.classList.add("bg-orange-500");
            strengthBar.style.width = `${percent}%`;
            securityLabel.classList.add("text-orange-400");
            securityLabel.textContent = "Medium";
        } else if (label === "STRONG") {
            strengthBar.classList.add("bg-green-500");
            strengthBar.style.width = `${percent}%`;
            securityLabel.classList.add("text-cyberaccent");
            securityLabel.textContent = "Strong";
        } else {
            strengthBar.classList.add("bg-indigo-500");
            strengthBar.style.width = `${percent}%`;
            securityLabel.classList.add("text-green-400");
            securityLabel.textContent = "Very Strong";
        }
    }

    // Resolve context from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const secLvl = urlParams.get('security_level') || 'strong';
    
    // Set initial values based on url target context
    if (secLvl === 'memorable') {
        switchMode('phrase');
    } else {
        switchMode('random');
        if (secLvl === 'very-strong') {
            sliderRandLen.value = 24;
            displayRandLen.textContent = "24 characters";
        } else if (secLvl === 'strong') {
            sliderRandLen.value = 16;
            displayRandLen.textContent = "16 characters";
        } else if (secLvl === 'custom') {
            sliderRandLen.value = 12;
            displayRandLen.textContent = "12 characters";
            optSymbol.checked = false;
        }
    }

    // Trigger initial generation
    generate();
});
