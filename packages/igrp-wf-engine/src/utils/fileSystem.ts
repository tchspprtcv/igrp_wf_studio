/**
 * File system utilities for the Workflow Engine
 */
import { FileOperationResult } from '../types';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Import Node.js modules conditionally
let fs: any;
let path: any;

if (!isBrowser) {
  fs = require('node:fs').promises;
  path = require('node:path');
}

/**
 * Get the workspace directory path
 */
export function getWorkspaceDir(): string {
  return './';
}

/**
 * Creates a directory if it doesn't exist
 */
export async function ensureDir(dirPath: string): Promise<FileOperationResult> {
  if (isBrowser) {
    // In browser, simulate success since we can't create directories
    return { 
      success: true, 
      message: 'Directory operation simulated in browser', 
      path: dirPath 
    };
  }

  try {
    try {
      await fs.access(dirPath);
      return { success: true, message: 'Directory already exists', path: dirPath };
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      return { success: true, message: 'Directory created successfully', path: dirPath };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to create directory: ${(error as Error).message}` 
    };
  }
}

/**
 * Writes content to a file, creating directories if needed
 */
export async function writeFile(
  filePath: string, 
  content: string
): Promise<FileOperationResult> {
  if (isBrowser) {
    try {
      // In browser, use localStorage as a simple file system simulation
      localStorage.setItem(filePath, content);
      return { 
        success: true, 
        message: 'File written successfully (browser storage)', 
        path: filePath 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to write file in browser storage: ${(error as Error).message}` 
      };
    }
  }

  try {
    const directory = path.dirname(filePath);
    await ensureDir(directory);
    await fs.writeFile(filePath, content, 'utf8');
    return { 
      success: true, 
      message: 'File written successfully', 
      path: filePath 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to write file: ${(error as Error).message}` 
    };
  }
}

/**
 * Reads content from a file
 */
export async function readFile(filePath: string): Promise<string | null> {
  if (isBrowser) {
    try {
      // In browser, read from localStorage
      const content = localStorage.getItem(filePath);
      return content;
    } catch (error) {
      console.error(`Failed to read file from browser storage: ${(error as Error).message}`);
      return null;
    }
  }

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Failed to read file: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Checks if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  if (isBrowser) {
    // In browser, check localStorage
    return localStorage.getItem(filePath) !== null;
  }

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes a file or directory
 */
export async function remove(path: string): Promise<FileOperationResult> {
  if (isBrowser) {
    try {
      localStorage.removeItem(path);
      return {
        success: true,
        message: 'Item removed successfully (browser storage)',
        path
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to remove item from browser storage: ${(error as Error).message}`
      };
    }
  }

  try {
    const stats = await fs.stat(path);
    if (stats.isDirectory()) {
      await fs.rm(path, { recursive: true });
    } else {
      await fs.unlink(path);
    }
    return {
      success: true,
      message: 'Item removed successfully',
      path
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to remove item: ${(error as Error).message}`
    };
  }
}