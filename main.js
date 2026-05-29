// main.js
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { exec, spawn, execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const fsSync = require('fs');

let mainWindow;
let isLive = false;

// Check if running in live environment
function checkLiveEnvironment() {
    const markers = ['/run/archiso', '/run/miso', '/etc/live', '/run/live'];
    for (const marker of markers) {
        if (fsSync.existsSync(marker)) {
            return true;
        }
    }
    return false;
}

// Autostart paths
const AUTOSTART_PATHS = [
    '/etc/xdg/autostart/stormos-welcome.desktop',
    path.join(os.homedir(), '.config/autostart/stormos-welcome.desktop')
];
const AUTOSTART_DISABLED_MARKER = path.join(os.homedir(), '.storm-autostart-disabled');

// Terminal emulator paths
const TERMINALS = ['xfce4-terminal', 'xterm', 'gnome-terminal', 'konsole', 'alacritty', 'kitty'];

function findAvailableTerminal() {
    for (const term of TERMINALS) {
        try {
            const which = execSync(`which ${term}`, { encoding: 'utf8' }).trim();
            if (which) return which;
        } catch (e) {}
    }
    return null;
}

function runInTerminal(cmd, title = 'StormOS', hold = true) {
    const term = findAvailableTerminal();
    if (!term) {
        dialog.showErrorBox('Terminal Error', 'No terminal emulator found. Please install xfce4-terminal.');
        return false;
    }

    let cmdStr = cmd.join(' ');
    let args;
    const termName = path.basename(term);

    if (termName === 'xfce4-terminal') {
        args = ['--disable-server', '--title', title];
        if (hold) {
            args.push('-e', `bash -c "${cmdStr}; echo; read -p 'Press Enter to close...'"`);
        } else {
            args.push('-e', `bash -c "${cmdStr}"`);
        }
    } else if (termName === 'xterm') {
        args = ['-title', title];
        if (hold) {
            args.push('-e', `bash -c "${cmdStr}; echo; read -p 'Press Enter to close...'"`);
        } else {
            args.push('-e', cmdStr);
        }
    } else {
        args = ['-e', `bash -c "${cmdStr}${hold ? '; echo; read -p \"Press Enter to close...\"' : ''}"`];
    }

    const proc = spawn(term, args, {
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0' }
    });
    proc.unref();
    return true;
}

// Autostart functions
async function disableAutostart() {
    const userAutostart = path.join(os.homedir(), '.config/autostart/stormos-welcome.desktop');
    try {
        await fs.mkdir(path.dirname(userAutostart), { recursive: true });
        await fs.writeFile(userAutostart, `[Desktop Entry]
Type=Application
Name=StormOS Welcome
Exec=stormos-welcome
Hidden=true
X-GNOME-Autostart-enabled=false
`);
        return { success: true, removed: [userAutostart] };
    } catch (error) {
        return { success: false, errors: [error.message] };
    }
}

async function enableAutostart() {
    const target = path.join(os.homedir(), '.config/autostart/stormos-welcome.desktop');
    const content = `[Desktop Entry]
Type=Application
Name=StormOS Welcome
Exec=stormos-welcome
Icon=start-here
Comment=StormOS Welcome Screen
X-GNOME-Autostart-enabled=true
Terminal=false
Categories=System;
`;
    try {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, content);
        if (fsSync.existsSync(AUTOSTART_DISABLED_MARKER)) {
            await fs.unlink(AUTOSTART_DISABLED_MARKER);
        }
        return { success: true, path: target };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function isAutostartEnabled() {
    const userAutostart = path.join(os.homedir(), '.config/autostart/stormos-welcome.desktop');
    if (fsSync.existsSync(userAutostart)) {
        const content = await fs.readFile(userAutostart, 'utf8');
        if (content.includes('Hidden=true')) return false;
        return true;
    }
    return fsSync.existsSync('/etc/xdg/autostart/stormos-welcome.desktop');
}

// Command execution with pkexec fallback
function runCommand(cmd, title = 'StormOS', hold = true) {
    if (cmd[0] === 'sudo' && fsSync.existsSync('/usr/bin/pkexec')) {
        const pkexecCmd = ['pkexec', ...cmd.slice(1)];
        try {
            const proc = spawn(pkexecCmd[0], pkexecCmd.slice(1), {
                detached: true,
                stdio: 'ignore'
            });
            proc.unref();
            return true;
        } catch (e) {}
    }
    return runInTerminal(cmd, title, hold);
}

// System detection
async function getSystemInfo() {
    try {
        const { stdout } = await execPromise('inxi -b -c0');
        return stdout;
    } catch (e) {
        return 'System info unavailable';
    }
}

function hasNvidia() {
    try {
        const output = execSync('lspci', { encoding: 'utf8' });
        return output.includes('NVIDIA');
    } catch (e) {
        return false;
    }
}

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve({ stdout, stderr });
        });
    });
}

