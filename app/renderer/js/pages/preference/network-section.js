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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNetworkSection = void 0;
const ConfigUtil = __importStar(require("../../../../common/config-util"));
const html_1 = require("../../../../common/html");
const t = __importStar(require("../../../../common/translation-util"));
const typed_ipc_renderer_1 = require("../../typed-ipc-renderer");
const base_section_1 = require("./base-section");
function initNetworkSection({ $root }) {
    $root.innerHTML = (0, html_1.html) `
    <div class="settings-pane">
      <div class="title">${t.__("Proxy")}</div>
      <div id="appearance-option-settings" class="settings-card">
        <div class="setting-row" id="use-system-settings">
          <div class="setting-description">
            ${t.__("Use system proxy settings (requires restart)")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div class="setting-row" id="use-manual-settings">
          <div class="setting-description">
            ${t.__("Manual proxy configuration")}
          </div>
          <div class="setting-control"></div>
        </div>
        <div class="manual-proxy-block">
          <div class="setting-row" id="proxy-pac-option">
            <span class="setting-input-key">PAC ${t.__("script")}</span>
            <input
              class="setting-input-value"
              placeholder="e.g. foobar.com/pacfile.js"
            />
          </div>
          <div class="setting-row" id="proxy-rules-option">
            <span class="setting-input-key">${t.__("Proxy rules")}</span>
            <input
              class="setting-input-value"
              placeholder="e.g. http=foopy:80;ftp=foopy2"
            />
          </div>
          <div class="setting-row" id="proxy-bypass-option">
            <span class="setting-input-key">${t.__("Proxy bypass rules")}</span>
            <input class="setting-input-value" placeholder="e.g. foobar.com" />
          </div>
          <div class="setting-row">
            <div class="action green" id="proxy-save-action">
              <span>${t.__("Save")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `.html;
    const $proxyPac = $root.querySelector("#proxy-pac-option .setting-input-value");
    const $proxyRules = $root.querySelector("#proxy-rules-option .setting-input-value");
    const $proxyBypass = $root.querySelector("#proxy-bypass-option .setting-input-value");
    const $proxySaveAction = $root.querySelector("#proxy-save-action");
    const $manualProxyBlock = $root.querySelector(".manual-proxy-block");
    toggleManualProxySettings(ConfigUtil.getConfigItem("useManualProxy", false));
    updateProxyOption();
    $proxyPac.value = ConfigUtil.getConfigItem("proxyPAC", "");
    $proxyRules.value = ConfigUtil.getConfigItem("proxyRules", "");
    $proxyBypass.value = ConfigUtil.getConfigItem("proxyBypass", "");
    $proxySaveAction.addEventListener("click", () => {
        ConfigUtil.setConfigItem("proxyPAC", $proxyPac.value);
        ConfigUtil.setConfigItem("proxyRules", $proxyRules.value);
        ConfigUtil.setConfigItem("proxyBypass", $proxyBypass.value);
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "reload-proxy", true);
    });
    function toggleManualProxySettings(option) {
        $manualProxyBlock.classList.toggle("hidden", !option);
    }
    function updateProxyOption() {
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#use-system-settings .setting-control"),
            value: ConfigUtil.getConfigItem("useSystemProxy", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("useSystemProxy", false);
                const manualProxyValue = ConfigUtil.getConfigItem("useManualProxy", false);
                if (manualProxyValue && newValue) {
                    ConfigUtil.setConfigItem("useManualProxy", !manualProxyValue);
                    toggleManualProxySettings(!manualProxyValue);
                }
                if (!newValue) {
                    // Remove proxy system proxy settings
                    ConfigUtil.setConfigItem("proxyRules", "");
                    typed_ipc_renderer_1.ipcRenderer.send("forward-message", "reload-proxy", false);
                }
                ConfigUtil.setConfigItem("useSystemProxy", newValue);
                updateProxyOption();
            },
        });
        (0, base_section_1.generateSettingOption)({
            $element: $root.querySelector("#use-manual-settings .setting-control"),
            value: ConfigUtil.getConfigItem("useManualProxy", false),
            clickHandler() {
                const newValue = !ConfigUtil.getConfigItem("useManualProxy", false);
                const systemProxyValue = ConfigUtil.getConfigItem("useSystemProxy", false);
                toggleManualProxySettings(newValue);
                if (systemProxyValue && newValue) {
                    ConfigUtil.setConfigItem("useSystemProxy", !systemProxyValue);
                }
                ConfigUtil.setConfigItem("proxyRules", "");
                ConfigUtil.setConfigItem("useManualProxy", newValue);
                // Reload app only when turning manual proxy off, hence !newValue
                typed_ipc_renderer_1.ipcRenderer.send("forward-message", "reload-proxy", !newValue);
                updateProxyOption();
            },
        });
    }
}
exports.initNetworkSection = initNetworkSection;
