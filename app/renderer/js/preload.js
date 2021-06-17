"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("electron/renderer");
const node_fs_1 = __importDefault(require("node:fs"));
const electron_bridge_1 = __importStar(require("./electron-bridge"));
const NetworkError = __importStar(require("./pages/network"));
const typed_ipc_renderer_1 = require("./typed-ipc-renderer");
renderer_1.contextBridge.exposeInMainWorld("raw_electron_bridge", electron_bridge_1.default);
typed_ipc_renderer_1.ipcRenderer.on("logout", () => {
    if (electron_bridge_1.bridgeEvents.emit("logout")) {
        return;
    }
    // Create the menu for the below
    const dropdown = document.querySelector(".dropdown-toggle");
    dropdown.click();
    const nodes = document.querySelectorAll(".dropdown-menu li:last-child a");
    nodes[nodes.length - 1].click();
});
typed_ipc_renderer_1.ipcRenderer.on("show-keyboard-shortcuts", () => {
    if (electron_bridge_1.bridgeEvents.emit("show-keyboard-shortcuts")) {
        return;
    }
    // Create the menu for the below
    const node = document.querySelector("a[data-overlay-trigger=keyboard-shortcuts]");
    // Additional check
    if (node.textContent.trim().toLowerCase() === "keyboard shortcuts (?)") {
        node.click();
    }
    else {
        // Atleast click the dropdown
        const dropdown = document.querySelector(".dropdown-toggle");
        dropdown.click();
    }
});
typed_ipc_renderer_1.ipcRenderer.on("show-notification-settings", () => {
    if (electron_bridge_1.bridgeEvents.emit("show-notification-settings")) {
        return;
    }
    // Create the menu for the below
    const dropdown = document.querySelector(".dropdown-toggle");
    dropdown.click();
    const nodes = document.querySelectorAll(".dropdown-menu li a");
    nodes[2].click();
    const notificationItem = document.querySelectorAll(".normal-settings-list li div");
    // Wait until the notification dom element shows up
    setTimeout(() => {
        notificationItem[2].click();
    }, 100);
});
window.addEventListener("load", () => {
    if (!location.href.includes("app/renderer/network.html")) {
        return;
    }
    const $reconnectButton = document.querySelector("#reconnect");
    const $settingsButton = document.querySelector("#settings");
    NetworkError.init($reconnectButton, $settingsButton);
});
(async () => renderer_1.webFrame.executeJavaScript(node_fs_1.default.readFileSync(require.resolve("./injected"), "utf8")))();
