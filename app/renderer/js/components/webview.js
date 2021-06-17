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
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const remote = __importStar(require("@electron/remote"));
const remote_1 = require("@electron/remote");
const ConfigUtil = __importStar(require("../../../common/config-util"));
const html_1 = require("../../../common/html");
const typed_ipc_renderer_1 = require("../typed-ipc-renderer");
const SystemUtil = __importStar(require("../utils/system-util"));
const base_1 = require("./base");
const context_menu_1 = require("./context-menu");
const shouldSilentWebview = ConfigUtil.getConfigItem("silent", false);
class WebView {
    constructor(props, $element, webContentsId) {
        this.props = props;
        this.zoomFactor = 1;
        this.loading = true;
        this.badgeCount = 0;
        this.hasUnreads = false;
        this.customCss = ConfigUtil.getConfigItem("customCSS", null);
        this.$webviewsContainer = document.querySelector("#webviews-container").classList;
        this.$el = $element;
        this.webContentsId = webContentsId;
        this.registerListeners();
    }
    static templateHtml(props) {
        return (0, html_1.html) `
      <webview
        data-tab-id="${props.tabIndex}"
        src="${props.url}"
        ${props.preload === undefined
            ? (0, html_1.html) ``
            : (0, html_1.html) `preload="${props.preload}"`}
        partition="persist:webviewsession"
        allowpopups
      >
      </webview>
    `;
    }
    static async create(props) {
        const $element = (0, base_1.generateNodeFromHtml)(WebView.templateHtml(props));
        props.$root.append($element);
        // Wait for did-navigate rather than did-attach to work around
        // https://github.com/electron/electron/issues/31918
        await new Promise((resolve) => {
            $element.addEventListener("did-navigate", () => {
                resolve();
            }, true);
        });
        // Work around https://github.com/electron/electron/issues/26904
        function getWebContentsIdFunction(selector) {
            return document
                .querySelector(selector)
                .getWebContentsId();
        }
        const selector = `webview[data-tab-id="${CSS.escape(`${props.tabIndex}`)}"]`;
        const webContentsId = await props.rootWebContents.executeJavaScript(`(${getWebContentsIdFunction.toString()})(${JSON.stringify(selector)})`);
        if (typeof webContentsId !== "number") {
            throw new TypeError("Failed to get WebContents ID");
        }
        return new WebView(props, $element, webContentsId);
    }
    getWebContents() {
        return remote.webContents.fromId(this.webContentsId);
    }
    registerListeners() {
        const webContents = this.getWebContents();
        if (shouldSilentWebview) {
            webContents.setAudioMuted(true);
        }
        let executed = false;
        webContents.on("page-title-updated", (_event, title) => {
            this.badgeCount = this.getBadgeCount(title);
            this.hasUnreads = this.getHasUnreads(title);
            this.props.onTitleChange();
            if (!executed && this.$el) {
                executed = true;
                webContents.executeJavaScript('(' + (function () {
                    // @ts-ignore
                    if (!window.pollUnreads) {
                        // @ts-ignore
                        window.pollUnreads = function () {
                            // @ts-ignore
                            const unreadCount = parseInt(document.querySelector('a[href="#all_messages"] .unread_count').innerText) || 0;
                            // @ts-ignore
                            const mentionCount = parseInt(document.querySelector('a[href="#narrow/is/mentioned"] .unread_count').innerText) || 0;
                            // @ts-ignore
                            const pmCount = parseInt(document.querySelector('#private_messages_section_header .unread_count').innerText) || 0;
                            // @ts-ignore
                            const title = `COUNTS-[${unreadCount}]-(${mentionCount + pmCount})`;
                            if (document.title !== title) {
                                document.title = title;
                            }
                            // @ts-ignore
                            requestAnimationFrame(window.pollUnreads);
                        };
                        // @ts-ignore
                        requestAnimationFrame(window.pollUnreads);
                    }
                }).toString() + ')();');
            }
        });
        this.$el.addEventListener("did-navigate-in-page", () => {
            this.canGoBackButton();
        });
        this.$el.addEventListener("did-navigate", () => {
            this.canGoBackButton();
        });
        webContents.on("page-favicon-updated", (_event, favicons) => {
            // This returns a string of favicons URL. If there is a PM counts in unread messages then the URL would be like
            // https://chat.zulip.org/static/images/favicon/favicon-pms.png
            if (favicons[0].indexOf("favicon-pms") > 0 &&
                node_process_1.default.platform === "darwin") {
                // This api is only supported on macOS
                remote_1.app.dock.setBadge("●");
                // Bounce the dock
                if (ConfigUtil.getConfigItem("dockBouncing", true)) {
                    remote_1.app.dock.bounce();
                }
            }
        });
        webContents.addListener("context-menu", (event, menuParameters) => {
            (0, context_menu_1.contextMenu)(webContents, event, menuParameters);
        });
        this.$el.addEventListener("dom-ready", () => {
            this.loading = false;
            this.props.switchLoading(false, this.props.url);
            this.show();
        });
        webContents.on("did-fail-load", (_event, _errorCode, errorDescription) => {
            const hasConnectivityError = SystemUtil.connectivityError.includes(errorDescription);
            if (hasConnectivityError) {
                console.error("error", errorDescription);
                if (!this.props.url.includes("network.html")) {
                    this.props.onNetworkError(this.props.index);
                }
            }
        });
        this.$el.addEventListener("did-start-loading", () => {
            this.props.switchLoading(true, this.props.url);
        });
        this.$el.addEventListener("did-stop-loading", () => {
            this.props.switchLoading(false, this.props.url);
        });
    }
    getHasUnreads(title) {
        return !title.includes('[0]');
    }
    getBadgeCount(title) {
        if (!title.startsWith('COUNTS')) {
            return 0;
        }
        const messageCountInTitle = /-\((\d+)\)/.exec(title);
        return messageCountInTitle ? Number(messageCountInTitle[1]) : 0;
    }
    showNotificationSettings() {
        this.send("show-notification-settings");
    }
    show() {
        // Do not show WebView if another tab was selected and this tab should be in background.
        if (!this.props.isActive()) {
            return;
        }
        // To show or hide the loading indicator in the the active tab
        this.$webviewsContainer.toggle("loaded", !this.loading);
        this.$el.classList.add("active");
        this.focus();
        this.props.onTitleChange();
        // Injecting preload css in webview to override some css rules
        (async () => this.getWebContents().insertCSS(node_fs_1.default.readFileSync(node_path_1.default.join(__dirname, "/../../css/preload.css"), "utf8")))();
        // Get customCSS again from config util to avoid warning user again
        const customCss = ConfigUtil.getConfigItem("customCSS", null);
        this.customCss = customCss;
        if (customCss) {
            if (!node_fs_1.default.existsSync(customCss)) {
                this.customCss = null;
                ConfigUtil.setConfigItem("customCSS", null);
                const errorMessage = "The custom css previously set is deleted!";
                remote_1.dialog.showErrorBox("custom css file deleted!", errorMessage);
                return;
            }
            (async () => this.getWebContents().insertCSS(node_fs_1.default.readFileSync(node_path_1.default.resolve(__dirname, customCss), "utf8")))();
        }
    }
    focus() {
        this.$el.focus();
        // Work around https://github.com/electron/electron/issues/31918
        this.$el.shadowRoot?.querySelector("iframe")?.focus();
    }
    hide() {
        this.$el.classList.remove("active");
    }
    load() {
        this.show();
    }
    zoomIn() {
        this.zoomFactor += 0.1;
        this.getWebContents().setZoomFactor(this.zoomFactor);
    }
    zoomOut() {
        this.zoomFactor -= 0.1;
        this.getWebContents().setZoomFactor(this.zoomFactor);
    }
    zoomActualSize() {
        this.zoomFactor = 1;
        this.getWebContents().setZoomFactor(this.zoomFactor);
    }
    logOut() {
        this.send("logout");
    }
    showKeyboardShortcuts() {
        this.send("show-keyboard-shortcuts");
    }
    openDevTools() {
        this.getWebContents().openDevTools();
    }
    back() {
        if (this.getWebContents().canGoBack()) {
            this.getWebContents().goBack();
            this.focus();
        }
    }
    canGoBackButton() {
        const $backButton = document.querySelector("#actions-container #back-action");
        $backButton.classList.toggle("disable", !this.getWebContents().canGoBack());
    }
    forward() {
        if (this.getWebContents().canGoForward()) {
            this.getWebContents().goForward();
        }
    }
    reload() {
        this.hide();
        // Shows the loading indicator till the webview is reloaded
        this.$webviewsContainer.remove("loaded");
        this.loading = true;
        this.props.switchLoading(true, this.props.url);
        this.getWebContents().reload();
    }
    send(channel, ...args) {
        typed_ipc_renderer_1.ipcRenderer.sendTo(this.webContentsId, channel, ...args);
    }
}
exports.default = WebView;
