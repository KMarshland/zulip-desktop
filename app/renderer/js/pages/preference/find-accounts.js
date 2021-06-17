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
exports.initFindAccounts = void 0;
const html_1 = require("../../../../common/html");
const LinkUtil = __importStar(require("../../../../common/link-util"));
const t = __importStar(require("../../../../common/translation-util"));
const base_1 = require("../../components/base");
async function findAccounts(url) {
    if (!url) {
        return;
    }
    if (!url.startsWith("http")) {
        url = "https://" + url;
    }
    await LinkUtil.openBrowser(new URL("/accounts/find", url));
}
function initFindAccounts(props) {
    const $findAccounts = (0, base_1.generateNodeFromHtml)((0, html_1.html) `
    <div class="settings-card certificate-card">
      <div class="certificate-input">
        <div>${t.__("Organization URL")}</div>
        <input class="setting-input-value" value="zulipchat.com" />
      </div>
      <div class="certificate-input">
        <button class="green w-150" id="find-accounts-button">
          ${t.__("Find accounts")}
        </button>
      </div>
    </div>
  `);
    props.$root.append($findAccounts);
    const $findAccountsButton = $findAccounts.querySelector("#find-accounts-button");
    const $serverUrlField = $findAccounts.querySelector("input.setting-input-value");
    $findAccountsButton.addEventListener("click", async () => {
        await findAccounts($serverUrlField.value);
    });
    $serverUrlField.addEventListener("click", () => {
        if ($serverUrlField.value === "zulipchat.com") {
            $serverUrlField.setSelectionRange(0, 0);
        }
    });
    $serverUrlField.addEventListener("keypress", async (event) => {
        if (event.key === "Enter") {
            await findAccounts($serverUrlField.value);
        }
    });
    $serverUrlField.addEventListener("input", () => {
        $serverUrlField.classList.toggle("invalid-input-value", $serverUrlField.value === "");
    });
}
exports.initFindAccounts = initFindAccounts;
