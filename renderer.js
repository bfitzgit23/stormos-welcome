// renderer.js
let currentItems = [];
let currentSoftwareSource = 'all';
let isLiveSession = false;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await checkEnvironment();
    setupTabs();
    setupEventListeners();
    await loadWelcomeTab();
});

// Check if running in live environment
async function checkEnvironment() {
    isLiveSession = await window.electronAPI.checkLive();
    
    if (isLiveSession) {
        document.getElementById('liveBadge').style.display = 'block';
        document.getElementById('installerHint').textContent = 
            'Runs the graphical installer to install StormOS to disk.';
    } else {
        document.getElementById('liveBadge').style.display = 'none';
        document.getElementById('installerHint').textContent = 
            'StormOS is already installed. The installer is for live ISO only.';
        document.getElementById('autostartCard').style.display = 'block';
        await updateAutostartStatus();
    }
    
    document.getElementById('envInfo').textContent = 
        `StormOS · ${isLiveSession ? 'Live ISO' : 'Installed'}`;
}

// Setup tab switching
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Load tab-specific content
            if (tabId === 'software') {
                loadSoftwareList();
            } else if (tabId === 'welcome') {
                loadWelcomeTab();
            }
        });
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Welcome tab buttons
    const launchInstaller = document.getElementById('launchInstallerBtn');
    if (launchInstaller) {
        launchInstaller.addEventListener('click', () => {
            window.electronAPI.runCommand(['calamares'], 'Calamares Installer', false);
        });
    }
    
    const enableAutostart = document.getElementById('enableAutostartBtn');
    if (enableAutostart) {
        enableAutostart.addEventListener('click', async () => {
            const result = await window.electronAPI.enableAutostart();
            if (result.success) {
                await updateAutostartStatus();
                showStatus('Autostart enabled');
            }
        });
    }
    
    const disableAutostart = document.getElementById('disableAutostartBtn');
    if (disableAutostart) {
        disableAutostart.addEventListener('click', async () => {
            const result = await window.electronAPI.disableAutostart();
            if (result.success) {
                await updateAutostartStatus();
                showStatus('Autostart disabled');
            }
        });
    }
    
    // System action buttons
    document.querySelectorAll('.btn-action[data-cmd]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = JSON.parse(btn.dataset.cmd);
            const title = btn.dataset.title || 'StormOS';
            const hold = btn.dataset.hold !== 'false';
            window.electronAPI.runCommand(cmd, title, hold);
            showStatus(`Running: ${title}`);
        });
    });
    
    // Link buttons
    document.querySelectorAll('.btn-link[data-url]').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            window.electronAPI.openUrl(url);
        });
    });
    
    // About button
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            alert('StormOS Welcome v2.0\n\nA modern welcome and software center for StormOS\nBuilt with Electron');
        });
    }
    
    // Theme selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            document.body.className = theme;
            localStorage.setItem('theme', theme);
        });
        
        const savedTheme = localStorage.getItem('theme') || 'dark';
        themeSelect.value = savedTheme;
        document.body.className = savedTheme;
    }
    
    // Software center buttons
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            loadSoftwareList();
        });
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadSoftwareList();
            }
        });
    }
    
    const sourceSelect = document.getElementById('sourceSelect');
    if (sourceSelect) {
        sourceSelect.addEventListener('change', (e) => {
            currentSoftwareSource = e.target.value;
            loadSoftwareList();
        });
    }
    
    const installedBtn = document.getElementById('installedBtn');
    if (installedBtn) {
        installedBtn.addEventListener('click', () => {
            loadInstalledPackages();
        });
    }
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            installSelected();
        });
    }
    
    const removeBtn = document.getElementById('removeBtn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeSelected();
        });
    }
}

// Update autostart status display
async function updateAutostartStatus() {
    const enabled = await window.electronAPI.isAutostartEnabled();
    const statusDiv = document.getElementById('autostartStatus');
    
    if (enabled) {
        statusDiv.textContent = '✓ Autostart is currently ENABLED';
        statusDiv.className = 'autostart-status enabled';
    } else {
        statusDiv.textContent = '✗ Autostart is currently DISABLED';
        statusDiv.className = 'autostart-status disabled';
    }
}

