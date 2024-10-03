const { app, WebContentsView, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

app.whenReady().then(() => {

  // BrowserWindow initiate the rendering of the angular toolbar
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (app.isPackaged){
    win.loadFile('dist/browser-template/browser/index.html');
  }else{
    win.loadURL('http://localhost:4200')
  }


  // WebContentsView initiate the rendering of a second view to browser the web
  const view = new WebContentsView();
  win.contentView.addChildView(view);

  // Always fit the web rendering with the electron windows
  function fitViewToWin() {
    const winSize = win.webContents.getOwnerBrowserWindow().getBounds();
    view.setBounds({ x: 0, y: 55, width: winSize.width, height: winSize.height });
  }

  win.webContents.openDevTools({ mode: 'detach' });

  view.webContents.on('did-start-navigation', (event, url, isMainFrame) => {
    if (isMainFrame) { // Seulement si c'est la navigation principale (et non des requêtes secondaires)
      win.webContents.send('update-url', url);
    }
  });

  view.webContents.on('did-stop-loading', () => {
    const url = view.webContents.getURL(); // Récupère l'URL actuelle
    win.webContents.send('navigation-end', url); // Envoie l'URL à Angular via ipcRenderer

    view.webContents.executeJavaScript(`
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });`)
  });

  view.webContents.on('before-input-event', (event, input) => {
    if (input.control) {
      // Lorsque la touche Ctrl est pressée, exécutez du JavaScript pour obtenir l'élément sous la souris
      view.webContents.executeJavaScript(`
      (function() {
        // Utiliser les coordonnées stockées dans mouseX et mouseY
        const element = document.elementFromPoint(mouseX, mouseY);

        if (!element) {
          return { xpath: null, className: null, id: null };
        }

        // Fonction pour obtenir le XPath d'un élément
        const getXPathForElement = (element) => {
          if (element.id) {
            return '//*[@id="' + element.id + '"]';
          } else if (element === document.body) {
            return '/html/body';
          }
          let ix = 0;
          const siblings = element.parentNode.childNodes;
          for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) {
              return getXPathForElement(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
              ix++;
            }
          }
          return '';
        };

        const xpath = getXPathForElement(element);
        const className = element.className || 'N/A';
        const id = element.id || 'N/A'; // Récupération de l'ID de l'élément

        return { xpath, className, id }; // Retourner l'objet avec xpath, className, et id
      })();
    `).then((elementInfo) => {
        console.log("Element Info: ", elementInfo);
        // Envoyer les informations de l'élément au processus de rendu (Angular)
        win.webContents.send('element-info', elementInfo);
      }).catch((err) => {
        console.error("Failed to get element info: ", err);
      });
    }
  });


  ipcMain.on('toogle-dev-tool', () => {
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  ipcMain.on('go-back', () => {
    view.webContents.navigationHistory.goBack();
  });

  ipcMain.handle('can-go-back', () => {
    return view.webContents.navigationHistory.canGoBack();
  });

  ipcMain.on('go-forward', () => {
    view.webContents.navigationHistory.goForward();
  });

  ipcMain.handle('can-go-forward', () => {
    return view.webContents.navigationHistory.canGoForward();
  });

  ipcMain.on('refresh', () => {
    view.webContents.reload();
  });

  ipcMain.handle('go-to-page', (event, url) => {
    return view.webContents.loadURL(url);
  });


  ipcMain.handle('current-url', () => {
    return view.webContents.getURL();
  });

  //Register events handling from the main windows
  win.once('ready-to-show', () => {
    fitViewToWin();
    view.webContents.loadURL('https://amiens.unilasalle.fr');
  });

  win.on('resized', () => {
    fitViewToWin();
  });
})
