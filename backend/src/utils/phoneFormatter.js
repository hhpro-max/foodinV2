/**
 * Format Iranian phone numbers to always start with +98
 * Handles inputs like:
 * - +989123456789
 * - 09123456789
 * - 9123456789
 * @param {string} phone - The phone number to format
 * @returns {string} - The formatted phone number starting with +98
 */
function formatIranianPhone(phone) {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle different input formats
  if (cleaned.startsWith('+98')) {
    // Already in correct format
    return '+98' + cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    // Starts with 0, replace with +98
    return '+98' + cleaned.substring(1);
  } else if (cleaned.startsWith('9')) {
    // Starts with 9, prepend +98
    return '+98' + cleaned;
  } else {
    // Invalid format, return as is
    throw new Error('Invalid Iranian phone number format');
  }
}

module.exports = { formatIranianPhone };