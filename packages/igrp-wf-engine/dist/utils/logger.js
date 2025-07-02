import debug from 'debug';
const BASE_NAMESPACE = 'igrp-wf';
export function createLogger(namespace) {
    const fullNamespace = `${BASE_NAMESPACE}:${namespace}`;
    const logger = debug(fullNamespace);
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
