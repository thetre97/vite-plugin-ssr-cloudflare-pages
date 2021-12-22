"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesystemRoute = exports.resolveFilesystemRoute = void 0;
const utils_1 = require("../utils");
function resolveFilesystemRoute(filesystemRoute, urlPathname) {
    return resolveAsStaticPath(filesystemRoute, urlPathname);
}
exports.resolveFilesystemRoute = resolveFilesystemRoute;
function resolveAsStaticPath(filesystemRoute, urlPathname) {
    urlPathname = removeTrailingSlash(urlPathname);
    // console.log('[Route Candidate] url:' + urlPathname, 'filesystemRoute:' + filesystemRoute)
    (0, utils_1.assert)(urlPathname.startsWith('/'));
    (0, utils_1.assert)(filesystemRoute.startsWith('/'));
    (0, utils_1.assert)(!urlPathname.endsWith('/') || urlPathname === '/');
    (0, utils_1.assert)(!filesystemRoute.endsWith('/') || filesystemRoute === '/');
    if (urlPathname !== filesystemRoute) {
        return null;
    }
    return { routeParams: {} };
}
function removeTrailingSlash(url) {
    if (url === '/' || !url.endsWith('/')) {
        return url;
    }
    else {
        return (0, utils_1.slice)(url, 0, -1);
    }
}
function getFilesystemRoute(pageId, filesystemRoots) {
    // Handle Filesystem Routing Root
    const filesystemRootsMatch = filesystemRoots
        .filter(({ rootPath }) => pageId.startsWith(rootPath))
        .sort((0, utils_1.higherFirst)(({ rootPath }) => rootPath.length));
    const root = filesystemRootsMatch[0];
    let filesystemRoute;
    if (root) {
        // Example values:
        //  - `{"pageId":"/pages/index","rootPath":"/","rootValue":"/client_portal"}`
        const { rootPath, rootValue } = root;
        const debugInfo = { pageId, rootPath, rootValue };
        (0, utils_1.assert)(rootValue.startsWith('/') && pageId.startsWith('/') && rootPath.startsWith('/'), debugInfo);
        (0, utils_1.assert)(pageId.startsWith(rootPath), debugInfo);
        if (rootPath !== '/') {
            (0, utils_1.assert)(!rootPath.endsWith('/'), debugInfo);
            filesystemRoute = (0, utils_1.slice)(pageId, rootPath.length, 0);
        }
        else {
            filesystemRoute = pageId;
        }
        (0, utils_1.assert)(filesystemRoute.startsWith('/'), debugInfo);
        filesystemRoute = rootValue + (rootValue.endsWith('/') ? '' : '/') + (0, utils_1.slice)(filesystemRoute, 1, 0);
    }
    else {
        filesystemRoute = pageId;
    }
    (0, utils_1.assert)(filesystemRoute.startsWith('/'));
    // Remove `pages/`, `index/, and `src/`, directories
    filesystemRoute = filesystemRoute.split('/pages/').join('/');
    filesystemRoute = filesystemRoute.split('/src/').join('/');
    filesystemRoute = filesystemRoute.split('/index/').join('/');
    // Hanlde `/index.page.*` suffix
    (0, utils_1.assert)(!filesystemRoute.includes('.page.'));
    if (filesystemRoute.endsWith('/index')) {
        filesystemRoute = (0, utils_1.slice)(filesystemRoute, 0, -'/index'.length);
    }
    if (filesystemRoute === '') {
        filesystemRoute = '/';
    }
    (0, utils_1.assert)(filesystemRoute.startsWith('/'));
    (0, utils_1.assert)(!filesystemRoute.endsWith('/') || filesystemRoute === '/');
    return filesystemRoute;
}
exports.getFilesystemRoute = getFilesystemRoute;
//# sourceMappingURL=resolveFilesystemRoute.js.map