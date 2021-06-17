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
exports.ServerManagerView = void 0;
const common_1 = require("electron/common");
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const remote_1 = require("@electron/remote");
const remote = __importStar(require("@electron/remote"));
const Sentry = __importStar(require("@sentry/electron"));
const ConfigUtil = __importStar(require("../../common/config-util"));
const DNDUtil = __importStar(require("../../common/dnd-util"));
const EnterpriseUtil = __importStar(require("../../common/enterprise-util"));
const LinkUtil = __importStar(require("../../common/link-util"));
const logger_util_1 = __importDefault(require("../../common/logger-util"));
const Messages = __importStar(require("../../common/messages"));
const functional_tab_1 = __importDefault(require("./components/functional-tab"));
const server_tab_1 = __importDefault(require("./components/server-tab"));
const webview_1 = __importDefault(require("./components/webview"));
const about_1 = require("./pages/about");
const preference_1 = require("./pages/preference/preference");
const tray_1 = require("./tray");
const typed_ipc_renderer_1 = require("./typed-ipc-renderer");
const DomainUtil = __importStar(require("./utils/domain-util"));
const reconnect_util_1 = __importDefault(require("./utils/reconnect-util"));
Sentry.init({});
const logger = new logger_util_1.default({
    file: "errors.log",
});
const rendererDirectory = node_path_1.default.resolve(__dirname, "..");
const rootWebContents = remote.getCurrentWebContents();
const dingSound = new Audio("../resources/sounds/ding.ogg");
class ServerManagerView {
    constructor() {
        this.$addServerButton = document.querySelector("#add-tab");
        this.$tabsContainer = document.querySelector("#tabs-container");
        const $actionsContainer = document.querySelector("#actions-container");
        this.$reloadButton = $actionsContainer.querySelector("#reload-action");
        this.$loadingIndicator =
            $actionsContainer.querySelector("#loading-action");
        this.$settingsButton = $actionsContainer.querySelector("#settings-action");
        this.$webviewsContainer = document.querySelector("#webviews-container");
        this.$backButton = $actionsContainer.querySelector("#back-action");
        this.$dndButton = $actionsContainer.querySelector("#dnd-action");
        this.$addServerTooltip = document.querySelector("#add-server-tooltip");
        this.$reloadTooltip = $actionsContainer.querySelector("#reload-tooltip");
        this.$loadingTooltip = $actionsContainer.querySelector("#loading-tooltip");
        this.$settingsTooltip =
            $actionsContainer.querySelector("#setting-tooltip");
        // TODO: This should have been querySelector but the problem is that
        // querySelector doesn't return elements not present in dom whereas somehow
        // getElementsByClassName does. To fix this we need to call this after this.initTabs
        // is called in this.init.
        // eslint-disable-next-line unicorn/prefer-query-selector
        this.$serverIconTooltip = document.getElementsByClassName("server-tooltip");
        this.$backTooltip = $actionsContainer.querySelector("#back-tooltip");
        this.$dndTooltip = $actionsContainer.querySelector("#dnd-tooltip");
        this.$sidebar = document.querySelector("#sidebar");
        this.$fullscreenPopup = document.querySelector("#fullscreen-popup");
        this.$fullscreenEscapeKey = node_process_1.default.platform === "darwin" ? "^⌘F" : "F11";
        this.$fullscreenPopup.textContent = `Press ${this.$fullscreenEscapeKey} to exit full screen`;
        this.loading = new Set();
        this.activeTabIndex = -1;
        this.tabs = [];
        this.presetOrgs = [];
        this.functionalTabs = new Map();
        this.tabIndex = 0;
    }
    async init() {
        (0, tray_1.initializeTray)(this);
        await this.loadProxy();
        this.initDefaultSettings();
        this.initSidebar();
        this.removeUaFromDisk();
        if (EnterpriseUtil.hasConfigFile()) {
            await this.initPresetOrgs();
        }
        await this.initTabs();
        this.initActions();
        this.registerIpcs();
    }
    async loadProxy() {
        // To change proxyEnable to useManualProxy in older versions
        const proxyEnabledOld = ConfigUtil.isConfigItemExists("useProxy");
        if (proxyEnabledOld) {
            const proxyEnableOldState = ConfigUtil.getConfigItem("useProxy", false);
            if (proxyEnableOldState) {
                ConfigUtil.setConfigItem("useManualProxy", true);
            }
            ConfigUtil.removeConfigItem("useProxy");
        }
        await remote_1.session.fromPartition("persist:webviewsession").setProxy(ConfigUtil.getConfigItem("useSystemProxy", false)
            ? { mode: "system" }
            : ConfigUtil.getConfigItem("useManualProxy", false)
                ? {
                    pacScript: ConfigUtil.getConfigItem("proxyPAC", ""),
                    proxyRules: ConfigUtil.getConfigItem("proxyRules", ""),
                    proxyBypassRules: ConfigUtil.getConfigItem("proxyBypass", ""),
                }
                : { mode: "direct" });
    }
    // Settings are initialized only when user clicks on General/Server/Network section settings
    // In case, user doesn't visit these section, those values set to be null automatically
    // This will make sure the default settings are correctly set to either true or false
    initDefaultSettings() {
        // Default settings which should be respected
        const settingOptions = {
            autoHideMenubar: false,
            trayIcon: true,
            useManualProxy: false,
            useSystemProxy: false,
            showSidebar: true,
            badgeOption: true,
            startAtLogin: false,
            startMinimized: false,
            enableSpellchecker: true,
            showNotification: true,
            autoUpdate: true,
            betaUpdate: false,
            errorReporting: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            customCSS: false,
            silent: false,
            lastActiveTab: 0,
            dnd: false,
            dndPreviousSettings: {
                showNotification: true,
                silent: false,
            },
            downloadsPath: `${remote_1.app.getPath("downloads")}`,
            quitOnClose: false,
            promptDownload: false,
        };
        // Platform specific settings
        if (node_process_1.default.platform === "win32") {
            // Only available on Windows
            settingOptions.flashTaskbarOnMessage = true;
            settingOptions.dndPreviousSettings.flashTaskbarOnMessage = true;
        }
        if (node_process_1.default.platform === "darwin") {
            // Only available on macOS
            settingOptions.dockBouncing = true;
        }
        if (node_process_1.default.platform !== "darwin") {
            settingOptions.autoHideMenubar = false;
            settingOptions.spellcheckerLanguages = ["en-US"];
        }
        for (const [setting, value] of Object.entries(settingOptions)) {
            // Give preference to defaults defined in global_config.json
            if (EnterpriseUtil.configItemExists(setting)) {
                ConfigUtil.setConfigItem(setting, EnterpriseUtil.getConfigItem(setting, value), true);
            }
            else if (!ConfigUtil.isConfigItemExists(setting)) {
                ConfigUtil.setConfigItem(setting, value);
            }
        }
    }
    initSidebar() {
        const showSidebar = ConfigUtil.getConfigItem("showSidebar", true);
        this.toggleSidebar(showSidebar);
    }
    // Remove the stale UA string from the disk if the app is not freshly
    // installed.  This should be removed in a further release.
    removeUaFromDisk() {
        ConfigUtil.removeConfigItem("userAgent");
    }
    async queueDomain(domain) {
        // Allows us to start adding multiple domains to the app simultaneously
        // promise of addition resolves in both cases, but we consider it rejected
        // if the resolved value is false
        try {
            const serverConf = await DomainUtil.checkDomain(domain);
            await DomainUtil.addDomain(serverConf);
            return true;
        }
        catch (error) {
            logger.error(error);
            logger.error(`Could not add ${domain}. Please contact your system administrator.`);
            return false;
        }
    }
    async initPresetOrgs() {
        // Read preset organizations from global_config.json and queues them
        // for addition to the app's domains
        const preAddedDomains = DomainUtil.getDomains();
        this.presetOrgs = EnterpriseUtil.getConfigItem("presetOrganizations", []);
        // Set to true if at least one new domain is added
        const domainPromises = [];
        for (const url of this.presetOrgs) {
            if (DomainUtil.duplicateDomain(url)) {
                continue;
            }
            domainPromises.push(this.queueDomain(url));
        }
        const domainsAdded = await Promise.all(domainPromises);
        if (domainsAdded.includes(true)) {
            // At least one domain was resolved
            if (preAddedDomains.length > 0) {
                // User already has servers added
                // ask them before reloading the app
                const { response } = await remote_1.dialog.showMessageBox({
                    type: "question",
                    buttons: ["Yes", "Later"],
                    defaultId: 0,
                    message: "New server" +
                        (domainsAdded.length > 1 ? "s" : "") +
                        " added. Reload app now?",
                });
                if (response === 0) {
                    typed_ipc_renderer_1.ipcRenderer.send("reload-full-app");
                }
            }
            else {
                typed_ipc_renderer_1.ipcRenderer.send("reload-full-app");
            }
        }
        else if (domainsAdded.length > 0) {
            // Find all orgs that failed
            const failedDomains = [];
            for (const org of this.presetOrgs) {
                if (DomainUtil.duplicateDomain(org)) {
                    continue;
                }
                failedDomains.push(org);
            }
            const { title, content } = Messages.enterpriseOrgError(domainsAdded.length, failedDomains);
            remote_1.dialog.showErrorBox(title, content);
            if (DomainUtil.getDomains().length === 0) {
                // No orgs present, stop showing loading gif
                await this.openSettings("AddServer");
            }
        }
    }
    async initTabs() {
        const servers = DomainUtil.getDomains();
        if (servers.length > 0) {
            for (const [i, server] of servers.entries()) {
                this.initServer(server, i);
            }
            // Open last active tab
            let lastActiveTab = ConfigUtil.getConfigItem("lastActiveTab", 0);
            if (lastActiveTab >= servers.length) {
                lastActiveTab = 0;
            }
            // `checkDomain()` and `webview.load()` for lastActiveTab before the others
            await DomainUtil.updateSavedServer(servers[lastActiveTab].url, lastActiveTab);
            await this.activateTab(lastActiveTab);
            await Promise.all(servers.map(async (server, i) => {
                // After the lastActiveTab is activated, we load the others in the background
                // without activating them, to prevent flashing of server icons
                if (i === lastActiveTab) {
                    return;
                }
                await DomainUtil.updateSavedServer(server.url, i);
                const tab = this.tabs[i];
                if (tab instanceof server_tab_1.default)
                    (await tab.webview).load();
            }));
            // Remove focus from the settings icon at sidebar bottom
            this.$settingsButton.classList.remove("active");
        }
        else if (this.presetOrgs.length === 0) {
            // Not attempting to add organisations in the background
            await this.openSettings("AddServer");
        }
        else {
            this.showLoading(true);
        }
    }
    initServer(server, index) {
        const tabIndex = this.getTabIndex();
        this.tabs.push(new server_tab_1.default({
            role: "server",
            icon: server.icon,
            name: server.alias,
            $root: this.$tabsContainer,
            onClick: this.activateLastTab.bind(this, index),
            index,
            tabIndex,
            onHover: this.onHover.bind(this, index),
            onHoverOut: this.onHoverOut.bind(this, index),
            webview: webview_1.default.create({
                $root: this.$webviewsContainer,
                rootWebContents,
                index,
                tabIndex,
                url: server.url,
                role: "server",
                hasPermission: (origin, permission) => origin === server.url && permission === "notifications",
                isActive: () => index === this.activeTabIndex,
                switchLoading: async (loading, url) => {
                    if (loading) {
                        this.loading.add(url);
                    }
                    else {
                        this.loading.delete(url);
                    }
                    const tab = this.tabs[this.activeTabIndex];
                    this.showLoading(tab instanceof server_tab_1.default &&
                        this.loading.has((await tab.webview).props.url));
                },
                onNetworkError: async (index) => {
                    await this.openNetworkTroubleshooting(index);
                },
                onTitleChange: this.updateBadge.bind(this),
                preload: "js/preload.js",
            }),
        }));
        this.loading.add(server.url);
    }
    initActions() {
        this.initDndButton();
        this.initServerActions();
        this.initLeftSidebarEvents();
    }
    initServerActions() {
        const $serverImgs = document.querySelectorAll(".server-icons");
        for (const [index, $serverImg] of $serverImgs.entries()) {
            this.addContextMenu($serverImg, index);
            if ($serverImg.src.includes("img/icon.png")) {
                this.displayInitialCharLogo($serverImg, index);
            }
            $serverImg.addEventListener("error", () => {
                this.displayInitialCharLogo($serverImg, index);
            });
        }
    }
    initLeftSidebarEvents() {
        this.$dndButton.addEventListener("click", () => {
            const dndUtil = DNDUtil.toggle();
            typed_ipc_renderer_1.ipcRenderer.send("forward-message", "toggle-dnd", dndUtil.dnd, dndUtil.newSettings);
        });
        this.$reloadButton.addEventListener("click", async () => {
            const tab = this.tabs[this.activeTabIndex];
            if (tab instanceof server_tab_1.default)
                (await tab.webview).reload();
        });
        this.$addServerButton.addEventListener("click", async () => {
            await this.openSettings("AddServer");
        });
        this.$settingsButton.addEventListener("click", async () => {
            await this.openSettings("General");
        });
        this.$backButton.addEventListener("click", async () => {
            const tab = this.tabs[this.activeTabIndex];
            if (tab instanceof server_tab_1.default)
                (await tab.webview).back();
        });
        this.sidebarHoverEvent(this.$addServerButton, this.$addServerTooltip, true);
        this.sidebarHoverEvent(this.$loadingIndicator, this.$loadingTooltip);
        this.sidebarHoverEvent(this.$settingsButton, this.$settingsTooltip);
        this.sidebarHoverEvent(this.$reloadButton, this.$reloadTooltip);
        this.sidebarHoverEvent(this.$backButton, this.$backTooltip);
        this.sidebarHoverEvent(this.$dndButton, this.$dndTooltip);
    }
    initDndButton() {
        const dnd = ConfigUtil.getConfigItem("dnd", false);
        this.toggleDndButton(dnd);
    }
    getTabIndex() {
        const currentIndex = this.tabIndex;
        this.tabIndex++;
        return currentIndex;
    }
    async getCurrentActiveServer() {
        const tab = this.tabs[this.activeTabIndex];
        return tab instanceof server_tab_1.default ? (await tab.webview).props.url : "";
    }
    displayInitialCharLogo($img, index) {
        // The index parameter is needed because webview[data-tab-id] can
        // increment beyond the size of the sidebar org array and throw an
        // error
        const $altIcon = document.createElement("div");
        const $parent = $img.parentElement;
        const $container = $parent.parentElement;
        const webviewId = $container.dataset.tabId;
        const $webview = document.querySelector(`webview[data-tab-id="${CSS.escape(webviewId)}"]`);
        const realmName = $webview.getAttribute("name");
        if (realmName === null) {
            $img.src = "/img/icon.png";
            return;
        }
        $altIcon.textContent = realmName.charAt(0) || "Z";
        $altIcon.classList.add("server-icon");
        $altIcon.classList.add("alt-icon");
        $img.remove();
        $parent.append($altIcon);
        this.addContextMenu($altIcon, index);
    }
    sidebarHoverEvent(SidebarButton, SidebarTooltip, addServer = false) {
        SidebarButton.addEventListener("mouseover", () => {
            SidebarTooltip.removeAttribute("style");
            // To handle position of add server tooltip due to scrolling of list of organizations
            // This could not be handled using CSS, hence the top of the tooltip is made same
            // as that of its parent element.
            // This needs to handled only for the add server tooltip and not others.
            if (addServer) {
                const { top } = SidebarButton.getBoundingClientRect();
                SidebarTooltip.style.top = `${top}px`;
            }
        });
        SidebarButton.addEventListener("mouseout", () => {
            SidebarTooltip.style.display = "none";
        });
    }
    onHover(index) {
        // `this.$serverIconTooltip[index].textContent` already has realm name, so we are just
        // removing the style.
        this.$serverIconTooltip[index].removeAttribute("style");
        // To handle position of servers' tooltip due to scrolling of list of organizations
        // This could not be handled using CSS, hence the top of the tooltip is made same
        // as that of its parent element.
        const { top } = this.$serverIconTooltip[index].parentElement.getBoundingClientRect();
        this.$serverIconTooltip[index].style.top = `${top}px`;
    }
    onHoverOut(index) {
        this.$serverIconTooltip[index].style.display = "none";
    }
    async openFunctionalTab(tabProps) {
        if (this.functionalTabs.has(tabProps.name)) {
            await this.activateTab(this.functionalTabs.get(tabProps.name));
            return;
        }
        const index = this.tabs.length;
        this.functionalTabs.set(tabProps.name, index);
        const tabIndex = this.getTabIndex();
        const $view = tabProps.makeView();
        this.$webviewsContainer.append($view);
        this.tabs.push(new functional_tab_1.default({
            role: "function",
            materialIcon: tabProps.materialIcon,
            name: tabProps.name,
            $root: this.$tabsContainer,
            index,
            tabIndex,
            onClick: this.activateTab.bind(this, index),
            onDestroy: async () => {
                await this.destroyTab(tabProps.name, index);
                tabProps.destroyView();
            },
            $view,
        }));
        // To show loading indicator the first time a functional tab is opened, indicator is
        // closed when the functional tab DOM is ready, handled in webview.js
        this.$webviewsContainer.classList.remove("loaded");
        await this.activateTab(this.functionalTabs.get(tabProps.name));
    }
    async openSettings(nav = "General") {
        await this.openFunctionalTab({
            name: "Settings",
            materialIcon: "settings",
            makeView: () => {
                this.preferenceView = new preference_1.PreferenceView();
                this.preferenceView.$view.classList.add("functional-view");
                return this.preferenceView.$view;
            },
            destroyView: () => {
                this.preferenceView.destroy();
                this.preferenceView = undefined;
            },
        });
        this.$settingsButton.classList.add("active");
        this.preferenceView.handleNavigation(nav);
    }
    async openAbout() {
        let aboutView;
        await this.openFunctionalTab({
            name: "About",
            materialIcon: "sentiment_very_satisfied",
            makeView() {
                aboutView = new about_1.AboutView();
                aboutView.$view.classList.add("functional-view");
                return aboutView.$view;
            },
            destroyView() {
                aboutView.destroy();
            },
        });
    }
    async openNetworkTroubleshooting(index) {
        const tab = this.tabs[index];
        if (!(tab instanceof server_tab_1.default))
            return;
        const webview = await tab.webview;
        const reconnectUtil = new reconnect_util_1.default(webview);
        reconnectUtil.pollInternetAndReload();
        await webview
            .getWebContents()
            .loadURL(`file://${rendererDirectory}/network.html`);
    }
    async activateLastTab(index) {
        // Open all the tabs in background, also activate the tab based on the index
        await this.activateTab(index);
        // Save last active tab via main process to avoid JSON DB errors
        typed_ipc_renderer_1.ipcRenderer.send("save-last-tab", index);
    }
    // Returns this.tabs in an way that does
    // not crash app when this.tabs is passed into
    // ipcRenderer. Something about webview, and props.webview
    // properties in ServerTab causes the app to crash.
    get tabsForIpc() {
        return this.tabs.map((tab) => ({
            role: tab.props.role,
            name: tab.props.name,
            index: tab.props.index,
        }));
    }
    async activateTab(index, hideOldTab = true) {
        const tab = this.tabs[index];
        if (!tab) {
            return;
        }
        if (this.activeTabIndex !== -1) {
            if (this.activeTabIndex === index) {
                return;
            }
            if (hideOldTab) {
                // If old tab is functional tab Settings, remove focus from the settings icon at sidebar bottom
                if (this.tabs[this.activeTabIndex].props.role === "function" &&
                    this.tabs[this.activeTabIndex].props.name === "Settings") {
                    this.$settingsButton.classList.remove("active");
                }
                await this.tabs[this.activeTabIndex].deactivate();
            }
        }
        if (tab instanceof server_tab_1.default) {
            try {
                (await tab.webview).canGoBackButton();
            }
            catch { }
        }
        else {
            document
                .querySelector("#actions-container #back-action")
                .classList.add("disable");
        }
        this.activeTabIndex = index;
        await tab.activate();
        this.showLoading(tab instanceof server_tab_1.default &&
            this.loading.has((await tab.webview).props.url));
        typed_ipc_renderer_1.ipcRenderer.send("update-menu", {
            // JSON stringify this.tabs to avoid a crash
            // util.inspect is being used to handle circular references
            tabs: this.tabsForIpc,
            activeTabIndex: this.activeTabIndex,
            // Following flag controls whether a menu item should be enabled or not
            enableMenu: tab.props.role === "server",
        });
    }
    showLoading(loading) {
        this.$reloadButton.classList.toggle("hidden", loading);
        this.$loadingIndicator.classList.toggle("hidden", !loading);
    }
    async destroyTab(name, index) {
        const tab = this.tabs[index];
        if (tab instanceof server_tab_1.default && (await tab.webview).loading) {
            return;
        }
        await tab.destroy();
        delete this.tabs[index];
        this.functionalTabs.delete(name);
        // Issue #188: If the functional tab was not focused, do not activate another tab.
        if (this.activeTabIndex === index) {
            await this.activateTab(0, false);
        }
    }
    destroyView() {
        // Show loading indicator
        this.$webviewsContainer.classList.remove("loaded");
        // Clear global variables
        this.activeTabIndex = -1;
        this.tabs = [];
        this.functionalTabs.clear();
        // Clear DOM elements
        this.$tabsContainer.textContent = "";
        this.$webviewsContainer.textContent = "";
    }
    async reloadView() {
        // Save and remember the index of last active tab so that we can use it later
        const lastActiveTab = this.tabs[this.activeTabIndex].props.index;
        ConfigUtil.setConfigItem("lastActiveTab", lastActiveTab);
        // Destroy the current view and re-initiate it
        this.destroyView();
        await this.initTabs();
        this.initServerActions();
    }
    // This will trigger when pressed CTRL/CMD + R [WIP]
    // It won't reload the current view properly when you add/delete a server.
    reloadCurrentView() {
        this.$reloadButton.click();
    }
    async updateBadge() {
        let messageCountAll = 0;
        let hasUnreads = false;
        for (const tab of this.tabs) {
            if (tab && tab instanceof server_tab_1.default && tab.updateBadge) {
                const count = (await tab.webview).badgeCount;
                hasUnreads = hasUnreads || (await tab.webview).hasUnreads;
                messageCountAll += count;
                tab.updateBadge(count);
            }
        }
        typed_ipc_renderer_1.ipcRenderer.send("update-badge", messageCountAll, hasUnreads);
    }
    toggleSidebar(show) {
        this.$sidebar.classList.toggle("sidebar-hide", !show);
    }
    // Toggles the dnd button icon.
    toggleDndButton(alert) {
        this.$dndTooltip.textContent =
            (alert ? "Disable" : "Enable") + " Do Not Disturb";
        this.$dndButton.querySelector("i").textContent = alert
            ? "notifications_off"
            : "notifications";
    }
    async isLoggedIn(tabIndex) {
        const tab = this.tabs[tabIndex];
        if (!(tab instanceof server_tab_1.default))
            return false;
        const webview = await tab.webview;
        const url = webview.getWebContents().getURL();
        return !(url.endsWith("/login/") || webview.loading);
    }
    addContextMenu($serverImg, index) {
        $serverImg.addEventListener("contextmenu", async (event) => {
            event.preventDefault();
            const template = [
                {
                    label: "Disconnect organization",
                    async click() {
                        const { response } = await remote_1.dialog.showMessageBox({
                            type: "warning",
                            buttons: ["YES", "NO"],
                            defaultId: 0,
                            message: "Are you sure you want to disconnect this organization?",
                        });
                        if (response === 0) {
                            if (DomainUtil.removeDomain(index)) {
                                typed_ipc_renderer_1.ipcRenderer.send("reload-full-app");
                            }
                            else {
                                const { title, content } = Messages.orgRemovalError(DomainUtil.getDomain(index).url);
                                remote_1.dialog.showErrorBox(title, content);
                            }
                        }
                    },
                },
                {
                    label: "Notification settings",
                    enabled: await this.isLoggedIn(index),
                    click: async () => {
                        // Switch to tab whose icon was right-clicked
                        await this.activateTab(index);
                        const tab = this.tabs[index];
                        if (tab instanceof server_tab_1.default)
                            (await tab.webview).showNotificationSettings();
                    },
                },
                {
                    label: "Copy Zulip URL",
                    click() {
                        common_1.clipboard.writeText(DomainUtil.getDomain(index).url);
                    },
                },
            ];
            const contextMenu = remote_1.Menu.buildFromTemplate(template);
            contextMenu.popup({ window: remote.getCurrentWindow() });
        });
    }
    registerIpcs() {
        const webviewListeners = [
            [
                "webview-reload",
                (webview) => {
                    webview.reload();
                },
            ],
            [
                "back",
                (webview) => {
                    webview.back();
                },
            ],
            [
                "focus",
                (webview) => {
                    webview.focus();
                },
            ],
            [
                "forward",
                (webview) => {
                    webview.forward();
                },
            ],
            [
                "zoomIn",
                (webview) => {
                    webview.zoomIn();
                },
            ],
            [
                "zoomOut",
                (webview) => {
                    webview.zoomOut();
                },
            ],
            [
                "zoomActualSize",
                (webview) => {
                    webview.zoomActualSize();
                },
            ],
            [
                "log-out",
                (webview) => {
                    webview.logOut();
                },
            ],
            [
                "show-keyboard-shortcuts",
                (webview) => {
                    webview.showKeyboardShortcuts();
                },
            ],
            [
                "tab-devtools",
                (webview) => {
                    webview.openDevTools();
                },
            ],
        ];
        for (const [channel, listener] of webviewListeners) {
            typed_ipc_renderer_1.ipcRenderer.on(channel, async () => {
                const tab = this.tabs[this.activeTabIndex];
                if (tab instanceof server_tab_1.default) {
                    const activeWebview = await tab.webview;
                    if (activeWebview)
                        listener(activeWebview);
                }
            });
        }
        typed_ipc_renderer_1.ipcRenderer.on("permission-request", async (event, { webContentsId, origin, permission, }, permissionCallbackId) => {
            const grant = webContentsId === null
                ? origin === "null" && permission === "notifications"
                : (await Promise.all(this.tabs.map(async (tab) => {
                    if (!(tab instanceof server_tab_1.default))
                        return false;
                    const webview = await tab.webview;
                    return (webview.webContentsId === webContentsId &&
                        webview.props.hasPermission?.(origin, permission));
                }))).some(Boolean);
            console.log(grant ? "Granted" : "Denied", "permissions request for", permission, "from", origin);
            typed_ipc_renderer_1.ipcRenderer.send("permission-callback", permissionCallbackId, grant);
        });
        typed_ipc_renderer_1.ipcRenderer.on("open-settings", async () => {
            await this.openSettings();
        });
        typed_ipc_renderer_1.ipcRenderer.on("open-about", this.openAbout.bind(this));
        typed_ipc_renderer_1.ipcRenderer.on("open-help", async () => {
            // Open help page of current active server
            await LinkUtil.openBrowser(new URL("https://zulip.com/help/"));
        });
        typed_ipc_renderer_1.ipcRenderer.on("reload-viewer", this.reloadView.bind(this, this.tabs[this.activeTabIndex].props.index));
        typed_ipc_renderer_1.ipcRenderer.on("reload-current-viewer", this.reloadCurrentView.bind(this));
        typed_ipc_renderer_1.ipcRenderer.on("hard-reload", () => {
            typed_ipc_renderer_1.ipcRenderer.send("reload-full-app");
        });
        typed_ipc_renderer_1.ipcRenderer.on("switch-server-tab", async (event, index) => {
            await this.activateLastTab(index);
        });
        typed_ipc_renderer_1.ipcRenderer.on("open-org-tab", async () => {
            await this.openSettings("AddServer");
        });
        typed_ipc_renderer_1.ipcRenderer.on("reload-proxy", async (event, showAlert) => {
            await this.loadProxy();
            if (showAlert) {
                await remote_1.dialog.showMessageBox({
                    message: "Proxy settings saved!",
                    buttons: ["OK"],
                });
                typed_ipc_renderer_1.ipcRenderer.send("reload-full-app");
            }
        });
        typed_ipc_renderer_1.ipcRenderer.on("toggle-sidebar", async (event, show) => {
            // Toggle the left sidebar
            this.toggleSidebar(show);
        });
        typed_ipc_renderer_1.ipcRenderer.on("toggle-silent", async (event, state) => Promise.all(this.tabs.map(async (tab) => {
            if (tab instanceof server_tab_1.default)
                (await tab.webview).getWebContents().setAudioMuted(state);
        })));
        typed_ipc_renderer_1.ipcRenderer.on("toggle-autohide-menubar", async (event, autoHideMenubar, updateMenu) => {
            if (updateMenu) {
                typed_ipc_renderer_1.ipcRenderer.send("update-menu", {
                    tabs: this.tabsForIpc,
                    activeTabIndex: this.activeTabIndex,
                });
            }
        });
        typed_ipc_renderer_1.ipcRenderer.on("toggle-dnd", async (event, state, newSettings) => {
            this.toggleDndButton(state);
            typed_ipc_renderer_1.ipcRenderer.send("forward-message", "toggle-silent", newSettings.silent ?? false);
        });
        typed_ipc_renderer_1.ipcRenderer.on("update-realm-name", (event, serverURL, realmName) => {
            for (const [index, domain] of DomainUtil.getDomains().entries()) {
                if (domain.url.includes(serverURL)) {
                    const serverTooltipSelector = ".tab .server-tooltip";
                    const serverTooltips = document.querySelectorAll(serverTooltipSelector);
                    serverTooltips[index].textContent = realmName;
                    this.tabs[index].props.name = realmName;
                    domain.alias = realmName;
                    DomainUtil.updateDomain(index, domain);
                    // Update the realm name also on the Window menu
                    typed_ipc_renderer_1.ipcRenderer.send("update-menu", {
                        tabs: this.tabsForIpc,
                        activeTabIndex: this.activeTabIndex,
                    });
                }
            }
        });
        typed_ipc_renderer_1.ipcRenderer.on("update-realm-icon", async (event, serverURL, iconURL) => {
            await Promise.all(DomainUtil.getDomains().map(async (domain, index) => {
                if (domain.url.includes(serverURL)) {
                    const localIconUrl = await DomainUtil.saveServerIcon(iconURL);
                    const serverImgsSelector = ".tab .server-icons";
                    const serverImgs = document.querySelectorAll(serverImgsSelector);
                    serverImgs[index].src = localIconUrl;
                    domain.icon = localIconUrl;
                    DomainUtil.updateDomain(index, domain);
                }
            }));
        });
        typed_ipc_renderer_1.ipcRenderer.on("enter-fullscreen", () => {
            this.$fullscreenPopup.classList.add("show");
            this.$fullscreenPopup.classList.remove("hidden");
        });
        typed_ipc_renderer_1.ipcRenderer.on("leave-fullscreen", () => {
            this.$fullscreenPopup.classList.remove("show");
        });
        typed_ipc_renderer_1.ipcRenderer.on("focus-webview-with-id", async (event, webviewId) => Promise.all(this.tabs.map(async (tab) => {
            if (tab instanceof server_tab_1.default &&
                (await tab.webview).webContentsId === webviewId) {
                const concurrentTab = document.querySelector(`div[data-tab-id="${CSS.escape(`${tab.props.tabIndex}`)}"]`);
                concurrentTab.click();
            }
        })));
        typed_ipc_renderer_1.ipcRenderer.on("render-taskbar-icon", (event, messageCount) => {
            // Create a canvas from unread messagecounts
            function createOverlayIcon(messageCount) {
                const canvas = document.createElement("canvas");
                canvas.height = 128;
                canvas.width = 128;
                canvas.style.letterSpacing = "-5px";
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#f42020";
                ctx.beginPath();
                ctx.ellipse(64, 64, 64, 64, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                if (messageCount > 99) {
                    ctx.font = "65px Helvetica";
                    ctx.fillText("99+", 64, 85);
                }
                else if (messageCount < 10) {
                    ctx.font = "90px Helvetica";
                    ctx.fillText(String(Math.min(99, messageCount)), 64, 96);
                }
                else {
                    ctx.font = "85px Helvetica";
                    ctx.fillText(String(Math.min(99, messageCount)), 64, 90);
                }
                return canvas;
            }
            typed_ipc_renderer_1.ipcRenderer.send("update-taskbar-icon", createOverlayIcon(messageCount).toDataURL(), String(messageCount));
        });
        typed_ipc_renderer_1.ipcRenderer.on("copy-zulip-url", async () => {
            common_1.clipboard.writeText(await this.getCurrentActiveServer());
        });
        typed_ipc_renderer_1.ipcRenderer.on("new-server", async () => {
            await this.openSettings("AddServer");
        });
        typed_ipc_renderer_1.ipcRenderer.on("set-active", async () => Promise.all(this.tabs.map(async (tab) => {
            if (tab instanceof server_tab_1.default)
                (await tab.webview).send("set-active");
        })));
        typed_ipc_renderer_1.ipcRenderer.on("set-idle", async () => Promise.all(this.tabs.map(async (tab) => {
            if (tab instanceof server_tab_1.default)
                (await tab.webview).send("set-idle");
        })));
        typed_ipc_renderer_1.ipcRenderer.on("open-network-settings", async () => {
            await this.openSettings("Network");
        });
        typed_ipc_renderer_1.ipcRenderer.on("play-ding-sound", async () => {
            await dingSound.play();
        });
    }
}
exports.ServerManagerView = ServerManagerView;
window.addEventListener("load", async () => {
    const serverManagerView = new ServerManagerView();
    await serverManagerView.init();
});
