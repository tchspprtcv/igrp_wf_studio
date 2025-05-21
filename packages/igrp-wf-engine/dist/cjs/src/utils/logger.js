"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileLogger = exports.processLogger = exports.appLogger = void 0;
exports.createLogger = createLogger;
const debug_1 = __importDefault(require("debug"));
const BASE_NAMESPACE = 'igrp-wf';
function createLogger(namespace) {
    const fullNamespace = `${BASE_NAMESPACE}:${namespace}`;
    // Attempt to access the default export if 'debugModule' is an object (like Vite's CJS wrapper),
    // otherwise use 'debugModule' itself (if it's already the function).
    const debugFn = debug_1.default.default || debug_1.default;
    if (typeof debugFn !== 'function') {
        console.error(`[${fullNamespace}] igrp-wf-engine: Failed to load debug function. 'debugFn' is type ${typeof debugFn}. Original 'debugModule' was: `, debug_1.default);
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
exports.appLogger = createLogger('app');
exports.processLogger = createLogger('process');
exports.fileLogger = createLogger('file');
