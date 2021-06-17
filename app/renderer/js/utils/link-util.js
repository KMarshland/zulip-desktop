"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openBrowser = exports.isUploadsUrl = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const html_1 = require("../../../common/html");
function isUploadsUrl(server, url) {
    return url.origin === server && url.pathname.startsWith("/user_uploads/");
}
exports.isUploadsUrl = isUploadsUrl;
async function openBrowser(url) {
    if (["http:", "https:", "mailto:"].includes(url.protocol)) {
        await electron_1.shell.openExternal(url.href);
    }
    else {
        // For security, indirect links to non-whitelisted protocols
        // through a real web browser via a local HTML file.
        const dir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "zulip-redirect-"));
        const file = path_1.default.join(dir, "redirect.html");
        fs_1.default.writeFileSync(file, html_1.html `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="Refresh" content="0; url=${url.href}" />
            <title>Redirecting</title>
            <style>
              html {
                font-family: menu, "Helvetica Neue", sans-serif;
              }
            </style>
          </head>
          <body>
            <p>Opening <a href="${url.href}">${url.href}</a>…</p>
          </body>
        </html> `.html);
        await electron_1.shell.openPath(file);
        setTimeout(() => {
            fs_1.default.unlinkSync(file);
            fs_1.default.rmdirSync(dir);
        }, 15_000);
    }
}
exports.openBrowser = openBrowser;
