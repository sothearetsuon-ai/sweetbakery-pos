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

  // Automatically grant media permissions (Camera, Microphone)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
      return;
    }
    callback(true);
  });
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return true;
  });

  // Load the bundled local application (100% offline ready)
  loadAppUrl();

  // Handle in-app navigation so downloading EXE or navigating to external web opens user browser safely
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // If loading fails (e.g. offline or DNS error), show friendly Khmer offline screen
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return; // Aborted load (e.g. during reload)
    if (validatedURL && (validatedURL.startsWith('http://') || validatedURL.startsWith('https://'))) {
      return; // Don't show offline screen if an external link / download failed to load inside browser view
    }
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

// Open external link safely via user's default Windows browser (Chrome, Edge, etc.)
ipcMain.on('open-external-url', (event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

// ==========================================
// 1-Click Telegram-Style Silent Auto-Updater
// ==========================================
ipcMain.on('start-desktop-silent-update', async (event, downloadUrl) => {
  const targetUrl = downloadUrl || 'https://github.com/sothearetsuon-ai/sweetbakery-pos/releases/latest/download/SweetBakery-POS-Setup.exe';
  const tempPath = path.join(app.getPath('temp'), 'SweetBakery-POS-Setup-Update.exe');

  console.log('🚀 Starting 1-Click Silent Desktop Update from:', targetUrl);

  // Try fast and resilient curl.exe first (native on Windows 10/11, handles system TLS and proxies)
  const downloadViaCurl = () => {
    return new Promise((resolve, reject) => {
      try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (e) {}

      const curl = spawn('curl.exe', [
        '-L',
        '--connect-timeout', '20',
        '--max-time', '600',
        '--retry', '3',
        '-o', tempPath,
        targetUrl
      ]);

      let lastPercent = 0;
      const progressTimer = setInterval(() => {
        try {
          if (fs.existsSync(tempPath)) {
            const stats = fs.statSync(tempPath);
            const downloadedMB = (stats.size / 1024 / 1024).toFixed(1);
            const estimatedTotalMB = 318;
            const percent = Math.min(99, Math.round((stats.size / (estimatedTotalMB * 1024 * 1024)) * 100));
            if (percent !== lastPercent) {
              lastPercent = percent;
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('desktop-update-progress', {
                  percent,
                  downloadedMB,
                  totalMB: estimatedTotalMB.toFixed(1)
                });
              }
            }
          }
        } catch (e) {}
      }, 500);

      curl.on('close', (code) => {
        clearInterval(progressTimer);
        if (code === 0 && fs.existsSync(tempPath) && fs.statSync(tempPath).size > 1000000) {
          resolve();
        } else {
          reject(new Error(`curl failed with code ${code}`));
        }
      });

      curl.on('error', (err) => {
        clearInterval(progressTimer);
        reject(err);
      });
    });
  };

  // Fallback: Node.js https.get
  const downloadViaNode = () => {
    return new Promise((resolve, reject) => {
      const getFile = (url) => {
        const req = https.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SweetBakeryDesktop/1.0' },
          timeout: 30000
        }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return getFile(res.headers.location);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`Server returned HTTP ${res.statusCode}`));
          }

          const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
          let receivedBytes = 0;
          let lastReport = 0;
          const fileStream = fs.createWriteStream(tempPath);

          res.on('data', (chunk) => {
            receivedBytes += chunk.length;
            const now = Date.now();
            if (totalBytes > 0 && now - lastReport > 250) {
              lastReport = now;
              const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('desktop-update-progress', {
                  percent,
                  downloadedMB: (receivedBytes / 1024 / 1024).toFixed(1),
                  totalMB: (totalBytes / 1024 / 1024).toFixed(1)
                });
              }
            }
          });

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });

          fileStream.on('error', reject);
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Connection timed out'));
        });

        req.on('error', reject);
      };

      getFile(targetUrl);
    });
  };

  try {
    try {
      await downloadViaCurl();
    } catch (curlErr) {
      console.warn('curl download failed, trying Node https download...', curlErr);
      await downloadViaNode();
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('desktop-update-complete');
    }

    // Launch Inno Setup directly in silent mode (/VERYSILENT /SUPPRESSMSGBOXES /FORCECLOSEAPPLICATIONS)
    spawn(tempPath, ['/VERYSILENT', '/SUPPRESSMSGBOXES', '/FORCECLOSEAPPLICATIONS'], {
      detached: true,
      stdio: 'ignore'
    }).unref();

    setTimeout(() => {
      app.quit();
    }, 800);

  } catch (err) {
    console.error('All desktop update download attempts failed:', err);
    // Automatic fallback: Open download link directly in the default browser so user is NEVER stuck!
    shell.openExternal(targetUrl);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        'desktop-update-error',
        'ការតភ្ជាប់មានភាពយឺតយ៉ាវ (ETIMEDOUT)។ ប្រព័ន្ធបានបើកកម្មវិធីរុករក (Browser) ដើម្បីទាញយកឯកសារដំឡើង Setup ដោយផ្ទាល់ជូនលោកអ្នកជំនួសវិញ!'
      );
    }
  }
});

