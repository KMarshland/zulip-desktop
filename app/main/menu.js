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
exports.setMenu = void 0;
const common_1 = require("electron/common");
const main_1 = require("electron/main");
const node_process_1 = __importDefault(require("node:process"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const ConfigUtil = __importStar(require("../common/config-util"));
const DNDUtil = __importStar(require("../common/dnd-util"));
const t = __importStar(require("../common/translation-util"));
const autoupdater_1 = require("./autoupdater");
const typed_ipc_main_1 = require("./typed-ipc-main");
const appName = main_1.app.name;
function getHistorySubmenu(enableMenu) {
    return [
        {
            label: t.__("Back"),
            accelerator: node_process_1.default.platform === "darwin" ? "Command+Left" : "Alt+Left",
            enabled: enableMenu,
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("back");
                }
            },
        },
        {
            label: t.__("Forward"),
            accelerator: node_process_1.default.platform === "darwin" ? "Command+Right" : "Alt+Right",
            enabled: enableMenu,
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("forward");
                }
            },
        },
    ];
}
function getToolsSubmenu() {
    return [
        {
            label: t.__("Check for Updates"),
            async click() {
                await checkForUpdate();
            },
        },
        {
            label: t.__("Release Notes"),
            async click() {
                await common_1.shell.openExternal(`https://github.com/zulip/zulip-desktop/releases/tag/v${main_1.app.getVersion()}`);
            },
        },
        {
            type: "separator",
        },
        {
            label: t.__("Download App Logs"),
            click() {
                const zip = new adm_zip_1.default();
                const date = new Date();
                const dateString = date.toLocaleDateString().replace(/\//g, "-");
                // Create a zip file of all the logs and config data
                zip.addLocalFolder(`${main_1.app.getPath("appData")}/${appName}/Logs`);
                zip.addLocalFolder(`${main_1.app.getPath("appData")}/${appName}/config`);
                // Put the log file in downloads folder
                const logFilePath = `${main_1.app.getPath("downloads")}/Zulip-logs-${dateString}.zip`;
                zip.writeZip(logFilePath);
                // Open and select the log file
                common_1.shell.showItemInFolder(logFilePath);
            },
        },
        {
            type: "separator",
        },
        {
            label: t.__("Toggle DevTools for Zulip App"),
            accelerator: node_process_1.default.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.webContents.openDevTools({ mode: "undocked" });
                }
            },
        },
        {
            label: t.__("Toggle DevTools for Active Tab"),
            accelerator: node_process_1.default.platform === "darwin" ? "Alt+Command+U" : "Ctrl+Shift+U",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("tab-devtools");
                }
            },
        },
    ];
}
function getViewSubmenu() {
    return [
        {
            label: t.__("Reload"),
            accelerator: "CommandOrControl+R",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("reload-current-viewer");
                }
            },
        },
        {
            label: t.__("Hard Reload"),
            accelerator: "CommandOrControl+Shift+R",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("hard-reload");
                }
            },
        },
        {
            label: t.__("Hard Reload"),
            visible: false,
            accelerator: "F5",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("hard-reload");
                }
            },
        },
        {
            type: "separator",
        },
        {
            label: t.__("Toggle Full Screen"),
            role: "togglefullscreen",
        },
        {
            label: t.__("Zoom In"),
            accelerator: "CommandOrControl+=",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("zoomIn");
                }
            },
        },
        {
            label: t.__("Zoom In"),
            visible: false,
            accelerator: "CommandOrControl+Plus",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("zoomIn");
                }
            },
        },
        {
            label: t.__("Zoom In"),
            visible: false,
            accelerator: "CommandOrControl+numadd",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("zoomIn");
                }
            },
        },
        {
            label: t.__("Zoom Out"),
            accelerator: "CommandOrControl+-",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("zoomOut");
                }
            },
        },
        {
            label: t.__("Zoom Out"),
            visible: false,
            accelerator: "CommandOrControl+numsub",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("zoomOut");
                }
            },
        },
        {
            label: t.__("Actual Size"),
            accelerator: "CommandOrControl+0",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("zoomActualSize");
                }
            },
        },
        {
            label: t.__("Actual Size"),
            visible: false,
            accelerator: "CommandOrControl+num0",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("zoomActualSize");
                }
            },
        },
        {
            type: "separator",
        },
        {
            label: t.__("Toggle Tray Icon"),
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    (0, typed_ipc_main_1.send)(focusedWindow.webContents, "toggletray");
                }
            },
        },
        {
            label: t.__("Toggle Sidebar"),
            accelerator: "CommandOrControl+Shift+S",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    const newValue = !ConfigUtil.getConfigItem("showSidebar", true);
                    (0, typed_ipc_main_1.send)(focusedWindow.webContents, "toggle-sidebar", newValue);
                    ConfigUtil.setConfigItem("showSidebar", newValue);
                }
            },
        },
        {
            label: t.__("Auto hide Menu bar"),
            checked: ConfigUtil.getConfigItem("autoHideMenubar", false),
            visible: node_process_1.default.platform !== "darwin",
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    const newValue = !ConfigUtil.getConfigItem("autoHideMenubar", false);
                    focusedWindow.autoHideMenuBar = newValue;
                    focusedWindow.setMenuBarVisibility(!newValue);
                    (0, typed_ipc_main_1.send)(focusedWindow.webContents, "toggle-autohide-menubar", newValue, false);
                    ConfigUtil.setConfigItem("autoHideMenubar", newValue);
                }
            },
            type: "checkbox",
        },
    ];
}
function getHelpSubmenu() {
    return [
        {
            label: `${appName + " Desktop"} v${main_1.app.getVersion()}`,
            enabled: false,
        },
        {
            label: t.__("About Zulip"),
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("open-about");
                }
            },
        },
        {
            label: t.__("Help Center"),
            click(focusedWindow) {
                if (focusedWindow) {
                    sendAction("open-help");
                }
            },
        },
        {
            label: t.__("Report an Issue"),
            async click() {
                await common_1.shell.openExternal("https://zulip.com/help/contact-support");
            },
        },
    ];
}
function getWindowSubmenu(tabs, activeTabIndex) {
    const initialSubmenu = [
        {
            label: t.__("Minimize"),
            role: "minimize",
        },
        {
            label: t.__("Close"),
            role: "close",
        },
    ];
    if (tabs.length > 0) {
        const shortcutKey = node_process_1.default.platform === "darwin" ? "Cmd" : "Ctrl";
        initialSubmenu.push({
            type: "separator",
        });
        for (const tab of tabs) {
            // Skip missing elements left by `delete this.tabs[index]` in
            // ServerManagerView.
            if (tab === undefined)
                continue;
            // Do not add functional tab settings to list of windows in menu bar
            if (tab.role === "function" && tab.name === "Settings") {
                continue;
            }
            initialSubmenu.push({
                label: tab.name,
                accelerator: tab.role === "function" ? "" : `${shortcutKey} + ${tab.index + 1}`,
                checked: tab.index === activeTabIndex,
                click(_item, focusedWindow) {
                    if (focusedWindow) {
                        sendAction("switch-server-tab", tab.index);
                    }
                },
                type: "checkbox",
            });
        }
        initialSubmenu.push({
            type: "separator",
        }, {
            label: t.__("Switch to Next Organization"),
            accelerator: "Ctrl+Tab",
            enabled: tabs.length > 1,
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("switch-server-tab", getNextServer(tabs, activeTabIndex));
                }
            },
        }, {
            label: t.__("Switch to Previous Organization"),
            accelerator: "Ctrl+Shift+Tab",
            enabled: tabs.length > 1,
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    sendAction("switch-server-tab", getPreviousServer(tabs, activeTabIndex));
                }
            },
        });
    }
    return initialSubmenu;
}
function getDarwinTpl(props) {
    const { tabs, activeTabIndex, enableMenu = false } = props;
    return [
        {
            label: main_1.app.name,
            submenu: [
                {
                    label: t.__("Add Organization"),
                    accelerator: "Cmd+Shift+N",
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("new-server");
                        }
                    },
                },
                {
                    label: t.__("Toggle Do Not Disturb"),
                    accelerator: "Cmd+Shift+M",
                    click() {
                        const dndUtil = DNDUtil.toggle();
                        sendAction("toggle-dnd", dndUtil.dnd, dndUtil.newSettings);
                    },
                },
                {
                    label: t.__("Desktop Settings"),
                    accelerator: "Cmd+,",
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("open-settings");
                        }
                    },
                },
                {
                    label: t.__("Keyboard Shortcuts"),
                    accelerator: "Cmd+Shift+K",
                    enabled: enableMenu,
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("show-keyboard-shortcuts");
                        }
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Copy Zulip URL"),
                    accelerator: "Cmd+Shift+C",
                    enabled: enableMenu,
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("copy-zulip-url");
                        }
                    },
                },
                {
                    label: t.__("Log Out of Organization"),
                    enabled: enableMenu,
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("log-out");
                        }
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Services"),
                    role: "services",
                    submenu: [],
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Hide"),
                    role: "hide",
                },
                {
                    label: t.__("Hide Others"),
                    role: "hideOthers",
                },
                {
                    label: t.__("Unhide"),
                    role: "unhide",
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Minimize"),
                    role: "minimize",
                },
                {
                    label: t.__("Close"),
                    role: "close",
                },
                {
                    label: t.__("Quit"),
                    role: "quit",
                },
            ],
        },
        {
            label: t.__("Edit"),
            submenu: [
                {
                    label: t.__("Undo"),
                    role: "undo",
                },
                {
                    label: t.__("Redo"),
                    role: "redo",
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Cut"),
                    role: "cut",
                },
                {
                    label: t.__("Copy"),
                    role: "copy",
                },
                {
                    label: t.__("Paste"),
                    role: "paste",
                },
                {
                    label: t.__("Paste and Match Style"),
                    role: "pasteAndMatchStyle",
                },
                {
                    label: t.__("Select All"),
                    role: "selectAll",
                },
            ],
        },
        {
            label: t.__("View"),
            submenu: getViewSubmenu(),
        },
        {
            label: t.__("History"),
            submenu: getHistorySubmenu(enableMenu),
        },
        {
            label: t.__("Window"),
            submenu: getWindowSubmenu(tabs, activeTabIndex),
        },
        {
            label: t.__("Tools"),
            submenu: getToolsSubmenu(),
        },
        {
            label: t.__("Help"),
            role: "help",
            submenu: getHelpSubmenu(),
        },
    ];
}
function getOtherTpl(props) {
    const { tabs, activeTabIndex, enableMenu = false } = props;
    return [
        {
            label: t.__("File"),
            submenu: [
                {
                    label: t.__("Add Organization"),
                    accelerator: "Ctrl+Shift+N",
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("new-server");
                        }
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Toggle Do Not Disturb"),
                    accelerator: "Ctrl+Shift+M",
                    click() {
                        const dndUtil = DNDUtil.toggle();
                        sendAction("toggle-dnd", dndUtil.dnd, dndUtil.newSettings);
                    },
                },
                {
                    label: t.__("Desktop Settings"),
                    accelerator: "Ctrl+,",
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("open-settings");
                        }
                    },
                },
                {
                    label: t.__("Keyboard Shortcuts"),
                    accelerator: "Ctrl+Shift+K",
                    enabled: enableMenu,
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("show-keyboard-shortcuts");
                        }
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Copy Zulip URL"),
                    accelerator: "Ctrl+Shift+C",
                    enabled: enableMenu,
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("copy-zulip-url");
                        }
                    },
                },
                {
                    label: t.__("Log Out of Organization"),
                    enabled: enableMenu,
                    click(_item, focusedWindow) {
                        if (focusedWindow) {
                            sendAction("log-out");
                        }
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Minimize"),
                    role: "minimize",
                },
                {
                    label: t.__("Close"),
                    role: "close",
                },
                {
                    label: t.__("Quit"),
                    role: "quit",
                    accelerator: "Ctrl+Q",
                },
            ],
        },
        {
            label: t.__("Edit"),
            submenu: [
                {
                    label: t.__("Undo"),
                    role: "undo",
                },
                {
                    label: t.__("Redo"),
                    role: "redo",
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Cut"),
                    role: "cut",
                },
                {
                    label: t.__("Copy"),
                    role: "copy",
                },
                {
                    label: t.__("Paste"),
                    role: "paste",
                },
                {
                    label: t.__("Paste and Match Style"),
                    role: "pasteAndMatchStyle",
                },
                {
                    type: "separator",
                },
                {
                    label: t.__("Select All"),
                    role: "selectAll",
                },
            ],
        },
        {
            label: t.__("View"),
            submenu: getViewSubmenu(),
        },
        {
            label: t.__("History"),
            submenu: getHistorySubmenu(enableMenu),
        },
        {
            label: t.__("Window"),
            submenu: getWindowSubmenu(tabs, activeTabIndex),
        },
        {
            label: t.__("Tools"),
            submenu: getToolsSubmenu(),
        },
        {
            label: t.__("Help"),
            role: "help",
            submenu: getHelpSubmenu(),
        },
    ];
}
function sendAction(channel, ...args) {
    const win = main_1.BrowserWindow.getAllWindows()[0];
    if (node_process_1.default.platform === "darwin") {
        win.restore();
    }
    (0, typed_ipc_main_1.send)(win.webContents, channel, ...args);
}
async function checkForUpdate() {
    await (0, autoupdater_1.appUpdater)(true);
}
function getNextServer(tabs, activeTabIndex) {
    do {
        activeTabIndex = (activeTabIndex + 1) % tabs.length;
    } while (tabs[activeTabIndex]?.role !== "server");
    return activeTabIndex;
}
function getPreviousServer(tabs, activeTabIndex) {
    do {
        activeTabIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;
    } while (tabs[activeTabIndex]?.role !== "server");
    return activeTabIndex;
}
function setMenu(props) {
    const tpl = node_process_1.default.platform === "darwin" ? getDarwinTpl(props) : getOtherTpl(props);
    const menu = main_1.Menu.buildFromTemplate(tpl);
    main_1.Menu.setApplicationMenu(menu);
}
exports.setMenu = setMenu;
