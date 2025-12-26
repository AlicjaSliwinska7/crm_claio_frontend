// src/shared/tables/components/CrudDialogs.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Modal, DeleteDialog } from '../../modals'

function CrudDialogs({
	// Modal (form)
	modalOpen,
	isEditing,
	onCloseModal,
	modalTitleAdd = 'Dodaj',
	modalTitleEdit = 'Edytuj',
	children, // formularz wewnątrz modalu
	size = 'sm',

	// Delete dialog
	deleteOpen,
	onConfirmDelete,
	onCancelDelete,
	deleteLabel,
	deleteMessage, // preferowane API: jawny komunikat
	deleteWhat = 'pozycję', // fallback: zbudujemy message z tej frazy
	confirmLabel = 'Usuń',
	cancelLabel = 'Anuluj',
}) {
	const message = deleteMessage ?? (deleteWhat ? `Czy na pewno chcesz usunąć ${deleteWhat}?` : undefined)

	return (
		<>
			{modalOpen && (
				<Modal title={isEditing ? modalTitleEdit : modalTitleAdd} onClose={onCloseModal} size={size}>
					{children}
				</Modal>
			)}

			<DeleteDialog
				open={!!deleteOpen}
				label={deleteLabel}
				message={message}
				onConfirm={onConfirmDelete}
				onClose={onCancelDelete}
				confirmLabel={confirmLabel}
				cancelLabel={cancelLabel}
			/>
		</>
	)
}

CrudDialogs.propTypes = {
	// Modal
	modalOpen: PropTypes.bool,
	isEditing: PropTypes.bool,
	onCloseModal: PropTypes.func,
	modalTitleAdd: PropTypes.string,
	modalTitleEdit: PropTypes.string,
	children: PropTypes.node,
	size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),

	// Delete dialog
	deleteOpen: PropTypes.bool,
	onConfirmDelete: PropTypes.func,
	onCancelDelete: PropTypes.func,
	deleteLabel: PropTypes.string,
	deleteMessage: PropTypes.string,
	deleteWhat: PropTypes.string,
	confirmLabel: PropTypes.string,
	cancelLabel: PropTypes.string,
}

export default memo(CrudDialogs)
