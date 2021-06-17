"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialog = exports.app = void 0;
const node_process_1 = __importDefault(require("node:process"));
_a = node_process_1.default.type === "renderer"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        require("@electron/remote")
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("electron/main"), exports.app = _a.app, exports.dialog = _a.dialog;
