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
const main_1 = require("electron/main");
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const remoteMain = __importStar(require("@electron/remote/main"));
const electron_window_state_1 = __importDefault(require("electron-window-state"));
const ConfigUtil = __importStar(require("../common/config-util"));
const autoupdater_1 = require("./autoupdater");
const BadgeSettings = __importStar(require("./badge-settings"));
const handle_external_link_1 = __importDefault(require("./handle-external-link"));
const AppMenu = __importStar(require("./menu"));
const request_1 = require("./request");
const sentry_1 = require("./sentry");
const startup_1 = require("./startup");
const typed_ipc_main_1 = require("./typed-ipc-main");
// eslint-disable-next-line @typescript-eslint/naming-convention
const { GDK_BACKEND } = node_process_1.default.env;
// Initialize sentry for main process
(0, sentry_1.sentryInit)();
let mainWindowState;
// Prevent window being garbage collected
let mainWindow;
let badgeCount;
let isQuitting = false;
// Load this url in main window
const mainUrl = "file://" + node_path_1.default.join(__dirname, "../renderer", "main.html");
const permissionCallbacks = new Map();
let nextPermissionCallbackId = 0;
const appIcon = node_path_1.default.join(__dirname, "../resources", "Icon");
const iconPath = () => appIcon + (node_process_1.default.platform === "win32" ? ".ico" : ".png");
// Toggle the app window
const toggleApp = () => {
    if (!mainWindow.isVisible() || mainWindow.isMinimized()) {
        mainWindow.show();
    }
    else {
        mainWindow.hide();
    }
};
function createMainWindow() {
    // Load the previous state with fallback to defaults
    mainWindowState = (0, electron_window_state_1.default)({
        defaultWidth: 1100,
        defaultHeight: 720,
        path: `${main_1.app.getPath("userData")}/config`,
    });
    const win = new main_1.BrowserWindow({
        // This settings needs to be saved in config
        title: "Zulip",
        icon: iconPath(),
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 500,
        minHeight: 400,
        webPreferences: {
            preload: require.resolve("../renderer/js/main"),
            webviewTag: true,
        },
        show: false,
    });
    remoteMain.enable(win.webContents);
    win.on("focus", () => {
        (0, typed_ipc_main_1.send)(win.webContents, "focus");
    });
    (async () => win.loadURL(mainUrl))();
    // Keep the app running in background on close event
    win.on("close", (event) => {
        if (ConfigUtil.getConfigItem("quitOnClose", false)) {
            main_1.app.quit();
        }
        if (!isQuitting && !(0, autoupdater_1.shouldQuitForUpdate)()) {
            event.preventDefault();
            if (node_process_1.default.platform === "darwin") {
                main_1.app.hide();
            }
            else {
                win.hide();
            }
        }
    });
    win.setTitle("Zulip");
    win.on("enter-full-screen", () => {
        (0, typed_ipc_main_1.send)(win.webContents, "enter-fullscreen");
    });
    win.on("leave-full-screen", () => {
        (0, typed_ipc_main_1.send)(win.webContents, "leave-fullscreen");
    });
    //  To destroy tray icon when navigate to a new URL
    win.webContents.on("will-navigate", (event) => {
        if (event) {
            (0, typed_ipc_main_1.send)(win.webContents, "destroytray");
        }
    });
    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(win);
    return win;
}
(async () => {
    if (!main_1.app.requestSingleInstanceLock()) {
        main_1.app.quit();
        return;
    }
    await main_1.app.whenReady();
    if (node_process_1.default.env.GDK_BACKEND !== GDK_BACKEND) {
        console.warn("Reverting GDK_BACKEND to work around https://github.com/electron/electron/issues/28436");
        if (GDK_BACKEND === undefined) {
            delete node_process_1.default.env.GDK_BACKEND;
        }
        else {
            node_process_1.default.env.GDK_BACKEND = GDK_BACKEND;
        }
    }
    // Used for notifications on Windows
    main_1.app.setAppUserModelId("org.zulip.zulip-electron");
    remoteMain.initialize();
    main_1.app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.show();
        }
    });
    typed_ipc_main_1.ipcMain.on("permission-callback", (event, permissionCallbackId, grant) => {
        permissionCallbacks.get(permissionCallbackId)?.(grant);
        permissionCallbacks.delete(permissionCallbackId);
    });
    // This event is only available on macOS. Triggers when you click on the dock icon.
    main_1.app.on("activate", () => {
        mainWindow.show();
    });
    main_1.app.on("web-contents-created", (_event, contents) => {
        contents.setWindowOpenHandler((details) => {
            (0, handle_external_link_1.default)(contents, details, page);
            return { action: "deny" };
        });
    });
    const ses = main_1.session.fromPartition("persist:webviewsession");
    ses.setUserAgent(`ZulipElectron/${main_1.app.getVersion()} ${ses.getUserAgent()}`);
    function configureSpellChecker() {
        const enable = ConfigUtil.getConfigItem("enableSpellchecker", true);
        if (enable && node_process_1.default.platform !== "darwin") {
            ses.setSpellCheckerLanguages(ConfigUtil.getConfigItem("spellcheckerLanguages", null) ?? []);
        }
        ses.setSpellCheckerEnabled(enable);
    }
    configureSpellChecker();
    typed_ipc_main_1.ipcMain.on("configure-spell-checker", configureSpellChecker);
    AppMenu.setMenu({
        tabs: [],
    });
    mainWindow = createMainWindow();
    // Auto-hide menu bar on Windows + Linux
    if (node_process_1.default.platform !== "darwin") {
        const shouldHideMenu = ConfigUtil.getConfigItem("autoHideMenubar", false);
        mainWindow.autoHideMenuBar = shouldHideMenu;
        mainWindow.setMenuBarVisibility(!shouldHideMenu);
    }
    const page = mainWindow.webContents;
    page.on("dom-ready", () => {
        if (ConfigUtil.getConfigItem("startMinimized", false)) {
            mainWindow.hide();
        }
        else {
            mainWindow.show();
        }
    });
    typed_ipc_main_1.ipcMain.on("fetch-user-agent", (event) => {
        event.returnValue = main_1.session
            .fromPartition("persist:webviewsession")
            .getUserAgent();
    });
    typed_ipc_main_1.ipcMain.handle("get-server-settings", async (event, domain) => (0, request_1._getServerSettings)(domain, ses));
    typed_ipc_main_1.ipcMain.handle("save-server-icon", async (event, url) => (0, request_1._saveServerIcon)(url, ses));
    typed_ipc_main_1.ipcMain.handle("is-online", async (event, url) => (0, request_1._isOnline)(url, ses));
    page.once("did-frame-finish-load", async () => {
        // Initiate auto-updates on MacOS and Windows
        if (ConfigUtil.getConfigItem("autoUpdate", true)) {
            await (0, autoupdater_1.appUpdater)();
        }
    });
    main_1.app.on("certificate-error", (event, webContents, urlString, error) => {
        const url = new URL(urlString);
        main_1.dialog.showErrorBox("Certificate error", `The server presented an invalid certificate for ${url.origin}:

${error}`);
    });
    ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
        const { origin } = new URL(details.requestingUrl);
        const permissionCallbackId = nextPermissionCallbackId++;
        permissionCallbacks.set(permissionCallbackId, callback);
        (0, typed_ipc_main_1.send)(page, "permission-request", {
            webContentsId: webContents.id === mainWindow.webContents.id
                ? null
                : webContents.id,
            origin,
            permission,
        }, permissionCallbackId);
    });
    // Temporarily remove this event
    // powerMonitor.on('resume', () => {
    // 	mainWindow.reload();
    // 	send(page, 'destroytray');
    // });
    typed_ipc_main_1.ipcMain.on("focus-app", () => {
        mainWindow.show();
    });
    typed_ipc_main_1.ipcMain.on("quit-app", () => {
        main_1.app.quit();
    });
    // Reload full app not just webview, useful in debugging
    typed_ipc_main_1.ipcMain.on("reload-full-app", () => {
        mainWindow.reload();
        (0, typed_ipc_main_1.send)(page, "destroytray");
    });
    typed_ipc_main_1.ipcMain.on("clear-app-settings", () => {
        mainWindowState.unmanage();
        main_1.app.relaunch();
        main_1.app.exit();
    });
    typed_ipc_main_1.ipcMain.on("toggle-app", () => {
        toggleApp();
    });
    typed_ipc_main_1.ipcMain.on("toggle-badge-option", () => {
        BadgeSettings.updateBadge(badgeCount, badgeCount === 0, mainWindow);
    });
    typed_ipc_main_1.ipcMain.on("toggle-menubar", (_event, showMenubar) => {
        mainWindow.autoHideMenuBar = showMenubar;
        mainWindow.setMenuBarVisibility(!showMenubar);
        (0, typed_ipc_main_1.send)(page, "toggle-autohide-menubar", showMenubar, true);
    });
    typed_ipc_main_1.ipcMain.on("update-badge", (_event, messageCount, hasUnreads) => {
        badgeCount = messageCount;
        BadgeSettings.updateBadge(badgeCount, hasUnreads, mainWindow);
        (0, typed_ipc_main_1.send)(page, "tray", messageCount);
    });
    typed_ipc_main_1.ipcMain.on("update-taskbar-icon", (_event, data, text) => {
        BadgeSettings.updateTaskbarIcon(data, text, mainWindow);
    });
    typed_ipc_main_1.ipcMain.on("forward-message", (_event, listener, ...parameters) => {
        (0, typed_ipc_main_1.send)(page, listener, ...parameters);
    });
    typed_ipc_main_1.ipcMain.on("update-menu", (_event, props) => {
        AppMenu.setMenu(props);
        if (props.activeTabIndex !== undefined) {
            const activeTab = props.tabs[props.activeTabIndex];
            mainWindow.setTitle(`Zulip - ${activeTab.name}`);
        }
    });
    typed_ipc_main_1.ipcMain.on("toggleAutoLauncher", async (_event, AutoLaunchValue) => {
        await (0, startup_1.setAutoLaunch)(AutoLaunchValue);
    });
    typed_ipc_main_1.ipcMain.on("realm-name-changed", (_event, serverURL, realmName) => {
        (0, typed_ipc_main_1.send)(page, "update-realm-name", serverURL, realmName);
    });
    typed_ipc_main_1.ipcMain.on("realm-icon-changed", (_event, serverURL, iconURL) => {
        (0, typed_ipc_main_1.send)(page, "update-realm-icon", serverURL, iconURL);
    });
    typed_ipc_main_1.ipcMain.on("save-last-tab", (_event, index) => {
        ConfigUtil.setConfigItem("lastActiveTab", index);
    });
    typed_ipc_main_1.ipcMain.on("focus-this-webview", (event) => {
        (0, typed_ipc_main_1.send)(page, "focus-webview-with-id", event.sender.id);
        mainWindow.show();
    });
    // Update user idle status for each realm after every 15s
    const idleCheckInterval = 15 * 1000; // 15 seconds
    setInterval(() => {
        // Set user idle if no activity in 1 second (idleThresholdSeconds)
        const idleThresholdSeconds = 1; // 1 second
        const idleState = main_1.powerMonitor.getSystemIdleState(idleThresholdSeconds);
        if (idleState === "active") {
            (0, typed_ipc_main_1.send)(page, "set-active");
        }
        else {
            (0, typed_ipc_main_1.send)(page, "set-idle");
        }
    }, idleCheckInterval);
})();
main_1.app.on("before-quit", () => {
    isQuitting = true;
});
// Send crash reports
node_process_1.default.on("uncaughtException", (error) => {
    console.error(error);
    console.error(error.stack);
});
