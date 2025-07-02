/**
 * File system utilities for the Workflow Engine
 */
import { FileOperationResult } from '../types';
/**
 * Get the workspace directory path
 */
export declare function getWorkspaceDir(): string;
/**
 * Creates a directory if it doesn't exist
 */
export declare function ensureDir(dirPath: string): Promise<FileOperationResult>;
/**
 * Writes content to a file, creating directories if needed
 */
export declare function writeFile(filePath: string, content: string): Promise<FileOperationResult>;
/**
 * Reads content from a file
 */
export declare function readFile(filePath: string): Promise<string | null>;
/**
 * Checks if a file exists
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Deletes a file or directory
 */
export declare function remove(path: string): Promise<FileOperationResult>;
