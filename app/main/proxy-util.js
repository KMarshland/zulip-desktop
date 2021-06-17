"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.resolveSystemProxy = void 0;
const ConfigUtil = __importStar(require("../common/config-util"));
// TODO: Refactor to async function
async function resolveSystemProxy(mainWindow) {
    const page = mainWindow.webContents;
    const ses = page.session;
    const resolveProxyUrl = "www.example.com";
    // Check HTTP Proxy
    const httpProxy = (async () => {
        const proxy = await ses.resolveProxy("http://" + resolveProxyUrl);
        let httpString = "";
        if (proxy !== "DIRECT" &&
            (proxy.includes("PROXY") || proxy.includes("HTTPS"))) {
            // In case of proxy HTTPS url:port, windows gives first word as HTTPS while linux gives PROXY
            // for all other HTTP or direct url:port both uses PROXY
            httpString = "http=" + proxy.split("PROXY")[1] + ";";
        }
        return httpString;
    })();
    // Check HTTPS Proxy
    const httpsProxy = (async () => {
        const proxy = await ses.resolveProxy("https://" + resolveProxyUrl);
        let httpsString = "";
        if ((proxy !== "DIRECT" || proxy.includes("HTTPS")) &&
            (proxy.includes("PROXY") || proxy.includes("HTTPS"))) {
            // In case of proxy HTTPS url:port, windows gives first word as HTTPS while linux gives PROXY
            // for all other HTTP or direct url:port both uses PROXY
            httpsString += "https=" + proxy.split("PROXY")[1] + ";";
        }
        return httpsString;
    })();
    // Check FTP Proxy
    const ftpProxy = (async () => {
        const proxy = await ses.resolveProxy("ftp://" + resolveProxyUrl);
        let ftpString = "";
        if (proxy !== "DIRECT" && proxy.includes("PROXY")) {
            ftpString += "ftp=" + proxy.split("PROXY")[1] + ";";
        }
        return ftpString;
    })();
    // Check SOCKS Proxy
    const socksProxy = (async () => {
        const proxy = await ses.resolveProxy("socks4://" + resolveProxyUrl);
        let socksString = "";
        if (proxy !== "DIRECT") {
            if (proxy.includes("SOCKS5")) {
                socksString += "socks=" + proxy.split("SOCKS5")[1] + ";";
            }
            else if (proxy.includes("SOCKS4")) {
                socksString += "socks=" + proxy.split("SOCKS4")[1] + ";";
            }
            else if (proxy.includes("PROXY")) {
                socksString += "socks=" + proxy.split("PROXY")[1] + ";";
            }
        }
        return socksString;
    })();
    const values = await Promise.all([
        httpProxy,
        httpsProxy,
        ftpProxy,
        socksProxy,
    ]);
    const proxyString = values.join("");
    ConfigUtil.setConfigItem("systemProxyRules", proxyString);
    const useSystemProxy = ConfigUtil.getConfigItem("useSystemProxy", false);
    if (useSystemProxy) {
        ConfigUtil.setConfigItem("proxyRules", proxyString);
    }
}
exports.resolveSystemProxy = resolveSystemProxy;
