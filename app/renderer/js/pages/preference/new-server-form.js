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
exports.initNewServerForm = void 0;
const remote_1 = require("@electron/remote");
const html_1 = require("../../../../common/html");
const LinkUtil = __importStar(require("../../../../common/link-util"));
const t = __importStar(require("../../../../common/translation-util"));
const base_1 = require("../../components/base");
const typed_ipc_renderer_1 = require("../../typed-ipc-renderer");
const DomainUtil = __importStar(require("../../utils/domain-util"));
function initNewServerForm({ $root, onChange }) {
    const $newServerForm = (0, base_1.generateNodeFromHtml)((0, html_1.html) `
    <div class="server-input-container">
      <div class="title">${t.__("Organization URL")}</div>
      <div class="add-server-info-row">
        <input
          class="setting-input-value"
          autofocus
          placeholder="your-organization.zulipchat.com or zulip.your-organization.com"
        />
      </div>
      <div class="server-center">
        <button id="connect">${t.__("Connect")}</button>
      </div>
      <div class="server-center">
        <div class="divider">
          <hr class="left" />
          ${t.__("OR")}
          <hr class="right" />
        </div>
      </div>
      <div class="server-center">
        <button id="open-create-org-link">
          ${t.__("Create a new organization")}
        </button>
      </div>
      <div class="server-center">
        <div class="server-network-option">
          <span id="open-network-settings"
            >${t.__("Network and Proxy Settings")}</span
          >
          <i class="material-icons open-network-button">open_in_new</i>
        </div>
      </div>
    </div>
  `);
    const $saveServerButton = $newServerForm.querySelector("#connect");
    $root.textContent = "";
    $root.append($newServerForm);
    const $newServerUrl = $newServerForm.querySelector("input.setting-input-value");
    async function submitFormHandler() {
        $saveServerButton.textContent = "Connecting...";
        let serverConf;
        try {
            serverConf = await DomainUtil.checkDomain($newServerUrl.value.trim());
        }
        catch (error) {
            $saveServerButton.textContent = "Connect";
            await remote_1.dialog.showMessageBox({
                type: "error",
                message: error instanceof Error
                    ? `${error.name}: ${error.message}`
                    : "Unknown error",
                buttons: ["OK"],
            });
            return;
        }
        await DomainUtil.addDomain(serverConf);
        onChange();
    }
    $saveServerButton.addEventListener("click", async () => {
        await submitFormHandler();
    });
    $newServerUrl.addEventListener("keypress", async (event) => {
        if (event.key === "Enter") {
            await submitFormHandler();
        }
    });
    // Open create new org link in default browser
    const link = "https://zulip.com/new/";
    const externalCreateNewOrgElement = $root.querySelector("#open-create-org-link");
    externalCreateNewOrgElement.addEventListener("click", async () => {
        await LinkUtil.openBrowser(new URL(link));
    });
    const networkSettingsId = $root.querySelector(".server-network-option");
    networkSettingsId.addEventListener("click", () => {
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "open-network-settings");
    });
}
exports.initNewServerForm = initNewServerForm;
