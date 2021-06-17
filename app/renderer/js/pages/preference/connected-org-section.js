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
exports.initConnectedOrgSection = void 0;
const html_1 = require("../../../../common/html");
const t = __importStar(require("../../../../common/translation-util"));
const typed_ipc_renderer_1 = require("../../typed-ipc-renderer");
const DomainUtil = __importStar(require("../../utils/domain-util"));
const base_section_1 = require("./base-section");
const find_accounts_1 = require("./find-accounts");
const server_info_form_1 = require("./server-info-form");
function initConnectedOrgSection({ $root, }) {
    $root.textContent = "";
    const servers = DomainUtil.getDomains();
    $root.innerHTML = (0, html_1.html) `
    <div class="settings-pane" id="server-settings-pane">
      <div class="page-title">${t.__("Connected organizations")}</div>
      <div class="title" id="existing-servers">
        ${t.__("All the connected orgnizations will appear here.")}
      </div>
      <div id="server-info-container"></div>
      <div id="new-org-button">
        <button class="green sea w-250">
          ${t.__("Connect to another organization")}
        </button>
      </div>
      <div class="page-title">${t.__("Find accounts by email")}</div>
      <div id="find-accounts-container"></div>
    </div>
  `.html;
    const $serverInfoContainer = $root.querySelector("#server-info-container");
    const $existingServers = $root.querySelector("#existing-servers");
    const $newOrgButton = $root.querySelector("#new-org-button");
    const $findAccountsContainer = $root.querySelector("#find-accounts-container");
    const noServerText = t.__("All the connected orgnizations will appear here");
    // Show noServerText if no servers are there otherwise hide it
    $existingServers.textContent = servers.length === 0 ? noServerText : "";
    for (const [i, server] of servers.entries()) {
        (0, server_info_form_1.initServerInfoForm)({
            $root: $serverInfoContainer,
            server,
            index: i,
            onChange: base_section_1.reloadApp,
        });
    }
    $newOrgButton.addEventListener("click", () => {
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "open-org-tab");
    });
    (0, find_accounts_1.initFindAccounts)({
        $root: $findAccountsContainer,
    });
}
exports.initConnectedOrgSection = initConnectedOrgSection;
