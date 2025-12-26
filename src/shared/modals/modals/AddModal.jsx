import React from 'react';
import Modal from './Modal';
import '../styles/modal.css';

/**
 * AddModal – bazowy modal do formularzy „dodawania”.
 * - overlay/jamniczek: bierze z bazowego <Modal> (tło jak DayOverview)
 * - wnętrze: formularz + przyklejona stopka akcji
 *
 * Props:
 * - open?: boolean (domyślnie true dla zgodności)
 * - title?: string
 * - onClose: () => void
 * - size?: 'sm' | 'md' | 'lg'  (domyślnie 'lg' – wygodniej dla długich form)
 * - formId?: string            (powiązanie przycisku „Zapisz” z konkretną formą)
 */
export default function AddModal({
  open = true,
  title = 'Dodaj',
  onClose,
  children,
  size = 'lg',
  formId = 'add-form',
}) {
  if (!open) return null;

  return (
    <Modal
      title={title}
      onClose={onClose}
      size={size}
      showClose
      className="ui-form"            // <— dodatkowa klasa: tylko dla formowych modali
      ariaLabel={title}
    >
      {/* Uwaga: nie zmieniamy Twojej logiki pól – po prostu opakuj je w <form> */}
      <form id={formId} className="ui-modal__body" noValidate>
        {children}
      </form>

      {/* Przyklejona stopka akcji (nie ucieka przy scrollowaniu treści) */}
      <div className="ui-modal__footer">
        <button type="button" className="ui-btn" onClick={onClose}>
          Anuluj
        </button>
        <button type="submit" className="ui-btn ui-btn--primary" form={formId}>
          Zapisz
        </button>
      </div>
    </Modal>
  );
}

/** Alias dla zgodności ze starymi importami */
export function LegacyModal(props) {
  return <AddModal {...props} />;
}
