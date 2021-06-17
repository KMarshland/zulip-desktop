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
exports.initializeTray = void 0;
const common_1 = require("electron/common");
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const remote_1 = require("@electron/remote");
const ConfigUtil = __importStar(require("../../common/config-util"));
const typed_ipc_renderer_1 = require("./typed-ipc-renderer");
let tray = null;
const iconDir = "../../resources/tray";
const traySuffix = "tray";
const appIcon = node_path_1.default.join(__dirname, iconDir, traySuffix);
const iconPath = () => {
    if (node_process_1.default.platform === "linux") {
        return appIcon + "linux.png";
    }
    return (appIcon + (node_process_1.default.platform === "win32" ? "win.ico" : "macOSTemplate.png"));
};
const winUnreadTrayIconPath = () => appIcon + "unread.ico";
let unread = 0;
const trayIconSize = () => {
    switch (node_process_1.default.platform) {
        case "darwin":
            return 20;
        case "win32":
            return 100;
        case "linux":
            return 100;
        default:
            return 80;
    }
};
//  Default config for Icon we might make it OS specific if needed like the size
const config = {
    pixelRatio: window.devicePixelRatio,
    unreadCount: 0,
    showUnreadCount: true,
    unreadColor: "#000000",
    readColor: "#000000",
    unreadBackgroundColor: "#B9FEEA",
    readBackgroundColor: "#B9FEEA",
    size: trayIconSize(),
    thick: node_process_1.default.platform === "win32",
};
const renderCanvas = function (arg) {
    config.unreadCount = arg;
    const size = config.size * config.pixelRatio;
    const padding = size * 0.05;
    const center = size / 2;
    const hasCount = config.showUnreadCount && config.unreadCount;
    const color = config.unreadCount ? config.unreadColor : config.readColor;
    const backgroundColor = config.unreadCount
        ? config.unreadBackgroundColor
        : config.readBackgroundColor;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    // Circle
    // If (!config.thick || config.thick && hasCount) {
    ctx.beginPath();
    ctx.arc(center, center, size / 2 - padding, 0, 2 * Math.PI, false);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.lineWidth = size / (config.thick ? 10 : 20);
    ctx.strokeStyle = backgroundColor;
    ctx.stroke();
    // Count or Icon
    if (hasCount) {
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        if (config.unreadCount > 99) {
            ctx.font = `${config.thick ? "bold " : ""}${size * 0.4}px Helvetica`;
            ctx.fillText("99+", center, center + size * 0.15);
        }
        else if (config.unreadCount < 10) {
            ctx.font = `${config.thick ? "bold " : ""}${size * 0.5}px Helvetica`;
            ctx.fillText(String(config.unreadCount), center, center + size * 0.2);
        }
        else {
            ctx.font = `${config.thick ? "bold " : ""}${size * 0.5}px Helvetica`;
            ctx.fillText(String(config.unreadCount), center, center + size * 0.15);
        }
    }
    return canvas;
};
/**
 * Renders the tray icon as a native image
 * @param arg: Unread count
 * @return the native image
 */
const renderNativeImage = function (arg) {
    if (node_process_1.default.platform === "win32") {
        return common_1.nativeImage.createFromPath(winUnreadTrayIconPath());
    }
    const canvas = renderCanvas(arg);
    const pngData = common_1.nativeImage
        .createFromDataURL(canvas.toDataURL("image/png"))
        .toPNG();
    return common_1.nativeImage.createFromBuffer(pngData, {
        scaleFactor: config.pixelRatio,
    });
};
function sendAction(channel, ...args) {
    const win = remote_1.BrowserWindow.getAllWindows()[0];
    if (node_process_1.default.platform === "darwin") {
        win.restore();
    }
    typed_ipc_renderer_1.ipcRenderer.sendTo(win.webContents.id, channel, ...args);
}
const createTray = function () {
    const contextMenu = remote_1.Menu.buildFromTemplate([
        {
            label: "Zulip",
            click() {
                typed_ipc_renderer_1.ipcRenderer.send("focus-app");
            },
        },
        {
            label: "Settings",
            click() {
                typed_ipc_renderer_1.ipcRenderer.send("focus-app");
                sendAction("open-settings");
            },
        },
        {
            type: "separator",
        },
        {
            label: "Quit",
            click() {
                typed_ipc_renderer_1.ipcRenderer.send("quit-app");
            },
        },
    ]);
    tray = new remote_1.Tray(iconPath());
    tray.setContextMenu(contextMenu);
    if (node_process_1.default.platform === "linux" || node_process_1.default.platform === "win32") {
        tray.on("click", () => {
            typed_ipc_renderer_1.ipcRenderer.send("toggle-app");
        });
    }
};
function initializeTray(serverManagerView) {
    typed_ipc_renderer_1.ipcRenderer.on("destroytray", (_event) => {
        if (!tray) {
            return;
        }
        tray.destroy();
        if (tray.isDestroyed()) {
            tray = null;
        }
        else {
            throw new Error("Tray icon not properly destroyed.");
        }
    });
    typed_ipc_renderer_1.ipcRenderer.on("tray", (_event, arg) => {
        if (!tray) {
            return;
        }
        // We don't want to create tray from unread messages on macOS since it already has dock badges.
        if (node_process_1.default.platform === "linux" || node_process_1.default.platform === "win32") {
            if (arg === 0) {
                unread = arg;
                tray.setImage(iconPath());
                tray.setToolTip("No unread messages");
            }
            else {
                unread = arg;
                const image = renderNativeImage(arg);
                tray.setImage(image);
                tray.setToolTip(`${arg} unread messages`);
            }
        }
    });
    function toggleTray() {
        let state;
        if (tray) {
            state = false;
            tray.destroy();
            if (tray.isDestroyed()) {
                tray = null;
            }
            ConfigUtil.setConfigItem("trayIcon", false);
        }
        else {
            state = true;
            createTray();
            if (node_process_1.default.platform === "linux" || node_process_1.default.platform === "win32") {
                const image = renderNativeImage(unread);
                tray.setImage(image);
                tray.setToolTip(`${unread} unread messages`);
            }
            ConfigUtil.setConfigItem("trayIcon", true);
        }
        serverManagerView.preferenceView?.handleToggleTray(state);
    }
    typed_ipc_renderer_1.ipcRenderer.on("toggletray", toggleTray);
    if (ConfigUtil.getConfigItem("trayIcon", true)) {
        createTray();
    }
}
exports.initializeTray = initializeTray;
