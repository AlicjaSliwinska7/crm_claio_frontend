import { useEffect, useRef, useState } from 'react'

export default function useContainerWidth() {
  const ref = useRef(null)
  const [w, setW] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setW(el.getBoundingClientRect().width)
    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(entries => {
        if (entries[0]) setW(entries[0].contentRect.width)
      })
      ro.observe(el)
    } else {
      window.addEventListener('resize', update)
    }
    update()
    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', update)
    }
  }, [])

  return [ref, w]
}
