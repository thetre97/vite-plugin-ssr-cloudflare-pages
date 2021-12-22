import { MediaType } from './inferMediaType';
import { AllPageFiles } from '../../shared/getPageFiles';
export { injectAssets__public };
export { injectAssets };
export { injectAssetsBeforeRender };
export { injectAssetsAfterRender };
export type { PageContextInjectAssets };
export { getPageAssets };
export { PageAssets };
declare type PageAssets = PageAsset[];
declare type PageAsset = {
    src: string;
    assetType: 'script' | 'style' | 'preload';
    mediaType: null | NonNullable<MediaType>['mediaType'];
    preloadType: null | NonNullable<MediaType>['preloadType'];
};
declare function getPageAssets(pageContext: {
    _allPageFiles: AllPageFiles;
    _baseUrl: string;
}, dependencies: string[], pageClientFilePath: string, isPreRendering: boolean): Promise<PageAsset[]>;
declare function injectAssets__public(htmlString: string, pageContext: Record<string, unknown>): Promise<string>;
declare type PageContextInjectAssets = {
    urlPathname: string;
    _getPageAssets: () => Promise<PageAssets>;
    _pageId: string;
    _pageClientPath: string;
    _passToClient: string[];
};
declare function injectAssets(htmlString: string, pageContext: PageContextInjectAssets): Promise<string>;
declare function injectAssetsBeforeRender(htmlString: string, pageContext: PageContextInjectAssets): Promise<string>;
declare function injectAssetsAfterRender(htmlString: string, pageContext: PageContextInjectAssets): Promise<string>;
//# sourceMappingURL=injectAssets.d.ts.map