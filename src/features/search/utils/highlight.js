export function highlight(text, q) {
  if (!text || !q) return text
  const T = String(text)
  const i = T.toLowerCase().indexOf(q.toLowerCase())
  if (i === -1) return T
  const before = T.slice(0, i)
  const match = T.slice(i, i + q.length)
  const after = T.slice(i + q.length)
  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  )
}
