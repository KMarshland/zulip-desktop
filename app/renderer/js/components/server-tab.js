"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_process_1 = __importDefault(require("node:process"));
const html_1 = require("../../../common/html");
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
const base_1 = require("./base");
const tab_1 = __importDefault(require("./tab"));
class ServerTab extends tab_1.default {
    constructor({ webview, ...props }) {
        super(props);
        this.webview = webview;
        this.$el = (0, base_1.generateNodeFromHtml)(this.templateHtml());
        this.props.$root.append(this.$el);
        this.registerListeners();
        this.$badge = this.$el.querySelector(".server-tab-badge");
    }
    async activate() {
        await super.activate();
        (await this.webview).load();
    }
    async deactivate() {
        await super.deactivate();
        (await this.webview).hide();
    }
    async destroy() {
        await super.destroy();
        (await this.webview).$el.remove();
    }
    templateHtml() {
        return (0, html_1.html) `
      <div class="tab" data-tab-id="${this.props.tabIndex}">
        <div class="server-tooltip" style="display:none">
          ${this.props.name}
        </div>
        <div class="server-tab-badge"></div>
        <div class="server-tab">
          <img class="server-icons" src="${this.props.icon}" />
        </div>
        <div class="server-tab-shortcut">${this.generateShortcutText()}</div>
      </div>
    `;
    }
    updateBadge(count) {
        this.$badge.textContent = count > 999 ? "1K+" : count.toString();
        this.$badge.classList.toggle("active", count > 0);
    }
    generateShortcutText() {
        // Only provide shortcuts for server [0..9]
        if (this.props.index >= 9) {
            return "";
        }
        const shownIndex = this.props.index + 1;
        // Array index == Shown index - 1
        typed_ipc_renderer_1.ipcRenderer.send("switch-server-tab", shownIndex - 1);
        return node_process_1.default.platform === "darwin"
            ? `⌘${shownIndex}`
            : `Ctrl+${shownIndex}`;
    }
}
exports.default = ServerTab;
