"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStaticRoute = exports.resolveRouteStringPrecedence = exports.resolveRouteString = void 0;
const matchRouteString_1 = require("./matchRouteString");
const utils_1 = require("../utils");
function resolveRouteString(routeString, urlPathname) {
    return (0, matchRouteString_1.matchRouteString)(routeString, urlPathname);
}
exports.resolveRouteString = resolveRouteString;
// -1 => routeMatch1 higher precedence
// +1 => routeMatch2 higher precedence
function resolveRouteStringPrecedence(routeMatch1, routeMatch2) {
    if (!routeMatch2.routeString) {
        return 0;
    }
    if (!routeMatch1.routeString) {
        return 0;
    }
    // Return route with highest number of static path segments at beginning first
    {
        const getValue = (routeString) => analyzeRouteString(routeString).numberOfStaticSegmentsBeginning;
        const result = (0, utils_1.higherFirst)(getValue)(routeMatch1.routeString, routeMatch2.routeString);
        if (result !== 0) {
            return result;
        }
    }
    // Return route with highest number of static path segments in total first
    {
        const getValue = (routeString) => analyzeRouteString(routeString).numberOfStaticSegements;
        const result = (0, utils_1.higherFirst)(getValue)(routeMatch1.routeString, routeMatch2.routeString);
        if (result !== 0) {
            return result;
        }
    }
    // Return route with most parameter segements first
    {
        const getValue = (routeString) => analyzeRouteString(routeString).numberOfParameterSegments;
        const result = (0, utils_1.higherFirst)(getValue)(routeMatch1.routeString, routeMatch2.routeString);
        if (result !== 0) {
            return result;
        }
    }
    // Return catch-all routes last
    {
        if (analyzeRouteString(routeMatch2.routeString).isCatchAll) {
            return -1;
        }
        if (analyzeRouteString(routeMatch1.routeString).isCatchAll) {
            return 1;
        }
    }
    return 0;
}
exports.resolveRouteStringPrecedence = resolveRouteStringPrecedence;
function analyzeRouteString(routeString) {
    const pathSegments = routeString.split('/').filter((path) => path !== '' && path !== '*');
    const isStatic = (path) => !path.startsWith(':');
    let numberOfStaticSegmentsBeginning = 0;
    for (const path of pathSegments) {
        if (!isStatic(path)) {
            break;
        }
        numberOfStaticSegmentsBeginning++;
    }
    const numberOfStaticSegements = pathSegments.filter((p) => isStatic(p)).length;
    const numberOfParameterSegments = pathSegments.filter((p) => !isStatic(p)).length;
    const isCatchAll = routeString.endsWith('*');
    return { numberOfParameterSegments, numberOfStaticSegmentsBeginning, numberOfStaticSegements, isCatchAll };
}
function isStaticRoute(routeString) {
    const url = routeString;
    const match = resolveRouteString(routeString, url);
    return match !== null && Object.keys(match.routeParams).length === 0;
}
exports.isStaticRoute = isStaticRoute;
//# sourceMappingURL=resolveRouteString.js.map