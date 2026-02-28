import React from 'react'

/**
 * Prosta lista grup (demo).
 * - Dla "sprzątania" dodaje klasę `shift-group--cleaning`,
 *   żeby można było niezależnie sterować kolorem i centrowaniem.
 */
export default function GroupList({ groups = [], showDots = false }) {
  const isCleaningGroup = (g) => {
    const id = String(g?.id ?? '').toLowerCase()
    const label = String(g?.label ?? '').toLowerCase()

    // Rozpoznawanie po id lub label (możesz dopasować do swoich danych)
    return (
      id.includes('clean') ||
      id.includes('sprzat') ||
      id.includes('sprząt') ||
      label.includes('sprzat') ||
      label.includes('sprząt') ||
      label.includes('sprzątanie') ||
      label.includes('cleaning')
    )
  }

  return (
    <>
      {groups.map((g, idx) => {
        const cleaning = isCleaningGroup(g)

        // standardowe palety dla zmian, ale sprzątanie ma własną klasę
        const paletteClass = cleaning ? 'shift-group--cleaning' : `shift-group--${(idx % 3) + 1}`

        return (
          <section key={g.id ?? idx} className={`shift-group ${paletteClass}`}>
            <header>
              <h4 className='shift-title'>{g.label}</h4>
              <span className='shift-count'>{g.people?.length ?? 0}</span>
            </header>

            <ul className='shift-people'>
              {g.people?.map((p, i) => (
                <li key={i} className='shift-person'>
                  {showDots ? '• ' : null}
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
