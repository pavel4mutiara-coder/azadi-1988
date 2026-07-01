/**
 * Parses a date string in a browser-independent and timezone-safe manner.
 * 
 * - If the input contains 'T', it is parsed as an ISO datetime.
 * - If the input is in 'YYYY-MM-DD' format (or starts with it), it manually extracts
 *   the year, month, and day, constructing the local Date as: new Date(year, month - 1, day).
 */
export function parseLocalDate(input: any): Date {
  if (!input) {
    return new Date();
  }

  if (input instanceof Date) {
    return input;
  }

  // Handle Firestore Timestamp objects
  if (typeof input === 'object') {
    if (typeof input.toDate === 'function') {
      return input.toDate();
    }
    if ('seconds' in input && typeof input.seconds === 'number') {
      return new Date(input.seconds * 1000);
    }
  }

  if (typeof input !== 'string') {
    try {
      return new Date(input);
    } catch (e) {
      return new Date();
    }
  }

  const str = input.trim();

  // If the input contains 'T', parse it as an ISO datetime
  if (str.includes('T')) {
    return new Date(str);
  }

  // Check for YYYY-MM-DD format (can have trailing spaces or times)
  const yyyymmddRegex = /^(\d{4})-(\d{2})-(\d{2})/;
  const match = str.match(yyyymmddRegex);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    
    // Check if there is also time info (e.g. "YYYY-MM-DD HH:mm:ss")
    const timeRegex = /\s+(\d{2}):(\d{2}):(\d{2})/;
    const timeMatch = str.match(timeRegex);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = parseInt(timeMatch[3], 10);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    
    return new Date(year, month - 1, day);
  }

  // Fallback to standard parsing if it doesn't match above but isn't browser-dependent
  return new Date(str);
}
