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
const ConfigUtil = __importStar(require("../../../common/config-util"));
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
const helpers_1 = require("./helpers");
const NativeNotification = window.Notification;
class BaseNotification extends NativeNotification {
    constructor(title, options) {
        options.silent = true;
        super(title, options);
        this.addEventListener("click", () => {
            // Focus to the server who sent the
            // notification if not focused already
            helpers_1.focusCurrentServer();
            typed_ipc_renderer_1.ipcRenderer.send("focus-app");
        });
    }
    static async requestPermission() {
        return this.permission;
    }
    // Override default Notification permission
    static get permission() {
        return ConfigUtil.getConfigItem("showNotification", true)
            ? "granted"
            : "denied";
    }
}
exports.default = BaseNotification;
