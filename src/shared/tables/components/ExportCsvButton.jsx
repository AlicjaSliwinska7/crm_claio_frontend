// src/shared/tables/components/ExportCsvButton.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

/**
 * ExportCsvButton — wspólny przycisk eksportu CSV
 * Zachowuje klasy i wygląd 1:1: "download-btn download-btn--primary"
 */
function ExportCsvButton({
	onClick,
	label = 'Eksportuj CSV',
	title = 'Eksportuj CSV',
	ariaLabel = 'Eksportuj CSV',
	className = '',
	iconOnly = true,
	disabled = false,
	busy = false,
	'data-testid': testId,
}) {
	return (
		<button
			type='button'
			className={`download-btn download-btn--primary ${className}`.trim()}
			onClick={onClick}
			title={title}
			aria-label={ariaLabel}
			disabled={disabled || busy}
			data-testid={testId}>
			<i className='fa-solid fa-file-export' aria-hidden />
			{!iconOnly && <span style={{ marginLeft: 6 }}>{busy ? 'Eksportuję…' : label}</span>}
		</button>
	)
}

ExportCsvButton.propTypes = {
	onClick: PropTypes.func,
	label: PropTypes.string,
	title: PropTypes.string,
	ariaLabel: PropTypes.string,
	className: PropTypes.string,
	iconOnly: PropTypes.bool,
	disabled: PropTypes.bool,
	busy: PropTypes.bool,
	'data-testid': PropTypes.string,
}

export default memo(ExportCsvButton)
