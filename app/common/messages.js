"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgRemovalError = exports.enterpriseOrgError = exports.invalidZulipServerError = void 0;
function invalidZulipServerError(domain) {
    return `${domain} does not appear to be a valid Zulip server. Make sure that
 • You can connect to that URL in a web browser.
 • If you need a proxy to connect to the Internet, that you've configured your proxy in the Network settings.
 • It's a Zulip server. (The oldest supported version is 1.6).
 • The server has a valid certificate.
 • The SSL is correctly configured for the certificate. Check out the SSL troubleshooting guide -
 https://zulip.readthedocs.io/en/stable/production/ssl-certificates.html`;
}
exports.invalidZulipServerError = invalidZulipServerError;
function enterpriseOrgError(length, domains) {
    let domainList = "";
    for (const domain of domains) {
        domainList += `• ${domain}\n`;
    }
    return {
        title: `Could not add the following ${length === 1 ? "organization" : "organizations"}`,
        content: `${domainList}\nPlease contact your system administrator.`,
    };
}
exports.enterpriseOrgError = enterpriseOrgError;
function orgRemovalError(url) {
    return {
        title: `Removing ${url} is a restricted operation.`,
        content: "Please contact your system administrator.",
    };
}
exports.orgRemovalError = orgRemovalError;
