import { app, BrowserWindow, session, desktopCapturer, globalShortcut, clipboard, Tray, Menu, nativeImage, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      sandbox: false
    }
  });

  // Note: Removed setContentProtection(true) as it interferes with microphone access
  // If needed, can be re-enabled for specific scenarios only

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Prevent closing, just hide
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Enable DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Automatically approve permission requests (specifically microphone/audio access)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('Permission requested:', permission);
    const allowedPermissions = ['media', 'audioCapture', 'display-capture', 'videoCapture', 'desktopVideoCapture', 'microphone'];
    if (allowedPermissions.includes(permission)) {
      console.log('✅ Approving permission:', permission);
      callback(true); // Approve microphone and screen access
    } else {
      console.log('⚠️ Approving other permission:', permission);
      callback(true); // Approve other permissions by default for this app
    }
  });
  
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    console.log('Permission check:', permission);
    return true; // Auto-allow check for all permissions
  });

  // Handle getDisplayMedia for System/Tab Audio capture
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      // Pick the first screen to share its audio (loopback audio capture)
      const screenSource = sources.find(s => s.id.startsWith('screen')) || sources[0];
      callback({ video: screenSource, audio: 'loopback' });
    }).catch((err) => {
      console.error('Error fetching sources:', err);
      callback();
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });

  // Setup System Tray
  const iconPath = path.join(__dirname, '../public/vite.svg'); // Fallback icon
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => mainWindow.show() },
      { label: 'Quit', click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setToolTip('GhostHire Copilot');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow.show());
  } catch(e) {
    console.error('Failed to create tray icon', e);
  }

  // Register Global Shortcut
  globalShortcut.register('CommandOrControl+Shift+X', async () => {
    console.log('Shortcut triggered. Capturing screen...');
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
      if (sources.length > 0) {
        const screenSource = sources[0];
        const dataURL = screenSource.thumbnail.toDataURL(); // base64
        
        // Add a small beep or subtle sound by shell beep (Windows only)
        shell.beep();
        
        const response = await fetch('http://localhost:5000/api/ai/solve-screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataURL })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.answer) {
            clipboard.writeText(result.answer);
            console.log('Answer copied to clipboard!');
            shell.beep(); // Second beep indicates success
          }
        }
      }
    } catch (err) {
      console.error('Error capturing screen or solving:', err);
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Do nothing, let it run in background tray
});
