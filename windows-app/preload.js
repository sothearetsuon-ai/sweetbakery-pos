const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('SweetBakeryDesktop', {
  isDesktop: true,
  platform: 'win32',
  startSilentUpdate: (downloadUrl) => {
    ipcRenderer.send('start-desktop-silent-update', downloadUrl);
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('desktop-update-progress', (event, data) => callback(data));
  },
  onUpdateComplete: (callback) => {
    ipcRenderer.on('desktop-update-complete', () => callback());
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('desktop-update-error', (event, error) => callback(error));
  }
});
