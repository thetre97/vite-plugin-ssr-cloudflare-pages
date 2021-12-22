export { getFileUrl };
export { handlePageContextRequestSuffix };
/**
 (`/`, `.html`) -> `/index.html`
 (`/`, `.pageContext`) -> `/index.pageContext.json`
 (`/about`, `.html`) -> `/about/index.html`
 (`/about/`, `.pageContext`) -> `/about/index.pageContext.json`
 (`/news/hello`, `.html`) -> `/news/hello/index.html`
 (`/product/42?review=true#reviews`, `.pageContext`) -> `/product/42/index.pageContext?review=true#reviews`
 ...
*/
declare function getFileUrl(url: string, fileExtension: '.html' | '.pageContext.json', doNotCreateExtraDirectory: boolean): string;
declare function handlePageContextRequestSuffix(url: string): {
    urlWithoutPageContextRequestSuffix: string;
    isPageContextRequest: boolean;
};
//# sourceMappingURL=getFileUrl.d.ts.map