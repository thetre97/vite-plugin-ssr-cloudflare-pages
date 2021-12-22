import { AllPageFiles } from '../getPageFiles';
import type { OnBeforeRouteHook } from './callOnBeforeRouteHook';
export { loadPageRoutes };
export type { PageRoutes };
declare type PageRoutes = {
    pageId: string;
    pageRouteFile?: {
        filePath: string;
        fileExports: Record<string, unknown> & {
            default: RouteValue;
            iKnowThePerformanceRisksOfAsyncRouteFunctions?: boolean;
        };
        routeValue: RouteValue;
    };
    filesystemRoute: string;
}[];
declare type RouteValue = string | Function;
declare function loadPageRoutes(globalContext: {
    _allPageFiles: AllPageFiles;
    _allPageIds: string[];
}): Promise<{
    pageRoutes: PageRoutes;
    onBeforeRouteHook: null | OnBeforeRouteHook;
}>;
//# sourceMappingURL=loadPageRoutes.d.ts.map