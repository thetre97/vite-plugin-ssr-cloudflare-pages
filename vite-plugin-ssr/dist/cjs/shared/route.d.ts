import type { AllPageFiles } from './getPageFiles';
import { PageContextUrlSource } from './addComputedUrlProps';
import { OnBeforeRouteHook } from './route/callOnBeforeRouteHook';
import { PageRoutes } from './route/loadPageRoutes';
import { isErrorPage } from './route/error-page';
export { route };
export { loadPageRoutes } from './route/loadPageRoutes';
export type { PageRoutes };
export type { PageContextForRoute };
export { isErrorPage };
export { getErrorPageId } from './route/error-page';
export { isStaticRoute } from './route/resolveRouteString';
declare type PageContextForRoute = PageContextUrlSource & {
    _allPageIds: string[];
    _allPageFiles: AllPageFiles;
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: null | OnBeforeRouteHook;
};
declare type HookError = {
    hookError: unknown;
    hookName: string;
    hookFilePath: string;
};
declare function route(pageContext: PageContextForRoute): Promise<HookError | {
    pageContextAddendum: {
        _pageId: string | null;
        routeParams: Record<string, string>;
    } & Record<string, unknown>;
}>;
//# sourceMappingURL=route.d.ts.map