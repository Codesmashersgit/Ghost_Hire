import { app, BrowserWindow, session, desktopCapturer, globalShortcut, clipboard, Tray, Menu, nativeImage, shell } from 'electron';
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
    // Uncomment below line ONLY for debugging mic issues:
    // mainWindow.webContents.openDevTools();
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
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false, // Can't be focused, won't steal focus from exam
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Make it completely click-through so user can click their exam underneath
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

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
  const iconPath = path.join(__dirname, '../public/vite.svg');
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show GhostHire', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('GhostHire – AI Copilot (Running)');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow.show());
  } catch (e) {
    console.error('Tray icon failed:', e.message);
  }

  // ── Global Shortcut: Ctrl+Shift+X → Screenshot Solve ──────────────────────
  globalShortcut.register('CommandOrControl+Shift+X', async () => {
    console.log('[Shortcut] Screenshot capture triggered');
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      });
      if (sources.length > 0) {
        const dataURL = sources[0].thumbnail.toDataURL();
        shell.beep(); // First beep = capturing

        const token = await mainWindow.webContents.executeJavaScript(
          `localStorage.getItem('token') || ''`
        );

        const response = await fetch('http://localhost:5000/api/ai/solve-screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageBase64: dataURL })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.answer) {
            clipboard.writeText(result.answer);
            shell.beep(); // Second beep = answer ready in clipboard
            console.log('[Shortcut] Answer copied to clipboard');

            // Send answer to overlay and show it
            if (overlayWindow) {
              overlayWindow.webContents.send('show-answer', result.answer);
              overlayWindow.showInactive(); // Show without stealing focus
            }
          }
        }
      }
    } catch (err) {
      console.error('[Shortcut] Error:', err.message);
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
