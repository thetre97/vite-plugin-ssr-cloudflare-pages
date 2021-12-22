import { findDefaultFile, findPageFile } from './getPageFiles';
import { getOnBeforeRenderHook } from './onBeforeRenderHook';
import { assertUsage, hasProp } from './utils';
export { loadPageIsomorphicFiles };
async function loadPageIsomorphicFiles(pageContext) {
    let Page = null;
    let pageExports = {}; // `{}` is slightly more convenient than `null` for the user
    const [pageIsomorphicFile, pageIsomorphicFileDefault] = await Promise.all([
        (async () => {
            const pageFile = findPageFile(pageContext._allPageFiles['.page'], pageContext._pageId);
            if (pageFile === null) {
                return null;
            }
            const { filePath, loadFile } = pageFile;
            const fileExports = await loadFile();
            const fileExportsTyped = {};
            assertUsage(hasProp(fileExports, 'Page') || hasProp(fileExports, 'default'), `${filePath} should have a \`export { Page }\` or \`export default\`.`);
            pageExports = fileExports;
            Page = pageExports['Page'] || pageExports['default'];
            const onBeforeRenderHook = getOnBeforeRenderHook(fileExports, filePath);
            if (hasProp(fileExports, 'skipOnBeforeRenderDefaultHook')) {
                assertUsage(hasProp(fileExports, 'skipOnBeforeRenderDefaultHook', 'boolean'), `${filePath} has \`export { skipOnBeforeRenderDefaultHook }\` but \`skipOnBeforeRenderDefaultHook\` should be a boolean.`);
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
            const pageFile = findDefaultFile(pageContext._allPageFiles['.page'], pageContext._pageId);
            if (pageFile === null) {
                return null;
            }
            const { filePath, loadFile } = pageFile;
            const fileExports = await loadFile();
            const onBeforeRenderHook = getOnBeforeRenderHook(fileExports, filePath, true);
            const pageIsomorphicFileDefault = {
                filePath,
                onBeforeRenderHook,
            };
            return pageIsomorphicFileDefault;
        })(),
    ]);
    return { Page, pageExports, pageIsomorphicFile, pageIsomorphicFileDefault };
}
//# sourceMappingURL=loadPageIsomorphicFiles.js.map