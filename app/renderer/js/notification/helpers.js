"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusCurrentServer = exports.appId = void 0;
const electron_1 = require("electron");
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
// Do not change this
exports.appId = "org.zulip.zulip-electron";
const currentWindow = electron_1.remote.getCurrentWindow();
const webContents = electron_1.remote.getCurrentWebContents();
const webContentsId = webContents.id;
// This function will focus the server that sent
// the notification. Main function implemented in main.js
function focusCurrentServer() {
    typed_ipc_renderer_1.ipcRenderer.sendTo(currentWindow.webContents.id, "focus-webview-with-id", webContentsId);
}
exports.focusCurrentServer = focusCurrentServer;
