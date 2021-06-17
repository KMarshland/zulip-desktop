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
exports.appUpdater = exports.shouldQuitForUpdate = void 0;
const common_1 = require("electron/common");
const main_1 = require("electron/main");
const node_process_1 = __importDefault(require("node:process"));
const electron_log_1 = __importDefault(require("electron-log"));
const electron_updater_1 = require("electron-updater");
const ConfigUtil = __importStar(require("../common/config-util"));
const linuxupdater_1 = require("./linuxupdater"); // Required only in case of linux
let quitting = false;
function shouldQuitForUpdate() {
    return quitting;
}
exports.shouldQuitForUpdate = shouldQuitForUpdate;
async function appUpdater(updateFromMenu = false) {
    // Don't initiate auto-updates in development
    if (!main_1.app.isPackaged) {
        return;
    }
    if (node_process_1.default.platform === "linux" && !node_process_1.default.env.APPIMAGE) {
        const ses = main_1.session.fromPartition("persist:webviewsession");
        await (0, linuxupdater_1.linuxUpdateNotification)(ses);
        return;
    }
    let updateAvailable = false;
    // Log whats happening
    electron_log_1.default.transports.file.fileName = "updates.log";
    electron_log_1.default.transports.file.level = "info";
    electron_updater_1.autoUpdater.logger = electron_log_1.default;
    // Handle auto updates for beta/pre releases
    const isBetaUpdate = ConfigUtil.getConfigItem("betaUpdate", false);
    electron_updater_1.autoUpdater.allowPrerelease = isBetaUpdate;
    const eventsListenerRemove = ["update-available", "update-not-available"];
    electron_updater_1.autoUpdater.on("update-available", async (info) => {
        if (updateFromMenu) {
            updateAvailable = true;
            // This is to prevent removal of 'update-downloaded' and 'error' event listener.
            for (const event of eventsListenerRemove) {
                electron_updater_1.autoUpdater.removeAllListeners(event);
            }
            await main_1.dialog.showMessageBox({
                message: `A new version ${info.version}, of Zulip Desktop is available`,
                detail: "The update will be downloaded in the background. You will be notified when it is ready to be installed.",
            });
        }
    });
    electron_updater_1.autoUpdater.on("update-not-available", async () => {
        if (updateFromMenu) {
            // Remove all autoUpdator listeners so that next time autoUpdator is manually called these
            // listeners don't trigger multiple times.
            electron_updater_1.autoUpdater.removeAllListeners();
            await main_1.dialog.showMessageBox({
                message: "No updates available",
                detail: `You are running the latest version of Zulip Desktop.\nVersion: ${main_1.app.getVersion()}`,
            });
        }
    });
    electron_updater_1.autoUpdater.on("error", async (error) => {
        if (updateFromMenu) {
            // Remove all autoUpdator listeners so that next time autoUpdator is manually called these
            // listeners don't trigger multiple times.
            electron_updater_1.autoUpdater.removeAllListeners();
            const messageText = updateAvailable
                ? "Unable to download the updates"
                : "Unable to check for updates";
            const { response } = await main_1.dialog.showMessageBox({
                type: "error",
                buttons: ["Manual Download", "Cancel"],
                message: messageText,
                detail: `Error: ${error.message}

The latest version of Zulip Desktop is available at -
https://zulip.com/apps/.
Current Version: ${main_1.app.getVersion()}`,
            });
            if (response === 0) {
                await common_1.shell.openExternal("https://zulip.com/apps/");
            }
        }
    });
    // Ask the user if update is available
    electron_updater_1.autoUpdater.on("update-downloaded", async (event) => {
        // Ask user to update the app
        const { response } = await main_1.dialog.showMessageBox({
            type: "question",
            buttons: ["Install and Relaunch", "Install Later"],
            defaultId: 0,
            message: `A new update ${event.version} has been downloaded`,
            detail: "It will be installed the next time you restart the application",
        });
        if (response === 0) {
            quitting = true;
            electron_updater_1.autoUpdater.quitAndInstall();
        }
    });
    // Init for updates
    await electron_updater_1.autoUpdater.checkForUpdates();
}
exports.appUpdater = appUpdater;
