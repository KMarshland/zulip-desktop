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
exports.initGeneralSection = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const remote = __importStar(require("@electron/remote"));
const remote_1 = require("@electron/remote");
const tagify_1 = __importDefault(require("@yaireo/tagify"));
const iso_639_1_1 = __importDefault(require("iso-639-1"));
const z = __importStar(require("zod"));
const ConfigUtil = __importStar(require("../../../../common/config-util"));
const EnterpriseUtil = __importStar(require("../../../../common/enterprise-util"));
const html_1 = require("../../../../common/html");
const t = __importStar(require("../../../../common/translation-util"));
const supported_locales_json_1 = __importDefault(require("../../../../translations/supported-locales.json"));
const typed_ipc_renderer_1 = require("../../typed-ipc-renderer");
const base_section_1 = require("./base-section");
const currentBrowserWindow = remote.getCurrentWindow();
function initGeneralSection({ $root }) {
    $root.innerHTML = (0, html_1.html) `
    <div class="settings-pane">
      <div class="title">${t.__("Appearance")}</div>
      <div id="appearance-option-settings" class="settings-card">
        <div class="setting-row" id="tray-option">
          <div class="setting-description">
            ${t.__("Show app icon in system tray")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div
          class="setting-row"
          id="menubar-option"
          style="display:${node_process_1.default.platform === "darwin" ? "none" : ""}"
        >
          <div class="setting-description">
            ${t.__("Auto hide menu bar (Press Alt key to display)")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="sidebar-option">
          <div class="setting-description">
            ${t.__("Show sidebar")} (<span class="code"
              >${node_process_1.default.platform === "darwin"
        ? "Cmd+Shift+S"
        : "Ctrl+Shift+S"}</span
            >)
          </div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="badge-option">
          <div class="setting-description">
            ${t.__("Show app unread badge")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div
          class="setting-row"
          id="dock-bounce-option"
          style="display:${node_process_1.default.platform === "darwin" ? "" : "none"}"
        >
          <div class="setting-description">
            ${t.__("Bounce dock on new private message")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div
          class="setting-row"
          id="flash-taskbar-option"
          style="display:${node_process_1.default.platform === "win32" ? "" : "none"}"
        >
          <div class="setting-description">
            ${t.__("Flash taskbar on new message")}
          </div>
          <div class="setting-control"></div>
        </div>
      </div>
      <div class="title">${t.__("Desktop Notifications")}</div>
      <div class="settings-card">
        <div class="setting-row" id="show-notification-option">
          <div class="setting-description">
            ${t.__("Show desktop notifications")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="silent-option">
          <div class="setting-description">
            ${t.__("Mute all sounds from Zulip")}
          </div>
          <div class="setting-control"></div>
        </div>
      </div>
      <div class="title">${t.__("App Updates")}</div>
      <div class="settings-card">
        <div class="setting-row" id="autoupdate-option">
          <div class="setting-description">${t.__("Enable auto updates")}</div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="betaupdate-option">
          <div class="setting-description">${t.__("Get beta updates")}</div>
          <div class="setting-control"></div>
        </div>
      </div>
      <div class="title">${t.__("Functionality")}</div>
      <div class="settings-card">
        <div class="setting-row" id="startAtLogin-option">
          <div class="setting-description">${t.__("Start app at login")}</div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="start-minimize-option">
          <div class="setting-description">
            ${t.__("Always start minimized")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="quitOnClose-option">
          <div class="setting-description">
            ${t.__("Quit when the window is closed")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="enable-spellchecker-option">
          <div class="setting-description">
            ${t.__("Enable spellchecker (requires restart)")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div
          class="setting-row"
          id="spellcheck-langs"
          style="display:${node_process_1.default.platform === "darwin" ? "none" : ""}"
        ></div>
        <div class="setting-row" id="note"></div>
      </div>

      <div class="title">${t.__("Advanced")}</div>
      <div class="settings-card">
        <div class="setting-row" id="enable-error-reporting">
          <div class="setting-description">
            ${t.__("Enable error reporting (requires restart)")}
          </div>
          <div class="setting-control"></div>
        </div>

        <div class="setting-row" id="app-language">
          <div class="setting-description">
            ${t.__("App language (requires restart)")}
          </div>
          <div id="lang-div" class="lang-div"></div>
        </div>

        <div class="setting-row" id="add-custom-css">
          <div class="setting-description">${t.__("Add custom CSS")}</div>
          <button class="custom-css-button green">${t.__("Upload")}</button>
        </div>
        <div class="setting-row" id="remove-custom-css">
          <div class="setting-description">
            <div class="selected-css-path" id="custom-css-path">
              ${ConfigUtil.getConfigItem("customCSS", "")}
            </div>
          </div>
          <div class="action red" id="css-delete-action">
            <i class="material-icons">indeterminate_check_box</i>
            <span>${t.__("Delete")}</span>
          </div>
        </div>
        <div class="setting-row" id="download-folder">
          <div class="setting-description">
            ${t.__("Default download location")}
          </div>
          <button class="download-folder-button green">
            ${t.__("Change")}
          </button>
        </div>
        <div class="setting-row">
          <div class="setting-description">
            <div class="download-folder-path">
              ${ConfigUtil.getConfigItem("downloadsPath", remote_1.app.getPath("downloads"))}
            </div>
          </div>
        </div>
        <div class="setting-row" id="prompt-download">
          <div class="setting-description">
            ${t.__("Ask where to save files before downloading")}
          </div>
          <div class="setting-control"></div>
        </div>
      </div>
      <div class="title">${t.__("Factory Reset Data")}</div>
      <div class="settings-card">
        <div class="setting-row" id="factory-reset-option">
          <div class="setting-description">
            ${t.__("Reset the application, thus deleting all the connected organizations and accounts.")}
          </div>
          <button class="factory-reset-button red w-150">
            ${t.__("Factory Reset")}
          </button>
        </div>
      </div>
    </div>
  `.html;
    updateTrayOption();
    updateBadgeOption();
    updateSilentOption();
    autoUpdateOption();
    betaUpdateOption();
    updateSidebarOption();
    updateStartAtLoginOption();
    factoryReset();
    showDesktopNotification();
    enableSpellchecker();
    minimizeOnStart();
    addCustomCss();
    showCustomCssPath();
    removeCustomCss();
    downloadFolder();
    updateQuitOnCloseOption();
    updatePromptDownloadOption();
    enableErrorReporting();
    setLocale();
    initSpellChecker();
    // Platform specific settings
    // Flashing taskbar on Windows
    if (node_process_1.default.platform === "win32") {
        updateFlashTaskbar();
    }
    // Dock bounce on macOS
    if (node_process_1.default.platform === "darwin") {
        updateDockBouncing();
    }
    // Auto hide menubar on Windows and Linux
    if (node_process_1.default.platform !== "darwin") {
        updateMenubarOption();
    }
    function updateTrayOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#tray-option .setting-control"),
            value: ConfigUtil.getConfigItem("trayIcon", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("trayIcon", true);
                ConfigUtil.setConfigItem("trayIcon", newValue);
                typed_ipc_renderer_1.ipcRenderer.send("forward-message", "toggletray");
                updateTrayOption();
            },
        });
    }
    function updateMenubarOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#menubar-option .setting-control"),
            value: ConfigUtil.getConfigItem("autoHideMenubar", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("autoHideMenubar", false);
                ConfigUtil.setConfigItem("autoHideMenubar", newValue);
                typed_ipc_renderer_1.ipcRenderer.send("toggle-menubar", newValue);
                updateMenubarOption();
            },
        });
    }
    function updateBadgeOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#badge-option .setting-control"),
            value: ConfigUtil.getConfigItem("badgeOption", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("badgeOption", true);
                ConfigUtil.setConfigItem("badgeOption", newValue);
                typed_ipc_renderer_1.ipcRenderer.send("toggle-badge-option", newValue);
                updateBadgeOption();
            },
        });
    }
    function updateDockBouncing() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#dock-bounce-option .setting-control"),
            value: ConfigUtil.getConfigItem("dockBouncing", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("dockBouncing", true);
                ConfigUtil.setConfigItem("dockBouncing", newValue);
                updateDockBouncing();
            },
        });
    }
    function updateFlashTaskbar() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#flash-taskbar-option .setting-control"),
            value: ConfigUtil.getConfigItem("flashTaskbarOnMessage", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("flashTaskbarOnMessage", true);
                ConfigUtil.setConfigItem("flashTaskbarOnMessage", newValue);
                updateFlashTaskbar();
            },
        });
    }
    function autoUpdateOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#autoupdate-option .setting-control"),
            disabled: EnterpriseUtil.configItemExists("autoUpdate"),
            value: ConfigUtil.getConfigItem("autoUpdate", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("autoUpdate", true);
                ConfigUtil.setConfigItem("autoUpdate", newValue);
                if (!newValue) {
                    ConfigUtil.setConfigItem("betaUpdate", false);
                    betaUpdateOption();
                }
                autoUpdateOption();
            },
        });
    }
    function betaUpdateOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#betaupdate-option .setting-control"),
            value: ConfigUtil.getConfigItem("betaUpdate", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("betaUpdate", false);
                if (ConfigUtil.getConfigItem("autoUpdate", true)) {
                    ConfigUtil.setConfigItem("betaUpdate", newValue);
                    betaUpdateOption();
                }
            },
        });
    }
    function updateSilentOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#silent-option .setting-control"),
            value: ConfigUtil.getConfigItem("silent", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("silent", true);
                ConfigUtil.setConfigItem("silent", newValue);
                updateSilentOption();
                typed_ipc_renderer_1.ipcRenderer.sendTo(currentBrowserWindow.webContents.id, "toggle-silent", newValue);
            },
        });
    }
    function showDesktopNotification() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#show-notification-option .setting-control"),
            value: ConfigUtil.getConfigItem("showNotification", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("showNotification", true);
                ConfigUtil.setConfigItem("showNotification", newValue);
                showDesktopNotification();
            },
        });
    }
    function updateSidebarOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#sidebar-option .setting-control"),
            value: ConfigUtil.getConfigItem("showSidebar", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("showSidebar", true);
                ConfigUtil.setConfigItem("showSidebar", newValue);
                typed_ipc_renderer_1.ipcRenderer.send("forward-message", "toggle-sidebar", newValue);
                updateSidebarOption();
            },
        });
    }
    function updateStartAtLoginOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#startAtLogin-option .setting-control"),
            value: ConfigUtil.getConfigItem("startAtLogin", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("startAtLogin", false);
                ConfigUtil.setConfigItem("startAtLogin", newValue);
                typed_ipc_renderer_1.ipcRenderer.send("toggleAutoLauncher", newValue);
                updateStartAtLoginOption();
            },
        });
    }
    function updateQuitOnCloseOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#quitOnClose-option .setting-control"),
            value: ConfigUtil.getConfigItem("quitOnClose", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("quitOnClose", false);
                ConfigUtil.setConfigItem("quitOnClose", newValue);
                updateQuitOnCloseOption();
            },
        });
    }
    function enableSpellchecker() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#enable-spellchecker-option .setting-control"),
            value: ConfigUtil.getConfigItem("enableSpellchecker", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("enableSpellchecker", true);
                ConfigUtil.setConfigItem("enableSpellchecker", newValue);
                typed_ipc_renderer_1.ipcRenderer.send("configure-spell-checker");
                enableSpellchecker();
                const spellcheckerLanguageInput = $root.querySelector("#spellcheck-langs");
                const spellcheckerNote = $root.querySelector("#note");
                spellcheckerLanguageInput.style.display =
                    spellcheckerLanguageInput.style.display === "none" ? "" : "none";
                spellcheckerNote.style.display =
                    spellcheckerNote.style.display === "none" ? "" : "none";
            },
        });
    }
    function enableErrorReporting() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#enable-error-reporting .setting-control"),
            value: ConfigUtil.getConfigItem("errorReporting", true),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("errorReporting", true);
                ConfigUtil.setConfigItem("errorReporting", newValue);
                enableErrorReporting();
            },
        });
    }
    async function customCssDialog() {
        const showDialogOptions = {
            title: "Select file",
            properties: ["openFile"],
            filters: [{ name: "CSS file", extensions: ["css"] }],
        };
        const { filePaths, canceled } = await remote_1.dialog.showOpenDialog(showDialogOptions);
        if (!canceled) {
            ConfigUtil.setConfigItem("customCSS", filePaths[0]);
            typed_ipc_renderer_1.ipcRenderer.send("forward-message", "hard-reload");
        }
    }
    function setLocale() {
        const langDiv = $root.querySelector(".lang-div");
        const langListHtml = (0, base_section_1.generateSelectHtml)(supported_locales_json_1.default, "lang-menu");
        langDiv.innerHTML += langListHtml.html;
        // `langMenu` is the select-option dropdown menu formed after executing the previous command
        const langMenu = $root.querySelector(".lang-menu");
        // The next three lines set the selected language visible on the dropdown button
        let language = ConfigUtil.getConfigItem("appLanguage", "en");
        language =
            language && langMenu.options.namedItem(language) ? language : "en";
        langMenu.options.namedItem(language).selected = true;
        langMenu.addEventListener("change", () => {
            ConfigUtil.setConfigItem("appLanguage", langMenu.value);
        });
    }
    function minimizeOnStart() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#start-minimize-option .setting-control"),
            value: ConfigUtil.getConfigItem("startMinimized", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("startMinimized", false);
                ConfigUtil.setConfigItem("startMinimized", newValue);
                minimizeOnStart();
            },
        });
    }
    function addCustomCss() {
        const customCssButton = $root.querySelector("#add-custom-css .custom-css-button");
        customCssButton.addEventListener("click", async () => {
            await customCssDialog();
        });
    }
    function showCustomCssPath() {
        if (!ConfigUtil.getConfigItem("customCSS", null)) {
            const cssPath = $root.querySelector("#remove-custom-css");
            cssPath.style.display = "none";
        }
    }
    function removeCustomCss() {
        const removeCssButton = $root.querySelector("#css-delete-action");
        removeCssButton.addEventListener("click", () => {
            ConfigUtil.setConfigItem("customCSS", "");
            typed_ipc_renderer_1.ipcRenderer.send("forward-message", "hard-reload");
        });
    }
    async function downloadFolderDialog() {
        const showDialogOptions = {
            title: "Select Download Location",
            properties: ["openDirectory"],
        };
        const { filePaths, canceled } = await remote_1.dialog.showOpenDialog(showDialogOptions);
        if (!canceled) {
            ConfigUtil.setConfigItem("downloadsPath", filePaths[0]);
            const downloadFolderPath = $root.querySelector(".download-folder-path");
            downloadFolderPath.textContent = filePaths[0];
        }
    }
    function downloadFolder() {
        const downloadFolder = $root.querySelector("#download-folder .download-folder-button");
        downloadFolder.addEventListener("click", async () => {
            await downloadFolderDialog();
        });
    }
    function updatePromptDownloadOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#prompt-download .setting-control"),
            value: ConfigUtil.getConfigItem("promptDownload", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("promptDownload", false);
                ConfigUtil.setConfigItem("promptDownload", newValue);
                updatePromptDownloadOption();
            },
        });
    }
    async function factoryResetSettings() {
        const clearAppDataMessage = "When the application restarts, it will be as if you have just downloaded Zulip app.";
        const getAppPath = node_path_1.default.join(remote_1.app.getPath("appData"), remote_1.app.name);
        const { response } = await remote_1.dialog.showMessageBox({
            type: "warning",
            buttons: ["YES", "NO"],
            defaultId: 0,
            message: "Are you sure?",
            detail: clearAppDataMessage,
        });
        if (response === 0) {
            await node_fs_1.default.promises.rmdir(getAppPath, { recursive: true });
            setTimeout(() => {
                typed_ipc_renderer_1.ipcRenderer.send("clear-app-settings");
            }, 1000);
        }
    }
    function factoryReset() {
        const factoryResetButton = $root.querySelector("#factory-reset-option .factory-reset-button");
        factoryResetButton.addEventListener("click", async () => {
            await factoryResetSettings();
        });
    }
    function initSpellChecker() {
        // The elctron API is a no-op on macOS and macOS default spellchecker is used.
        if (node_process_1.default.platform === "darwin") {
            const note = $root.querySelector("#note");
            note.append(t.__("On macOS, the OS spellchecker is used."));
            note.append(document.createElement("br"));
            note.append(t.__("Change the language from System Preferences → Keyboard → Text → Spelling."));
        }
        else {
            const note = $root.querySelector("#note");
            note.append(t.__("You can select a maximum of 3 languages for spellchecking."));
            const spellDiv = $root.querySelector("#spellcheck-langs");
            spellDiv.innerHTML += (0, html_1.html) `
        <div class="setting-description">${t.__("Spellchecker Languages")}</div>
        <input name="spellcheck" placeholder="Enter Languages" />
      `.html;
            const availableLanguages = remote_1.session.fromPartition("persist:webviewsession").availableSpellCheckerLanguages;
            let languagePairs = new Map();
            for (const l of availableLanguages) {
                if (iso_639_1_1.default.validate(l)) {
                    languagePairs.set(iso_639_1_1.default.getName(l), l);
                }
            }
            // Manually set names for languages not available in ISO6391
            languagePairs.set("English (AU)", "en-AU");
            languagePairs.set("English (CA)", "en-CA");
            languagePairs.set("English (GB)", "en-GB");
            languagePairs.set("English (US)", "en-US");
            languagePairs.set("Spanish (Latin America)", "es-419");
            languagePairs.set("Spanish (Argentina)", "es-AR");
            languagePairs.set("Spanish (Mexico)", "es-MX");
            languagePairs.set("Spanish (US)", "es-US");
            languagePairs.set("Portuguese (Brazil)", "pt-BR");
            languagePairs.set("Portuguese (Portugal)", "pt-PT");
            languagePairs.set("Serbo-Croatian", "sh");
            languagePairs = new Map([...languagePairs].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
            const tagField = $root.querySelector("input[name=spellcheck]");
            const tagify = new tagify_1.default(tagField, {
                whitelist: [...languagePairs.keys()],
                enforceWhitelist: true,
                maxTags: 3,
                dropdown: {
                    enabled: 0,
                    maxItems: Number.POSITIVE_INFINITY,
                    closeOnSelect: false,
                    highlightFirst: true,
                },
            });
            const configuredLanguages = (ConfigUtil.getConfigItem("spellcheckerLanguages", null) ?? []).map((code) => [...languagePairs].find((pair) => pair[1] === code)[0]);
            tagify.addTags(configuredLanguages);
            tagField.addEventListener("change", () => {
                if (tagField.value.length === 0) {
                    ConfigUtil.setConfigItem("spellcheckerLanguages", []);
                    typed_ipc_renderer_1.ipcRenderer.send("configure-spell-checker");
                }
                else {
                    const data = JSON.parse(tagField.value);
                    const spellLangs = z
                        .array(z.object({ value: z.string() }))
                        .parse(data)
                        .map((elt) => languagePairs.get(elt.value));
                    ConfigUtil.setConfigItem("spellcheckerLanguages", spellLangs);
                    typed_ipc_renderer_1.ipcRenderer.send("configure-spell-checker");
                }
            });
        }
        // Do not display the spellchecker input and note if it is disabled
        if (!ConfigUtil.getConfigItem("enableSpellchecker", true)) {
            const spellcheckerLanguageInput = $root.querySelector("#spellcheck-langs");
            const spellcheckerNote = $root.querySelector("#note");
            spellcheckerLanguageInput.style.display = "none";
            spellcheckerNote.style.display = "none";
        }
    }
}
exports.initGeneralSection = initGeneralSection;
