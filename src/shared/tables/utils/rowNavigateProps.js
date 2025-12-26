// src/shared/tables/utils/rowNavigateProps.js

function isInteractiveTarget(target) {
	if (!target || typeof target.closest !== 'function') return false
	// cokolwiek interaktywnego w wierszu nie powinno wywoływać nawigacji wiersza
	const selector = [
		'a[href]',
		'button',
		'input',
		'select',
		'textarea',
		'[role="button"]',
		'[data-stop-row-nav="true"]',
	].join(',')
	return !!target.closest(selector)
}

/**
 * Props do przypięcia na <tr> lub wrapperze wiersza, żeby całość była klikalna i dostępna.
 *
 * @param {string|number} id
 * @param {(id:any, evt:Event)=>void} onNavigate
 * @param {{label?:string, disabled?:boolean, role?:'link'|'button', stopOnInteractive?:boolean}} opts
 */
export function rowNavigateProps(id, onNavigate, opts = {}) {
	const {
		label,
		disabled = false,
		role = 'link', // semantycznie to „przejście gdzieś”, więc link
		stopOnInteractive = true, // nie nawiguj, gdy klik w <a>, <button>, itp.
	} = opts

	const callNavigate = e => {
		if (disabled) return
		if (typeof onNavigate === 'function') onNavigate(id, e)
	}

	return {
		role,
		tabIndex: disabled ? -1 : 0,
		'aria-disabled': disabled ? 'true' : undefined,
		'aria-label': label,
		'data-rowid': id,
		style: { cursor: disabled ? 'default' : 'pointer' },

		onClick: e => {
			if (disabled) {
				e.preventDefault?.()
				return
			}
			if (stopOnInteractive && isInteractiveTarget(e.target)) return
			callNavigate(e)
		},

		onKeyDown: e => {
			if (disabled) return
			// Enter aktywuje od razu
			if (e.key === 'Enter') {
				e.preventDefault()
				callNavigate(e)
			}
			// Spacja niech nie przewija strony – akcję wykonamy w keyUp
			if (e.key === ' ') {
				e.preventDefault()
			}
		},

		onKeyUp: e => {
			if (disabled) return
			if (e.key === ' ') {
				callNavigate(e)
			}
		},
	}
}
