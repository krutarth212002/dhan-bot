const call = async (path, options = {}) => {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const api = {
  // Auth
  getStatus:       () => call('/auth/status'),
  setToken:        (token) => call('/auth/token', { method: 'POST', body: JSON.stringify({ accessToken: token }) }),
  // Bot toggle
  getBotStatus:    () => call('/bot/status'),
  enableBot:       () => call('/bot/enable', { method: 'POST' }),
  disableBot:      () => call('/bot/disable', { method: 'POST' }),
  toggleBot:       () => call('/bot/toggle', { method: 'POST' }),
  // Config
  getConfig:       () => call('/config/current'),
  updateConfig:    (data) => call('/config/update', { method: 'POST', body: JSON.stringify(data) }),
  // Index config
  getIndexConfigs: () => call('/index-config'),
  updateIndexConfig: (data) => call('/index-config/update', { method: 'POST', body: JSON.stringify(data) }),
  // Trades
  getTrades:       () => call('/trades'),
  getFailedTrades: () => call('/trades/failed'),
  // Health
  getHealth:       () => call('/actuator/health'),
};
