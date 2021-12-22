"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchRouteString = void 0;
const utils_1 = require("../utils");
function matchRouteString(routeString, urlPathname) {
    const match = matchPath({ path: routeString, caseSensitive: true }, urlPathname);
    if (!match) {
        return null;
    }
    const routeParams = match.params;
    (0, utils_1.assert)((0, utils_1.isPlainObject)(routeParams));
    return { routeParams };
}
exports.matchRouteString = matchRouteString;
// `matchPath()` is copied from https://github.com/remix-run/react-router/blob/34e25c1f0d20d083205469411eee0c5863748abf/packages/react-router/index.tsx#L1031
// See https://reactrouter.com/web/api/matchPath
/**
 * Performs pattern matching on a URL pathname and returns information about
 * the match.
 */
function matchPath(pattern, pathname) {
    if (typeof pattern === 'string') {
        pattern = { path: pattern, caseSensitive: false, end: true };
    }
    let [matcher, paramNames] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
    let match = pathname.match(matcher);
    if (!match)
        return null;
    let matchedPathname = match[0];
    let pathnameBase = matchedPathname.replace(/(.)\/+$/, '$1');
    let captureGroups = match.slice(1);
    let params = paramNames.reduce((memo, paramName, index) => {
        // We need to compute the pathnameBase here using the raw splat value
        // instead of using params["*"] later because it will be decoded then
        if (paramName === '*') {
            let splatValue = captureGroups[index] || '';
            pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, '$1');
        }
        memo[paramName] = safelyDecodeURIComponent(captureGroups[index] || '', paramName);
        return memo;
    }, {});
    return {
        params,
        pathname: matchedPathname,
        pathnameBase,
        pattern,
    };
}
function compilePath(path, caseSensitive = false, end = true) {
    (0, utils_1.assertWarning)(path === '*' || !path.endsWith('*') || path.endsWith('/*'), `Route path "${path}" will be treated as if it were ` +
        `"${path.replace(/\*$/, '/*')}" because the \`*\` character must ` +
        `always follow a \`/\` in the pattern. To get rid of this warning, ` +
        `please change the route path to "${path.replace(/\*$/, '/*')}".`);
    let paramNames = [];
    let regexpSource = '^' +
        path
            .replace(/\/*\*?$/, '') // Ignore trailing / and /*, we'll handle it below
            .replace(/^\/*/, '/') // Make sure it has a leading /
            .replace(/[\\.*+^$?{}|()[\]]/g, '\\$&') // Escape special regex chars
            .replace(/:(\w+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return '([^\\/]+)';
        });
    if (path.endsWith('*')) {
        paramNames.push('*');
        regexpSource +=
            path === '*' || path === '/*'
                ? '(.*)$' // Already matched the initial /, just match the rest
                : '(?:\\/(.+)|\\/*)$'; // Don't include the / in params["*"]
    }
    else {
        regexpSource += end
            ? '\\/*$' // When matching to the end, ignore trailing slashes
            : // Otherwise, at least match a word boundary. This restricts parent
                // routes to matching only their own words and nothing more, e.g. parent
                // route "/home" should not match "/home2".
                '(?:\\b|$)';
    }
    let matcher = new RegExp(regexpSource, caseSensitive ? undefined : 'i');
    return [matcher, paramNames];
}
function safelyDecodeURIComponent(value, paramName) {
    try {
        return decodeURIComponent(value);
    }
    catch (error) {
        (0, utils_1.assertWarning)(false, `The value for the URL param "${paramName}" will not be decoded because` +
            ` the string "${value}" is a malformed URL segment. This is probably` +
            ` due to a bad percent encoding (${error}).`);
        return value;
    }
}
//# sourceMappingURL=matchRouteString.js.map