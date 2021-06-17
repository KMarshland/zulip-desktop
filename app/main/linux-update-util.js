"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUpdateItem = exports.setUpdateItem = exports.getUpdateItem = void 0;
const main_1 = require("electron/main");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_json_db_1 = require("node-json-db");
const Errors_1 = require("node-json-db/dist/lib/Errors");
const logger_util_1 = __importDefault(require("../common/logger-util"));
const logger = new logger_util_1.default({
    file: "linux-update-util.log",
});
let db;
reloadDb();
function getUpdateItem(key, defaultValue = null) {
    reloadDb();
    let value;
    try {
        value = db.getObject(`/${key}`);
    }
    catch (error) {
        if (!(error instanceof Errors_1.DataError))
            throw error;
    }
    if (value !== true && value !== null) {
        setUpdateItem(key, defaultValue);
        return defaultValue;
    }
    return value;
}
exports.getUpdateItem = getUpdateItem;
function setUpdateItem(key, value) {
    db.push(`/${key}`, value, true);
    reloadDb();
}
exports.setUpdateItem = setUpdateItem;
function removeUpdateItem(key) {
    db.delete(`/${key}`);
    reloadDb();
}
exports.removeUpdateItem = removeUpdateItem;
function reloadDb() {
    const linuxUpdateJsonPath = node_path_1.default.join(main_1.app.getPath("userData"), "/config/updates.json");
    try {
        const file = node_fs_1.default.readFileSync(linuxUpdateJsonPath, "utf8");
        JSON.parse(file);
    }
    catch (error) {
        if (node_fs_1.default.existsSync(linuxUpdateJsonPath)) {
            node_fs_1.default.unlinkSync(linuxUpdateJsonPath);
            main_1.dialog.showErrorBox("Error saving update notifications.", "We encountered an error while saving the update notifications.");
            logger.error("Error while JSON parsing updates.json: ");
            logger.error(error);
        }
    }
    db = new node_json_db_1.JsonDB(linuxUpdateJsonPath, true, true);
}
