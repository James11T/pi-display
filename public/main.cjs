const path = require("path");
const { app, BrowserWindow } = require("electron");
const { createAuthWindow } = require("./auth.cjs");

require("@electron/remote/main").initialize();

const createWindow = () => {
  console.log("Create window");

  const mainWindow = new BrowserWindow({
    width: 1480,
    height: 320,
    frame: false,
    // fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.setMenu(null);

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../static/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
  }
};

app.on("ready", () => {
  createWindow();
  createAuthWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
