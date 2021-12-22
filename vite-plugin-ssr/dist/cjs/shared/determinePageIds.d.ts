import { AllPageFiles } from './getPageFiles';
export { determinePageIds };
/**
  Returns the ID of all pages including `_error.page.*` but excluding `_default.page.*`.
*/
declare function determinePageIds(allPageFiles: AllPageFiles): Promise<string[]>;
//# sourceMappingURL=determinePageIds.d.ts.map