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
const backoff = __importStar(require("backoff"));
const html_1 = require("../../../common/html");
const logger_util_1 = __importDefault(require("../../../common/logger-util"));
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
const logger = new logger_util_1.default({
    file: "domain-util.log",
});
class ReconnectUtil {
    constructor(webview) {
        this.webview = webview;
        this.url = webview.props.url;
        this.alreadyReloaded = false;
        this.fibonacciBackoff = backoff.fibonacci({
            initialDelay: 5000,
            maxDelay: 300000,
        });
    }
    async isOnline() {
        return typed_ipc_renderer_1.ipcRenderer.invoke("is-online", this.url);
    }
    pollInternetAndReload() {
        this.fibonacciBackoff.backoff();
        this.fibonacciBackoff.on("ready", async () => {
            if (await this._checkAndReload()) {
                this.fibonacciBackoff.reset();
            }
            else {
                this.fibonacciBackoff.backoff();
            }
        });
    }
    async _checkAndReload() {
        if (this.alreadyReloaded) {
            return true;
        }
        if (await this.isOnline()) {
            typed_ipc_renderer_1.ipcRenderer.send("forward-message", "reload-viewer");
            logger.log("You're back online.");
            return true;
        }
        logger.log("There is no internet connection, try checking network cables, modem and router.");
        const errorMessageHolder = document.querySelector("#description");
        if (errorMessageHolder) {
            errorMessageHolder.innerHTML = (0, html_1.html) `
        <div>Your internet connection doesn't seem to work properly!</div>
        <div>Verify that it works and then click try again.</div>
      `.html;
        }
        return false;
    }
}
exports.default = ReconnectUtil;
