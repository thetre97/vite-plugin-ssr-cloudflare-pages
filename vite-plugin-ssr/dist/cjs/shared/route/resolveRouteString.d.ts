export { resolveRouteString };
export { resolveRouteStringPrecedence };
export { isStaticRoute };
declare function resolveRouteString(routeString: string, urlPathname: string): null | {
    routeParams: Record<string, string>;
};
declare type RouteMatch = {
    routeString?: string;
};
declare function resolveRouteStringPrecedence(routeMatch1: RouteMatch, routeMatch2: RouteMatch): 0 | -1 | 1;
declare function isStaticRoute(routeString: string): boolean;
//# sourceMappingURL=resolveRouteString.d.ts.map