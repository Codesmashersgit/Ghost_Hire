import { app, BrowserWindow, session, desktopCapturer, globalShortcut, clipboard, Tray, Menu, nativeImage, shell, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

// Removed ESM __dirname as we use app.getAppPath()

// standard console is fine

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let overlayWindow = null;
let micOverlayWindow = null;
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
    skipTaskbar: true, // STEALTH: Hide from taskbar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      sandbox: false,
      webSecurity: false, // Allow cross-origin media requests
      allowRunningInsecureContent: true,
    }
  });

  // STEALTH: Prevent window from appearing in screenshots, screen shares, and OBS
  mainWindow.setContentProtection(true);

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
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
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
    width: 600,           // Larger width
    height: 800,          // Larger height
    x: 10,
    y: 80,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false, // Prevents stealing focus from the exam
    show: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Keep aggressively on top for the main overlay as well
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  // CRITICAL: Invisible to Zoom/Meet screen share, OBS, screen recording
  // Only visible on your physical monitor — interviewer sees nothing!
  overlayWindow.setContentProtection(true);

  // Allow clicking on the overlay (so they can drag, resize, and click copy buttons)
  // overlayWindow.setIgnoreMouseEvents(true, { forward: true }); // REMOVED

  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173/#/overlay');
  } else {
    overlayWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'), { hash: 'overlay' });
  }
}

function createMicOverlayWindow() {
  micOverlayWindow = new BrowserWindow({
    width: 600,
    height: 800,
    x: 200,
    y: 80,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false, // Prevents stealing focus from Internshala
    show: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Keep it aggressively on top of even full-screen lock browsers
  micOverlayWindow.setAlwaysOnTop(true, 'screen-saver');

  micOverlayWindow.setContentProtection(true);

  if (isDev) {
    micOverlayWindow.loadURL('http://localhost:5173/#/mic-overlay');
  } else {
    micOverlayWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'), { hash: 'mic-overlay' });
  }
}


app.whenReady().then(() => {
  createWindow();
  createOverlayWindow();
  createMicOverlayWindow();

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

  const showInOverlay = (text, label) => {
    const isStreaming = label && label.includes('Streaming');
    
    if (!isStreaming) {
      clipboard.writeText(text);
      shell.beep();
    }
    
    if (overlayWindow) {
      overlayWindow.webContents.send('show-answer', text, label);
      if (!isStreaming && (!micOverlayWindow || !micOverlayWindow.isVisible())) {
        overlayWindow.showInactive();
      }
    }
    if (micOverlayWindow) {
      micOverlayWindow.webContents.send('show-mic-answer', text);
      if (!isStreaming && !micOverlayWindow.isVisible()) {
        micOverlayWindow.showInactive();
      }
    }
    if (!isStreaming) {
      console.log(`[Shortcut] ${label} shown in overlay`);
    }
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
      const response = await fetch('http://localhost:5000/api/ai/get-code', {
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
      const response = await fetch('http://localhost:5000/api/ai/quick-explain', {
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
      const response = await fetch('http://localhost:5000/api/ai/get-code', {
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

  // ── Global Shortcut: Ctrl+Shift+M → Toggle Mic Overlay ────────────────────
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (micOverlayWindow) {
      if (micOverlayWindow.isVisible()) {
        micOverlayWindow.hide();
      } else {
        micOverlayWindow.showInactive();
      }
    }
  });

  // ── Mic IPC handling ──────────────────────────────────────────────────────
  let currentMicStatus = false;
  
  ipcMain.on('toggle-mic-from-overlay', (event, status) => {
    currentMicStatus = status;
    if (mainWindow) {
      mainWindow.webContents.send('toggle-mic', status);
    }
  });

  ipcMain.on('send-manual-message', (event, text) => {
    if (mainWindow) {
      mainWindow.webContents.send('manual-message-from-overlay', text);
    }
  });

  ipcMain.on('broadcast-live-transcript', (event, text) => {
    if (micOverlayWindow) {
      micOverlayWindow.webContents.send('live-transcript', text);
    }
  });

  ipcMain.on('sync-mic-status-from-main', (event, status) => {
    currentMicStatus = status;
    if (micOverlayWindow) {
      micOverlayWindow.webContents.send('sync-mic-status', status);
    }
    if (overlayWindow) {
      overlayWindow.webContents.send('sync-mic-status', status);
    }
  });

  ipcMain.on('get-mic-status', (event) => {
    event.reply('sync-mic-status', currentMicStatus);
  });

  ipcMain.on('show-answer-in-overlay', (event, text, label) => {
    showInOverlay(text, label || 'Audio Answer');
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Keep running in tray — do NOT quit
});
