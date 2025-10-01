// Simple device fingerprinting for fraud detection
// Combines browser characteristics to create a semi-unique identifier

export const generateDeviceFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];

  // Create a simple hash from the components
  const fingerprint = components.join('|');
  return btoa(fingerprint).substring(0, 32);
};

export const generateSessionId = (): string => {
  const SESSION_KEY = 'viewer_session_id';
  
  // Try to get existing session ID
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};
