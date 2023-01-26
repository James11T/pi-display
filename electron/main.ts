import path from "path";
import { app, BrowserWindow, WebPreferences } from "electron";
import { createAuthWindow, loadTokens } from "./auth";
import remote from "@electron/remote/main";

remote.initialize();

const createWindow = () => {
  console.log("Create window");

  const mainWindow = new BrowserWindow({
    width: 1480,
    height: 320,
    // frame: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    } as WebPreferences,
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
  const tokens = loadTokens();
  if (tokens) {
  } else {
  }
  createAuthWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
