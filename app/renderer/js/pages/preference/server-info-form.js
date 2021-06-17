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
exports.initServerInfoForm = void 0;
const remote_1 = require("@electron/remote");
const html_1 = require("../../../../common/html");
const Messages = __importStar(require("../../../../common/messages"));
const t = __importStar(require("../../../../common/translation-util"));
const base_1 = require("../../components/base");
const typed_ipc_renderer_1 = require("../../typed-ipc-renderer");
const DomainUtil = __importStar(require("../../utils/domain-util"));
function initServerInfoForm(props) {
    const $serverInfoForm = (0, base_1.generateNodeFromHtml)((0, html_1.html) `
    <div class="settings-card">
      <div class="server-info-left">
        <img class="server-info-icon" src="${props.server.icon}" />
        <div class="server-info-row">
          <span class="server-info-alias">${props.server.alias}</span>
          <i class="material-icons open-tab-button">open_in_new</i>
        </div>
      </div>
      <div class="server-info-right">
        <div class="server-info-row server-url">
          <span class="server-url-info" title="${props.server.url}"
            >${props.server.url}</span
          >
        </div>
        <div class="server-info-row">
          <div class="action red server-delete-action">
            <span>${t.__("Disconnect")}</span>
          </div>
        </div>
      </div>
    </div>
  `);
    const $serverInfoAlias = $serverInfoForm.querySelector(".server-info-alias");
    const $serverIcon = $serverInfoForm.querySelector(".server-info-icon");
    const $deleteServerButton = $serverInfoForm.querySelector(".server-delete-action");
    const $openServerButton = $serverInfoForm.querySelector(".open-tab-button");
    props.$root.append($serverInfoForm);
    $deleteServerButton.addEventListener("click", async () => {
        const { response } = await remote_1.dialog.showMessageBox({
            type: "warning",
            buttons: [t.__("YES"), t.__("NO")],
            defaultId: 0,
            message: t.__("Are you sure you want to disconnect this organization?"),
        });
        if (response === 0) {
            if (DomainUtil.removeDomain(props.index)) {
                typed_ipc_renderer_1.ipcRenderer.send("reload-full-app");
            }
            else {
                const { title, content } = Messages.orgRemovalError(DomainUtil.getDomain(props.index).url);
                remote_1.dialog.showErrorBox(title, content);
            }
        }
    });
    $openServerButton.addEventListener("click", () => {
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "switch-server-tab", props.index);
    });
    $serverInfoAlias.addEventListener("click", () => {
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "switch-server-tab", props.index);
    });
    $serverIcon.addEventListener("click", () => {
        typed_ipc_renderer_1.ipcRenderer.send("forward-message", "switch-server-tab", props.index);
    });
}
exports.initServerInfoForm = initServerInfoForm;
