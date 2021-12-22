"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPageIsomorphicFiles = void 0;
const getPageFiles_1 = require("./getPageFiles");
const onBeforeRenderHook_1 = require("./onBeforeRenderHook");
const utils_1 = require("./utils");
async function loadPageIsomorphicFiles(pageContext) {
    let Page = null;
    let pageExports = {}; // `{}` is slightly more convenient than `null` for the user
    const [pageIsomorphicFile, pageIsomorphicFileDefault] = await Promise.all([
        (async () => {
            const pageFile = (0, getPageFiles_1.findPageFile)(pageContext._allPageFiles['.page'], pageContext._pageId);
            if (pageFile === null) {
                return null;
            }
            const { filePath, loadFile } = pageFile;
            const fileExports = await loadFile();
            const fileExportsTyped = {};
            (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'Page') || (0, utils_1.hasProp)(fileExports, 'default'), `${filePath} should have a \`export { Page }\` or \`export default\`.`);
            pageExports = fileExports;
            Page = pageExports['Page'] || pageExports['default'];
            const onBeforeRenderHook = (0, onBeforeRenderHook_1.getOnBeforeRenderHook)(fileExports, filePath);
            if ((0, utils_1.hasProp)(fileExports, 'skipOnBeforeRenderDefaultHook')) {
                (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'skipOnBeforeRenderDefaultHook', 'boolean'), `${filePath} has \`export { skipOnBeforeRenderDefaultHook }\` but \`skipOnBeforeRenderDefaultHook\` should be a boolean.`);
                fileExportsTyped.skipOnBeforeRenderDefaultHook = fileExports.skipOnBeforeRenderDefaultHook;
            }
            const pageIsomorphicFile = {
                filePath,
                onBeforeRenderHook,
                fileExports: fileExportsTyped,
            };
            return pageIsomorphicFile;
        })(),
        (async () => {
            const pageFile = (0, getPageFiles_1.findDefaultFile)(pageContext._allPageFiles['.page'], pageContext._pageId);
            if (pageFile === null) {
                return null;
            }
            const { filePath, loadFile } = pageFile;
            const fileExports = await loadFile();
            const onBeforeRenderHook = (0, onBeforeRenderHook_1.getOnBeforeRenderHook)(fileExports, filePath, true);
            const pageIsomorphicFileDefault = {
                filePath,
                onBeforeRenderHook,
            };
            return pageIsomorphicFileDefault;
        })(),
    ]);
    return { Page, pageExports, pageIsomorphicFile, pageIsomorphicFileDefault };
}
exports.loadPageIsomorphicFiles = loadPageIsomorphicFiles;
//# sourceMappingURL=loadPageIsomorphicFiles.js.map