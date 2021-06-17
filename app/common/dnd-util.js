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
exports.toggle = void 0;
const node_process_1 = __importDefault(require("node:process"));
const ConfigUtil = __importStar(require("./config-util"));
function toggle() {
    const dnd = !ConfigUtil.getConfigItem("dnd", false);
    const dndSettingList = ["showNotification", "silent"];
    if (node_process_1.default.platform === "win32") {
        dndSettingList.push("flashTaskbarOnMessage");
    }
    let newSettings;
    if (dnd) {
        const oldSettings = {};
        newSettings = {};
        // Iterate through the dndSettingList.
        for (const settingName of dndSettingList) {
            // Store the current value of setting.
            oldSettings[settingName] = ConfigUtil.getConfigItem(settingName, settingName !== "silent");
            // New value of setting.
            newSettings[settingName] = settingName === "silent";
        }
        // Store old value in oldSettings.
        ConfigUtil.setConfigItem("dndPreviousSettings", oldSettings);
    }
    else {
        newSettings = ConfigUtil.getConfigItem("dndPreviousSettings", {
            showNotification: true,
            silent: false,
            ...(node_process_1.default.platform === "win32" && { flashTaskbarOnMessage: true }),
        });
    }
    for (const settingName of dndSettingList) {
        ConfigUtil.setConfigItem(settingName, newSettings[settingName]);
    }
    ConfigUtil.setConfigItem("dnd", dnd);
    return { dnd, newSettings };
}
exports.toggle = toggle;
