"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
function init($reconnectButton, $settingsButton) {
    $reconnectButton.addEventListener("click", () => {
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "reload-viewer");
    });
    $settingsButton.addEventListener("click", () => {
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "open-settings");
    });
}
exports.init = init;
