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
exports.linuxUpdateNotification = void 0;
const main_1 = require("electron/main");
const get_stream_1 = __importDefault(require("get-stream"));
const semver = __importStar(require("semver"));
const z = __importStar(require("zod"));
const ConfigUtil = __importStar(require("../common/config-util"));
const logger_util_1 = __importDefault(require("../common/logger-util"));
const LinuxUpdateUtil = __importStar(require("./linux-update-util"));
const request_1 = require("./request");
const logger = new logger_util_1.default({
    file: "linux-update-util.log",
});
async function linuxUpdateNotification(session) {
    let url = "https://api.github.com/repos/zulip/zulip-desktop/releases";
    url = ConfigUtil.getConfigItem("betaUpdate", false) ? url : url + "/latest";
    try {
        const response = await (0, request_1.fetchResponse)(main_1.net.request({ url, session }));
        if (response.statusCode !== 200) {
            logger.log("Linux update response status: ", response.statusCode);
            return;
        }
        const data = JSON.parse(await (0, get_stream_1.default)(response));
        /* eslint-disable @typescript-eslint/naming-convention */
        const latestVersion = ConfigUtil.getConfigItem("betaUpdate", false)
            ? z.array(z.object({ tag_name: z.string() })).parse(data)[0].tag_name
            : z.object({ tag_name: z.string() }).parse(data).tag_name;
        /* eslint-enable @typescript-eslint/naming-convention */
        if (semver.gt(latestVersion, main_1.app.getVersion())) {
            const notified = LinuxUpdateUtil.getUpdateItem(latestVersion);
            if (notified === null) {
                new main_1.Notification({
                    title: "Zulip Update",
                    body: `A new version ${latestVersion} is available. Please update using your package manager.`,
                }).show();
                LinuxUpdateUtil.setUpdateItem(latestVersion, true);
            }
        }
    }
    catch (error) {
        logger.error("Linux update error.");
        logger.error(error);
    }
}
exports.linuxUpdateNotification = linuxUpdateNotification;
