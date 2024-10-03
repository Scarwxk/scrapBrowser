const { contextBridge, ipcRenderer } = require('electron/renderer')
const url = require("node:url");

contextBridge.exposeInMainWorld('electronAPI', {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),
  updateUrl: (callback) => ipcRenderer.on('update-url', (_event, value) => callback(value)),

  onNavigationEnd: (callback) => ipcRenderer.on('navigation-end', (_event, value) => callback(value)),

  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  goToPage: (url) => ipcRenderer.invoke('go-to-page', url),
  currentUrl: () => ipcRenderer.invoke('current-url'),
})

