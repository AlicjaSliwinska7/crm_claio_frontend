export const clientHref = name =>
  name && name !== '—' ? `/clients?name=${encodeURIComponent(name)}` : null
