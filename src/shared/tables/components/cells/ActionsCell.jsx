// src/shared/tables/components/cells/ActionsCell.jsx
import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import RowActionsButtons from '../RowActionsButtons'

const ActionsCell = memo(function ActionsCell({
	actions = [],
	className = '',
	size = 18,
	ariaLabel = 'Akcje wiersza',
	stopPropagation = true,
	'data-testid': testId,
	sticky = false,
}) {
	const hasActions = Array.isArray(actions) && actions.length > 0

	const handleCellClick = useCallback(
		e => {
			if (stopPropagation) e.stopPropagation()
		},
		[stopPropagation]
	)

	// jeśli z zewnątrz przyszło "sticky" w klasie, to przerzucamy je na inner
	const classParts = (className || '').split(/\s+/).filter(Boolean)
	const classHasSticky = classParts.includes('sticky')
	const tdClass = classParts.filter(c => c !== 'sticky').join(' ')
	const isSticky = sticky || classHasSticky

	// wyciągamy standardowe akcje
	const previewAction = actions.find(a => a.type === 'preview' || a.type === 'view' || a.key === 'preview') || null
	const editAction = actions.find(a => a.type === 'edit' || a.key === 'edit' || a.type === 'update') || null
	const deleteAction = actions.find(a => a.type === 'delete' || a.key === 'delete' || a.type === 'remove') || null

	// nowo: akcja formularza i pobierania
	const formAction = actions.find(a => a.type === 'form' || a.key === 'form') || null
	const downloadAction = actions.find(a => a.type === 'download' || a.key === 'download') || null

	const makeHandler = action => {
		if (!action) return undefined

		const { onClick, href, target, rel } = action

		// jeśli jest href – najpierw onClick (np. logowanie), potem otwarcie linku
		if (href) {
			return () => {
				if (typeof onClick === 'function') {
					onClick()
				}
				if (typeof window !== 'undefined') {
					const t = target || '_blank'
					const r = rel || 'noopener,noreferrer'
					try {
						window.open(href, t, r)
					} catch {
						// fallback – zmiana lokalizacji
						window.location.href = href
					}
				}
			}
		}

		if (typeof onClick === 'function') return onClick

		return undefined
	}

	return (
		<td className={clsx('actions-col', tdClass)} onClick={handleCellClick} data-testid={testId} data-column='actions'>
			<div className={clsx('actions-col__inner', isSticky && 'actions-col__inner--sticky')}>
				{hasActions ? (
					<RowActionsButtons
						onPreview={makeHandler(previewAction)}
						onEdit={makeHandler(editAction)}
						onDelete={makeHandler(deleteAction)}
						onForm={makeHandler(formAction)}
						onDownload={makeHandler(downloadAction)}
						size={size}
						stopPropagation={stopPropagation}
						titles={{
							preview: previewAction?.title || previewAction?.label || 'Podgląd',
							edit: editAction?.title || editAction?.label || 'Edytuj',
							delete: deleteAction?.title || deleteAction?.label || 'Usuń',
							form: formAction?.title || formAction?.label || 'Formularz',
							download: downloadAction?.title || downloadAction?.label || 'Pobierz',
						}}
						disabled={{
							preview: !!previewAction?.disabled,
							edit: !!editAction?.disabled,
							delete: !!deleteAction?.disabled,
							form: !!formAction?.disabled,
							download: !!downloadAction?.disabled,
						}}
						data-testid={testId ? `${testId}-group` : undefined}
						aria-label={ariaLabel}
					/>
				) : (
					<span className='actions-col__placeholder' aria-hidden='true'>
						&nbsp;
					</span>
				)}
			</div>
		</td>
	)
})

ActionsCell.propTypes = {
	actions: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string,
			type: PropTypes.string,
			label: PropTypes.string,
			title: PropTypes.string,
			icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.string]),
			href: PropTypes.string,
			onClick: PropTypes.func,
			disabled: PropTypes.bool,
			target: PropTypes.string,
			rel: PropTypes.string,
		})
	),
	className: PropTypes.string,
	size: PropTypes.number,
	ariaLabel: PropTypes.string,
	stopPropagation: PropTypes.bool,
	sticky: PropTypes.bool,
	'data-testid': PropTypes.string,
}

export default ActionsCell
