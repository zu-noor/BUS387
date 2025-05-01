const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize the data store
const store = new Store();

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Event handler for when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// IPC handlers for data operations
ipcMain.on('save-note', (event, note) => {
  let notes = store.get('notes') || [];
  
  // If note has an id, update it, otherwise add it
  if (note.id) {
    const index = notes.findIndex(n => n.id === note.id);
    if (index !== -1) {
      notes[index] = note;
    } else {
      // If somehow we have an ID but can't find the note, just add it
      notes.push(note);
    }
  } else {
    // Generate a unique ID for the new note
    note.id = Date.now().toString();
    notes.push(note);
  }
  
  // Save to store and notify the renderer process
  store.set('notes', notes);
  event.reply('notes-updated', notes);
});

ipcMain.on('delete-note', (event, noteId) => {
  let notes = store.get('notes') || [];
  notes = notes.filter(note => note.id !== noteId);
  store.set('notes', notes);
  event.reply('notes-updated', notes);
});

ipcMain.on('get-notes', (event) => {
  const notes = store.get('notes') || [];
  event.reply('notes-loaded', notes);
});