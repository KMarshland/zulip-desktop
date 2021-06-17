"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadApp = exports.generateSelectHtml = exports.generateOptionHtml = exports.generateSettingOption = void 0;
const html_1 = require("../../../../common/html");
const base_1 = require("../../components/base");
const typed_ipc_renderer_1 = require("../../typed-ipc-renderer");
function generateSettingOption(props) {
    const { $element, disabled, value, clickHandler } = props;
    $element.textContent = "";
    const $optionControl = (0, base_1.generateNodeFromHtml)(generateOptionHtml(value, disabled));
    $element.append($optionControl);
    if (!disabled) {
        $optionControl.addEventListener("click", clickHandler);
    }
}
exports.generateSettingOption = generateSettingOption;
function generateOptionHtml(settingOption, disabled) {
    const labelHtml = disabled
        ? // eslint-disable-next-line unicorn/template-indent
            (0, html_1.html) `<label
        class="disallowed"
        title="Setting locked by system administrator."
      ></label>`
        : (0, html_1.html) `<label></label>`;
    if (settingOption) {
        return (0, html_1.html) `
      <div class="action">
        <div class="switch">
          <input class="toggle toggle-round" type="checkbox" checked disabled />
          ${labelHtml}
        </div>
      </div>
    `;
    }
    return (0, html_1.html) `
    <div class="action">
      <div class="switch">
        <input class="toggle toggle-round" type="checkbox" />
        ${labelHtml}
      </div>
    </div>
  `;
}
exports.generateOptionHtml = generateOptionHtml;
/* A method that in future can be used to create dropdown menus using <select> <option> tags.
     it needs an object which has ``key: value`` pairs and will return a string that can be appended to HTML
  */
function generateSelectHtml(options, className, idName) {
    const optionsHtml = (0, html_1.html) ``.join(Object.keys(options).map((key) => (0, html_1.html) `
        <option name="${key}" value="${key}">${options[key]}</option>
      `));
    return (0, html_1.html) `
    <select class="${className}" id="${idName}">
      ${optionsHtml}
    </select>
  `;
}
exports.generateSelectHtml = generateSelectHtml;
function reloadApp() {
    typed_ipc_renderer_1.ipcRenderer.send("forward-message", "reload-viewer");
}
exports.reloadApp = reloadApp;
