document.addEventListener('DOMContentLoaded', () => {
    // Get configuration details
    const configEl = document.getElementById('tool-config');
    const selectEl = document.getElementById('cpm-channel-select');
    
    // UI Elements
    const tabCpm = document.getElementById('tab-cpm');
    const tabCost = document.getElementById('tab-cost');
    const tabImpressions = document.getElementById('tab-impressions');
    
    const groupCost = document.getElementById('group-cost');
    const groupImpressions = document.getElementById('group-impressions');
    const groupCpm = document.getElementById('group-cpm');
    
    const inputCost = document.getElementById('cpm-cost');
    const inputImpressions = document.getElementById('cpm-impressions');
    const inputCpm = document.getElementById('cpm-value');
    
    const inputRevenue = document.getElementById('cpm-revenue');
    const btnCalculate = document.getElementById('btn-calculate-cpm');
    
    const outCost = document.getElementById('out-cpm-cost');
    const outImpressions = document.getElementById('out-cpm-impressions');
    const outCpm = document.getElementById('out-cpm-value');
    const outRoas = document.getElementById('out-cpm-roas');
    
    let activeMode = 'cpm'; // can be 'cpm', 'cost', 'impressions'
    
    // Channel-specific default CPM values
    const channelDefaults = {
        'facebook-ads': 12.00,
        'google-display': 3.50,
        'tiktok-ads': 8.50,
        'linkedin-campaigns': 48.00,
        'youtube-ads': 14.00
    };
    
    // Initial parameter resolution
    const urlParams = new URLSearchParams(window.location.search);
    let channel = urlParams.get('channel') || configEl.getAttribute('data-param-channel') || 'facebook-ads';
    if (!channelDefaults[channel]) {
        channel = 'facebook-ads';
    }
    
    // Initialize select element value
    if (selectEl) {
        selectEl.value = channel;
    }
    
    // Apply initial defaults
    inputCpm.value = channelDefaults[channel];
    inputCost.value = (parseFloat(inputImpressions.value) / 1000) * channelDefaults[channel];
    
    // Tab click handlers
    tabCpm.addEventListener('click', () => setMode('cpm'));
    tabCost.addEventListener('click', () => setMode('cost'));
    tabImpressions.addEventListener('click', () => setMode('impressions'));
    
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            const newChannel = e.target.value;
            if (channelDefaults[newChannel]) {
                channel = newChannel;
                
                // Update default values
                inputCpm.value = channelDefaults[channel];
                inputCost.value = ((parseFloat(inputImpressions.value) || 100000) / 1000) * channelDefaults[channel];
                
                // Update URL parameters dynamically
                const url = new URL(window.location.href);
                url.searchParams.set('channel', channel);
                window.history.replaceState(null, '', url.toString());
                
                runCalculate();
            }
        });
    }
    
    function setMode(mode) {
        activeMode = mode;
        
        // Update input visibilities
        groupCost.classList.add('hidden');
        groupImpressions.classList.add('hidden');
        groupCpm.classList.add('hidden');
        
        // Reset tab styles
        [tabCpm, tabCost, tabImpressions].forEach(tab => {
            tab.className = "py-2 text-xs font-semibold rounded-md transition text-gray-400 hover:text-white";
        });
        
        if (mode === 'cpm') {
            groupCost.classList.remove('hidden');
            groupImpressions.classList.remove('hidden');
            tabCpm.className = "py-2 text-xs font-semibold rounded-md transition text-white bg-cyberneon/20 border border-cyberneon/30";
        } else if (mode === 'cost') {
            groupImpressions.classList.remove('hidden');
            groupCpm.classList.remove('hidden');
            tabCost.className = "py-2 text-xs font-semibold rounded-md transition text-white bg-cyberneon/20 border border-cyberneon/30";
        } else if (mode === 'impressions') {
            groupCost.classList.remove('hidden');
            groupCpm.classList.remove('hidden');
            tabImpressions.className = "py-2 text-xs font-semibold rounded-md transition text-white bg-cyberneon/20 border border-cyberneon/30";
        }
    }
    
    // Triggers
    btnCalculate.addEventListener('click', runCalculate);
    inputRevenue.addEventListener('input', calculateRoasOnly);
    
    function runCalculate() {
        let cost = parseFloat(inputCost.value);
        let impressions = parseFloat(inputImpressions.value);
        let cpm = parseFloat(inputCpm.value);
        
        if (activeMode === 'cpm') {
            if (isNaN(cost) || isNaN(impressions) || cost <= 0 || impressions <= 0) {
                alert('Please enter valid Cost and Impressions.');
                return;
            }
            cpm = (cost / impressions) * 1000;
            inputCpm.value = cpm.toFixed(2);
        } else if (activeMode === 'cost') {
            if (isNaN(impressions) || isNaN(cpm) || impressions <= 0 || cpm <= 0) {
                alert('Please enter valid Impressions and CPM.');
                return;
            }
            cost = (impressions / 1000) * cpm;
            inputCost.value = cost.toFixed(2);
        } else if (activeMode === 'impressions') {
            if (isNaN(cost) || isNaN(cpm) || cost <= 0 || cpm <= 0) {
                alert('Please enter valid Cost and CPM.');
                return;
            }
            impressions = (cost / cpm) * 1000;
            inputImpressions.value = Math.round(impressions);
        }
        
        // Update Output panel
        outCost.textContent = `$${formatNumber(cost.toFixed(2))}`;
        outImpressions.textContent = formatNumber(Math.round(impressions));
        outCpm.textContent = `$${cpm.toFixed(2)}`;
        
        // Calculate ROAS
        calculateRoasOnly();
    }
    
    function calculateRoasOnly() {
        const cost = parseFloat(inputCost.value);
        const revenue = parseFloat(inputRevenue.value);
        
        if (isNaN(cost) || isNaN(revenue) || cost <= 0 || revenue < 0) {
            outRoas.textContent = '0.00x';
            return;
        }
        
        const roasVal = revenue / cost;
        outRoas.textContent = `${roasVal.toFixed(2)}x`;
        
        // Dynamically style ROAS color based on efficiency
        if (roasVal >= 2.0) {
            outRoas.className = 'py-2 text-xs font-bold text-green-400 font-mono';
        } else if (roasVal >= 1.0) {
            outRoas.className = 'py-2 text-xs font-bold text-yellow-400 font-mono';
        } else {
            outRoas.className = 'py-2 text-xs font-bold text-red-400 font-mono';
        }
    }
    
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Initial run
    runCalculate();
});
