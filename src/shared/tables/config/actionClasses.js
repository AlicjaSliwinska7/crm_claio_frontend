// src/shared/tables/config/actionClasses.js

// Wspólna klasa bazowa dla wszystkich przycisków akcji
export const ACTION_BASE_CLASS = 'action-btn'

// Krótkie aliasy (używane m.in. przez selektory .action-btn.delete)
export const ACTION_SHORT = {
	edit: 'edit',
	delete: 'delete',
	view: 'view',
	preview: 'preview',
	form: 'form',
	download: 'download',
	link: 'link',
}

// Długi modyfikator w konwencji BEM-owej (zgodny z naszym CSS: .action-btn.action-edit)
export const ACTION_LONG = {
	edit: 'action-edit',
	delete: 'action-delete',
	view: 'action-view',
	preview: 'action-preview',
	form: 'action-form',
	download: 'action-download',
	link: 'action-link',
}

// Pełne klasy dla znanych typów (BASE + oba modyfikatory)
export const ACTION_CLASSES = Object.fromEntries(
	Object.keys(ACTION_SHORT).map(type => [type, `${ACTION_BASE_CLASS} ${ACTION_LONG[type]} ${ACTION_SHORT[type]}`])
)

/**
 * Buduje klasy dla dowolnego typu + ewentualnych dodatkowych klas.
 * Zawsze zwraca przynajmniej 'action-btn'.
 */
export function classForAction(type, extra = '') {
	const baseForKnown =
		type && ACTION_CLASSES[type] ? ACTION_CLASSES[type] : `${ACTION_BASE_CLASS}${type ? ` action-${type}` : ''}`

	// Jeśli to 'delete', upewnij się, że jest też krótki alias 'delete'
	const withDeleteAlias =
		type === 'delete' && !baseForKnown.includes(' delete') ? `${baseForKnown} delete` : baseForKnown

	return extra ? `${withDeleteAlias} ${extra}`.trim() : withDeleteAlias
}
