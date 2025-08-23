declare module '@11ty/eleventy' {
  export type EleventyPlugin = (config: UserConfig, options?: Record<string, unknown>) => void;
  export type EleventyEventCallback = (...args: unknown[]) => void | Promise<void>;

  export interface UserConfig {
    addDataExtension(extension: string, options: { parser: (contents: string, filePath: string) => Promise<unknown>; read?: boolean }): void;
    addTransform(name: string, transform: (content: string, outputPath: string) => string): void;
    addFilter(name: string, filter: (...args: unknown[]) => unknown): void;
    setDataDeepMerge(value: boolean): void;
    addPassthroughCopy(path: string | Record<string, string>): void;
    setServerOptions(options: { port?: number; showAllHosts?: boolean; showVersion?: boolean }): void;
    setWatchThrottleWaitTime?(time: number): void;
    addPlugin(plugin: EleventyPlugin, options?: Record<string, unknown>): void;
    on(event: string, callback: EleventyEventCallback): void;
  }

  export const HtmlBasePlugin: EleventyPlugin;
  export const RenderPlugin: EleventyPlugin;
}