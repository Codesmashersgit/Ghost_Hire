import { app, BrowserWindow, session, desktopCapturer, globalShortcut, clipboard, Tray, Menu, nativeImage, shell, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let overlayWindow = null;
let tray = null;
let isQuitting = false;

// ── CRITICAL: Set these flags BEFORE app is ready ──────────────────────────
// Allow screen/audio capture without extra OS prompts
app.commandLine.appendSwitch('enable-usermedia-screen-capturing');
app.commandLine.appendSwitch('allow-http-screen-capture');
// Fix GPU Cache access denied errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
// DO NOT use 'use-fake-ui-for-media-stream' — it causes video_frame_pool errors

// ── Set up permissions on defaultSession BEFORE window is created ──────────
// This must be done before createWindow() so no permission requests are missed
app.on('ready', () => {
  // Auto-approve ALL permission requests (mic, camera, screen, audio)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    console.log(`[Permission Request] ${permission}`, details?.mediaTypes || '');
    callback(true); // Always approve
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    console.log(`[Permission Check] ${permission}`);
    return true; // Always grant
  });

  // Handle getDisplayMedia → system loopback audio for Earbuds Mode
  // We pass audio:'loopback' only — no video to avoid video_frame_pool errors
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      const screenSource = sources[0];
      if (screenSource) {
        // Provide video source (required by API) but we stop the video track in renderer
        callback({ video: screenSource, audio: 'loopback' });
      } else {
        callback({});
      }
    }).catch((err) => {
      console.error('Error fetching display sources:', err);
      callback({});
    });
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    show: false, // Don't show until ready to prevent flash
    skipTaskbar: false, // Show in taskbar so user knows it opened (disguised as Windows Audio Service)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      sandbox: false,
      webSecurity: false, // Allow cross-origin media requests
      allowRunningInsecureContent: true,
    }
  });

  // Re-apply permission handlers specifically to THIS window's session too
  // (in case the window uses a different partition)
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
    console.log(`[Window Permission] ${permission}`, details?.mediaTypes || '');
    callback(true);
  });

  mainWindow.webContents.session.setPermissionCheckHandler(() => true);

  // Inject getUserMedia override BEFORE page loads
  // This forces Electron renderer to always resolve getUserMedia successfully
  mainWindow.webContents.on('did-start-loading', () => {
    mainWindow.webContents.executeJavaScript(`
      // Override permissions query so 'microphone' always returns 'granted'
      if (navigator.permissions && navigator.permissions.query) {
        const originalQuery = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = (parameters) => {
          if (parameters.name === 'microphone' || parameters.name === 'camera' || parameters.name === 'notifications') {
            return Promise.resolve({ state: 'granted', onchange: null });
          }
          return originalQuery(parameters);
        };
      }
    `).catch(() => {}); // Ignore errors if page not ready yet
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when fully loaded (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // mainWindow.webContents.openDevTools(); // Uncomment only for debugging
  });

  // Prevent closing — just hide to system tray
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 480,           // Compact width — fits on side without blocking exam
    height: 700,          // Tall enough to show full answer
    x: 10,               // Left side of screen
    y: 80,               // Small gap from top
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,     // Won't steal focus from exam
    show: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // CRITICAL: Invisible to Zoom/Meet screen share, OBS, screen recording
  // Only visible on your physical monitor — interviewer sees nothing!
  overlayWindow.setContentProtection(true);

  // Allow clicking on the overlay (so they can drag, resize, and click copy buttons)
  // overlayWindow.setIgnoreMouseEvents(true, { forward: true }); // REMOVED

  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173/#/overlay');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'overlay' });
  }
}


