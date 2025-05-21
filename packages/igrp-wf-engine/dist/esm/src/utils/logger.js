import debugModule from 'debug';
const BASE_NAMESPACE = 'igrp-wf';
export function createLogger(namespace) {
    const fullNamespace = `${BASE_NAMESPACE}:${namespace}`;
    // Attempt to access the default export if 'debugModule' is an object (like Vite's CJS wrapper),
    // otherwise use 'debugModule' itself (if it's already the function).
    const debugFn = debugModule.default || debugModule;
    if (typeof debugFn !== 'function') {
        console.error(`[${fullNamespace}] igrp-wf-engine: Failed to load debug function. 'debugFn' is type ${typeof debugFn}. Original 'debugModule' was: `, debugModule);
        // Fallback to console.log if debug is not available
        const fallbackLogger = (...args) => console.log(`[${fullNamespace}] (logger fallback)`, ...args);
        return {
            info: fallbackLogger,
            warn: fallbackLogger,
            error: fallbackLogger,
            debug: fallbackLogger,
        };
    }
    const logger = debugFn(fullNamespace);
    return {
        info: (message, ...args) => {
            logger(`ℹ️ ${message}`, ...args);
        },
        warn: (message, ...args) => {
            logger(`⚠️ ${message}`, ...args);
        },
        error: (message, ...args) => {
            logger(`❌ ${message}`, ...args);
        },
        debug: (message, ...args) => {
            logger(`🔍 ${message}`, ...args);
        }
    };
}
export const appLogger = createLogger('app');
export const processLogger = createLogger('process');
export const fileLogger = createLogger('file');
