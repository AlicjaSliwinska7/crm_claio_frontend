// src/shared/tables/utils/actions.js

// Prosty preset: Edytuj + Usuń (buttony)
export const editDeleteActions = (onEdit, onDelete) => [
	{ type: 'edit', label: 'Edytuj', onClick: onEdit },
	{ type: 'delete', label: 'Usuń', onClick: onDelete },
]

/**
 * Akcja pobrania jako LINK z ikoną "download".
 * RowActions wyrenderuje <a> dla każdego obiektu z `href`.
 */
export const downloadAction = (
	href,
	{
		label = 'Pobierz',
		title = 'Pobierz',
		download, // <a download="...">
		target, // np. '_blank'
		rel, // np. 'noopener'
	} = {}
) => ({
	type: 'link', // ważne: link, nie "download"
	icon: 'download', // wymusza ikonę z TYPE_ICON_MAP w RowActions.jsx
	href,
	label,
	title,
	...(download ? { download } : {}),
	...(target ? { target } : {}),
	...(rel ? { rel } : {}),
})

/**
 * Zestaw: Pobierz + Edytuj + Usuń
 */
export const downloadEditDeleteActions = ({
	href,
	onEdit,
	onDelete,
	downloadLabel = 'Pobierz',
	editLabel = 'Edytuj',
	deleteLabel = 'Usuń',
	downloadFileName, // opcjonalnie ustawi <a download="...">
	openInNewTab = false,
} = {}) => [
	downloadAction(href, {
		label: downloadLabel,
		title: downloadLabel,
		download: downloadFileName,
		target: openInNewTab ? '_blank' : undefined,
		rel: openInNewTab ? 'noopener' : undefined,
	}),
	{ type: 'edit', label: editLabel, onClick: onEdit },
	{ type: 'delete', label: deleteLabel, onClick: onDelete },
]
