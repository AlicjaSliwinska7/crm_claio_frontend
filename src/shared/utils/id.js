export const rid = (prefix = 'id') =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now()}`;
