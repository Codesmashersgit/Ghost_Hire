import { app, BrowserWindow, session, desktopCapturer } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // VERY IMPORTANT: Makes the window invisible to screen capture (OBS, Zoom, MS Teams, etc.)
  mainWindow.setContentProtection(true);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // Automatically approve permission requests (specifically microphone/audio access)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'audioCapture', 'display-capture', 'videoCapture', 'desktopVideoCapture'];
    if (allowedPermissions.includes(permission)) {
      callback(true); // Approve microphone and screen access
    } else {
      callback(true); // Approve other permissions by default for this app
    }
  });
  
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
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
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
