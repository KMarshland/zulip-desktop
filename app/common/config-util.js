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
exports.removeConfigItem = exports.setConfigItem = exports.isConfigItemExists = exports.getConfigItem = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const Sentry = __importStar(require("@sentry/electron"));
const node_json_db_1 = require("node-json-db");
const Errors_1 = require("node-json-db/dist/lib/Errors");
const config_schemata_1 = require("./config-schemata");
const EnterpriseUtil = __importStar(require("./enterprise-util"));
const logger_util_1 = __importDefault(require("./logger-util"));
const remote_1 = require("./remote");
const logger = new logger_util_1.default({
    file: "config-util.log",
});
let db;
reloadDb();
function getConfigItem(key, defaultValue) {
    try {
        db.reload();
    }
    catch (error) {
        logger.error("Error while reloading settings.json: ");
        logger.error(error);
    }
    try {
        return config_schemata_1.configSchemata[key].parse(db.getObject(`/${key}`));
    }
    catch (error) {
        if (!(error instanceof Errors_1.DataError))
            throw error;
        setConfigItem(key, defaultValue);
        return defaultValue;
    }
}
exports.getConfigItem = getConfigItem;
// This function returns whether a key exists in the configuration file (settings.json)
function isConfigItemExists(key) {
    try {
        db.reload();
    }
    catch (error) {
        logger.error("Error while reloading settings.json: ");
        logger.error(error);
    }
    return db.exists(`/${key}`);
}
exports.isConfigItemExists = isConfigItemExists;
function setConfigItem(key, value, override) {
    if (EnterpriseUtil.configItemExists(key) && !override) {
        // If item is in global config and we're not trying to override
        return;
    }
    config_schemata_1.configSchemata[key].parse(value);
    db.push(`/${key}`, value, true);
    db.save();
}
exports.setConfigItem = setConfigItem;
function removeConfigItem(key) {
    db.delete(`/${key}`);
    db.save();
}
exports.removeConfigItem = removeConfigItem;
function reloadDb() {
    const settingsJsonPath = node_path_1.default.join(remote_1.app.getPath("userData"), "/config/settings.json");
    try {
        const file = node_fs_1.default.readFileSync(settingsJsonPath, "utf8");
        JSON.parse(file);
    }
    catch (error) {
        if (node_fs_1.default.existsSync(settingsJsonPath)) {
            node_fs_1.default.unlinkSync(settingsJsonPath);
            remote_1.dialog.showErrorBox("Error saving settings", "We encountered an error while saving the settings.");
            logger.error("Error while JSON parsing settings.json: ");
            logger.error(error);
            Sentry.captureException(error);
        }
    }
    db = new node_json_db_1.JsonDB(settingsJsonPath, true, true);
}
