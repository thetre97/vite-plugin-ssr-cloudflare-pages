import { ViteManifest } from './getViteManifest';
import { AllPageFiles } from '../shared/getPageFiles';
export { getPreloadUrls };
declare function getPreloadUrls(pageContext: {
    _allPageFiles: AllPageFiles;
}, dependencies: string[], clientManifest: null | ViteManifest, serverManifest: null | ViteManifest): Promise<string[]>;
//# sourceMappingURL=getPreloadTags.d.ts.map