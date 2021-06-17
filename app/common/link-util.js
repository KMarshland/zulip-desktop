"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openBrowser = void 0;
const common_1 = require("electron/common");
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const html_1 = require("./html");
async function openBrowser(url) {
    if (["http:", "https:", "mailto:"].includes(url.protocol)) {
        await common_1.shell.openExternal(url.href);
    }
    else {
        // For security, indirect links to non-whitelisted protocols
        // through a real web browser via a local HTML file.
        const dir = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), "zulip-redirect-"));
        const file = node_path_1.default.join(dir, "redirect.html");
        node_fs_1.default.writeFileSync(file, (0, html_1.html) `
        <!DOCTYPE html>
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
        </html>
      `.html);
        await common_1.shell.openPath(file);
        setTimeout(() => {
            node_fs_1.default.unlinkSync(file);
            node_fs_1.default.rmdirSync(dir);
        }, 15000);
    }
}
exports.openBrowser = openBrowser;
