// All API calls go through /api/ which Netlify proxies to the VPS
// This completely eliminates CORS and mixed content issues
// No security headers needed on the backend either

const call = async (path, options = {}) => {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const api = {
  getStatus:    () => call('/auth/status'),
  setToken:     (token) => call('/auth/token', { method: 'POST', body: JSON.stringify({ accessToken: token }) }),
  getConfig:    () => call('/config/current'),
  updateConfig: (data) => call('/config/update', { method: 'POST', body: JSON.stringify(data) }),
  getTrades:    () => call('/trades'),
  getFailedTrades: () => call('/trades/failed'),
  getHealth:    () => call('/actuator/health'),
};
