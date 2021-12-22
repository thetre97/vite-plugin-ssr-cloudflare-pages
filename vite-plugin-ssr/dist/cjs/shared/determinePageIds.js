"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determinePageIds = void 0;
const utils_1 = require("./utils");
/**
  Returns the ID of all pages including `_error.page.*` but excluding `_default.page.*`.
*/
async function determinePageIds(allPageFiles) {
    const pageFileIds = computePageIds(allPageFiles['.page']);
    const pageClientFileIds = computePageIds(allPageFiles['.page.client']);
    const pageServerFileIds = computePageIds(allPageFiles['.page.server']);
    const allPageIds = (0, utils_1.unique)([...pageFileIds, ...pageClientFileIds, ...pageServerFileIds]);
    allPageIds.forEach((pageId) => {
        (0, utils_1.assertUsage)(pageFileIds.includes(pageId) || pageServerFileIds.includes(pageId), `File missing. You need to create at least \`${pageId}.page.server.js\` or \`${pageId}.page.js\`.`);
        (0, utils_1.assertUsage)(pageFileIds.includes(pageId) || pageClientFileIds.includes(pageId), `File missing. You need to create at least \`${pageId}.page.client.js\` or \`${pageId}.page.js\`.`);
    });
    return allPageIds;
}
exports.determinePageIds = determinePageIds;
function computePageIds(pageFiles) {
    const fileIds = pageFiles
        .map(({ filePath }) => filePath)
        .filter((filePath) => !isDefaultPageFile(filePath))
        .map(computePageId);
    return fileIds;
}
function computePageId(filePath) {
    const pageSuffix = '.page.';
    const pageId = (0, utils_1.slice)(filePath.split(pageSuffix), 0, -1).join(pageSuffix);
    (0, utils_1.assert)(!pageId.includes('\\'));
    return pageId;
}
function isDefaultPageFile(filePath) {
    (0, utils_1.assert)(!filePath.includes('\\'));
    if (!filePath.includes('/_default')) {
        return false;
    }
    (0, utils_1.assertUsage)(filePath.includes('_default.page.client.') || filePath.includes('_default.page.server.'), `\`_default.*\` file should be either \`_default.page.client.*\` or \`_default.page.server.*\` but we got: ${filePath}`);
    return true;
}
//# sourceMappingURL=determinePageIds.js.map