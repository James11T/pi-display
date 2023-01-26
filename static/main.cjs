const path = require("path");
const { app, BrowserWindow } = require("electron");
require("@electron/remote/main").initialize();

const createWindow = () => {
  console.log("Create window");

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
  }
};

app.on("ready", () => createWindow());

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
