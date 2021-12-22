import type { PageContextInjectAssets } from './injectAssets';
import { Stream, StreamTypePatch } from './stream';
export { escapeInject };
export { dangerouslySkipEscape };
export { renderHtml };
export { isDocumentHtml };
export { getHtmlString };
export type { HtmlRender };
declare type DocumentHtml = TemplateWrapped | EscapedString | Stream;
declare type HtmlRender = string | Stream;
declare const __template: unique symbol;
declare type TemplateStrings = TemplateStringsArray;
declare type TemplateVariable = string | EscapedString | Stream | TemplateWrapped;
declare type TemplateWrapped = {
    [__template]: TemplateContent;
};
declare type TemplateContent = {
    templateStrings: TemplateStrings;
    templateVariables: TemplateVariable[];
};
declare function isDocumentHtml(something: unknown): something is DocumentHtml;
declare function renderHtml(documentHtml: DocumentHtml, pageContext: PageContextInjectAssets, renderFilePath: string, onErrorWhileStreaming: (err: unknown) => void): Promise<HtmlRender | {
    hookError: unknown;
}>;
declare function escapeInject(templateStrings: TemplateStrings, ...templateVariables: (TemplateVariable | StreamTypePatch)[]): TemplateWrapped;
declare const __escaped: unique symbol;
declare type EscapedString = {
    [__escaped]: string;
};
declare function dangerouslySkipEscape(alreadyEscapedString: string): EscapedString;
declare function getHtmlString(htmlRender: HtmlRender): Promise<string>;
//# sourceMappingURL=renderHtml.d.ts.map