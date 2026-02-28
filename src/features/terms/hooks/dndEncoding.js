export const setDataId = (e, id) => {
  try { e.dataTransfer.setData('text/task', String(id)) } catch {}
  try { e.dataTransfer.setData('text/plain', String(id)) } catch {}
  try { e.dataTransfer.effectAllowed = 'move' } catch {}
}

export const getDataId = (e, fallback = null) => {
  try { const a = e.dataTransfer.getData('text/task'); if (a) return a } catch {}
  try {
    const b = e.dataTransfer.getData('text/plain')
    if (b && !b.startsWith('GROUP|')) return b
  } catch {}
  return fallback
}

const GROUP_MIME = 'text/slotgroup'
const encodeGroup = ({ dayISO, slotKey, type }) => `GROUP|${dayISO}|${slotKey}|${type}`
const decodeGroup = (txt) => {
  if (!txt || !txt.startsWith('GROUP|')) return null
  const [, dayISO, slotKey, type] = txt.split('|')
  return { dayISO, slotKey, type }
}

export const setGroupDrag = (e, info) => {
  const enc = encodeGroup(info)
  try { e.dataTransfer.setData(GROUP_MIME, enc) } catch {}
  try { e.dataTransfer.setData('text/plain', enc) } catch {}
  try { e.dataTransfer.effectAllowed = 'move' } catch {}
}

export const getGroupDrag = (e) => {
  try { const a = e.dataTransfer.getData(GROUP_MIME); if (a) return decodeGroup(a) } catch {}
  try { const b = e.dataTransfer.getData('text/plain'); if (b) return decodeGroup(b) } catch {}
  return null
}