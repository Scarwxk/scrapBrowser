import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  private ipcRenderer: IpcRenderer;

  url = 'https://amiens.unilasalle.fr';
  canGoBack = false;
  canGoForward = false;

  constructor() {
    if (window.require) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
    } else {
      // Seulement pour les tests en dehors d'electron
      const ipc = {} as IpcRenderer;
      this.ipcRenderer = ipc;
    }
  }

  toogleDevTool() {
    this.ipcRenderer.invoke('toogle-dev-tool');
  }

  goBack() {
    this.ipcRenderer.invoke('go-back')
    this.updateHistory();
  }

  goForward() {
    this.ipcRenderer.invoke('go-forward')
    this.updateHistory();
  }

  refresh() {
    this.ipcRenderer.invoke('refresh');
  }

  goToPage(url: string) {
    this.ipcRenderer.invoke('go-to-page', url)
      .then(() => this.updateHistory());
  }

  setToCurrentUrl() {
    this.ipcRenderer.invoke('current-url')
      .then((url) => {
        this.url = url;
      });
  }

  updateHistory() {
    this.setToCurrentUrl();

    this.ipcRenderer.invoke('can-go-back')
      .then((canGoBack : boolean) => this.canGoBack = canGoBack);

    this.ipcRenderer.invoke('can-go-forward')
      .then((canGoForward : boolean) => this.canGoForward = canGoForward);
  }
}