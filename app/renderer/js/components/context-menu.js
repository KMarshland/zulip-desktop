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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMenu = void 0;
const common_1 = require("electron/common");
const node_process_1 = __importDefault(require("node:process"));
const remote_1 = require("@electron/remote");
const t = __importStar(require("../../../common/translation-util"));
const contextMenu = (webContents, event, props) => {
    const isText = props.selectionText !== "";
    const isLink = props.linkURL !== "";
    const linkUrl = isLink ? new URL(props.linkURL) : undefined;
    const makeSuggestion = (suggestion) => ({
        label: suggestion,
        visible: true,
        async click() {
            await webContents.insertText(suggestion);
        },
    });
    let menuTemplate = [
        {
            label: t.__("Add to Dictionary"),
            visible: props.isEditable && isText && props.misspelledWord.length > 0,
            click(_item) {
                webContents.session.addWordToSpellCheckerDictionary(props.misspelledWord);
            },
        },
        {
            type: "separator",
            visible: props.isEditable && isText && props.misspelledWord.length > 0,
        },
        {
            label: `${t.__("Look Up")} "${props.selectionText}"`,
            visible: node_process_1.default.platform === "darwin" && isText,
            click(_item) {
                webContents.showDefinitionForSelection();
            },
        },
        {
            type: "separator",
            visible: node_process_1.default.platform === "darwin" && isText,
        },
        {
            label: t.__("Cut"),
            visible: isText,
            enabled: props.isEditable,
            accelerator: "CommandOrControl+X",
            click(_item) {
                webContents.cut();
            },
        },
        {
            label: t.__("Copy"),
            accelerator: "CommandOrControl+C",
            enabled: props.editFlags.canCopy,
            click(_item) {
                webContents.copy();
            },
        },
        {
            label: t.__("Paste"),
            accelerator: "CommandOrControl+V",
            enabled: props.isEditable,
            click() {
                webContents.paste();
            },
        },
        {
            type: "separator",
        },
        {
            label: linkUrl?.protocol === "mailto:"
                ? t.__("Copy Email Address")
                : t.__("Copy Link"),
            visible: isLink,
            click(_item) {
                common_1.clipboard.write({
                    bookmark: props.linkText,
                    text: linkUrl?.protocol === "mailto:" ? linkUrl.pathname : props.linkURL,
                });
            },
        },
        {
            label: t.__("Copy Image"),
            visible: props.mediaType === "image",
            click(_item) {
                webContents.copyImageAt(props.x, props.y);
            },
        },
        {
            label: t.__("Copy Image URL"),
            visible: props.mediaType === "image",
            click(_item) {
                common_1.clipboard.write({
                    bookmark: props.srcURL,
                    text: props.srcURL,
                });
            },
        },
        {
            type: "separator",
            visible: isLink || props.mediaType === "image",
        },
        {
            label: t.__("Services"),
            visible: node_process_1.default.platform === "darwin",
            role: "services",
        },
    ];
    if (props.misspelledWord) {
        if (props.dictionarySuggestions.length > 0) {
            const suggestions = props.dictionarySuggestions.map((suggestion) => makeSuggestion(suggestion));
            menuTemplate = [...suggestions, ...menuTemplate];
        }
        else {
            menuTemplate.unshift({
                label: t.__("No Suggestion Found"),
                enabled: false,
            });
        }
    }
    // Hide the invisible separators on Linux and Windows
    // Electron has a bug which ignores visible: false parameter for separator menuitems. So we remove them here.
    // https://github.com/electron/electron/issues/5869
    // https://github.com/electron/electron/issues/6906
    const filteredMenuTemplate = menuTemplate.filter((menuItem) => menuItem.visible ?? true);
    const menu = remote_1.Menu.buildFromTemplate(filteredMenuTemplate);
    menu.popup();
};
exports.contextMenu = contextMenu;
