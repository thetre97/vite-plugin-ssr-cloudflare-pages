"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStaticRoute = exports.getErrorPageId = exports.isErrorPage = exports.loadPageRoutes = exports.route = void 0;
const utils_1 = require("./utils");
const addComputedUrlProps_1 = require("./addComputedUrlProps");
const pickWinner_1 = require("./route/pickWinner");
const resolveRouteString_1 = require("./route/resolveRouteString");
const resolveFilesystemRoute_1 = require("./route/resolveFilesystemRoute");
const resolveRouteFunction_1 = require("./route/resolveRouteFunction");
const callOnBeforeRouteHook_1 = require("./route/callOnBeforeRouteHook");
const error_page_1 = require("./route/error-page");
Object.defineProperty(exports, "isErrorPage", { enumerable: true, get: function () { return error_page_1.isErrorPage; } });
var loadPageRoutes_1 = require("./route/loadPageRoutes");
Object.defineProperty(exports, "loadPageRoutes", { enumerable: true, get: function () { return loadPageRoutes_1.loadPageRoutes; } });
var error_page_2 = require("./route/error-page");
Object.defineProperty(exports, "getErrorPageId", { enumerable: true, get: function () { return error_page_2.getErrorPageId; } });
var resolveRouteString_2 = require("./route/resolveRouteString");
Object.defineProperty(exports, "isStaticRoute", { enumerable: true, get: function () { return resolveRouteString_2.isStaticRoute; } });
async function route(pageContext) {
    (0, addComputedUrlProps_1.addComputedUrlProps)(pageContext);
    const pageContextAddendum = {};
    const hookResult = await (0, callOnBeforeRouteHook_1.callOnBeforeRouteHook)(pageContext);
    if ('hookError' in hookResult) {
        return hookResult;
    }
    if ('pageContextProvidedByUser' in hookResult) {
        (0, utils_1.objectAssign)(pageContextAddendum, hookResult.pageContextProvidedByUser);
        if ((0, utils_1.hasProp)(pageContextAddendum, '_pageId', 'string') || (0, utils_1.hasProp)(pageContextAddendum, '_pageId', 'null')) {
            // We bypass `vite-plugin-ssr`'s routing
            if (!(0, utils_1.hasProp)(pageContextAddendum, 'routeParams')) {
                (0, utils_1.objectAssign)(pageContextAddendum, { routeParams: {} });
            }
            else {
                (0, utils_1.assert)((0, utils_1.hasProp)(pageContextAddendum, 'routeParams', 'object'));
            }
            return { pageContextAddendum };
        }
        // We already assign so that `pageContext.url === pageContextAddendum.url`; enabling the `onBeforeRoute()` hook to mutate `pageContext.url` before routing.
        (0, utils_1.objectAssign)(pageContext, pageContextAddendum);
    }
    // `vite-plugin-ssr`'s routing
    const allPageIds = pageContext._allPageIds;
    (0, utils_1.assert)(allPageIds.length >= 0);
    (0, utils_1.assertUsage)(allPageIds.length > 0, 'No `*.page.js` file found. You must create a `*.page.js` file, e.g. `pages/index.page.js` (or `pages/index.page.{jsx, tsx, vue, ...}`).');
    const { urlPathname } = pageContext;
    (0, utils_1.assert)(urlPathname.startsWith('/'));
    const hookErrors = [];
    const routeMatches = [];
    await Promise.all(pageContext._pageRoutes.map(async (pageRoute) => {
        const { pageId, filesystemRoute, pageRouteFile } = pageRoute;
        (0, utils_1.assertUsage)(!isReservedPageId(pageId), "Only `_default.page.*` and `_error.page.*` files are allowed to include the special character `_` in their path. The following shouldn't include `_`: " +
            pageId);
        if (!pageRouteFile) {
            const match = (0, resolveFilesystemRoute_1.resolveFilesystemRoute)(filesystemRoute, urlPathname);
            if (match) {
                const { routeParams } = match;
                routeMatches.push({ pageId, routeParams, routeType: 'FILESYSTEM' });
            }
        }
        else {
            const pageRouteFileExports = pageRouteFile.fileExports;
            const pageRouteFilePath = pageRouteFile.filePath;
            // Route with Route String defined in `.page.route.js`
            if ((0, utils_1.hasProp)(pageRouteFileExports, 'default', 'string')) {
                const routeString = pageRouteFileExports.default;
                (0, utils_1.assertUsage)(routeString.startsWith('/'), `A Route String should start with a leading \`/\` but \`${pageRouteFilePath}\` has \`export default '${routeString}'\`. Make sure to \`export default '/${routeString}'\` instead.`);
                const match = (0, resolveRouteString_1.resolveRouteString)(routeString, urlPathname);
                if (match) {
                    const { routeParams } = match;
                    routeMatches.push({
                        pageId,
                        routeString,
                        routeParams,
                        routeType: 'STRING',
                    });
                }
            }
            // Route with Route Function defined in `.page.route.js`
            else if ((0, utils_1.hasProp)(pageRouteFileExports, 'default', 'function')) {
                const match = await (0, resolveRouteFunction_1.resolveRouteFunction)(pageRouteFileExports, urlPathname, pageContext, pageRouteFilePath);
                if (match && 'hookError' in match) {
                    hookErrors.push(match);
                    return;
                }
                if (match) {
                    const { routeParams, precedence } = match;
                    routeMatches.push({ pageId, precedence, routeParams, routeType: 'FUNCTION' });
                }
            }
            else {
                (0, utils_1.assert)(false);
            }
        }
    }));
    if (hookErrors.length > 0) {
        return hookErrors[0];
    }
    // console.log('[Route Matches]:', JSON.stringify(routeMatches, null, 2))
    const winner = (0, pickWinner_1.pickWinner)(routeMatches);
    // console.log('[Route Match]:', `[${urlPathname}]: ${winner && winner.pageId}`)
    if (!winner) {
        (0, utils_1.objectAssign)(pageContextAddendum, {
            _pageId: null,
            routeParams: {},
        });
        return { pageContextAddendum };
    }
    const { pageId, routeParams } = winner;
    (0, utils_1.assert)((0, utils_1.isPlainObject)(routeParams));
    (0, utils_1.objectAssign)(pageContextAddendum, {
        _pageId: pageId,
        routeParams,
    });
    return { pageContextAddendum };
}
exports.route = route;
function isReservedPageId(pageId) {
    (0, utils_1.assert)(!pageId.includes('\\'));
    return pageId.includes('/_');
}
//# sourceMappingURL=route.js.map