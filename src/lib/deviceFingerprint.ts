// Simple device fingerprinting for fraud detection
export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let fingerprint = '';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser Fingerprint', 4, 17);
    fingerprint = canvas.toDataURL();
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    fingerprint
  ];

  return btoa(components.join('|')).slice(0, 64);
};

export const generateSessionId = (): string => {
  const existingSession = sessionStorage.getItem('video_session_id');
  if (existingSession) return existingSession;
  
  const newSession = crypto.randomUUID();
  sessionStorage.setItem('video_session_id', newSession);
  return newSession;
};
