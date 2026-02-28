export function assignLanes(items) {
  const lanesEnd = []
  return items.map((it) => {
    let lane = 0
    for (; lane < lanesEnd.length; lane++) {
      if (it.start > lanesEnd[lane]) break
    }
    lanesEnd[lane] = it.end
    return { ...it, lane }
  })
}