app.whenReady().then(() => {
  createWindow();
  createOverlayWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });

  // ── System Tray Setup ──────────────────────────────────────────────────────
  // Use a base64 icon (a simple dot/gear) so it NEVER fails in production due to missing paths
  const base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  try {
    tray = new Tray(nativeImage.createFromDataURL(base64Icon));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Windows Audio Service (Running)', enabled: false },
      { label: 'Show Dashboard', click: () => { mainWindow.show(); mainWindow.focus(); } },
      { type: 'separator' },
      { label: 'Stop Service', click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('Windows Audio Service');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
  } catch (e) {
    console.error('Tray icon failed:', e.message);
  }

  // Store last screenshot for reuse in get-code shortcut
  let lastScreenshot = null;

  // Helper: get token from mainWindow localStorage
  const getToken = async () => {
    try {
      return await mainWindow.webContents.executeJavaScript(`localStorage.getItem('token') || ''`);
    } catch { return ''; }
  };

  // Helper: show answer in overlay + copy to clipboard
  const showInOverlay = (text, label) => {
    clipboard.writeText(text);
    shell.beep();
    if (overlayWindow) {
      overlayWindow.webContents.send('show-answer', text, label);
      overlayWindow.showInactive();
    }
    console.log(`[Shortcut] ${label} shown in overlay`);
  };

  // Listen for GET CODE click from the overlay
  ipcMain.on('request-code', async () => {
    console.log('[IPC] Get Code button clicked from overlay');
    try {
      if (!lastScreenshot) {
        const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
        if (!sources.length) return;
        lastScreenshot = sources[0].thumbnail.toDataURL();
      }
      shell.beep(); // Beep = fetching code
      const token = await getToken();
      const response = await fetch('https://ghosthire-backend.onrender.com/api/ai/get-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: lastScreenshot })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.answer) {
          showInOverlay(result.answer, 'Code');
        } else {
          showInOverlay('Error: ' + (result.message || 'Failed to get code'), 'Error');
        }
      } else {
        let errMsg = `Backend returned ${response.status}`;
        try { const errRes = await response.json(); if (errRes.message) errMsg = errRes.message; } catch(e){}
        showInOverlay(`Error: ${errMsg}`, 'Error');
      }
    } catch (err) {
      showInOverlay('Error: ' + err.message, 'Error');
    }
  });

  // ── Ctrl+Shift+X → THEORY ONLY (fast, no code) ────────────────────────────
  globalShortcut.register('CommandOrControl+Shift+X', async () => {
    console.log('[Shortcut] Quick Explain triggered');
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
      if (!sources.length) return;

      lastScreenshot = sources[0].thumbnail.toDataURL(); // Save for Ctrl+Shift+C
      shell.beep(); // Beep 1 = capturing

      const token = await getToken();
      const response = await fetch('https://ghosthire-backend.onrender.com/api/ai/quick-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: lastScreenshot })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.answer) {
          showInOverlay(result.answer, 'Theory');
        } else {
          showInOverlay('Error: ' + (result.message || 'Failed to get answer'), 'Error');
        }
      } else {
        let errMsg = `Backend returned ${response.status}`;
        try { const errRes = await response.json(); if (errRes.message) errMsg = errRes.message; } catch(e){}
        showInOverlay(`Error: ${errMsg}`, 'Error');
        console.error('[Shortcut] quick-explain failed:', response.status);
      }
    } catch (err) {
      showInOverlay('Error: ' + err.message, 'Error');
      console.error('[Shortcut] Ctrl+Shift+X Error:', err.message);
    }
  });

  // ── Ctrl+Shift+C → CODE ONLY (uses last screenshot) ───────────────────────
  globalShortcut.register('CommandOrControl+Shift+C', async () => {
    console.log('[Shortcut] Get Code triggered');
    try {
      // If no previous screenshot, capture fresh one
      if (!lastScreenshot) {
        const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
        if (!sources.length) return;
        lastScreenshot = sources[0].thumbnail.toDataURL();
      }
      shell.beep(); // Beep = fetching code

      const token = await getToken();
      const response = await fetch('https://ghosthire-backend.onrender.com/api/ai/get-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: lastScreenshot })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.answer) {
          showInOverlay(result.answer, 'Code');
        } else {
          showInOverlay('Error: ' + (result.message || 'Failed to get code'), 'Error');
        }
      } else {
        showInOverlay(`Error: Backend returned ${response.status}. Please make sure you are logged in!`, 'Error');
        console.error('[Shortcut] get-code failed:', response.status);
      }
    } catch (err) {
      showInOverlay('Error: ' + err.message, 'Error');
      console.error('[Shortcut] Ctrl+Shift+C Error:', err.message);
    }
  });


  // ── Global Shortcut: Ctrl+Shift+Z → Hide Overlay ─────────────────────────
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    console.log('[Shortcut] Hide overlay triggered');
    if (overlayWindow && overlayWindow.isVisible()) {
      overlayWindow.hide();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Keep running in tray — do NOT quit
});
