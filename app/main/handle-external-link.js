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
const common_1 = require("electron/common");
const main_1 = require("electron/main");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ConfigUtil = __importStar(require("../common/config-util"));
const LinkUtil = __importStar(require("../common/link-util"));
const typed_ipc_main_1 = require("./typed-ipc-main");
function isUploadsUrl(server, url) {
    return url.origin === server && url.pathname.startsWith("/user_uploads/");
}
function downloadFile({ contents, url, downloadPath, completed, failed, }) {
    contents.downloadURL(url);
    contents.session.once("will-download", async (_event, item) => {
        if (ConfigUtil.getConfigItem("promptDownload", false)) {
            const showDialogOptions = {
                defaultPath: node_path_1.default.join(downloadPath, item.getFilename()),
            };
            item.setSaveDialogOptions(showDialogOptions);
        }
        else {
            const getTimeStamp = () => {
                const date = new Date();
                return date.getTime();
            };
            const formatFile = (filePath) => {
                const fileExtension = node_path_1.default.extname(filePath);
                const baseName = node_path_1.default.basename(filePath, fileExtension);
                return `${baseName}-${getTimeStamp()}${fileExtension}`;
            };
            const filePath = node_path_1.default.join(downloadPath, item.getFilename());
            // Update the name and path of the file if it already exists
            const updatedFilePath = node_path_1.default.join(downloadPath, formatFile(filePath));
            const setFilePath = node_fs_1.default.existsSync(filePath)
                ? updatedFilePath
                : filePath;
            item.setSavePath(setFilePath);
        }
        const updatedListener = (_event, state) => {
            switch (state) {
                case "interrupted": {
                    // Can interrupted to due to network error, cancel download then
                    console.log("Download interrupted, cancelling and fallback to dialog download.");
                    item.cancel();
                    break;
                }
                case "progressing": {
                    if (item.isPaused()) {
                        item.cancel();
                    }
                    // This event can also be used to show progress in percentage in future.
                    break;
                }
                default: {
                    console.info("Unknown updated state of download item");
                }
            }
        };
        item.on("updated", updatedListener);
        item.once("done", async (_event, state) => {
            if (state === "completed") {
                await completed(item.getSavePath(), node_path_1.default.basename(item.getSavePath()));
            }
            else {
                console.log("Download failed state:", state);
                failed(state);
            }
            // To stop item for listening to updated events of this file
            item.removeListener("updated", updatedListener);
        });
    });
}
function handleExternalLink(contents, details, mainContents) {
    const url = new URL(details.url);
    const downloadPath = ConfigUtil.getConfigItem("downloadsPath", `${main_1.app.getPath("downloads")}`);
    if (isUploadsUrl(new URL(contents.getURL()).origin, url)) {
        downloadFile({
            contents,
            url: url.href,
            downloadPath,
            async completed(filePath, fileName) {
                const downloadNotification = new main_1.Notification({
                    title: "Download Complete",
                    body: `Click to show ${fileName} in folder`,
                    silent: true, // We'll play our own sound - ding.ogg
                });
                downloadNotification.on("click", () => {
                    // Reveal file in download folder
                    common_1.shell.showItemInFolder(filePath);
                });
                downloadNotification.show();
                // Play sound to indicate download complete
                if (!ConfigUtil.getConfigItem("silent", false)) {
                    (0, typed_ipc_main_1.send)(mainContents, "play-ding-sound");
                }
            },
            failed(state) {
                // Automatic download failed, so show save dialog prompt and download
                // through webview
                // Only do this if it is the automatic download, otherwise show an error (so we aren't showing two save
                // prompts right after each other)
                // Check that the download is not cancelled by user
                if (state !== "cancelled") {
                    if (ConfigUtil.getConfigItem("promptDownload", false)) {
                        new main_1.Notification({
                            title: "Download Complete",
                            body: "Download failed",
                        }).show();
                    }
                    else {
                        contents.downloadURL(url.href);
                    }
                }
            },
        });
    }
    else {
        (async () => LinkUtil.openBrowser(url))();
    }
}
exports.default = handleExternalLink;
