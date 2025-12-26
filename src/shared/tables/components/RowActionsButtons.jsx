// src/shared/tables/components/RowActionsButtons.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Pencil, Trash2, Eye, FileText, Download } from 'lucide-react'

/**
 * RowActionsButtons – lekki zestaw przycisków akcji do wiersza tabeli.
 *
 * ZGODNE Z CSS rejestrów:
 *  - kontener: .row-actions (.row-actions--inline dla layoutu w jednej linii)
 *  - przyciski: .action-btn + modyfikatory (.preview | .edit | .delete | .form | .download)
 *  - "delete" trzyma stały kolor w CSS
 */
function RowActionsButtons({
	onEdit,
	onDelete,
	onPreview,
	onForm,
	onDownload,
	size = 16,
	className = 'row-actions',
	stopPropagation = true,
	titles,
	disabled,
	'data-testid': testId,
	ariaLabel = 'Akcje wiersza',
}) {
	const labels = {
		preview: titles?.preview ?? 'Podgląd',
		edit: titles?.edit ?? 'Edytuj',
		delete: titles?.delete ?? 'Usuń',
		form: titles?.form ?? 'Formularz',
		download: titles?.download ?? 'Pobierz',
	}

	const isDisabled = {
		preview: !!disabled?.preview,
		edit: !!disabled?.edit,
		delete: !!disabled?.delete,
		form: !!disabled?.form,
		download: !!disabled?.download,
	}

	const wrap = fn => e => {
		if (stopPropagation) {
			e.stopPropagation()
			e.preventDefault?.()
		}
		fn?.()
	}

	// zawsze mamy row-actions + inline
	const containerClass = [
		className?.includes('row-actions') ? className : `row-actions ${className || ''}`,
		'row-actions--inline',
	]
		.filter(Boolean)
		.join(' ')
		.trim()

	// wymuszamy rozmiar na SVG, żeby CSS z font-size:0 ich nie „zgubił”
	const iconStyle = { width: size, height: size, minWidth: size, minHeight: size }

	return (
		<div className={containerClass} role='group' aria-label={ariaLabel} data-testid={testId}>
			{onPreview && (
				<button
					type='button'
					className='action-btn preview'
					onClick={wrap(onPreview)}
					aria-label={labels.preview}
					title={labels.preview}
					disabled={isDisabled.preview}
					data-testid={testId ? `${testId}-preview` : undefined}>
					<Eye aria-hidden style={iconStyle} />
				</button>
			)}

			{onEdit && (
				<button
					type='button'
					className='action-btn edit'
					onClick={wrap(onEdit)}
					aria-label={labels.edit}
					title={labels.edit}
					disabled={isDisabled.edit}
					data-testid={testId ? `${testId}-edit` : undefined}>
					<Pencil aria-hidden style={iconStyle} />
				</button>
			)}

			{onForm && (
				<button
					type='button'
					className='action-btn form'
					onClick={wrap(onForm)}
					aria-label={labels.form}
					title={labels.form}
					disabled={isDisabled.form}
					data-testid={testId ? `${testId}-form` : undefined}>
					<FileText aria-hidden style={iconStyle} />
				</button>
			)}

			{onDownload && (
				<button
					type='button'
					className='action-btn download'
					onClick={wrap(onDownload)}
					aria-label={labels.download}
					title={labels.download}
					disabled={isDisabled.download}
					data-testid={testId ? `${testId}-download` : undefined}>
					<Download aria-hidden style={iconStyle} />
				</button>
			)}

			{onDelete && (
				<button
					type='button'
					className='action-btn delete'
					onClick={wrap(onDelete)}
					aria-label={labels.delete}
					title={labels.delete}
					disabled={isDisabled.delete}
					data-testid={testId ? `${testId}-delete` : undefined}>
					<Trash2 aria-hidden style={iconStyle} />
				</button>
			)}
		</div>
	)
}

RowActionsButtons.propTypes = {
	onEdit: PropTypes.func,
	onDelete: PropTypes.func,
	onPreview: PropTypes.func,
	onForm: PropTypes.func,
	onDownload: PropTypes.func,
	size: PropTypes.number,
	className: PropTypes.string,
	stopPropagation: PropTypes.bool,
	titles: PropTypes.shape({
		preview: PropTypes.string,
		edit: PropTypes.string,
		delete: PropTypes.string,
		form: PropTypes.string,
		download: PropTypes.string,
	}),
	disabled: PropTypes.shape({
		preview: PropTypes.bool,
		edit: PropTypes.bool,
		delete: PropTypes.bool,
		form: PropTypes.bool,
		download: PropTypes.bool,
	}),
	'data-testid': PropTypes.string,
	ariaLabel: PropTypes.string,
}

export default memo(RowActionsButtons)
