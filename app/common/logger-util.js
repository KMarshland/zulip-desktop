"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_console_1 = require("node:console");
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_process_1 = __importDefault(require("node:process"));
const default_util_1 = require("./default-util");
const remote_1 = require("./remote");
(0, default_util_1.initSetUp)();
const logDir = `${remote_1.app.getPath("userData")}/Logs`;
class Logger {
    constructor(options = {}) {
        let { file = "console.log" } = options;
        file = `${logDir}/${file}`;
        // Trim log according to type of process
        if (node_process_1.default.type === "renderer") {
            requestIdleCallback(async () => this.trimLog(file));
        }
        else {
            node_process_1.default.nextTick(async () => this.trimLog(file));
        }
        const fileStream = node_fs_1.default.createWriteStream(file, { flags: "a" });
        const nodeConsole = new node_console_1.Console(fileStream);
        this.nodeConsole = nodeConsole;
    }
    _log(type, ...args) {
        args.unshift(this.getTimestamp() + " |\t");
        args.unshift(type.toUpperCase() + " |");
        this.nodeConsole[type](...args);
        console[type](...args);
    }
    log(...args) {
        this._log("log", ...args);
    }
    debug(...args) {
        this._log("debug", ...args);
    }
    info(...args) {
        this._log("info", ...args);
    }
    warn(...args) {
        this._log("warn", ...args);
    }
    error(...args) {
        this._log("error", ...args);
    }
    getTimestamp() {
        const date = new Date();
        const timestamp = `${date.getMonth()}/${date.getDate()} ` +
            `${date.getMinutes()}:${date.getSeconds()}`;
        return timestamp;
    }
    async trimLog(file) {
        const data = await node_fs_1.default.promises.readFile(file, "utf8");
        const maxLogFileLines = 500;
        const logs = data.split(node_os_1.default.EOL);
        const logLength = logs.length - 1;
        // Keep bottom maxLogFileLines of each log instance
        if (logLength > maxLogFileLines) {
            const trimmedLogs = logs.slice(logLength - maxLogFileLines);
            const toWrite = trimmedLogs.join(node_os_1.default.EOL);
            await node_fs_1.default.promises.writeFile(file, toWrite);
        }
    }
}
exports.default = Logger;
