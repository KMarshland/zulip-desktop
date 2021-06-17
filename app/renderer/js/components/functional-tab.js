"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const html_1 = require("../../../common/html");
const base_1 = require("./base");
const tab_1 = __importDefault(require("./tab"));
class FunctionalTab extends tab_1.default {
    constructor({ $view, ...props }) {
        super(props);
        this.$view = $view;
        this.$el = (0, base_1.generateNodeFromHtml)(this.templateHtml());
        if (this.props.name !== "Settings") {
            this.props.$root.append(this.$el);
            this.$closeButton = this.$el.querySelector(".server-tab-badge");
            this.registerListeners();
        }
    }
    async activate() {
        await super.activate();
        this.$view.classList.add("active");
    }
    async deactivate() {
        await super.deactivate();
        this.$view.classList.remove("active");
    }
    async destroy() {
        await super.destroy();
        this.$view.remove();
    }
    templateHtml() {
        return (0, html_1.html) `
      <div class="tab functional-tab" data-tab-id="${this.props.tabIndex}">
        <div class="server-tab-badge close-button">
          <i class="material-icons">close</i>
        </div>
        <div class="server-tab">
          <i class="material-icons">${this.props.materialIcon}</i>
        </div>
      </div>
    `;
    }
    registerListeners() {
        super.registerListeners();
        this.$el.addEventListener("mouseover", () => {
            this.$closeButton?.classList.add("active");
        });
        this.$el.addEventListener("mouseout", () => {
            this.$closeButton?.classList.remove("active");
        });
        this.$closeButton?.addEventListener("click", (event) => {
            this.props.onDestroy?.();
            event.stopPropagation();
        });
    }
}
exports.default = FunctionalTab;
