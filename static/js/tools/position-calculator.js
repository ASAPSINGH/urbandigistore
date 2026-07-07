document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const assetClass = configEl.getAttribute('data-param-asset_class');
    
    // UI Elements
    const badgeAsset = document.getElementById('calc-badge-asset');
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
    
    // Initialize labels & defaults based on asset class
    if (assetClass === 'forex') {
        badgeAsset.textContent = 'Forex FX Pairs';
        labelSL.textContent = 'Stop Loss (Pips)';
        inputSL.value = '20';
        inputEntry.value = '1.1200';
        inputStopPrice.value = '1.1180';
        
        outSizeLabel1.textContent = 'Standard Lot Sizing:';
        outRowLotsMini.classList.remove('hidden');
        outRowLotsMicro.classList.remove('hidden');
    } else {
        // Crypto or Stocks
        badgeAsset.textContent = assetClass.charAt(0).toUpperCase() + assetClass.slice(1);
        labelSL.textContent = 'Stop Loss (%)';
        inputSL.value = '5';
        inputEntry.value = '100';
        inputStopPrice.value = '95';
        
        outSizeLabel1.textContent = assetClass === 'stocks' ? 'Shares to Purchase:' : 'Coins to Allocate:';
        outRowLotsMini.classList.add('hidden');
        outRowLotsMicro.classList.add('hidden');
    }
    
    // Event listeners to sync entry/stop prices with Stop Loss distance
    inputEntry.addEventListener('input', updateSLDistance);
    inputStopPrice.addEventListener('input', updateSLDistance);
    inputSL.addEventListener('input', () => {
        // Clear entry/stop price fields to avoid conflicts when typing SL directly
        inputEntry.value = '';
        inputStopPrice.value = '';
    });
    
    function updateSLDistance() {
        const entry = parseFloat(inputEntry.value);
        const stop = parseFloat(inputStopPrice.value);
        
        if (isNaN(entry) || isNaN(stop) || entry <= 0 || stop <= 0) return;
        
        if (assetClass === 'forex') {
            // Standard Pip calculation (4 decimal digits for pairs like EURUSD, 0.0001 = 1 pip)
            // Use 10,000 multiplier
            const diff = Math.abs(entry - stop);
            // Handle JPY pairs differently if entry price is small e.g. < 200 (like USD/JPY ~150)
            const multiplier = entry < 250 ? 100 : 10000;
            const pips = (diff * multiplier).toFixed(1);
            inputSL.value = pips;
        } else {
            // Percentage difference
            const diff = Math.abs(entry - stop);
            const pct = ((diff / entry) * 100).toFixed(2);
            inputSL.value = pct;
        }
    }
    
    // Trigger Calculation
    btnCalculate.addEventListener('click', calculatePosition);
    
    function calculatePosition() {
        const balance = parseFloat(inputBalance.value);
        const riskPct = parseFloat(inputRisk.value);
        const slDist = parseFloat(inputSL.value);
        
        if (isNaN(balance) || isNaN(riskPct) || isNaN(slDist) || balance <= 0 || riskPct <= 0 || slDist <= 0) {
            alert('Please enter valid numeric parameters.');
            return;
        }
        
        // 1. Calculate Money at Risk
        const riskCash = balance * (riskPct / 100);
        outRiskCash.textContent = `$${riskCash.toFixed(2)}`;
        
        // 2. Sizing calculation
        if (assetClass === 'forex') {
            // Standard EUR/USD pip value is $10 for a standard lot (100,000 units)
            // Sizing Formula: Lots = RiskCash / (StopLossPips * PipValue)
            const pipValue = 10; // Default approximation for USD-account trading USD-crosses
            const standardLots = riskCash / (slDist * pipValue);
            
            outLotsStandard.textContent = `${standardLots.toFixed(2)} Lots`;
            outLotsMini.textContent = `${(standardLots * 10).toFixed(2)} Lots`;
            outLotsMicro.textContent = `${(standardLots * 100).toFixed(2)} Lots`;
        } else {
            // Crypto or Stocks (percentage risk sizing)
            // Standard Position Size = RiskCash / StopLossPercent
            // (e.g. Risk $100 with 5% stop = $2000 total size, buy $2000 worth of shares)
            const totalPositionValue = riskCash / (slDist / 100);
            const entryPrice = parseFloat(inputEntry.value) || 1.0;
            const sharesCount = totalPositionValue / entryPrice;
            
            // Format output size
            outLotsStandard.textContent = `${sharesCount.toFixed(4)} units`;
            
            // Re-purpose mini row to show total purchase value
            outRowLotsMini.classList.remove('hidden');
            const miniLabel = outRowLotsMini.querySelector('span:first-child');
            miniLabel.textContent = 'Total Deal Value:';
            outLotsMini.textContent = `$${totalPositionValue.toFixed(2)}`;
        }
    }
    
    // Run initial calculation
    calculatePosition();
});
