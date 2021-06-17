"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newNotification = void 0;
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
function newNotification(title, options, dispatch) {
    const notification = new Notification(title, { ...options, silent: true });
    for (const type of ["click", "close", "error", "show"]) {
        notification.addEventListener(type, (ev) => {
            if (type === "click")
                typed_ipc_renderer_1.ipcRenderer.send("focus-this-webview");
            if (!dispatch(type, ev)) {
                ev.preventDefault();
            }
        });
    }
    return {
        close() {
            notification.close();
        },
        title: notification.title,
        dir: notification.dir,
        lang: notification.lang,
        body: notification.body,
        tag: notification.tag,
        icon: notification.icon,
        data: notification.data,
    };
}
exports.newNotification = newNotification;
