"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgent = exports.connectivityError = void 0;
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
exports.connectivityError = [
    "ERR_INTERNET_DISCONNECTED",
    "ERR_PROXY_CONNECTION_FAILED",
    "ERR_CONNECTION_RESET",
    "ERR_NOT_CONNECTED",
    "ERR_NAME_NOT_RESOLVED",
    "ERR_NETWORK_CHANGED",
];
const userAgent = typed_ipc_renderer_1.ipcRenderer.sendSync("fetch-user-agent");
function getUserAgent() {
    return userAgent;
}
exports.getUserAgent = getUserAgent;
