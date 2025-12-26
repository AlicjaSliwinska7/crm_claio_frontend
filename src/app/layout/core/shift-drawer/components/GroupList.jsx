import React from 'react'

/**
 * Prosta lista grup (demo) – możesz podmienić na swoje dane/komponent.
 */
export default function GroupList({ groups = [], showDots = false }) {
	return (
		<>
			{groups.map((g, idx) => (
				<section key={g.id ?? idx} className={`shift-group shift-group--${(idx % 3) + 1}`}>
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
			))}
		</>
	)
}
