"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToFrame = exports.send = exports.ipcMain = void 0;
const main_1 = require("electron/main");
exports.ipcMain = main_1.ipcMain;
function send(contents, channel, ...args) {
    contents.send(channel, ...args);
}
exports.send = send;
function sendToFrame(contents, frameId, channel, ...args) {
    contents.sendToFrame(frameId, channel, ...args);
}
exports.sendToFrame = sendToFrame;
