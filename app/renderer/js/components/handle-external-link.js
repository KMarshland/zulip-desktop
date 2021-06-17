"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ConfigUtil = __importStar(require("../../../common/config-util"));
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
const LinkUtil = __importStar(require("../utils/link-util"));
const { shell, app } = electron_1.remote;
const dingSound = new Audio("../resources/sounds/ding.ogg");
function handleExternalLink(event) {
    event.preventDefault();
    const url = new URL(event.url);
    const downloadPath = ConfigUtil.getConfigItem("downloadsPath", `${app.getPath("downloads")}`);
    if (LinkUtil.isUploadsUrl(this.props.url, url)) {
        typed_ipc_renderer_1.ipcRenderer.send("downloadFile", url.href, downloadPath);
        typed_ipc_renderer_1.ipcRenderer.once("downloadFileCompleted", async (_event, filePath, fileName) => {
            const downloadNotification = new Notification("Download Complete", {
                body: `Click to show ${fileName} in folder`,
                silent: true, // We'll play our own sound - ding.ogg
            });
            downloadNotification.addEventListener("click", () => {
                // Reveal file in download folder
                shell.showItemInFolder(filePath);
            });
            typed_ipc_renderer_1.ipcRenderer.removeAllListeners("downloadFileFailed");
            // Play sound to indicate download complete
            if (!ConfigUtil.getConfigItem("silent", false)) {
                await dingSound.play();
            }
        });
        typed_ipc_renderer_1.ipcRenderer.once("downloadFileFailed", (_event, state) => {
            // Automatic download failed, so show save dialog prompt and download
            // through webview
            // Only do this if it is the automatic download, otherwise show an error (so we aren't showing two save
            // prompts right after each other)
            // Check that the download is not cancelled by user
            if (state !== "cancelled") {
                if (ConfigUtil.getConfigItem("promptDownload", false)) {
                    // We need to create a "new Notification" to display it, but just `Notification(...)` on its own
                    // doesn't work
                    // eslint-disable-next-line no-new
                    new Notification("Download Complete", {
                        body: "Download failed",
                    });
                }
                else {
                    this.$el.downloadURL(url.href);
                }
            }
            typed_ipc_renderer_1.ipcRenderer.removeAllListeners("downloadFileCompleted");
        });
    }
    else {
        (async () => LinkUtil.openBrowser(url))();
    }
}
exports.default = handleExternalLink;
