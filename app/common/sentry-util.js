"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureException = exports.sentryInit = void 0;
const electron_1 = __importDefault(require("electron"));
const electron_2 = require("@sentry/electron");
const { app } = process.type === "renderer" ? electron_1.default.remote : electron_1.default;
const sentryInit = () => {
    if (app.isPackaged) {
        electron_2.init({
            dsn: "https://628dc2f2864243a08ead72e63f94c7b1@sentry.io/204668",
            // We should ignore this error since it's harmless and we know the reason behind this
            // This error mainly comes from the console logs.
            // This is a temp solution until Sentry supports disabling the console logs
            ignoreErrors: ["does not appear to be a valid Zulip server"],
            /// sendTimeout: 30 // wait 30 seconds before considering the sending capture to have failed, default is 1 second
        });
    }
};
exports.sentryInit = sentryInit;
var electron_3 = require("@sentry/electron");
Object.defineProperty(exports, "captureException", { enumerable: true, get: function () { return electron_3.captureException; } });