// Load welcome tab content
async function loadWelcomeTab() {
    const hasNvidia = await window.electronAPI.hasNvidia();
    const systemInfo = await window.electronAPI.getSystemInfo();
    
    // You could display system info if needed
}

// Software center functions
async function loadSoftwareList() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    const source = currentSoftwareSource;
    
    const listDiv = document.getElementById('softwareList');
    listDiv.innerHTML = '<div class="loading">Searching...</div>';
    
    let items = [];
    
    try {
        if (source === 'all' || source === 'pacman') {
            const pacmanItems = await window.electronAPI.pacmanSearch(query || '');
            items.push(...pacmanItems);
        }
        if (source === 'all' || source === 'aur') {
            try {
                const yayItems = await window.electronAPI.yaySearch(query || '');
                items.push(...yayItems);
            } catch (e) {
                console.log('yay not available');
            }
        }
        
        items.sort((a, b) => a.name.localeCompare(b.name));
        currentItems = items;
        displaySoftwareList(items);
        
        const backendSpan = document.getElementById('backendStatus');
        if (backendSpan) {
            backendSpan.textContent = `Pacman: ✓ | AUR: ${items.some(i => i.source === 'aur') ? '✓' : '✗'}`;
        }
    } catch (error) {
        listDiv.innerHTML = `<div class="loading">Error loading packages: ${error.message}</div>`;
    }
}

async function loadInstalledPackages() {
    const listDiv = document.getElementById('softwareList');
    listDiv.innerHTML = '<div class="loading">Loading installed packages...</div>';
    
    try {
        const items = await window.electronAPI.pacmanListInstalled();
        currentItems = items;
        displaySoftwareList(items);
    } catch (error) {
        listDiv.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    }
}

function displaySoftwareList(items) {
    const listDiv = document.getElementById('softwareList');
    
    if (items.length === 0) {
        listDiv.innerHTML = '<div class="loading">No packages found</div>';
        return;
    }
    
    listDiv.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'software-item';
        div.dataset.index = index;
        div.innerHTML = `
            <div class="item-name">${escapeHtml(item.name)}</div>
            <div class="item-version">${escapeHtml(item.source)} • ${escapeHtml(item.version)}</div>
        `;
        div.addEventListener('click', () => {
            document.querySelectorAll('.software-item').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            showDetails(item);
        });
        listDiv.appendChild(div);
    });
}

function showDetails(item) {
    const titleDiv = document.getElementById('detailsTitle');
    const textDiv = document.getElementById('detailsText');
    const installBtn = document.getElementById('installBtn');
    const removeBtn = document.getElementById('removeBtn');
    
    titleDiv.textContent = `${item.name} — ${item.source}`;
    textDiv.textContent = item.summary || 'No description available.';
    
    installBtn.disabled = item.installed;
    removeBtn.disabled = !item.installed;
    
    // Store current item for actions
    window.selectedItem = item;
}

async function installSelected() {
    const item = window.selectedItem;
    if (!item || item.installed) return;
    
    let cmd;
    if (item.source === 'pacman') {
        cmd = ['sudo', 'pacman', '-S', '--noconfirm', item.identifier];
    } else if (item.source === 'aur') {
        cmd = ['yay', '-S', '--noconfirm', item.identifier];
    } else {
        return;
    }
    
    window.electronAPI.runCommand(cmd, `Install: ${item.name}`, true);
    showStatus(`Installing ${item.name}...`);
}

async function removeSelected() {
    const item = window.selectedItem;
    if (!item || !item.installed) return;
    
    let cmd;
    if (item.source === 'pacman') {
        cmd = ['sudo', 'pacman', '-Rns', item.identifier];
    } else if (item.source === 'aur') {
        cmd = ['yay', '-Rns', item.identifier];
    } else {
        return;
    }
    
    window.electronAPI.runCommand(cmd, `Remove: ${item.name}`, true);
    showStatus(`Removing ${item.name}...`);
}

function showStatus(message) {
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
        statusBar.textContent = message;
        setTimeout(() => {
            if (statusBar.textContent === message) {
                statusBar.textContent = 'Ready';
            }
        }, 5000);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
