"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgeEvents = void 0;
const node_events_1 = require("node:events");
const clipboard_decrypter_1 = require("./clipboard-decrypter");
const notification_1 = require("./notification");
const typed_ipc_renderer_1 = require("./typed-ipc-renderer");
let notificationReplySupported = false;
// Indicates if the user is idle or not
let idle = false;
// Indicates the time at which user was last active
let lastActive = Date.now();
exports.bridgeEvents = new node_events_1.EventEmitter();
/* eslint-disable @typescript-eslint/naming-convention */
const electron_bridge = {
    send_event: (eventName, ...args) => exports.bridgeEvents.emit(eventName, ...args),
    on_event(eventName, listener) {
        exports.bridgeEvents.on(eventName, listener);
    },
    new_notification: (title, options, dispatch) => (0, notification_1.newNotification)(title, options, dispatch),
    get_idle_on_system: () => idle,
    get_last_active_on_system: () => lastActive,
    get_send_notification_reply_message_supported: () => notificationReplySupported,
    set_send_notification_reply_message_supported(value) {
        notificationReplySupported = value;
    },
    decrypt_clipboard: (version) => new clipboard_decrypter_1.ClipboardDecrypterImpl(version),
};
/* eslint-enable @typescript-eslint/naming-convention */
exports.bridgeEvents.on("total_unread_count", (unreadCount) => {
    if (typeof unreadCount !== "number") {
        throw new TypeError("Expected string for unreadCount");
    }
    typed_ipc_renderer_1.ipcRenderer.send("unread-count", unreadCount);
});
exports.bridgeEvents.on("realm_name", (realmName) => {
    if (typeof realmName !== "string") {
        throw new TypeError("Expected string for realmName");
    }
    const serverUrl = location.origin;
    typed_ipc_renderer_1.ipcRenderer.send("realm-name-changed", serverUrl, realmName);
});
exports.bridgeEvents.on("realm_icon_url", (iconUrl) => {
    if (typeof iconUrl !== "string") {
        throw new TypeError("Expected string for iconUrl");
    }
    const serverUrl = location.origin;
    typed_ipc_renderer_1.ipcRenderer.send("realm-icon-changed", serverUrl, iconUrl.includes("http") ? iconUrl : `${serverUrl}${iconUrl}`);
});
// Set user as active and update the time of last activity
typed_ipc_renderer_1.ipcRenderer.on("set-active", () => {
    idle = false;
    lastActive = Date.now();
});
// Set user as idle and time of last activity is left unchanged
typed_ipc_renderer_1.ipcRenderer.on("set-idle", () => {
    idle = true;
});
// This follows node's idiomatic implementation of event
// emitters to make event handling more simpler instead of using
// functions zulip side will emit event using ElectronBrigde.send_event
// which is alias of .emit and on this side we can handle the data by adding
// a listener for the event.
exports.default = electron_bridge;
