// src/features/charts/hooks/useColumnRoles.js
import { useEffect, useState } from 'react'

export default function useColumnRoles({ columns, numericCols }) {
  const [colRoles, setColRoles] = useState({})

  const columnsKey = (columns || []).join('|')
  const numericFirst = numericCols?.[0] || ''

  // domyślne role po wczytaniu kolumn (jak w pierwowzorze)
  useEffect(() => {
    if (!columns?.length) return

    setColRoles((prev) => {
      const next = { ...prev }

      // ustaw X tylko, jeśli nie istnieje jeszcze żadna kolumna z rolą "x"
      if (!Object.values(next).includes('x')) next[numericFirst || columns[0]] = 'x'

      for (const c of columns) if (!next[c]) next[c] = 'yl'
      return next
    })
  }, [columnsKey, numericFirst])

  const setRole = (col, role) => {
    setColRoles((prev) => {
      const next = { ...prev }
      if (role === 'x') {
        for (const k of Object.keys(next)) if (next[k] === 'x') next[k] = 'ignore'
      }
      next[col] = role
      return next
    })
  }

  return { colRoles, setColRoles, setRole }
}