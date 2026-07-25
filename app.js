/* ==========================================================================
   PulseLink Engine - JavaScript Logic & Analytics
   ========================================================================== */

// --- State Management ---
const STORAGE_KEY_LINKS = 'pulselink_links_v2';
const STORAGE_KEY_LOGS = 'pulselink_logs_v2';
const STORAGE_KEY_THEME = 'pulselink_theme_v2';

let links = JSON.parse(localStorage.getItem(STORAGE_KEY_LINKS)) || [];
let clickLogs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS)) || [];

// Global Chart Instances
let timelineChart = null;
let deviceChart = null;
let referrerChart = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTabs();
    initEventListeners();
    
    // Seed initial demo data if empty so the UI looks active & populated
    if (links.length === 0) {
        seedDemoData();
    } else {
        refreshUI();
    }

    // Check URL hash for simulated redirection
    checkHashRedirection();
});

// --- Seed Demo Data ---
function seedDemoData() {
    const now = new Date();
    
    const demoLinks = [
        {
            id: 'link-demo-1',
            domain: 'pulse.link/',
            alias: 'cyber-sale-2026',
            shortUrl: 'pulse.link/cyber-sale-2026',
            originalUrl: 'https://github.com/trending?utm_source=twitter&utm_medium=social&utm_campaign=cyber',
            createdAt: new Date(now - 86400000 * 3).toISOString(),
            clicks: 142,
            password: '',
            expiration: '',
            utm: { source: 'twitter', medium: 'social', campaign: 'cyber' }
        },
        {
            id: 'link-demo-2',
            domain: 'snap.url/',
            alias: 'ai-launch',
            shortUrl: 'snap.url/ai-launch',
            originalUrl: 'https://openai.com/research/overview',
            createdAt: new Date(now - 86400000 * 5).toISOString(),
            clicks: 89,
            password: 'demo',
            expiration: '',
            utm: { source: 'newsletter', medium: 'email', campaign: 'launch' }
        },
        {
            id: 'link-demo-3',
            domain: 'trim.io/',
            alias: 'port-v2',
            shortUrl: 'trim.io/port-v2',
            originalUrl: 'https://dribbble.com/shots/popular',
            createdAt: new Date(now - 86400000 * 1).toISOString(),
            clicks: 54,
            password: '',
            expiration: '',
            utm: { source: 'linkedin', medium: 'post', campaign: 'brand' }
        }
    ];

    const referrers = ['Twitter / X', 'Google Search', 'Direct', 'LinkedIn', 'Reddit', 'GitHub'];
    const devices = ['Desktop (Mac/Win)', 'Mobile (iOS)', 'Mobile (Android)', 'Tablet'];
    const locations = ['United States', 'India', 'Germany', 'Japan', 'United Kingdom', 'Canada'];

    const demoLogs = [];
    demoLinks.forEach(link => {
        for (let i = 0; i < link.clicks; i++) {
            const daysAgo = Math.floor(Math.random() * 7);
            const logDate = new Date(now - (daysAgo * 86400000 + Math.random() * 3600000 * 12));
            demoLogs.push({
                id: 'log-' + Math.random().toString(36).substr(2, 9),
                linkId: link.id,
                alias: link.alias,
                shortUrl: link.shortUrl,
                timestamp: logDate.toLocaleString(),
                rawDate: logDate.toISOString(),
                referrer: referrers[Math.floor(Math.random() * referrers.length)],
                device: devices[Math.floor(Math.random() * devices.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                ipHash: `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
            });
        }
    });

    links = demoLinks;
    clickLogs = demoLogs;
    saveState();
    refreshUI();
    showToast('Loaded demo links & telemetry logs!', 'success');
}

// --- Local Storage Save ---
function saveState() {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(clickLogs));
}

// --- Theme Toggle ---
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        document.getElementById('themeToggleBtn').innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}

document.getElementById('themeToggleBtn').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem(STORAGE_KEY_THEME, isLight ? 'light' : 'dark');
    document.getElementById('themeToggleBtn').innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    updateCharts();
});

// --- Tab System ---
function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.add('hidden'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.dataset.tab + 'Section';
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }

            if (tab.dataset.tab === 'analytics') {
                updateCharts();
            } else if (tab.dataset.tab === 'qrcode') {
                renderQrCode();
            }
        });
    });
}

// --- Event Listeners Setup ---
function initEventListeners() {
    // Domain Prefix sync
    document.getElementById('domainSelect').addEventListener('change', (e) => {
        document.getElementById('selectedDomainPrefix').innerText = e.target.value;
    });

    // Advanced Options Accordion
    const toggleBtn = document.getElementById('toggleAdvOptions');
    const advDrawer = document.getElementById('advOptionsDrawer');
    toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('active');
        advDrawer.classList.toggle('hidden');
    });

    // Shortener Form Submit
    document.getElementById('urlForm').addEventListener('submit', handleSingleShorten);

    // Copy Short URL
    document.getElementById('btnCopyShortUrl').addEventListener('click', () => {
        const text = document.getElementById('createdShortUrl').innerText;
        copyToClipboard(text, 'Short URL copied to clipboard!');
    });

    // Visit / Test Redirect
    document.getElementById('btnTestRedirect').addEventListener('click', () => {
        const createdShortUrl = document.getElementById('createdShortUrl').innerText;
        const link = links.find(l => l.shortUrl === createdShortUrl);
        if (link) {
            triggerLinkClick(link);
        }
    });

    // Quick QR from result
    document.getElementById('btnQuickQr').addEventListener('click', () => {
        const createdShortUrl = document.getElementById('createdShortUrl').innerText;
        document.querySelector('[data-tab="qrcode"]').click();
        document.getElementById('qrCustomUrlInput').value = 'https://' + createdShortUrl;
        renderQrCode();
    });

    // Batch Shorten Process
    document.getElementById('btnProcessBatch').addEventListener('click', handleBatchShorten);
    document.getElementById('btnClearBatch').addEventListener('click', () => {
        document.getElementById('batchTextarea').value = '';
        document.getElementById('batchResultContainer').classList.add('hidden');
    });
    document.getElementById('btnExportBatchCsv').addEventListener('click', exportBatchCsv);

    // Quick Demo Data Button
    document.getElementById('btnQuickDemo').addEventListener('click', seedDemoData);

    // QR Code Controls
    document.getElementById('btnGenerateQr').addEventListener('click', renderQrCode);
    document.getElementById('btnDownloadQr').addEventListener('click', downloadQrCode);
    if (document.getElementById('btnCopyQrImage')) {
        document.getElementById('btnCopyQrImage').addEventListener('click', copyQrImage);
    }
    document.getElementById('qrSelectLink').addEventListener('change', (e) => {
        if (e.target.value) {
            document.getElementById('qrCustomUrlInput').value = 'https://' + e.target.value;
            renderQrCode();
        }
    });

    // Analytics Dropdown Filter
    document.getElementById('linkSelectAnalytics').addEventListener('change', updateCharts);
    document.getElementById('btnClearLogs').addEventListener('click', () => {
        clickLogs = [];
        saveState();
        refreshUI();
        showToast('Click logs cleared', 'success');
    });

    // History Table Search
    document.getElementById('historySearchInput').addEventListener('input', renderHistoryTable);

    // Export / Import JSON
    document.getElementById('btnExportJson').addEventListener('click', exportJsonData);
    document.getElementById('btnImportJson').addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput').addEventListener('change', importJsonData);

    // Delete All Links
    document.getElementById('btnClearAllLinks').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL links and analytics logs?')) {
            links = [];
            clickLogs = [];
            saveState();
            refreshUI();
            showToast('All link records deleted', 'error');
        }
    });

    // Password Modal Handlers
    document.getElementById('btnModalCancel').addEventListener('click', () => {
        document.getElementById('passwordModal').classList.add('hidden');
    });
}

// --- Single URL Shorten Handler ---
function handleSingleShorten(e) {
    e.preventDefault();

    let longUrl = document.getElementById('longUrlInput').value.trim();
    if (!longUrl) return;

    // Validate URL format
    if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
        longUrl = 'https://' + longUrl;
    }

    const domain = document.getElementById('domainSelect').value;
    let customAlias = document.getElementById('customAliasInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const expiration = document.getElementById('expirationInput').value;

    const utmSource = document.getElementById('utmSource').value.trim();
    const utmMedium = document.getElementById('utmMedium').value.trim();
    const utmCampaign = document.getElementById('utmCampaign').value.trim();

    // Generate or validate alias
    if (customAlias) {
        // Check duplicate
        if (links.some(l => l.alias.toLowerCase() === customAlias.toLowerCase())) {
            showToast('Custom alias is already taken! Try another.', 'error');
            return;
        }
    } else {
        customAlias = generateRandomSlug(6);
    }

    // Build UTM parameters onto original URL if present
    let finalOriginalUrl = longUrl;
    const utmParams = new URLSearchParams();
    if (utmSource) utmParams.append('utm_source', utmSource);
    if (utmMedium) utmParams.append('utm_medium', utmMedium);
    if (utmCampaign) utmParams.append('utm_campaign', utmCampaign);

    if (utmParams.toString()) {
        const separator = finalOriginalUrl.includes('?') ? '&' : '?';
        finalOriginalUrl += separator + utmParams.toString();
    }

    const newLink = {
        id: 'link-' + Date.now(),
        domain: domain,
        alias: customAlias,
        shortUrl: domain + customAlias,
        originalUrl: finalOriginalUrl,
        createdAt: new Date().toISOString(),
        clicks: 0,
        password: password,
        expiration: expiration,
        utm: { source: utmSource, medium: utmMedium, campaign: utmCampaign }
    };

    links.unshift(newLink);
    saveState();
    refreshUI();

    // Display Result Box
    const resultBox = document.getElementById('resultBox');
    resultBox.classList.remove('hidden');
    document.getElementById('createdShortUrl').innerText = newLink.shortUrl;
    
    const createdOrigLink = document.getElementById('createdOriginalUrl');
    createdOrigLink.innerText = newLink.originalUrl;
    createdOrigLink.href = newLink.originalUrl;

    // Display Meta Tags
    const metaContainer = document.getElementById('resultMetaTags');
    metaContainer.innerHTML = '';
    
    if (password) {
        metaContainer.innerHTML += `<span class="meta-chip"><i class="fa-solid fa-lock"></i> Protected</span>`;
    }
    if (expiration) {
        metaContainer.innerHTML += `<span class="meta-chip"><i class="fa-regular fa-calendar"></i> Expires: ${new Date(expiration).toLocaleDateString()}</span>`;
    }
    if (utmSource || utmCampaign) {
        metaContainer.innerHTML += `<span class="meta-chip"><i class="fa-solid fa-tag"></i> Campaign Attached</span>`;
    }

    showToast('Short URL generated successfully!', 'success');
}

// --- Random Slug Generator ---
function generateRandomSlug(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let slug = '';
    for (let i = 0; i < length; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
}

// --- Batch Shorten Handler ---
function handleBatchShorten() {
    const rawText = document.getElementById('batchTextarea').value;
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
        showToast('Please enter at least one valid URL', 'error');
        return;
    }

    const domain = 'pulse.link/';
    const processed = [];

    lines.forEach((line, idx) => {
        let validUrl = line;
        if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
            validUrl = 'https://' + validUrl;
        }

        const slug = generateRandomSlug(6);
        const item = {
            id: 'link-batch-' + Date.now() + '-' + idx,
            domain: domain,
            alias: slug,
            shortUrl: domain + slug,
            originalUrl: validUrl,
            createdAt: new Date().toISOString(),
            clicks: 0,
            password: '',
            expiration: '',
            utm: {}
        };
        links.unshift(item);
        processed.push(item);
    });

    saveState();
    refreshUI();

    // Render Batch Result Table
    const tbody = document.getElementById('batchTableBody');
    tbody.innerHTML = processed.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td class="truncate-link" style="max-width: 300px;">${item.originalUrl}</td>
            <td class="link-mono">${item.shortUrl}</td>
            <td>
                <button class="btn btn-sm btn-accent" onclick="copyToClipboard('${item.shortUrl}')">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('batchResultCount').innerText = `Batch Processed (${processed.length} Links)`;
    document.getElementById('batchResultContainer').classList.remove('hidden');
    showToast(`Successfully created ${processed.length} short links!`, 'success');
}

// --- Export Batch CSV ---
function exportBatchCsv() {
    let csv = 'Index,Original URL,Short URL\n';
    links.slice(0, 20).forEach((l, idx) => {
        csv += `"${idx+1}","${l.originalUrl}","${l.shortUrl}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulselink_batch_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- Refresh UI Components ---
function refreshUI() {
    document.getElementById('linkCountBadge').innerText = links.length;
    renderAnalyticsDropdown();
    renderHistoryTable();
    renderClickLogsTable();
    updateKpis();
    if (document.getElementById('analyticsSection').classList.contains('active')) {
        updateCharts();
    }
}

// --- Trigger Link Click Telemetry & Redirection ---
function triggerLinkClick(link) {
    // Expiration check
    if (link.expiration && new Date(link.expiration) < new Date()) {
        showToast('This short link has expired!', 'error');
        return;
    }

    // Password Check
    if (link.password) {
        showPasswordModal(link);
        return;
    }

    executeRedirect(link);
}

function showPasswordModal(link) {
    const modal = document.getElementById('passwordModal');
    const input = document.getElementById('modalPasswordInput');
    const errorMsg = document.getElementById('modalErrorMsg');
    
    input.value = '';
    errorMsg.classList.add('hidden');
    modal.classList.remove('hidden');

    const submitBtn = document.getElementById('btnModalSubmit');
    const newSubmitHandler = () => {
        if (input.value === link.password) {
            modal.classList.add('hidden');
            executeRedirect(link);
        } else {
            errorMsg.classList.remove('hidden');
        }
    };

    submitBtn.onclick = newSubmitHandler;
}

function executeRedirect(link) {
    // Record Telemetry
    link.clicks = (link.clicks || 0) + 1;

    const referrers = ['Direct', 'Twitter / X', 'Google Search', 'LinkedIn', 'Reddit'];
    const devices = ['Desktop (Mac/Win)', 'Mobile (iOS)', 'Mobile (Android)'];
    const locations = ['United States', 'India', 'Germany', 'United Kingdom', 'Japan'];

    const newLog = {
        id: 'log-' + Date.now(),
        linkId: link.id,
        alias: link.alias,
        shortUrl: link.shortUrl,
        timestamp: new Date().toLocaleString(),
        rawDate: new Date().toISOString(),
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        ipHash: `10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
    };

    clickLogs.unshift(newLog);
    saveState();
    refreshUI();

    showToast(`Redirecting to ${link.originalUrl}...`, 'success');
    setTimeout(() => {
        window.open(link.originalUrl, '_blank');
    }, 600);
}

// --- Check Hash Redirection Simulation ---
function checkHashRedirection() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
        const link = links.find(l => l.alias.toLowerCase() === hash.toLowerCase());
        if (link) {
            triggerLinkClick(link);
        }
    }
}

// --- KPIs & Analytics Dropdown ---
function updateKpis() {
    const selected = document.getElementById('linkSelectAnalytics').value;
    let filteredLogs = clickLogs;
    let filteredLinks = links;

    if (selected !== 'all') {
        filteredLogs = clickLogs.filter(l => l.linkId === selected);
        filteredLinks = links.filter(l => l.id === selected);
    }

    const totalClicks = filteredLogs.length;
    const activeLinksCount = filteredLinks.length;
    
    // Unique visitors calculated via distinct IP Hash
    const uniqueIps = new Set(filteredLogs.map(l => l.ipHash)).size;

    document.getElementById('kpiTotalClicks').innerText = totalClicks.toLocaleString();
    document.getElementById('kpiActiveLinks').innerText = activeLinksCount.toLocaleString();
    document.getElementById('kpiUniqueVisitors').innerText = uniqueIps.toLocaleString();
}

function renderAnalyticsDropdown() {
    const select = document.getElementById('linkSelectAnalytics');
    const qrSelect = document.getElementById('qrSelectLink');

    const opts = `<option value="all">-- All Links Combined --</option>` + links.map(l => 
        `<option value="${l.id}">${l.shortUrl} (${l.clicks} clicks)</option>`
    ).join('');

    const qrOpts = `<option value="">-- Choose from saved links --</option>` + links.map(l => 
        `<option value="${l.shortUrl}">${l.shortUrl}</option>`
    ).join('');

    select.innerHTML = opts;
    qrSelect.innerHTML = qrOpts;
}

// --- Chart.js Rendering ---
function updateCharts() {
    const selectedLinkId = document.getElementById('linkSelectAnalytics').value;
    let targetLogs = clickLogs;

    if (selectedLinkId !== 'all') {
        targetLogs = clickLogs.filter(l => l.linkId === selectedLinkId);
    }

    updateKpis();

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

    // 1. Timeline Chart (Last 7 Days)
    const days = [];
    const clickCounts = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days.push(dateStr);

        const count = targetLogs.filter(log => {
            const logDate = new Date(log.rawDate || log.timestamp);
            return logDate.toDateString() === d.toDateString();
        }).length;

        clickCounts.push(count);
    }

    const ctxTimeline = document.getElementById('timelineChart').getContext('2d');
    if (timelineChart) timelineChart.destroy();

    const gradient = ctxTimeline.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    timelineChart = new Chart(ctxTimeline, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Click Volume',
                data: clickCounts,
                borderColor: '#6366f1',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#818cf8',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
            }
        }
    });

    // 2. Device Chart (Doughnut)
    const deviceMap = {};
    targetLogs.forEach(l => {
        const dev = l.device || 'Desktop';
        deviceMap[dev] = (deviceMap[dev] || 0) + 1;
    });

    const ctxDevice = document.getElementById('deviceChart').getContext('2d');
    if (deviceChart) deviceChart.destroy();

    deviceChart = new Chart(ctxDevice, {
        type: 'doughnut',
        data: {
            labels: Object.keys(deviceMap).length ? Object.keys(deviceMap) : ['No Data'],
            datasets: [{
                data: Object.values(deviceMap).length ? Object.values(deviceMap) : [1],
                backgroundColor: ['#6366f1', '#06b6d4', '#a855f7', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } }
            }
        }
    });

    // 3. Referrers Chart (Bar)
    const referrerMap = {};
    targetLogs.forEach(l => {
        const ref = l.referrer || 'Direct';
        referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });

    const ctxReferrer = document.getElementById('referrerChart').getContext('2d');
    if (referrerChart) referrerChart.destroy();

    referrerChart = new Chart(ctxReferrer, {
        type: 'bar',
        data: {
            labels: Object.keys(referrerMap).length ? Object.keys(referrerMap) : ['Direct'],
            datasets: [{
                label: 'Clicks',
                data: Object.values(referrerMap).length ? Object.values(referrerMap) : [0],
                backgroundColor: '#06b6d4',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: textColor }, grid: { display: false } },
                y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
            }
        }
    });
}

// --- History Table Renderer ---
function renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    const query = (document.getElementById('historySearchInput').value || '').toLowerCase();

    const filtered = links.filter(l => 
        l.shortUrl.toLowerCase().includes(query) ||
        l.originalUrl.toLowerCase().includes(query) ||
        l.alias.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2rem;">No links found matching criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(link => `
        <tr>
            <td>
                <span class="link-mono">${link.shortUrl}</span>
            </td>
            <td>
                <a href="${link.originalUrl}" target="_blank" class="truncate-link" style="max-width: 250px; display: inline-block;">
                    ${link.originalUrl}
                </a>
            </td>
            <td>
                <span class="status-pill status-success"><i class="fa-solid fa-arrow-pointer"></i> ${link.clicks}</span>
            </td>
            <td style="font-size: 0.8rem; color: var(--text-dim);">
                ${new Date(link.createdAt).toLocaleDateString()}
            </td>
            <td>
                ${link.password ? '<span class="meta-chip"><i class="fa-solid fa-lock"></i> Pass</span>' : '<span class="meta-chip">Public</span>'}
            </td>
            <td>
                <div class="table-actions-cell">
                    <button class="btn btn-sm btn-accent" onclick="copyToClipboard('${link.shortUrl}')" title="Copy Link">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="triggerLinkClickById('${link.id}')" title="Test Click">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLink('${link.id}')" title="Delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function triggerLinkClickById(id) {
    const link = links.find(l => l.id === id);
    if (link) triggerLinkClick(link);
}

function deleteLink(id) {
    if (confirm('Delete this short link?')) {
        links = links.filter(l => l.id !== id);
        clickLogs = clickLogs.filter(l => l.linkId !== id);
        saveState();
        refreshUI();
        showToast('Link deleted', 'error');
    }
}

// --- Live Telemetry Log Table ---
function renderClickLogsTable() {
    const tbody = document.getElementById('clickLogsTableBody');
    if (clickLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No click telemetry logs yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = clickLogs.slice(0, 15).map(log => `
        <tr>
            <td style="font-size: 0.8rem; color: var(--text-dim);">${log.timestamp}</td>
            <td class="link-mono">${log.alias}</td>
            <td><span class="meta-chip">${log.referrer}</span></td>
            <td>${log.device}</td>
            <td>${log.location}</td>
            <td style="font-family: var(--font-mono); font-size: 0.8rem;">${log.ipHash}</td>
        </tr>
    `).join('');
}

// --- QR Studio Logic ---
function renderQrCode() {
    const targetContainer = document.getElementById('qrcodeTarget');
    targetContainer.innerHTML = '';

    const textInput = document.getElementById('qrCustomUrlInput').value || 'https://pulse.link/demo';
    const fgColor = document.getElementById('qrFgColor').value || '#6366f1';
    const bgColor = document.getElementById('qrBgColor').value || '#ffffff';
    const size = parseInt(document.getElementById('qrSizeSelect').value) || 300;

    try {
        new QRCode(targetContainer, {
            text: textInput,
            width: size,
            height: size,
            colorDark: fgColor,
            colorLight: bgColor,
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (err) {
        console.error('QR Generator Error:', err);
    }
}

function downloadQrCode() {
    const img = document.querySelector('#qrcodeTarget img');
    const canvas = document.querySelector('#qrcodeTarget canvas');

    let src = '';
    if (img && img.src) {
        src = img.src;
    } else if (canvas) {
        src = canvas.toDataURL('image/png');
    }

    if (!src) {
        showToast('Could not find QR Code image to download', 'error');
        return;
    }

    const a = document.createElement('a');
    a.href = src;
    a.download = `pulselink_qr_${Date.now()}.png`;
    a.click();
    showToast('Downloaded QR Code image!', 'success');
}

function copyQrImage() {
    const canvas = document.querySelector('#qrcodeTarget canvas');
    if (canvas) {
        canvas.toBlob(blob => {
            if (blob) {
                try {
                    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                        .then(() => showToast('QR Image copied to clipboard!', 'success'))
                        .catch(() => showToast('Clipboard image write failed', 'error'));
                } catch(e) {
                    showToast('Clipboard API not fully supported for images', 'error');
                }
            }
        });
    } else {
        showToast('QR Code not ready yet', 'error');
    }
}

// --- JSON Data Export / Import ---
function exportJsonData() {
    const data = {
        links: links,
        logs: clickLogs,
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulselink_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported backup file!', 'success');
}

function importJsonData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.links && Array.isArray(parsed.links)) {
                links = parsed.links;
                clickLogs = parsed.logs || [];
                saveState();
                refreshUI();
                showToast('Imported data successfully!', 'success');
            } else {
                showToast('Invalid backup JSON format', 'error');
            }
        } catch (err) {
            showToast('Failed to parse JSON file', 'error');
        }
    };
    reader.readAsText(file);
}

// --- Copy Helper ---
function copyToClipboard(text, message = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message, 'success');
    }).catch(() => {
        showToast('Failed to copy to clipboard', 'error');
    });
}

// --- Toast System ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}
