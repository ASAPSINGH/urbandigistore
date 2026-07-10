document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('fibo-use-case-select');
    
    // UI Elements
    const inputHigh = document.getElementById('fib-high');
    const inputLow = document.getElementById('fib-low');
    const selectTrend = document.getElementById('fib-trend');
    const btnCalculate = document.getElementById('btn-calculate-fib');
    const tableBody = document.getElementById('fib-table-body');
    
    // Config setup
    const useCaseDefaults = {
        'stock-trends': { high: '180', low: '140', name: 'Stock Market Trends' },
        'crypto-waves': { high: '68000', low: '52000', name: 'Crypto Volatility Waves' },
        'forex-swings': { high: '1.1200', low: '1.0800', name: 'Forex Currency Swings' }
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let useCase = urlParams.get('use_case') || configEl.getAttribute('data-param-use_case') || 'stock-trends';
    // Mapping old use cases if they exist
    if (useCase === 'stock-trading') useCase = 'stock-trends';
    if (useCase === 'crypto-trading') useCase = 'crypto-waves';
    if (useCase === 'forex-trading') useCase = 'forex-swings';
    
    if (!useCaseDefaults[useCase]) {
        useCase = 'stock-trends';
    }
    
    // Initialize select element value
    if (selectEl) {
        selectEl.value = useCase;
    }
    
    // Set appropriate demo parameters
    inputHigh.value = useCaseDefaults[useCase].high;
    inputLow.value = useCaseDefaults[useCase].low;
    
    // Event Trigger
    btnCalculate.addEventListener('click', calculateFibonacci);
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newUseCase = e.target.value;
            if (useCaseDefaults[newUseCase]) {
                useCase = newUseCase;
                
                // Update input values
                inputHigh.value = useCaseDefaults[useCase].high;
                inputLow.value = useCaseDefaults[useCase].low;
                
                // Update URL parameters dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('use_case', useCase);
                window.history.replaceState(null, '', url.toString());
                
                calculateFibonacci();
            }
        });
    }
    
    function calculateFibonacci() {
        const high = parseFloat(inputHigh.value);
        const low = parseFloat(inputLow.value);
        const trend = selectTrend.value;
        
        if (isNaN(high) || isNaN(low) || high <= 0 || low <= 0 || high <= low) {
            alert('Please check price values. Swing High must be greater than Swing Low.');
            return;
        }
        
        const diff = high - low;
        
        // Helper to determine decimal precision dynamically based on inputs
        const getPrecision = (val1, val2) => {
            const str1 = val1.toString();
            const str2 = val2.toString();
            const dec1 = str1.includes('.') ? str1.split('.')[1].length : 0;
            const dec2 = str2.includes('.') ? str2.split('.')[1].length : 0;
            return Math.max(dec1, dec2, 2);
        };
        const precision = getPrecision(high, low);
        
        // Define levels configuration
        const ratios = [
            { ratio: 0, label: 'Start / Anchor' },
            { ratio: 0.236, label: 'Retracement Level' },
            { ratio: 0.382, label: 'Retracement Level' },
            { ratio: 0.500, label: 'Psychological Pullback' },
            { ratio: 0.618, label: 'Golden Ratio Zone', highlight: true },
            { ratio: 0.786, label: 'Deep Retracement' },
            { ratio: 1.000, label: 'Full Retracement' },
            { ratio: 1.618, label: 'Golden Extension' },
            { ratio: 2.618, label: 'Extension Target' }
        ];
        
        // Clear previous table outputs
        tableBody.innerHTML = '';
        
        ratios.forEach(item => {
            let targetPrice;
            
            if (trend === 'up') {
                // Uptrend Retracement: price falls from high towards low, extensions go upwards from high
                if (item.ratio <= 1.0) {
                    targetPrice = high - (diff * item.ratio);
                } else {
                    targetPrice = high + (diff * (item.ratio - 1.0));
                }
            } else {
                // Downtrend Retracement: price rises from low towards high, extensions go downwards from low
                if (item.ratio <= 1.0) {
                    targetPrice = low + (diff * item.ratio);
                } else {
                    targetPrice = low - (diff * (item.ratio - 1.0));
                }
            }
            
            // Format Table Row
            const tr = document.createElement('tr');
            
            if (item.highlight) {
                tr.className = "bg-cyberneon/10 text-cyberneon font-bold";
            } else {
                tr.className = "hover:bg-white/[0.02]";
            }
            
            tr.innerHTML = `
                <td class="py-2.5 pl-2">${(item.ratio * 100).toFixed(1)}%</td>
                <td class="py-2.5">${item.label}</td>
                <td class="py-2.5 pr-2 text-right">${targetPrice.toFixed(precision)}</td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
    
    // Initial run
    calculateFibonacci();
});
