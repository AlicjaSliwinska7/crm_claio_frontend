const clamp255 = n => Math.min(255, Math.max(0, Math.round(n)));

const parseRgbLike = (val) => {
  const m = String(val).trim().match(/^rgba?\s*\(\s*([^)]+)\s*\)$/i);
  if (!m) return null;
  const parts = m[1].split(',').map(s => s.trim());
  if (parts.length < 3) return null;
  const [r, g, b] = parts;
  const rr = clamp255(Number(r.replace('%','')));
  const gg = clamp255(Number(g.replace('%','')));
  const bb = clamp255(Number(b.replace('%','')));
  if (![rr, gg, bb].every(Number.isFinite)) return null;
  return { r: rr, g: gg, b: bb };
};
