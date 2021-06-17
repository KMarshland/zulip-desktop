"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSetUp = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const remote_1 = require("./remote");
let setupCompleted = false;
const zulipDir = remote_1.app.getPath("userData");
const logDir = `${zulipDir}/Logs/`;
const configDir = `${zulipDir}/config/`;
const initSetUp = () => {
    // If it is the first time the app is running
    // create zulip dir in userData folder to
    // avoid errors
    if (!setupCompleted) {
        if (!node_fs_1.default.existsSync(zulipDir)) {
            node_fs_1.default.mkdirSync(zulipDir);
        }
        if (!node_fs_1.default.existsSync(logDir)) {
            node_fs_1.default.mkdirSync(logDir);
        }
        // Migrate config files from app data folder to config folder inside app
        // data folder. This will be done once when a user updates to the new version.
        if (!node_fs_1.default.existsSync(configDir)) {
            node_fs_1.default.mkdirSync(configDir);
            const domainJson = `${zulipDir}/domain.json`;
            const settingsJson = `${zulipDir}/settings.json`;
            const updatesJson = `${zulipDir}/updates.json`;
            const windowStateJson = `${zulipDir}/window-state.json`;
            const configData = [
                {
                    path: domainJson,
                    fileName: "domain.json",
                },
                {
                    path: settingsJson,
                    fileName: "settings.json",
                },
                {
                    path: updatesJson,
                    fileName: "updates.json",
                },
            ];
            for (const data of configData) {
                if (node_fs_1.default.existsSync(data.path)) {
                    node_fs_1.default.copyFileSync(data.path, configDir + data.fileName);
                    node_fs_1.default.unlinkSync(data.path);
                }
            }
            // `window-state.json` is only deleted not moved, as the electron-window-state
            // package will recreate the file in the config folder.
            if (node_fs_1.default.existsSync(windowStateJson)) {
                node_fs_1.default.unlinkSync(windowStateJson);
            }
        }
        setupCompleted = true;
    }
};
exports.initSetUp = initSetUp;
