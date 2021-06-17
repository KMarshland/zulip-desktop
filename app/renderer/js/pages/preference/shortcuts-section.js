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
exports.initShortcutsSection = void 0;
const node_process_1 = __importDefault(require("node:process"));
const html_1 = require("../../../../common/html");
const LinkUtil = __importStar(require("../../../../common/link-util"));
const t = __importStar(require("../../../../common/translation-util"));
// eslint-disable-next-line complexity
function initShortcutsSection({ $root }) {
    const cmdOrCtrl = node_process_1.default.platform === "darwin" ? "⌘" : "Ctrl";
    $root.innerHTML = (0, html_1.html) `
    <div class="settings-pane">
      <div class="settings-card tip">
        <p>
          <b><i class="material-icons md-14">settings</i>${t.__("Tip")}: </b
          >${t.__("These desktop app shortcuts extend the Zulip webapp's")}
          <span id="open-hotkeys-link"> ${t.__("keyboard shortcuts")}</span>.
        </p>
      </div>
      <div class="title">${t.__("Application Shortcuts")}</div>
      <div class="settings-card">
        <table>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>,</kbd></td>
            <td>${t.__("Settings")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>K</kbd></td>
            <td>${t.__("Keyboard Shortcuts")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd></td>
            <td>${t.__("Toggle Do Not Disturb")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Shift</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>M</kbd></td>
            <td>${t.__("Toggle Do Not Disturb")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Shift</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>D</kbd></td>
            <td>${t.__("Reset App Settings")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>L</kbd></td>
            <td>${t.__("Log Out")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>H</kbd></td>
            <td>${t.__("Hide Zulip")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Option</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>H</kbd></td>
            <td>${t.__("Hide Others")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Q</kbd></td>
            <td>${t.__("Quit Zulip")}</td>
          </tr>
        </table>
        <div class="setting-control"></div>
      </div>
      <div class="title">${t.__("Edit Shortcuts")}</div>
      <div class="settings-card">
        <table>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Z</kbd></td>
            <td>${t.__("Undo")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Shift</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>Z</kbd></td>
            <td>${t.__("Redo")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Y</kbd></td>
            <td>${t.__("Redo")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>X</kbd></td>
            <td>${t.__("Cut")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>C</kbd></td>
            <td>${t.__("Copy")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>V</kbd></td>
            <td>${t.__("Paste")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd></td>
            <td>${t.__("Paste and Match Style")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Shift</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>V</kbd></td>
            <td>${t.__("Paste and Match Style")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>A</kbd></td>
            <td>${t.__("Select All")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td>
              <kbd>Control</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>Space</kbd>
            </td>
            <td>${t.__("Emoji & Symbols")}</td>
          </tr>
        </table>
        <div class="setting-control"></div>
      </div>
      <div class="title">${t.__("View Shortcuts")}</div>
      <div class="settings-card">
        <table>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>R</kbd></td>
            <td>${t.__("Reload")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd></td>
            <td>${t.__("Hard Reload")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Shift</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>R</kbd></td>
            <td>${t.__("Hard Reload")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>F11</kbd></td>
            <td>${t.__("Toggle Full Screen")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Control</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>F</kbd></td>
            <td>${t.__("Enter Full Screen")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>+</kbd></td>
            <td>${t.__("Zoom In")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>=</kbd></td>
            <td>${t.__("Zoom In")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>-</kbd></td>
            <td>${t.__("Zoom Out")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>0</kbd></td>
            <td>${t.__("Actual Size")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></td>
            <td>${t.__("Toggle Sidebar")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Shift</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>S</kbd></td>
            <td>${t.__("Toggle Sidebar")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Option</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>I</kbd></td>
            <td>${t.__("Toggle DevTools for Zulip App")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd></td>
            <td>${t.__("Toggle DevTools for Zulip App")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>Option</kbd> + <kbd>${cmdOrCtrl}</kbd> + <kbd>U</kbd></td>
            <td>${t.__("Toggle DevTools for Active Tab")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>Shift</kbd> + <kbd>U</kbd></td>
            <td>${t.__("Toggle DevTools for Active Tab")}</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>Tab</kbd></td>
            <td>${t.__("Switch to Next Organization")}</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Tab</kbd></td>
            <td>${t.__("Switch to Previous Organization")}</td>
          </tr>
        </table>
        <div class="setting-control"></div>
      </div>
      <div class="title">${t.__("History Shortcuts")}</div>
      <div class="settings-card">
        <table>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>←</kbd></td>
            <td>${t.__("Back")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>Alt</kbd> + <kbd>←</kbd></td>
            <td>${t.__("Back")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "" : "hidden"}>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>→</kbd></td>
            <td>${t.__("Forward")}</td>
          </tr>
          <tr ${node_process_1.default.platform === "darwin" ? "hidden" : ""}>
            <td><kbd>Alt</kbd> + <kbd>→</kbd></td>
            <td>${t.__("Forward")}</td>
          </tr>
        </table>
        <div class="setting-control"></div>
      </div>
      <div class="title">${t.__("Window Shortcuts")}</div>
      <div class="settings-card">
        <table>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>M</kbd></td>
            <td>${t.__("Minimize")}</td>
          </tr>
          <tr>
            <td><kbd>${cmdOrCtrl}</kbd> + <kbd>W</kbd></td>
            <td>${t.__("Close")}</td>
          </tr>
        </table>
        <div class="setting-control"></div>
      </div>
    </div>
  `.html;
    const link = "https://zulip.com/help/keyboard-shortcuts";
    const externalCreateNewOrgElement = $root.querySelector("#open-hotkeys-link");
    externalCreateNewOrgElement.addEventListener("click", async () => {
        await LinkUtil.openBrowser(new URL(link));
    });
}
exports.initShortcutsSection = initShortcutsSection;
