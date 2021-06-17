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
const html_1 = require("../../../../common/html");
const t = __importStar(require("../../../../common/translation-util"));
const base_1 = require("../../components/base");
class PreferenceNav {
    constructor(props) {
        this.props = props;
        this.navItems = [
            "General",
            "Network",
            "AddServer",
            "Organizations",
            "Shortcuts",
        ];
        this.$el = (0, base_1.generateNodeFromHtml)(this.templateHtml());
        this.props.$root.append(this.$el);
        this.registerListeners();
    }
    templateHtml() {
        const navItemsHtml = (0, html_1.html) ``.join(this.navItems.map((navItem) => (0, html_1.html) `
          <div class="nav" id="nav-${navItem}">${t.__(navItem)}</div>
        `));
        return (0, html_1.html) `
      <div>
        <div id="settings-header">${t.__("Settings")}</div>
        <div id="nav-container">${navItemsHtml}</div>
      </div>
    `;
    }
    registerListeners() {
        for (const navItem of this.navItems) {
            const $item = this.$el.querySelector(`#nav-${CSS.escape(navItem)}`);
            $item.addEventListener("click", () => {
                this.props.onItemSelected(navItem);
            });
        }
    }
    select(navItemToSelect) {
        for (const navItem of this.navItems) {
            if (navItem === navItemToSelect) {
                this.activate(navItem);
            }
            else {
                this.deactivate(navItem);
            }
        }
    }
    activate(navItem) {
        const $item = this.$el.querySelector(`#nav-${CSS.escape(navItem)}`);
        $item.classList.add("active");
    }
    deactivate(navItem) {
        const $item = this.$el.querySelector(`#nav-${CSS.escape(navItem)}`);
        $item.classList.remove("active");
    }
}
exports.default = PreferenceNav;
