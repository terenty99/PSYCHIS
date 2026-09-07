const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');

// Enable hardware acceleration and seamless media/video playback
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-certificate-errors');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'PSYCHIS // Spatial Knowledge Engine',
    backgroundColor: '#F6F5F2',
    icon: path.join(__dirname, 'public', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      webviewTag: true,
      allowRunningInsecureContent: true,
    },
  });

  // Intercept new window popups and open external links in default OS browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent external link navigation from replacing the main PSYCHIS window
  // CRITICAL: Only intercept the main top-level window, allow iframes and video players to navigate
  win.webContents.on('will-navigate', (event, url) => {
    const isMain = event.isMainFrame !== false && (event.frame == null || event.frame === win.webContents.mainFrame);
    if (!isMain) {
      return; // Allow embedded browser frames to navigate freely
    }
    if (url !== win.webContents.getURL() && !url.startsWith('file://') && !url.includes('localhost:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Hotkey support: F5/Ctrl+R to reload without cache, F12 to inspect
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      win.webContents.reloadIgnoringCache();
    }
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      win.webContents.toggleDevTools();
    }
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(async () => {
  // Strip or spoof Referer to match target host so hotlink protections (Fandom, Wikia, DeviantArt, etc.) never block images
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const requestHeaders = { ...details.requestHeaders };
    const url = details.url;

    if (
      details.resourceType === 'image' ||
      /\.(jpe?g|png|webp|gif|svg|avif)($|\?)/i.test(url) ||
      /wikia\.nocookie|fandom|deviantart|pinimg|pinimg\.com|wikimedia|wp\.com/i.test(url)
    ) {
      try {
        const parsed = new URL(url);
        requestHeaders['Referer'] = `${parsed.protocol}//${parsed.host}/`;
        requestHeaders['Origin'] = `${parsed.protocol}//${parsed.host}`;
      } catch (_) {
        delete requestHeaders['Referer'];
      }
      delete requestHeaders['Sec-Fetch-Site'];
    }

    callback({ cancel: false, requestHeaders });
  });

  // Strip framing barriers and security restrictions across all header casings
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = {};
    for (const [key, value] of Object.entries(details.responseHeaders || {})) {
      const lower = key.toLowerCase();
      if (
        lower === 'x-frame-options' ||
        lower === 'content-security-policy' ||
        lower === 'frame-options' ||
        lower === 'cross-origin-opener-policy' ||
        lower === 'cross-origin-embedder-policy' ||
        lower === 'access-control-allow-origin'
      ) {
        continue;
      }
      responseHeaders[key] = value;
    }
    responseHeaders['access-control-allow-origin'] = ['*'];
    callback({ cancel: false, responseHeaders });
  });

  // Ensure webviews can navigate internally and have multimedia permissions
  app.on('web-contents-created', (event, contents) => {
    if (contents.getType() === 'webview') {
      contents.setWindowOpenHandler(({ url }) => {
        contents.loadURL(url);
        return { action: 'deny' };
      });
    }
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'fullscreen', 'autoplay', 'display-capture', 'clipboard-read', 'clipboard-write'];
    callback(allowed.includes(permission));
  });

  // Pre-seed Google & YouTube consent cookies to immediately bypass regional/EU consent barriers
  try {
    const consentCookies = [
      { url: 'https://www.youtube.com', name: 'SOCS', value: 'CAESEwgDEgk2OTQ0NTY1NDgaAmVuIAEaBgiA_LyaBg', domain: '.youtube.com' },
      { url: 'https://www.google.com', name: 'SOCS', value: 'CAESEwgDEgk2OTQ0NTY1NDgaAmVuIAEaBgiA_LyaBg', domain: '.google.com' },
      { url: 'https://www.youtube.com', name: 'CONSENT', value: 'YES+cb', domain: '.youtube.com' },
      { url: 'https://www.google.com', name: 'CONSENT', value: 'YES+cb', domain: '.google.com' },
    ];
    for (const c of consentCookies) {
      await session.defaultSession.cookies.set({
        url: c.url,
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: '/',
      });
    }
  } catch (cookieErr) {
    console.warn('Consent cookie configuration notice:', cookieErr);
  }

  // Ensure disk and HTTP cache is cleared so newly built dist files take effect immediately
  try {
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData({
      storages: ['serviceworkers', 'cachestorage', 'shadercache'],
    });
  } catch (err) {
    console.warn('Cache clear notice:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