// Software backends
async function runCapture(cmd) {
    return new Promise((resolve) => {
        exec(cmd.join(' '), { timeout: 30000 }, (error, stdout, stderr) => {
            resolve({ code: error ? 1 : 0, stdout, stderr });
        });
    });
}

// IPC Handlers
ipcMain.handle('check-live', () => {
    isLive = checkLiveEnvironment();
    return isLive;
});

ipcMain.handle('get-system-info', getSystemInfo);
ipcMain.handle('has-nvidia', hasNvidia);

ipcMain.handle('disable-autostart', async () => {
    const result = await disableAutostart();
    if (result.success) {
        try {
            await fs.writeFile(AUTOSTART_DISABLED_MARKER, '');
        } catch (e) {}
    }
    return result;
});

ipcMain.handle('enable-autostart', enableAutostart);
ipcMain.handle('is-autostart-enabled', isAutostartEnabled);
ipcMain.handle('is-autostart-first-run', () => {
    return !fsSync.existsSync(AUTOSTART_DISABLED_MARKER);
});

ipcMain.handle('run-command', (event, cmd, title, hold) => {
    return runCommand(cmd, title, hold);
});

ipcMain.handle('open-url', (event, url) => {
    shell.openExternal(url);
});

// Software center backends
ipcMain.handle('pacman-search', async (event, query) => {
    const result = await runCapture(['pacman', '-Ss', query]);
    const items = [];
    const lines = result.stdout.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith(' ')) {
            const match = line.match(/([^/]+)\/([^\s]+)\s+([^\s]+)/);
            if (match) {
                const desc = lines[i + 1]?.trim() || '';
                items.push({
                    name: match[2],
                    source: 'pacman',
                    version: match[3],
                    summary: desc,
                    identifier: match[2],
                    installed: line.toLowerCase().includes('installed')
                });
                i++;
            }
        }
    }
    return items;
});

ipcMain.handle('yay-search', async (event, query) => {
    try {
        const result = await runCapture(['yay', '-Ss', query]);
        const items = [];
        const lines = result.stdout.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && line.startsWith('aur/')) {
                const match = line.match(/aur\/([^\s]+)\s+([^\s]+)/);
                if (match) {
                    const desc = lines[i + 1]?.trim() || '';
                    items.push({
                        name: match[1],
                        source: 'aur',
                        version: match[2],
                        summary: desc,
                        identifier: match[1],
                        installed: line.includes('Installed')
                    });
                    i++;
                }
            }
        }
        return items;
    } catch (e) {
        return [];
    }
});

ipcMain.handle('pacman-list-installed', async () => {
    const result = await runCapture(['pacman', '-Q']);
    const items = [];
    for (const line of result.stdout.split('\n')) {
        const parts = line.trim().split(' ');
        if (parts.length >= 2) {
            items.push({
                name: parts[0],
                source: 'pacman',
                version: parts[1],
                identifier: parts[0],
                installed: true
            });
        }
    }
    return items;
});

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        frame: true,
        titleBarStyle: 'default',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'build/icon.png'),
        backgroundColor: '#2E3440',
        show: false
    });

    mainWindow.loadFile('index.html');
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();
    
    // Handle autostart on first run after installation
    if (!checkLiveEnvironment() && !fsSync.existsSync(AUTOSTART_DISABLED_MARKER)) {
        disableAutostart().then(() => {
            fsSync.writeFileSync(AUTOSTART_DISABLED_MARKER, '');
        });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
