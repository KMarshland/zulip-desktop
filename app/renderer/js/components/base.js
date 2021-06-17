"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNodeFromHtml = void 0;
function generateNodeFromHtml(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.html;
    if (wrapper.firstElementChild === null) {
        throw new Error("No element found in HTML");
    }
    return wrapper.firstElementChild;
}
exports.generateNodeFromHtml = generateNodeFromHtml;
