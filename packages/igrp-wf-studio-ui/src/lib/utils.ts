import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Generates the next sequential code for areas, subareas, or processes.
 * @param type - The type of item ('area', 'subarea', 'process').
 * @param projectCode - The code of the project/workspace (e.g., 'SIGA'). Required for areas.
 * @param parentCode - The code of the parent item (e.g., area code for subarea, area/subarea code for process).
 * @param existingCodes - An array of existing codes at the same level.
 * @returns The next sequential code string.
 */
export function generateNextCode(
  type: 'area' | 'subarea' | 'process',
  projectCode: string,
  parentCode?: string,
  existingCodes?: string[]
): string {
  if (!existingCodes) {
    existingCodes = [];
  }

  let prefix = "";
  let codesToParse = existingCodes;

  if (type === 'area') {
    prefix = `${projectCode}-`;
    // Filter codes that match the area format, e.g., "PROJECTCODE-XX"
    codesToParse = existingCodes.filter(code => code.startsWith(prefix) && /^\d{2,}$/.test(code.substring(prefix.length)));
  } else if (type === 'subarea' || type === 'process') {
    if (!parentCode) {
      console.error("Parent code is required for subarea or process code generation.");
      // Return a placeholder or throw an error, depending on desired handling
      return "ERROR_NO_PARENT_CODE";
    }
    prefix = `${parentCode}.`;
    // Filter codes that match the subarea/process format, e.g., "PARENTCODE.XX"
    // For processes under subareas, parentCode would be "AREA.SUBCODE", so prefix is "AREA.SUBCODE."
    codesToParse = existingCodes.filter(code => code.startsWith(prefix) && /^\d{2,}$/.test(code.substring(prefix.length)));
  } else {
    console.error("Invalid type for code generation.");
    return "ERROR_INVALID_TYPE";
  }

  let maxSeq = 0;
  codesToParse.forEach(code => {
    const seqStr = code.substring(prefix.length);
    const seqNum = parseInt(seqStr, 10);
    if (!isNaN(seqNum) && seqNum > maxSeq) {
      maxSeq = seqNum;
    }
  });

  const nextSeq = maxSeq + 1;
  const formattedSeq = nextSeq.toString().padStart(2, '0');

  return `${prefix}${formattedSeq}`;
}