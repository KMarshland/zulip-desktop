"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackHolder = exports.sendFeedback = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const send_feedback_1 = __importDefault(require("@electron-elements/send-feedback"));
const { app } = electron_1.remote;
customElements.define("send-feedback", send_feedback_1.default);
exports.sendFeedback = document.querySelector("send-feedback");
exports.feedbackHolder = exports.sendFeedback.parentElement;
// Make the button color match zulip app's theme
exports.sendFeedback.customStylesheet = "css/feedback.css";
// Customize the fields of custom elements
exports.sendFeedback.title = "Report Issue";
exports.sendFeedback.titleLabel = "Issue title:";
exports.sendFeedback.titlePlaceholder = "Enter issue title";
exports.sendFeedback.textareaLabel = "Describe the issue:";
exports.sendFeedback.textareaPlaceholder =
    "Succinctly describe your issue and steps to reproduce it...";
exports.sendFeedback.buttonLabel = "Report Issue";
exports.sendFeedback.loaderSuccessText = "";
exports.sendFeedback.useReporter("emailReporter", {
    email: "support@zulip.com",
});
exports.feedbackHolder.addEventListener("click", (event) => {
    // Only remove the class if the grey out faded
    // part is clicked and not the feedback element itself
    if (event.target === event.currentTarget) {
        exports.feedbackHolder.classList.remove("show");
    }
});
exports.sendFeedback.addEventListener("feedback-submitted", () => {
    setTimeout(() => {
        exports.feedbackHolder.classList.remove("show");
    }, 1000);
});
exports.sendFeedback.addEventListener("feedback-cancelled", () => {
    exports.feedbackHolder.classList.remove("show");
});
const dataDir = app.getPath("userData");
const logsDir = path_1.default.join(dataDir, "/Logs");
exports.sendFeedback.logs.push(...fs_1.default.readdirSync(logsDir).map((file) => path_1.default.join(logsDir, file)));
