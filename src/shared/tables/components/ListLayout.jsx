// src/shared/tables/components/ListLayout.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

// mały helper do łączenia klas
const cx = (...xs) => xs.filter(Boolean).join(' ')

/**
 * ListLayout — wspólny szkielet dla widoków list/tabel
 *
 * Wstecznie kompatybilny:
 *  - controls (gotowy pasek)
 *  - rootClassName / controlsClassName / tableContainerClassName
 *
 * Nowe:
 *  - left / right
 *  - title / header
 *  - stickyControls
 *  - variant
 *  - className
 */
function ListLayout({
	// stare propsy
	controls,
	children,
	summary,
	footer,
	rootClassName = 'contact-list',
	controlsClassName = 'contact-controls',
	tableContainerClassName = 'table-container',

	// nowe
	title,
	header,
	left,
	right,
	stickyControls = false,
	variant,
	className,
	'aria-label': ariaLabel,

	// reszta leci na <section>
	...rest
}) {
	const root = cx('list', rootClassName, variant, className)
	const controlsCN = cx('list-controls', controlsClassName, stickyControls && 'list-controls--sticky')
	const tableCN = cx('list-table-container', tableContainerClassName)

	return (
		<section className={root} aria-label={ariaLabel} {...rest}>
			{/* Nagłówek */}
			{header ?? (title ? <h2 className='list-title'>{title}</h2> : null)}

			{/* Pasek nad listą */}
			{controls ? (
				<div className={controlsCN}>{controls}</div>
			) : left || right ? (
				<div className={controlsCN}>
					<div className='list-controls__left'>{left}</div>
					<div className='list-controls__right'>{right}</div>
				</div>
			) : null}

			{/* Zawartość / tabela */}
			<div className={tableCN}>{children}</div>

			{/* Podsumowanie / stopka */}
			{summary ?? null}
			{footer ?? null}
		</section>
	)
}

ListLayout.propTypes = {
	controls: PropTypes.node,
	children: PropTypes.node,
	summary: PropTypes.node,
	footer: PropTypes.node,
	rootClassName: PropTypes.string,
	controlsClassName: PropTypes.string,
	tableContainerClassName: PropTypes.string,
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	header: PropTypes.node,
	left: PropTypes.node,
	right: PropTypes.node,
	stickyControls: PropTypes.bool,
	variant: PropTypes.string,
	className: PropTypes.string,
	'aria-label': PropTypes.string,
}

export default memo(ListLayout)
