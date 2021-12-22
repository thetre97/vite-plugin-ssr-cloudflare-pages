import { makeFirst } from '../utils';
import { resolveRouteStringPrecedence, isStaticRoute } from './resolveRouteString';
export { pickWinner };
function pickWinner(routeMatches) {
    // prettier-ignore
    const candidates = routeMatches
        .sort(resolveRouteStringPrecedence)
        // See https://vite-plugin-ssr.com/route-function#precedence
        .sort(makeFirst((routeMatch) => routeMatch.routeType === 'FUNCTION' && !!routeMatch.precedence && routeMatch.precedence < 0))
        .sort(makeFirst((routeMatch) => routeMatch.routeType === 'STRING' && isStaticRoute(routeMatch.routeString) === false))
        .sort(makeFirst((routeMatch) => routeMatch.routeType === 'FUNCTION' && !routeMatch.precedence))
        .sort(makeFirst((routeMatch) => routeMatch.routeType === 'STRING' && isStaticRoute(routeMatch.routeString) === true))
        .sort(makeFirst((routeMatch) => routeMatch.routeType === 'FILESYSTEM'))
        .sort(makeFirst((routeMatch) => routeMatch.routeType === 'FUNCTION' && !!routeMatch.precedence && routeMatch.precedence > 0));
    const winner = candidates[0];
    return winner;
}
//# sourceMappingURL=pickWinner.js.map