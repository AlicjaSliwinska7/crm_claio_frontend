// src/app/layout/core/quick-access/components/Tile.jsx
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { getShortcutIcon } from '../utils/shortcutIcons'

function isExternalTarget(to) {
  if (!to || typeof to !== 'string') return false
  return /^(https?:)?\/\//i.test(to) || to.startsWith('mailto:') || to.startsWith('tel:')
}

function normalizePath(p) {
  if (!p) return '/'
  const noQ = p.split('?')[0].split('#')[0]
  return noQ.length > 1 ? noQ.replace(/\/+$/, '') : noQ
}

function isActivePath(currentPathname, to) {
  if (!to || typeof to !== 'string') return false
  if (isExternalTarget(to)) return false

  const cur = normalizePath(currentPathname)
  const target = normalizePath(to)

  if (cur === target) return true
  return cur.startsWith(target + '/')
}

function Tile({
  id,
  label,
  to,
  manage = false,
  onRemove,
  onClick,
  className = '',
  iconWeight = 'normal', // 'thin' | 'normal'
}) {
  const { pathname } = useLocation()
  const active = useMemo(() => isActivePath(pathname, to), [pathname, to])

  const cls = useMemo(() => {
    const base = className ? `qa-tile ${className}` : 'qa-tile'
    return active ? `${base} active` : base
  }, [className, active])

  const icon = useMemo(() => getShortcutIcon({ id, to }), [id, to])

  // Lucide: default strokeWidth ~2. U nas: normal = 1.75, thin = 1.25
  const strokeWidth = iconWeight === 'thin' ? 1.25 : 1.75

  const iconNode = useMemo(() => {
    if (!icon) return null

    // jeśli ktoś zwrócił już gotowy element, spróbujmy mu nadać strokeWidth
    if (React.isValidElement(icon)) {
      // nie nadpisujemy propsów, jeśli to nie jest SVG/lucide? — clone jest bezpieczny
      return React.cloneElement(icon, { strokeWidth })
    }

    // lucide: forwardRef/memo → createElement działa poprawnie
    return React.createElement(icon, { size: 18, strokeWidth, 'aria-hidden': true })
  }, [icon, strokeWidth])

  return (
    <div className={cls} data-qa-icon-weight={iconWeight}>
      <button
        type="button"
        className={active ? 'qa-btn active' : 'qa-btn'}
        onClick={onClick}
        title={label}
        aria-label={label}
      >
        <span className="qa-btn__inner">
          <span className="qa-ico" aria-hidden="true">
            {iconNode}
          </span>
          <span className="qa-label">{label}</span>
        </span>
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
  to: PropTypes.string,
  manage: PropTypes.bool,
  onRemove: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  iconWeight: PropTypes.oneOf(['thin', 'normal']),
}

Tile.defaultProps = {
  to: undefined,
  manage: false,
  onRemove: undefined,
  className: '',
  iconWeight: 'normal',
}

export default React.memo(Tile)