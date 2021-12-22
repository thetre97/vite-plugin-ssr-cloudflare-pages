export type { AllPageFiles };
export type { PageFile };
export { getAllPageFiles };
export { findPageFile };
export { findDefaultFiles };
export { findDefaultFile };
export { setPageFiles };
export { setPageFilesAsync };
export { isPageFilesSet };
declare function setPageFiles(pageFiles: unknown): void;
declare function isPageFilesSet(): boolean;
declare function setPageFilesAsync(_asyncSetter: () => Promise<unknown>): void;
declare type PageFile = {
    filePath: string;
    loadFile: () => Promise<Record<string, unknown>>;
};
declare const fileTypes: readonly [".page", ".page.server", ".page.route", ".page.client"];
declare type FileType = typeof fileTypes[number];
declare type AllPageFiles = Record<FileType, PageFile[]>;
declare function getAllPageFiles(): Promise<AllPageFiles>;
declare function findPageFile<T extends {
    filePath: string;
}>(pageFiles: T[], pageId: string): T | null;
declare function findDefaultFiles<T extends {
    filePath: string;
}>(pageFiles: T[]): T[];
declare function findDefaultFile<T extends {
    filePath: string;
}>(pageFiles: T[], pageId: string): T | null;
//# sourceMappingURL=getPageFiles.d.ts.map