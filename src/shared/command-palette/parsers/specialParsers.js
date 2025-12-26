/** ppp <orderId> -> /dokumentacja/zlecenia/:id/przyjecie-probek */
export const parsePPP = (q, nav) => {
  const m = q.match(/^ppp\s+([-\w]+)/i);
  if (!m) return [];
  const orderId = m[1];
  return [{
    id: `go-ppp-${orderId}`,
    label: `Otwórz PPP dla ${orderId}`,
    hint: "/dokumentacja/zlecenia/:id/przyjecie-probek",
    action: () => nav(`/dokumentacja/zlecenia/${orderId}/przyjecie-probek`),
    group: "Szybkie skoki",
  }];
};

/** pb <id> -> /dokumentacja/pb/:id */
export const parsePB = (q, nav) => {
  const m = q.match(/^pb\s+([-\w]+)/i);
  if (!m) return [];
  const id = m[1];
  return [{
    id: `go-pb-${id}`,
    label: `Otwórz PB ${id}`,
    hint: "/dokumentacja/pb/:id",
    action: () => nav(`/dokumentacja/pb/${id}`),
    group: "Szybkie skoki",
  }];
};

/** kb <id> -> /dokumentacja/karty-badan/:id */
export const parseKB = (q, nav) => {
  const m = q.match(/^kb\s+([-\w]+)/i);
  if (!m) return [];
  const id = m[1];
  return [{
    id: `go-kb-${id}`,
    label: `Otwórz Kartę badań ${id}`,
    hint: "/dokumentacja/karty-badan/:id",
    action: () => nav(`/dokumentacja/karty-badan/${id}`),
    group: "Szybkie skoki",
  }];
};

export const defaultParsers = [parsePPP, parsePB, parseKB];
