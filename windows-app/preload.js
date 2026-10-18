const { contextBridge, ipcRenderer } = require('electron');
const pkg = require('./package.json');

contextBridge.exposeInMainWorld('SweetBakeryDesktop', {
  isDesktop: true,
  platform: 'win32',
  getAppVersion: () => pkg.version,
  openExternal: (url) => {
    ipcRenderer.send('open-external-url', url);
  },
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
  },
  searchYouTube: (query) => ipcRenderer.invoke('search-youtube', query),
  fetchYouTubePlaylist: (listId) => ipcRenderer.invoke('fetch-youtube-playlist', listId)
});
