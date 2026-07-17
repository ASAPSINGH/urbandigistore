document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('pos-asset-select');
    
    // UI Elements
    const labelSL = document.getElementById('label-sl-unit');
    const inputBalance = document.getElementById('calc-balance');
    const inputRisk = document.getElementById('calc-risk');
    const inputSL = document.getElementById('calc-sl');
    
    const priceFields = document.getElementById('price-fields');
    const inputEntry = document.getElementById('calc-entry');
    const inputStopPrice = document.getElementById('calc-sl-price');
    
    const btnCalculate = document.getElementById('btn-calculate-size');
    
    const outRiskCash = document.getElementById('out-risk-cash');
    const outSizeLabel1 = document.getElementById('out-size-label-1');
    const outLotsStandard = document.getElementById('out-lots-standard');
    
    const outRowLotsMini = document.getElementById('out-row-lots-mini');
    const outLotsMini = document.getElementById('out-lots-mini');
    const outRowLotsMicro = document.getElementById('out-row-lots-micro');
    const outLotsMicro = document.getElementById('out-lots-micro');
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let assetClass = urlParams.get('asset_class') || configEl.getAttribute('data-param-asset_class') || 'forex-trading';
    
    // Legacy maps if they exist
    if (assetClass === 'forex') assetClass = 'forex-trading';
    if (assetClass === 'crypto') assetClass = 'crypto-trading';
    if (assetClass === 'stocks') assetClass = 'stock-investing';
    
    if (selectEl) {
        selectEl.value = assetClass;
    }
    
    // Config function
    const applyAssetConfig = (type) => {
        if (type === 'forex-trading') {
            labelSL.textContent = 'Stop Loss (Pips)';
            inputSL.value = '20';
            inputEntry.value = '1.1200';
            inputStopPrice.value = '1.1180';
            
            outSizeLabel1.textContent = 'Standard Lot Sizing:';
            outRowLotsMini.classList.remove('hidden');
            const miniLabel = outRowLotsMini.querySelector('span:first-child');
            if (miniLabel) miniLabel.textContent = 'Mini Lots Sizing:';
            outRowLotsMicro.classList.remove('hidden');
        } else {
            // Crypto or Stocks
            labelSL.textContent = 'Stop Loss (%)';
            inputSL.value = '5';
            
            if (type === 'crypto-trading') {
                inputEntry.value = '60000';
                inputStopPrice.value = '57000';
                outSizeLabel1.textContent = 'Coins to Allocate:';
            } else {
                inputEntry.value = '150';
                inputStopPrice.value = '142.50';
                outSizeLabel1.textContent = 'Shares to Purchase:';
            }
            
            outRowLotsMini.classList.remove('hidden');
            const miniLabel = outRowLotsMini.querySelector('span:first-child');
            if (miniLabel) miniLabel.textContent = 'Total Deal Value:';
            outRowLotsMicro.classList.add('hidden');
        }
    };
    
    applyAssetConfig(assetClass);
    
    // Event listeners to sync entry/stop prices with Stop Loss distance
    inputEntry.addEventListener('input', updateSLDistance);
    inputStopPrice.addEventListener('input', updateSLDistance);
    inputSL.addEventListener('input', () => {
        inputEntry.value = '';
        inputStopPrice.value = '';
    });
    
    function updateSLDistance() {
        const entry = parseFloat(inputEntry.value);
        const stop = parseFloat(inputStopPrice.value);
        
        if (isNaN(entry) || isNaN(stop) || entry <= 0 || stop <= 0) return;
        
        if (assetClass === 'forex-trading') {
            // Forex stop distance = |entry - stop| * 10000 (pip scaling)
            const pips = Math.abs(entry - stop) * 10000;
            inputSL.value = Math.round(pips);
        } else {
            // Stocks/Crypto stop distance = (|entry - stop| / entry) * 100
            const pct = (Math.abs(entry - stop) / entry) * 100;
            inputSL.value = pct.toFixed(2);
        }
    }
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newAssetClass = e.target.value;
            assetClass = newAssetClass;
            
            // Update UI elements based on new configuration
            applyAssetConfig(assetClass);
            
            // Update URL parameters dynamically
            const url = new URL(window.location.href);
            url.searchParams.set('asset_class', assetClass);
            window.history.replaceState(null, '', url.toString());
            
            calculatePosition();
        });
    }
    
    // Trigger Calculation
    btnCalculate.addEventListener('click', calculatePosition);
    
    // Auto-calculate on input changes
    [inputBalance, inputRisk, inputSL, inputEntry, inputStopPrice].forEach(el => {
        el.addEventListener('input', calculatePosition);
    });
    
    function calculatePosition(e) {
        const balance = parseFloat(inputBalance.value);
        const riskPct = parseFloat(inputRisk.value);
        const slDist = parseFloat(inputSL.value);
        
        const isExplicitClick = e && e.type === 'click';
        
        if (isNaN(balance) || isNaN(riskPct) || isNaN(slDist) || balance <= 0 || riskPct <= 0 || slDist <= 0) {
            if (isExplicitClick) alert('Please enter valid numeric parameters.');
            return;
        }
        
        // 1. Calculate Money at Risk
        const riskCash = balance * (riskPct / 100);
        outRiskCash.textContent = `$${riskCash.toFixed(2)}`;
        
        // 2. Sizing calculation
        if (assetClass === 'forex-trading') {
            const pipValue = 10; // Default approximation for USD accounts
            const standardLots = riskCash / (slDist * pipValue);
            
            outLotsStandard.textContent = `${standardLots.toFixed(2)} Lots`;
            outLotsMini.textContent = `${(standardLots * 10).toFixed(2)} Lots`;
            outLotsMicro.textContent = `${(standardLots * 100).toFixed(2)} Lots`;
        } else {
            // Crypto or Stocks (percentage risk sizing)
            const totalPositionValue = riskCash / (slDist / 100);
            const entryPrice = parseFloat(inputEntry.value) || 1.0;
            const sharesCount = totalPositionValue / entryPrice;
            
            // Format output size
            outLotsStandard.textContent = `${sharesCount.toFixed(4)} units`;
            outLotsMini.textContent = `$${totalPositionValue.toFixed(2)}`;
        }
    }
    
    // Run initial calculation
    calculatePosition();
});
