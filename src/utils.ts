/**
 * Returns today's date as an ISO 8601 date string (`YYYY-MM-DD`) in the user's
 * **local** timezone, making it suitable for use with `<input type="date">` elements.
 *
 * @returns A string like `"2024-03-15"` representing today's local date.
 */
export function getTodayString() {
  // Return today's date in ISO 8601 format (YYYY-MM-DD) in the current LOCAL timezone
  // This is required for HTML <input type="date"> elements
  // Must use local time, not UTC, to get the correct date
  const now = new Date();
  
  // Get local year, month, day (not UTC)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Return as ISO date string in local timezone
  return `${year}-${month}-${day}`;
}
