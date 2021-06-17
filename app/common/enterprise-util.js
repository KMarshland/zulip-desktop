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
exports.isPresetOrg = exports.configItemExists = exports.getConfigItem = exports.hasConfigFile = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const z = __importStar(require("zod"));
const config_schemata_1 = require("./config-schemata");
const logger_util_1 = __importDefault(require("./logger-util"));
const logger = new logger_util_1.default({
    file: "enterprise-util.log",
});
let enterpriseSettings;
let configFile;
reloadDb();
function reloadDb() {
    let enterpriseFile = "/etc/zulip-desktop-config/global_config.json";
    if (node_process_1.default.platform === "win32") {
        enterpriseFile =
            "C:\\Program Files\\Zulip-Desktop-Config\\global_config.json";
    }
    enterpriseFile = node_path_1.default.resolve(enterpriseFile);
    if (node_fs_1.default.existsSync(enterpriseFile)) {
        configFile = true;
        try {
            const file = node_fs_1.default.readFileSync(enterpriseFile, "utf8");
            const data = JSON.parse(file);
            enterpriseSettings = z
                .object(config_schemata_1.enterpriseConfigSchemata)
                .partial()
                .parse(data);
        }
        catch (error) {
            logger.log("Error while JSON parsing global_config.json: ");
            logger.log(error);
        }
    }
    else {
        configFile = false;
    }
}
function hasConfigFile() {
    return configFile;
}
exports.hasConfigFile = hasConfigFile;
function getConfigItem(key, defaultValue) {
    reloadDb();
    if (!configFile) {
        return defaultValue;
    }
    const value = enterpriseSettings[key];
    return value === undefined ? defaultValue : value;
}
exports.getConfigItem = getConfigItem;
function configItemExists(key) {
    reloadDb();
    if (!configFile) {
        return false;
    }
    return enterpriseSettings[key] !== undefined;
}
exports.configItemExists = configItemExists;
function isPresetOrg(url) {
    if (!configFile || !configItemExists("presetOrganizations")) {
        return false;
    }
    const presetOrgs = enterpriseSettings.presetOrganizations;
    if (!Array.isArray(presetOrgs)) {
        throw new TypeError("Expected array for presetOrgs");
    }
    for (const org of presetOrgs) {
        if (url.includes(org)) {
            return true;
        }
    }
    return false;
}
exports.isPresetOrg = isPresetOrg;
