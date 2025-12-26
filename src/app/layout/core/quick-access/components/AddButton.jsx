// src/app/layout/core/quick-access/components/AddButton.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { Plus } from 'lucide-react'

function AddButton({
  onClick,
  title = 'Dodaj nowy skrót',
  size = 50,
  disabled = false,
  className = '',
  'data-testid': testId,
}) {
  const cls = className ? `qa-add ${className}` : 'qa-add'

  return (
    <button
      type="button"
      className={cls}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      <span className="qa-add-icon" aria-hidden="true">
        <Plus size={size} />
      </span>
    </button>
  )
}

AddButton.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  'data-testid': PropTypes.string,
}

export default React.memo(AddButton)
