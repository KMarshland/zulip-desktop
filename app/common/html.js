"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.html = exports.Html = void 0;
const escape_goat_1 = require("escape-goat");
class Html {
    constructor({ html }) {
        this.html = html;
    }
    join(htmls) {
        return new Html({ html: htmls.map((html) => html.html).join(this.html) });
    }
}
exports.Html = Html;
function html(template, ...values) {
    let html = template[0];
    for (const [index, value] of values.entries()) {
        html += value instanceof Html ? value.html : (0, escape_goat_1.htmlEscape)(String(value));
        html += template[index + 1];
    }
    return new Html({ html });
}
exports.html = html;
