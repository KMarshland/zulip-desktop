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
exports.updateTaskbarIcon = exports.updateBadge = void 0;
const common_1 = require("electron/common");
const main_1 = require("electron/main");
const node_process_1 = __importDefault(require("node:process"));
const ConfigUtil = __importStar(require("../common/config-util"));
const typed_ipc_main_1 = require("./typed-ipc-main");
function showBadgeCount(messageCount, hasUnreads, mainWindow) {
    if (node_process_1.default.platform === "win32") {
        updateOverlayIcon(messageCount, mainWindow);
    }
    else {
        if (messageCount > 0 || !hasUnreads) {
            main_1.app.badgeCount = messageCount;
        }
        else {
            main_1.app.dock.setBadge('•');
        }
    }
}
function hideBadgeCount(mainWindow) {
    if (node_process_1.default.platform === "win32") {
        mainWindow.setOverlayIcon(null, "");
    }
    else {
        main_1.app.badgeCount = 0;
    }
}
function updateBadge(badgeCount, hasUnreads, mainWindow) {
    if (ConfigUtil.getConfigItem("badgeOption", true)) {
        showBadgeCount(badgeCount, hasUnreads, mainWindow);
    }
    else {
        hideBadgeCount(mainWindow);
    }
}
exports.updateBadge = updateBadge;
function updateOverlayIcon(messageCount, mainWindow) {
    if (!mainWindow.isFocused()) {
        mainWindow.flashFrame(ConfigUtil.getConfigItem("flashTaskbarOnMessage", true));
    }
    if (messageCount === 0) {
        mainWindow.setOverlayIcon(null, "");
    }
    else {
        (0, typed_ipc_main_1.send)(mainWindow.webContents, "render-taskbar-icon", messageCount);
    }
}
function updateTaskbarIcon(data, text, mainWindow) {
    const img = common_1.nativeImage.createFromDataURL(data);
    mainWindow.setOverlayIcon(img, text);
}
exports.updateTaskbarIcon = updateTaskbarIcon;
