"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreferenceView = void 0;
const node_process_1 = __importDefault(require("node:process"));
const html_1 = require("../../../../common/html");
const typed_ipc_renderer_1 = require("../../typed-ipc-renderer");
const connected_org_section_1 = require("./connected-org-section");
const general_section_1 = require("./general-section");
const nav_1 = __importDefault(require("./nav"));
const network_section_1 = require("./network-section");
const servers_section_1 = require("./servers-section");
const shortcuts_section_1 = require("./shortcuts-section");
class PreferenceView {
    constructor() {
        this.navItem = "General";
        this.handleNavigation = (navItem) => {
            this.navItem = navItem;
            this.nav.select(navItem);
            switch (navItem) {
                case "AddServer":
                    (0, servers_section_1.initServersSection)({
                        $root: this.$settingsContainer,
                    });
                    break;
                case "General":
                    (0, general_section_1.initGeneralSection)({
                        $root: this.$settingsContainer,
                    });
                    break;
                case "Organizations":
                    (0, connected_org_section_1.initConnectedOrgSection)({
                        $root: this.$settingsContainer,
                    });
                    break;
                case "Network":
                    (0, network_section_1.initNetworkSection)({
                        $root: this.$settingsContainer,
                    });
                    break;
                case "Shortcuts": {
                    (0, shortcuts_section_1.initShortcutsSection)({
                        $root: this.$settingsContainer,
                    });
                    break;
                }
                default:
                    ((n) => n)(navItem);
            }
            window.location.hash = `#${navItem}`;
        };
        this.handleToggleSidebar = (_event, state) => {
            this.handleToggle("sidebar-option", state);
        };
        this.handleToggleMenubar = (_event, state) => {
            this.handleToggle("menubar-option", state);
        };
        this.handleToggleDnd = (_event, _state, newSettings) => {
            this.handleToggle("show-notification-option", newSettings.showNotification);
            this.handleToggle("silent-option", newSettings.silent);
            if (node_process_1.default.platform === "win32") {
                this.handleToggle("flash-taskbar-option", newSettings.flashTaskbarOnMessage);
            }
        };
        this.$view = document.createElement("div");
        this.$shadow = this.$view.attachShadow({ mode: "open" });
        this.$shadow.innerHTML = (0, html_1.html) `
      <link
        rel="stylesheet"
        href="${require.resolve("../../../css/fonts.css")}"
      />
      <link
        rel="stylesheet"
        href="${require.resolve("../../../css/preference.css")}"
      />
      <link
        rel="stylesheet"
        href="${require.resolve("@yaireo/tagify/dist/tagify.css")}"
      />
      <!-- Initially hidden to prevent FOUC -->
      <div id="content" hidden>
        <div id="sidebar"></div>
        <div id="settings-container"></div>
      </div>
    `.html;
        const $sidebarContainer = this.$shadow.querySelector("#sidebar");
        this.$settingsContainer = this.$shadow.querySelector("#settings-container");
        this.nav = new nav_1.default({
            $root: $sidebarContainer,
            onItemSelected: this.handleNavigation,
        });
        typed_ipc_renderer_1.ipcRenderer.on("toggle-sidebar", this.handleToggleSidebar);
        typed_ipc_renderer_1.ipcRenderer.on("toggle-autohide-menubar", this.handleToggleMenubar);
        typed_ipc_renderer_1.ipcRenderer.on("toggle-dnd", this.handleToggleDnd);
        this.handleNavigation(this.navItem);
    }
    handleToggleTray(state) {
        this.handleToggle("tray-option", state);
    }
    destroy() {
        typed_ipc_renderer_1.ipcRenderer.off("toggle-sidebar", this.handleToggleSidebar);
        typed_ipc_renderer_1.ipcRenderer.off("toggle-autohide-menubar", this.handleToggleMenubar);
        typed_ipc_renderer_1.ipcRenderer.off("toggle-dnd", this.handleToggleDnd);
    }
    // Handle toggling and reflect changes in preference page
    handleToggle(elementName, state = false) {
        const inputSelector = `#${elementName} .action .switch input`;
        const input = this.$shadow.querySelector(inputSelector);
        if (input) {
            input.checked = state;
        }
    }
}
exports.PreferenceView = PreferenceView;
