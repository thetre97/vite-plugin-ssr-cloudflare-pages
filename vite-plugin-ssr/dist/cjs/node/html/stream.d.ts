/// <reference types="node" />
import { HtmlRender } from './renderHtml';
import type { Readable as StreamReadableNode, Writable as StreamWritableNode } from 'stream';
export { getStreamReadableNode };
export { getStreamReadableWeb };
export { pipeToStreamWritableNode };
export { pipeToStreamWritableWeb };
export { manipulateStream };
export { isStream };
export { streamToString };
export type { Stream };
export type { StreamTypePatch };
export type { StreamReadableWeb };
export type { StreamReadableNode };
export type { StreamWritableWeb };
export type { StreamWritableNode };
export type { StreamPipeWeb };
export type { StreamPipeNode };
export { pipeWebStream };
export { pipeNodeStream };
declare type StreamReadableWeb = ReadableStream;
declare type StreamWritableWeb = WritableStream;
declare type StreamPipeWeb = (writable: StreamWritableWeb) => void;
declare type StreamPipeNode = (writable: StreamWritableNode) => void;
declare type Stream = StreamReadableWeb | StreamReadableNode | StreamPipeWebWrapped | StreamPipeNodeWrapped;
declare type StreamTypePatch = NodeJS.ReadableStream;
declare function getStreamReadableNode(htmlRender: HtmlRender): Promise<null | StreamReadableNode>;
declare function getStreamReadableWeb(htmlRender: HtmlRender): Promise<null | StreamReadableWeb>;
declare function pipeToStreamWritableWeb(htmlRender: HtmlRender, writable: StreamWritableWeb): boolean;
declare function pipeToStreamWritableNode(htmlRender: HtmlRender, writable: StreamWritableNode): boolean;
declare type StreamWrapper<StreamType> = {
    stream: StreamType;
} | {
    errorBeforeFirstData: unknown;
};
declare function manipulateStream<StreamType extends Stream>(streamOriginal: StreamType, { injectStringAtBegin, injectStringAtEnd, onErrorWhileStreaming, }: {
    injectStringAtBegin?: () => Promise<string>;
    injectStringAtEnd?: () => Promise<string>;
    onErrorWhileStreaming: (err: unknown) => void;
}): Promise<StreamWrapper<StreamType>>;
declare function isStream(something: unknown): something is Stream;
declare const __streamPipeWeb: unique symbol;
declare type StreamPipeWebWrapped = {
    [__streamPipeWeb]: StreamPipeWeb;
};
declare function pipeWebStream(pipe: StreamPipeWeb): StreamPipeWebWrapped;
declare const __streamPipeNode: unique symbol;
declare type StreamPipeNodeWrapped = {
    [__streamPipeNode]: StreamPipeNode;
};
declare function pipeNodeStream(pipe: StreamPipeNode): StreamPipeNodeWrapped;
declare function streamToString(stream: Stream): Promise<string>;
//# sourceMappingURL=stream.d.ts.map