// Security utilities for handling sensitive data

/**
 * Show partial serial number for security
 * @param serial - The full serial number
 * @returns Partial serial number (first 3 and last 3 characters)
 */
export function showPartialSerial(serial: string | null | undefined): string {
  if (!serial || serial === '') {
    return 'Not Available';
  }
  
  // If already hashed or partial, return as is
  if (serial.includes('***') || serial.length < 6) {
    return serial;
  }
  
  // Show only first 3 and last 3 characters for security
  if (serial.length > 6) {
    return serial.substring(0, 3) + '***' + serial.substring(serial.length - 3);
  } else {
    return '***' + serial.substring(serial.length - 3);
  }
}

/**
 * Check if user can see full serial number
 * @param user - Current user
 * @param postOwner - Post owner ID
 * @returns Whether user can see full serial
 */
export function canSeeFullSerial(user: any, postOwner: string): boolean {
  if (!user) return false;
  
  // User can see their own device's full serial
  return user.id === postOwner;
}

/**
 * Format serial number for display
 * @param serial - Serial number
 * @param user - Current user
 * @param postOwner - Post owner ID
 * @returns Formatted serial number
 */
export function formatSerialForDisplay(serial: string | null | undefined, user: any, postOwner: string): string {
  if (!serial) return 'Not Available';
  
  if (canSeeFullSerial(user, postOwner)) {
    return serial;
  }
  
  return showPartialSerial(serial);
}
