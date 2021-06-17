"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClipboardDecrypterImpl = void 0;
const common_1 = require("electron/common");
const node_buffer_1 = require("node:buffer");
const node_crypto_1 = __importDefault(require("node:crypto"));
class ClipboardDecrypterImpl {
    constructor(_) {
        // At this time, the only version is 1.
        this.version = 1;
        this.key = node_crypto_1.default.randomBytes(32);
        this.pasted = new Promise((resolve) => {
            let interval = null;
            const startPolling = () => {
                if (interval === null) {
                    interval = setInterval(poll, 1000);
                }
                poll();
            };
            const stopPolling = () => {
                if (interval !== null) {
                    clearInterval(interval);
                    interval = null;
                }
            };
            const poll = () => {
                let plaintext;
                try {
                    const data = node_buffer_1.Buffer.from(common_1.clipboard.readText(), "hex");
                    const iv = data.slice(0, 12);
                    const ciphertext = data.slice(12, -16);
                    const authTag = data.slice(-16);
                    const decipher = node_crypto_1.default.createDecipheriv("aes-256-gcm", this.key, iv, { authTagLength: 16 });
                    decipher.setAuthTag(authTag);
                    plaintext =
                        decipher.update(ciphertext, undefined, "utf8") +
                            decipher.final("utf8");
                }
                catch {
                    // If the parsing or decryption failed in any way,
                    // the correct token hasn’t been copied yet; try
                    // again next time.
                    return;
                }
                window.removeEventListener("focus", startPolling);
                window.removeEventListener("blur", stopPolling);
                stopPolling();
                resolve(plaintext);
            };
            window.addEventListener("focus", startPolling);
            window.addEventListener("blur", stopPolling);
            if (document.hasFocus()) {
                startPolling();
            }
        });
    }
}
exports.ClipboardDecrypterImpl = ClipboardDecrypterImpl;
