/**
 * Refresh Handler - Prevents infinite loops after page refresh
 */

// Track if this is a page refresh vs first load
const SESSION_KEY = 'app-session-id';
const REFRESH_COUNT_KEY = 'refresh-count';
const MAX_REFRESHES = 3;

export function handlePageRefresh() {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  const currentSessionId = Date.now().toString();
  
  if (!sessionId) {
    // First load in this tab
    console.log('🆕 First load - initializing session');
    sessionStorage.setItem(SESSION_KEY, currentSessionId);
    localStorage.setItem(REFRESH_COUNT_KEY, '0');
    return { isRefresh: false, shouldReset: false };
  }
  
  // This is a refresh
  const refreshCount = parseInt(localStorage.getItem(REFRESH_COUNT_KEY) || '0');
  const newCount = refreshCount + 1;
  
  console.log(`🔄 Page refresh detected (${newCount}/${MAX_REFRESHES})`);
  localStorage.setItem(REFRESH_COUNT_KEY, newCount.toString());
  
  // If too many refreshes, clear problematic state
  if (newCount >= MAX_REFRESHES) {
    console.warn('⚠️ Multiple refreshes detected - clearing cached state to prevent loops');
    
    // Clear potentially problematic cached data but keep auth
    const authToken = localStorage.getItem('sb-auth-token');
    const adminUser = localStorage.getItem('admin_user');
    
    // Clear scroll positions and session data that might cause loops
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('scroll-') || 
          key.startsWith('session-') || 
          key.startsWith('form-draft-') ||
          key.startsWith('device-id')) {
        localStorage.removeItem(key);
      }
    });
    
    // Restore auth
    if (authToken) localStorage.setItem('sb-auth-token', authToken);
    if (adminUser) localStorage.setItem('admin_user', adminUser);
    
    // Reset counter
    localStorage.setItem(REFRESH_COUNT_KEY, '0');
    
    return { isRefresh: true, shouldReset: true };
  }
  
  return { isRefresh: true, shouldReset: false };
}

// Reset refresh counter on successful page load
export function markSuccessfulLoad() {
  localStorage.setItem(REFRESH_COUNT_KEY, '0');
}

// Check if we're in a refresh loop
export function isInRefreshLoop(): boolean {
  const count = parseInt(localStorage.getItem(REFRESH_COUNT_KEY) || '0');
  return count >= MAX_REFRESHES;
}



