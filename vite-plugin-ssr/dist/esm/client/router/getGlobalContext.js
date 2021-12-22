import { determinePageIds } from '../../shared/determinePageIds';
import { getAllPageFiles } from '../../shared/getPageFiles';
import { loadPageRoutes } from '../../shared/route';
import { assert, assertBaseUrl, hasProp, objectAssign } from '../../shared/utils';
export { getGlobalContext };
let globalContext;
async function getGlobalContext() {
    if (!globalContext) {
        globalContext = await retrieveGlobalContext();
    }
    return globalContext;
}
async function retrieveGlobalContext() {
    const globalContext = {
        _parseUrl: null,
        _baseUrl: import.meta.env.BASE_URL,
    };
    assertBaseUrl(globalContext._baseUrl);
    const allPageFiles = await getAllPageFiles();
    objectAssign(globalContext, { _allPageFiles: allPageFiles });
    const allPageIds = await determinePageIds(allPageFiles);
    objectAssign(globalContext, { _allPageIds: allPageIds });
    const { pageRoutes, onBeforeRouteHook } = await loadPageRoutes(globalContext);
    objectAssign(globalContext, { _pageRoutes: pageRoutes, _onBeforeRouteHook: onBeforeRouteHook });
    const serverFiles = [];
    await Promise.all(allPageFiles['.page.server'].map(async ({ filePath, loadFile }) => {
        const fileExports = await loadFile();
        assert(hasProp(fileExports, 'hasExportOnBeforeRender', 'boolean'));
        assert(Object.keys(fileExports).length === 1);
        serverFiles.push({ filePath, fileExports });
    }));
    objectAssign(globalContext, { _serverFiles: serverFiles });
    return globalContext;
}
//# sourceMappingURL=getGlobalContext.js.map