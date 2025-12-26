// src/app/layout/core/quick-access/components/Tile.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'

function Tile({ id, label, manage = false, onRemove, onClick, className = '' }) {
  const cls = className ? `qa-tile ${className}` : 'qa-tile'

  return (
    <div className={cls}>
      <button
        type="button"
        className="qa-btn"
        onClick={onClick}
        title={label}
        aria-label={label}
      >
        {label}
      </button>

      {manage && (
        <button
          type="button"
          className="qa-remove"
          title="Usuń skrót"
          aria-label={`Usuń skrót ${label}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.(id)
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

Tile.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  manage: PropTypes.bool,
  onRemove: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
}

export default React.memo(Tile)
