import {Injectable, NgZone} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  url = 'https://amiens.unilasalle.fr';
  canGoBack = false;
  canGoForward = false;

  // @ts-ignore
  electronAPI = window.electronAPI;

  constructor(private zone: NgZone) {
    this.electronAPI.updateUrl((newUrl: string) => {
      this.zone.run(() => { // Utilisation de NgZone pour détecter les changements
        this.updateUrl(newUrl);
        this.updateUrlOnNavigation()
      });
    });
  }

  // Met à jour l'URL avec la nouvelle URL reçue d'Electron
  updateUrl(newUrl: string) {
    this.url = newUrl;
  }

  toogleDevTool() {
    this.electronAPI.toogleDevTool();
  }

  goBack() {
    this.electronAPI.goBack();
    this.updateHistory();
  }

  goForward() {
    this.electronAPI.goForward();
    this.updateHistory();
  }

  refresh() {
    this.electronAPI.refresh();
  }

  goToPage(url: string) {
    this.electronAPI.goToPage(url)
      .then(() => this.updateHistory());
  }

  setToCurrentUrl() {
    this.electronAPI.currentUrl()
      .then((url :string) => {
        this.url = url;
      });
  }

  updateHistory() {
    this.setToCurrentUrl();

    this.electronAPI.canGoBack()
      .then((canGoBack : boolean) => this.canGoBack = canGoBack);

    this.electronAPI.canGoForward()
      .then((canGoForward : boolean) => this.canGoForward = canGoForward);
  }

  updateUrlOnNavigation() {
    // Utiliser l'API Electron pour écouter la fin de la navigation
    this.electronAPI.onNavigationEnd((newUrl: string) => {
      this.url = newUrl;
    });
  }
}
