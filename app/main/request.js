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
exports._isOnline = exports._saveServerIcon = exports._getServerSettings = exports.fetchResponse = void 0;
const main_1 = require("electron/main");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_stream_1 = __importDefault(require("node:stream"));
const node_util_1 = __importDefault(require("node:util"));
const Sentry = __importStar(require("@sentry/electron"));
const get_stream_1 = __importDefault(require("get-stream"));
const z = __importStar(require("zod"));
const logger_util_1 = __importDefault(require("../common/logger-util"));
const Messages = __importStar(require("../common/messages"));
async function fetchResponse(request) {
    return new Promise((resolve, reject) => {
        request.on("response", resolve);
        request.on("abort", () => {
            reject(new Error("Request aborted"));
        });
        request.on("error", reject);
        request.end();
    });
}
exports.fetchResponse = fetchResponse;
const pipeline = node_util_1.default.promisify(node_stream_1.default.pipeline);
/* Request: domain-util */
const defaultIconUrl = "../renderer/img/icon.png";
const logger = new logger_util_1.default({
    file: "domain-util.log",
});
const generateFilePath = (url) => {
    const dir = `${main_1.app.getPath("userData")}/server-icons`;
    const extension = node_path_1.default.extname(url).split("?")[0];
    let hash = 5381;
    let { length } = url;
    while (length) {
        // eslint-disable-next-line no-bitwise, unicorn/prefer-code-point
        hash = (hash * 33) ^ url.charCodeAt(--length);
    }
    // Create 'server-icons' directory if not existed
    if (!node_fs_1.default.existsSync(dir)) {
        node_fs_1.default.mkdirSync(dir);
    }
    // eslint-disable-next-line no-bitwise
    return `${dir}/${hash >>> 0}${extension}`;
};
const _getServerSettings = async (domain, session) => {
    const response = await fetchResponse(main_1.net.request({
        url: domain + "/api/v1/server_settings",
        session,
    }));
    if (response.statusCode !== 200) {
        throw new Error(Messages.invalidZulipServerError(domain));
    }
    const data = JSON.parse(await (0, get_stream_1.default)(response));
    /* eslint-disable @typescript-eslint/naming-convention */
    const { realm_name, realm_uri, realm_icon } = z
        .object({
        realm_name: z.string(),
        realm_uri: z.string(),
        realm_icon: z.string(),
    })
        .parse(data);
    /* eslint-enable @typescript-eslint/naming-convention */
    return {
        // Some Zulip Servers use absolute URL for server icon whereas others use relative URL
        // Following check handles both the cases
        icon: realm_icon.startsWith("/") ? realm_uri + realm_icon : realm_icon,
        url: realm_uri,
        alias: realm_name,
    };
};
exports._getServerSettings = _getServerSettings;
const _saveServerIcon = async (url, session) => {
    try {
        const response = await fetchResponse(main_1.net.request({ url, session }));
        if (response.statusCode !== 200) {
            logger.log("Could not get server icon.");
            return defaultIconUrl;
        }
        const filePath = generateFilePath(url);
        await pipeline(response, node_fs_1.default.createWriteStream(filePath));
        return filePath;
    }
    catch (error) {
        logger.log("Could not get server icon.");
        logger.log(error);
        Sentry.captureException(error);
        return defaultIconUrl;
    }
};
exports._saveServerIcon = _saveServerIcon;
/* Request: reconnect-util */
const _isOnline = async (url, session) => {
    try {
        const response = await fetchResponse(main_1.net.request({
            method: "HEAD",
            url: `${url}/api/v1/server_settings`,
            session,
        }));
        const isValidResponse = response.statusCode >= 200 && response.statusCode < 400;
        return isValidResponse;
    }
    catch (error) {
        logger.log(error);
        return false;
    }
};
exports._isOnline = _isOnline;
