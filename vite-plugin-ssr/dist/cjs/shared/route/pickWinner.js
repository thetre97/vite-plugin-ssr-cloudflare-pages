"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickWinner = void 0;
const utils_1 = require("../utils");
const resolveRouteString_1 = require("./resolveRouteString");
function pickWinner(routeMatches) {
    // prettier-ignore
    const candidates = routeMatches
        .sort(resolveRouteString_1.resolveRouteStringPrecedence)
        // See https://vite-plugin-ssr.com/route-function#precedence
        .sort((0, utils_1.makeFirst)((routeMatch) => routeMatch.routeType === 'FUNCTION' && !!routeMatch.precedence && routeMatch.precedence < 0))
        .sort((0, utils_1.makeFirst)((routeMatch) => routeMatch.routeType === 'STRING' && (0, resolveRouteString_1.isStaticRoute)(routeMatch.routeString) === false))
        .sort((0, utils_1.makeFirst)((routeMatch) => routeMatch.routeType === 'FUNCTION' && !routeMatch.precedence))
        .sort((0, utils_1.makeFirst)((routeMatch) => routeMatch.routeType === 'STRING' && (0, resolveRouteString_1.isStaticRoute)(routeMatch.routeString) === true))
        .sort((0, utils_1.makeFirst)((routeMatch) => routeMatch.routeType === 'FILESYSTEM'))
        .sort((0, utils_1.makeFirst)((routeMatch) => routeMatch.routeType === 'FUNCTION' && !!routeMatch.precedence && routeMatch.precedence > 0));
    const winner = candidates[0];
    return winner;
}
exports.pickWinner = pickWinner;
//# sourceMappingURL=pickWinner.js.map