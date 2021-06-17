"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tab {
    constructor(props) {
        this.props = props;
    }
    registerListeners() {
        this.$el.addEventListener("click", this.props.onClick);
        if (this.props.onHover !== undefined) {
            this.$el.addEventListener("mouseover", this.props.onHover);
        }
        if (this.props.onHoverOut !== undefined) {
            this.$el.addEventListener("mouseout", this.props.onHoverOut);
        }
    }
    async activate() {
        this.$el.classList.add("active");
    }
    async deactivate() {
        this.$el.classList.remove("active");
    }
    async destroy() {
        this.$el.remove();
    }
}
exports.default = Tab;
