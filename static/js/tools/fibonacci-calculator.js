document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const useCase = configEl.getAttribute('data-param-use_case');
    
    // UI Elements
    const badgeUseCase = document.getElementById('fib-badge-usecase');
    const inputHigh = document.getElementById('fib-high');
    const inputLow = document.getElementById('fib-low');
    const selectTrend = document.getElementById('fib-trend');
    const btnCalculate = document.getElementById('btn-calculate-fib');
    const tableBody = document.getElementById('fib-table-body');
    
    // Config setup
    const useCaseTitles = {
        'stock-trading': 'Equities & Stocks',
        'crypto-trading': 'Crypto Markets',
        'forex-trading': 'Forex Currencies'
    };
    
    badgeUseCase.textContent = useCaseTitles[useCase] || 'Financial Trading';
    
    // Set appropriate demo parameters
    if (useCase === 'crypto-trading') {
        inputHigh.value = '68000';
        inputLow.value = '52000';
    } else if (useCase === 'forex-trading') {
        inputHigh.value = '1.1200';
        inputLow.value = '1.0800';
    } else {
        inputHigh.value = '180';
        inputLow.value = '140';
    }
    
    // Event Trigger
    btnCalculate.addEventListener('click', calculateFibonacci);
    
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
                    // Extensions: High + (diff * (ratio - 1.0))
                    targetPrice = high + (diff * (item.ratio - 1.0));
                }
            } else {
                // Downtrend Retracement: price rises from low towards high, extensions go downwards from low
                if (item.ratio <= 1.0) {
                    targetPrice = low + (diff * item.ratio);
                } else {
                    // Extensions: Low - (diff * (ratio - 1.0))
                    targetPrice = low - (diff * (item.ratio - 1.0));
                }
            }
            
            // Format Table Row
            const tr = document.createElement('tr');
            
            if (item.highlight) {
                tr.className = 'bg-cyberneon/10 border-y border-cyberneon/20 text-cyberneon font-semibold';
            } else {
                tr.className = 'hover:bg-white/5 border-b border-white/5';
            }
            
            tr.innerHTML = `
                <td class="py-3 font-semibold">${(item.ratio * 100).toFixed(1)}%</td>
                <td class="py-3 text-gray-400 text-xs">${item.label}</td>
                <td class="py-3 text-right font-bold text-white font-mono">${targetPrice.toFixed(precision)}</td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
    
    // Run initial on load
    calculateFibonacci();
});
