declare module '@11ty/eleventy' {
  export interface UserConfig {
    addDataExtension(extension: string, options: { parser: (contents: string, filePath: string) => Promise<unknown> }): void;
    addTransform(name: string, transform: (content: string, outputPath: string) => string): void;
    setDataDeepMerge(value: boolean): void;
    addPassthroughCopy(path: string | Record<string, string>): void;
    setServerOptions(options: { port?: number; showAllHosts?: boolean; showVersion?: boolean }): void;
    setWatchThrottleWaitTime?(time: number): void;
    addPlugin(plugin: any, options?: any): void;
    on(event: string, callback: (...args: any[]) => void | Promise<void>): void;
  }

  export const HtmlBasePlugin: any;
  export const RenderPlugin: any;
}