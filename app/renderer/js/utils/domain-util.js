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
exports.formatUrl = exports.updateSavedServer = exports.saveServerIcon = exports.checkDomain = exports.duplicateDomain = exports.removeDomain = exports.removeDomains = exports.addDomain = exports.updateDomain = exports.getDomain = exports.getDomains = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const remote_1 = require("@electron/remote");
const Sentry = __importStar(require("@sentry/electron"));
const node_json_db_1 = require("node-json-db");
const Errors_1 = require("node-json-db/dist/lib/Errors");
const z = __importStar(require("zod"));
const EnterpriseUtil = __importStar(require("../../../common/enterprise-util"));
const logger_util_1 = __importDefault(require("../../../common/logger-util"));
const Messages = __importStar(require("../../../common/messages"));
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
const logger = new logger_util_1.default({
    file: "domain-util.log",
});
const defaultIconUrl = "../renderer/img/icon.png";
const serverConfSchema = z.object({
    url: z.string(),
    alias: z.string(),
    icon: z.string(),
});
let db;
reloadDb();
// Migrate from old schema
try {
    const oldDomain = db.getObject("/domain");
    if (typeof oldDomain === "string") {
        (async () => {
            await addDomain({
                alias: "Zulip",
                url: oldDomain,
            });
            db.delete("/domain");
        })();
    }
}
catch (error) {
    if (!(error instanceof Errors_1.DataError))
        throw error;
}
function getDomains() {
    reloadDb();
    try {
        return serverConfSchema.array().parse(db.getObject("/domains"));
    }
    catch (error) {
        if (!(error instanceof Errors_1.DataError))
            throw error;
        return [];
    }
}
exports.getDomains = getDomains;
function getDomain(index) {
    reloadDb();
    return serverConfSchema.parse(db.getObject(`/domains[${index}]`));
}
exports.getDomain = getDomain;
function updateDomain(index, server) {
    reloadDb();
    serverConfSchema.parse(server);
    db.push(`/domains[${index}]`, server, true);
}
exports.updateDomain = updateDomain;
async function addDomain(server) {
    if (server.icon) {
        const localIconUrl = await saveServerIcon(server.icon);
        server.icon = localIconUrl;
        serverConfSchema.parse(server);
        db.push("/domains[]", server, true);
        reloadDb();
    }
    else {
        server.icon = defaultIconUrl;
        serverConfSchema.parse(server);
        db.push("/domains[]", server, true);
        reloadDb();
    }
}
exports.addDomain = addDomain;
function removeDomains() {
    db.delete("/domains");
    reloadDb();
}
exports.removeDomains = removeDomains;
function removeDomain(index) {
    if (EnterpriseUtil.isPresetOrg(getDomain(index).url)) {
        return false;
    }
    db.delete(`/domains[${index}]`);
    reloadDb();
    return true;
}
exports.removeDomain = removeDomain;
// Check if domain is already added
function duplicateDomain(domain) {
    domain = formatUrl(domain);
    return getDomains().some((server) => server.url === domain);
}
exports.duplicateDomain = duplicateDomain;
async function checkDomain(domain, silent = false) {
    if (!silent && duplicateDomain(domain)) {
        // Do not check duplicate in silent mode
        throw new Error("This server has been added.");
    }
    domain = formatUrl(domain);
    try {
        return await getServerSettings(domain);
    }
    catch {
        throw new Error(Messages.invalidZulipServerError(domain));
    }
}
exports.checkDomain = checkDomain;
async function getServerSettings(domain) {
    return typed_ipc_renderer_1.ipcRenderer.invoke("get-server-settings", domain);
}
async function saveServerIcon(iconURL) {
    return typed_ipc_renderer_1.ipcRenderer.invoke("save-server-icon", iconURL);
}
exports.saveServerIcon = saveServerIcon;
async function updateSavedServer(url, index) {
    // Does not promise successful update
    const oldIcon = getDomain(index).icon;
    try {
        const newServerConf = await checkDomain(url, true);
        const localIconUrl = await saveServerIcon(newServerConf.icon);
        if (!oldIcon || localIconUrl !== "../renderer/img/icon.png") {
            newServerConf.icon = localIconUrl;
            updateDomain(index, newServerConf);
            reloadDb();
        }
    }
    catch (error) {
        logger.log("Could not update server icon.");
        logger.log(error);
        Sentry.captureException(error);
    }
}
exports.updateSavedServer = updateSavedServer;
function reloadDb() {
    const domainJsonPath = node_path_1.default.join(remote_1.app.getPath("userData"), "config/domain.json");
    try {
        const file = node_fs_1.default.readFileSync(domainJsonPath, "utf8");
        JSON.parse(file);
    }
    catch (error) {
        if (node_fs_1.default.existsSync(domainJsonPath)) {
            node_fs_1.default.unlinkSync(domainJsonPath);
            remote_1.dialog.showErrorBox("Error saving new organization", "There seems to be error while saving new organization, " +
                "you may have to re-add your previous organizations back.");
            logger.error("Error while JSON parsing domain.json: ");
            logger.error(error);
            Sentry.captureException(error);
        }
    }
    db = new node_json_db_1.JsonDB(domainJsonPath, true, true);
}
function formatUrl(domain) {
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
        return domain;
    }
    if (domain.startsWith("localhost:")) {
        return `http://${domain}`;
    }
    return `https://${domain}`;
}
exports.formatUrl = formatUrl;
