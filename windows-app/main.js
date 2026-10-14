const { app, BrowserWindow, Menu, shell, dialog, session, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

const TARGET_ONLINE_URL = 'https://sweetbakery-8040d.web.app/';

let mainWindow;

function createWindow() {
  // Clear any stale Service Workers registered under previous online web sessions
  session.defaultSession.clearStorageData({ storages: ['serviceworkers'] }).catch(() => {});

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 650,
    title: 'SweetBakery POS - ប្រព័ន្ធគ្រប់គ្រងហាងនំខេកស្តង់ដារ',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#fff1f2',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      spellcheck: false
    }
  });

  // Load the bundled local application (100% offline ready)
  loadAppUrl();

  // If loading fails (e.g. offline or DNS error), show friendly Khmer offline screen
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return; // Aborted load (e.g. during reload)
    console.warn(`Failed to load ${validatedURL}: [${errorCode}] ${errorDescription}`);
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
  });

  // Handle external links (open outside Electron in user's default browser)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') && !url.includes('sweetbakery-8040d.web.app')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Create clean application menu in Khmer
  setupAppMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadAppUrl() {
  if (!mainWindow) return;
  mainWindow.loadFile(path.join(__dirname, 'app-dist', 'index.html')).catch(err => {
    console.error('Error loading bundled index.html:', err);
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
  });
}

function setupAppMenu() {
  const template = [
    {
      label: 'កម្មវិធី (App)',
      submenu: [
        {
          label: 'ផ្ទុកទំព័រឡើងវិញ (Reload)',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) loadAppUrl();
          }
        },
        {
          label: 'បោះពុម្ពវិក្កយបត្រ (Print)',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.print();
          }
        },
        { type: 'separator' },
        {
          label: 'ចាកចេញ (Exit)',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'ទិដ្ឋភាព (View)',
      submenu: [
        {
          label: 'ពង្រីកពេញអេក្រង់ (Toggle Full Screen)',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: 'ពង្រីកអក្សរ (Zoom In)',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomIn'
        },
        {
          label: 'បង្រួមអក្សរ (Zoom Out)',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomOut'
        },
        {
          label: 'ទំហំដើម (Reset Zoom)',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom'
        }
      ]
    },
    {
      label: 'ជំនួយ (Help)',
      submenu: [
        {
          label: 'បើកក្នុង Browser ក្រៅ',
          click: () => shell.openExternal(TARGET_ONLINE_URL)
        },
        {
          label: 'អំពី SweetBakery POS',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'អំពី SweetBakery POS',
              message: 'SweetBakery POS Desktop Edition v1.0',
              detail: 'ប្រព័ន្ធគ្រប់គ្រងការលក់ និងស្តុកនំខេកទំនើប\nCloud Hosted: sweetbakery-8040d.web.app\nភ្ជាប់ប្រព័ន្ធស្វ័យប្រវត្តិ (Auto-Update Online)'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

// ==========================================
// 1-Click Telegram-Style Silent Auto-Updater
// ==========================================
ipcMain.on('start-desktop-silent-update', async (event, downloadUrl) => {
  const targetUrl = downloadUrl || 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe';
  const tempPath = path.join(app.getPath('temp'), 'SweetBakery-POS-Setup-Update.exe');

  console.log('🚀 Starting 1-Click Silent Desktop Update from:', targetUrl);

  const downloadFile = (fileUrl, destination, onProgress) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(fileUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const request = protocol.get(fileUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SweetBakeryDesktop/1.0' }
      }, (response) => {
        // Handle 301, 302, 307, 308 redirects from GitHub
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return downloadFile(response.headers.location, destination, onProgress).then(resolve).catch(reject);
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`Server returned HTTP ${response.statusCode}`));
        }

        const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
        let receivedBytes = 0;
        let lastReport = 0;

        const fileStream = fs.createWriteStream(destination);
        response.on('data', (chunk) => {
          receivedBytes += chunk.length;
          const now = Date.now();
          if (totalBytes > 0 && now - lastReport > 200) {
            lastReport = now;
            const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
            onProgress(percent, (receivedBytes / 1024 / 1024).toFixed(1), (totalBytes / 1024 / 1024).toFixed(1));
          }
        });

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          onProgress(100, (receivedBytes / 1024 / 1024).toFixed(1), (totalBytes / 1024 / 1024).toFixed(1));
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(destination, () => {});
          reject(err);
        });
      });

      request.on('error', (err) => {
        fs.unlink(destination, () => {});
        reject(err);
      });
    });
  };

  try {
    await downloadFile(targetUrl, tempPath, (percent, rec, tot) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('desktop-update-progress', { percent, downloadedMB: rec, totalMB: tot });
      }
    });

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('desktop-update-complete');
    }

    // Launch Inno Setup directly in silent mode (/VERYSILENT /SUPPRESSMSGBOXES)
    // Inno Setup itself handles closing old app, updating files, and auto-relaunching!
    spawn(tempPath, ['/VERYSILENT', '/SUPPRESSMSGBOXES'], {
      detached: true,
      stdio: 'ignore'
    }).unref();

    setTimeout(() => {
      app.quit();
    }, 800);

  } catch (err) {
    console.error('Desktop Update Failed:', err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('desktop-update-error', err.message || 'Download failed');
    }
  }
});

