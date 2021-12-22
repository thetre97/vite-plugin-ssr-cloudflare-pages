"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErrorPage = exports.getErrorPageId = void 0;
const utils_1 = require("../utils");
function getErrorPageId(allPageIds) {
    const errorPageIds = allPageIds.filter((pageId) => isErrorPage(pageId));
    (0, utils_1.assertUsage)(errorPageIds.length <= 1, `Only one \`_error.page.js\` is allowed. Found several: ${errorPageIds.join(' ')}`);
    if (errorPageIds.length > 0) {
        const errorPageId = errorPageIds[0];
        (0, utils_1.assert)(errorPageId);
        return errorPageId;
    }
    return null;
}
exports.getErrorPageId = getErrorPageId;
function isErrorPage(pageId) {
    (0, utils_1.assert)(!pageId.includes('\\'));
    return pageId.includes('/_error');
}
exports.isErrorPage = isErrorPage;
//# sourceMappingURL=error-page.js.map