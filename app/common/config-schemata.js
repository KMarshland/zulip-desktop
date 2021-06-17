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
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterpriseConfigSchemata = exports.configSchemata = exports.dndSettingsSchemata = void 0;
const z = __importStar(require("zod"));
exports.dndSettingsSchemata = {
    showNotification: z.boolean(),
    silent: z.boolean(),
    flashTaskbarOnMessage: z.boolean(),
};
exports.configSchemata = {
    ...exports.dndSettingsSchemata,
    appLanguage: z.string().nullable(),
    autoHideMenubar: z.boolean(),
    autoUpdate: z.boolean(),
    badgeOption: z.boolean(),
    betaUpdate: z.boolean(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    customCSS: z.string().or(z.literal(false)).nullable(),
    dnd: z.boolean(),
    dndPreviousSettings: z.object(exports.dndSettingsSchemata).partial(),
    dockBouncing: z.boolean(),
    downloadsPath: z.string(),
    enableSpellchecker: z.boolean(),
    errorReporting: z.boolean(),
    lastActiveTab: z.number(),
    promptDownload: z.boolean(),
    proxyBypass: z.string(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    proxyPAC: z.string(),
    proxyRules: z.string(),
    quitOnClose: z.boolean(),
    showSidebar: z.boolean(),
    spellcheckerLanguages: z.string().array().nullable(),
    startAtLogin: z.boolean(),
    startMinimized: z.boolean(),
    trayIcon: z.boolean(),
    useManualProxy: z.boolean(),
    useProxy: z.boolean(),
    useSystemProxy: z.boolean(),
};
exports.enterpriseConfigSchemata = {
    ...exports.configSchemata,
    presetOrganizations: z.string().array(),
};
