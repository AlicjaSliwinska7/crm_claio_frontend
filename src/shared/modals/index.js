// src/shared/modals/modals/index.js

// core
export { default as Modal } from './modals/Modal'
export { default as ContentModal } from './modals/ContentModal'
export { default as CalModal } from './modals/CalModal'


// form / specjalne
export { default as AddModal } from './modals/AddModal'
export { default as ChangePasswordModal } from './modals/ChangePasswordModal'
export { default as ConfirmDateModal } from './modals/ConfirmDateModal'
export { default as DayOverviewModal } from './modals/DayOverviewModal'
export { default as DocumentUploadModal } from './modals/DocumentUploadModal'
export { default as FullScreenModal } from './modals/FullScreenModal'
export { default as InlineExpand } from './modals/InlineExpand.jsx'
export { default as MethodModal } from './modals/MethodModal.jsx'

// dialogs
export { default as ConfirmDialog } from './dialogs/ConfirmDialog'
export { default as DateConfirmDialog } from './dialogs/DateConfirmDialog'
export { default as DeleteDialog } from './dialogs/DeleteDialog'

// (opcjonalnie) re-exporty zbiorcze jeśli chcesz:
export * as Dialogs from './dialogs'
export * as UI from './ui'
