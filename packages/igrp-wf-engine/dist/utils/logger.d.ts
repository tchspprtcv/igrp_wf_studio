export interface Logger {
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
}
export declare function createLogger(namespace: string): Logger;
export declare const appLogger: Logger;
export declare const processLogger: Logger;
export declare const fileLogger: Logger;
