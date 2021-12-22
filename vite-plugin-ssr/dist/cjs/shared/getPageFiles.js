"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPageFilesSet = exports.setPageFilesAsync = exports.setPageFiles = exports.findDefaultFile = exports.findDefaultFiles = exports.findPageFile = exports.getAllPageFiles = void 0;
const ssrEnv_1 = require("../node/ssrEnv");
const utils_1 = require("./utils");
assertNotAlreadyLoaded();
let allPageFilesUnprocessed;
function setPageFiles(pageFiles) {
    (0, utils_1.assert)((0, utils_1.hasProp)(pageFiles, '.page'));
    allPageFilesUnprocessed = pageFiles;
}
exports.setPageFiles = setPageFiles;
function isPageFilesSet() {
    return !!allPageFilesUnprocessed;
}
exports.isPageFilesSet = isPageFilesSet;
let asyncSetter;
function setPageFilesAsync(_asyncSetter) {
    asyncSetter = _asyncSetter;
}
exports.setPageFilesAsync = setPageFilesAsync;
const fileTypes = ['.page', '.page.server', '.page.route', '.page.client'];
async function getAllPageFiles() {
    if (asyncSetter) {
        const ssrEnv = (0, ssrEnv_1.getSsrEnv)();
        if (!allPageFilesUnprocessed ||
            // We reload all glob imports in dev to make auto-reload work
            !ssrEnv.isProduction) {
            allPageFilesUnprocessed = (await asyncSetter());
        }
        (0, utils_1.assert)((0, utils_1.hasProp)(allPageFilesUnprocessed, '.page'));
    }
    (0, utils_1.assert)((0, utils_1.hasProp)(allPageFilesUnprocessed, '.page'));
    const tranform = (pageFiles) => {
        return Object.entries(pageFiles).map(([filePath, loadFile]) => {
            return { filePath, loadFile };
        });
    };
    const allPageFiles = {
        '.page': tranform(allPageFilesUnprocessed['.page']),
        '.page.route': tranform(allPageFilesUnprocessed['.page.route']),
        '.page.server': tranform(allPageFilesUnprocessed['.page.server']),
        '.page.client': tranform(allPageFilesUnprocessed['.page.client']),
    };
    return allPageFiles;
}
exports.getAllPageFiles = getAllPageFiles;
function findPageFile(pageFiles, pageId) {
    pageFiles = pageFiles.filter(({ filePath }) => {
        (0, utils_1.assert)(filePath.startsWith('/'));
        (0, utils_1.assert)(pageId.startsWith('/'));
        (0, utils_1.assert)(!filePath.includes('\\'));
        (0, utils_1.assert)(!pageId.includes('\\'));
        return filePath.startsWith(`${pageId}.page.`);
    });
    if (pageFiles.length === 0) {
        return null;
    }
    (0, utils_1.assertUsage)(pageFiles.length === 1, 'Conflicting ' + pageFiles.map(({ filePath }) => filePath).join(' '));
    const pageFile = pageFiles[0];
    (0, utils_1.assert)(pageFile);
    return pageFile;
}
exports.findPageFile = findPageFile;
function findDefaultFiles(pageFiles) {
    const defaultFiles = pageFiles.filter(({ filePath }) => {
        (0, utils_1.assert)(filePath.startsWith('/'));
        (0, utils_1.assert)(!filePath.includes('\\'));
        return filePath.includes('/_default');
    });
    return defaultFiles;
}
exports.findDefaultFiles = findDefaultFiles;
function assertNotAlreadyLoaded() {
    // The functionality of this file will fail if it's loaded more than
    // once; we assert that it's loaded only once.
    const alreadyLoaded = Symbol();
    const globalObject = (0, utils_1.isBrowser)() ? window : global;
    (0, utils_1.assert)(!globalObject[alreadyLoaded]);
    globalObject[alreadyLoaded] = true;
}
function findDefaultFile(pageFiles, pageId) {
    const defautFiles = findDefaultFiles(pageFiles);
    // Sort `_default.page.server.js` files by filesystem proximity to pageId's `*.page.js` file
    defautFiles.sort((0, utils_1.lowerFirst)(({ filePath }) => {
        if (filePath.startsWith(pageId))
            return -1;
        return (0, utils_1.getPathDistance)(pageId, filePath);
    }));
    return defautFiles[0] || null;
}
exports.findDefaultFile = findDefaultFile;
//# sourceMappingURL=getPageFiles.js.map