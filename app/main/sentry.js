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
exports.sentryInit = void 0;
const main_1 = require("electron/main");
const Sentry = __importStar(require("@sentry/electron"));
const config_util_1 = require("../common/config-util");
const sentryInit = () => {
    Sentry.init({
        dsn: "https://628dc2f2864243a08ead72e63f94c7b1@o48127.ingest.sentry.io/204668",
        // Don't report errors in development or if disabled by the user.
        beforeSend: (event) => main_1.app.isPackaged && (0, config_util_1.getConfigItem)("errorReporting", true) ? event : null,
        // We should ignore this error since it's harmless and we know the reason behind this
        // This error mainly comes from the console logs.
        // This is a temp solution until Sentry supports disabling the console logs
        ignoreErrors: ["does not appear to be a valid Zulip server"],
        /// sendTimeout: 30 // wait 30 seconds before considering the sending capture to have failed, default is 1 second
    });
};
exports.sentryInit = sentryInit;
