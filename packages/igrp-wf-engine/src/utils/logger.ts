import * as debug from 'debug';

const BASE_NAMESPACE = 'igrp-wf';

export interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

export function createLogger(namespace: string): Logger {
  const fullNamespace = `${BASE_NAMESPACE}:${namespace}`;
  const logger = debug(fullNamespace);

  return {
    info: (message: string, ...args: any[]) => {
      logger(`ℹ️ ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      logger(`⚠️ ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      logger(`❌ ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      logger(`🔍 ${message}`, ...args);
    }
  };
}

export const appLogger = createLogger('app');
export const processLogger = createLogger('process');
export const fileLogger = createLogger('file');