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
exports.initServersSection = void 0;
const html_1 = require("../../../../common/html");
const t = __importStar(require("../../../../common/translation-util"));
const base_section_1 = require("./base-section");
const new_server_form_1 = require("./new-server-form");
function initServersSection({ $root }) {
    $root.innerHTML = (0, html_1.html) `
    <div class="add-server-modal">
      <div class="modal-container">
        <div class="settings-pane" id="server-settings-pane">
          <div class="page-title">${t.__("Add a Zulip organization")}</div>
          <div id="new-server-container"></div>
        </div>
      </div>
    </div>
  `.html;
    const $newServerContainer = $root.querySelector("#new-server-container");
    (0, new_server_form_1.initNewServerForm)({
        $root: $newServerContainer,
        onChange: base_section_1.reloadApp,
    });
}
exports.initServersSection = initServersSection;
