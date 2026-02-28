// src/shared/tables/components/cells/ActionsCell.jsx
import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import RowActionsButtons from '../RowActionsButtons'

const ActionsCell = memo(function ActionsCell({
  actions = [],
  className = '',
  size = 18,
  ariaLabel = 'Akcje wiersza',
  stopPropagation = true,
  'data-testid': testId,
  sticky = false,
}) {
  const hasActions = Array.isArray(actions) && actions.length > 0

  const handleCellClick = useCallback(
    (e) => {
      if (stopPropagation) e.stopPropagation()
    },
    [stopPropagation]
  )

  // jeśli z zewnątrz przyszło "sticky" w klasie, to przerzucamy je na inner
  const classParts = (className || '').split(/\s+/).filter(Boolean)
  const classHasSticky = classParts.includes('sticky')
  const tdClass = classParts.filter((c) => c !== 'sticky').join(' ')
  const isSticky = sticky || classHasSticky

  // standardowe akcje
  const previewAction =
    actions.find((a) => a.type === 'preview' || a.type === 'view' || a.key === 'preview') || null
  const editAction =
    actions.find((a) => a.type === 'edit' || a.key === 'edit' || a.type === 'update') || null
  const deleteAction =
    actions.find((a) => a.type === 'delete' || a.key === 'delete' || a.type === 'remove') || null

  // formularz
  const formAction = actions.find((a) => a.type === 'form' || a.key === 'form') || null

  // ✅ download:
  // - nowe API: type 'download'
  // - Twoje API: type 'link' + icon 'download'
  const downloadAction =
    actions.find((a) => a.type === 'download' || a.key === 'download') ||
    actions.find((a) => (a.type === 'link' || a.type === 'url') && a.icon === 'download') ||
    null

  const makeHandler = (action) => {
    if (!action) return undefined
    if (typeof action.onClick === 'function') return action.onClick
    return undefined
  }

  // ✅ jeżeli mamy href – renderujemy prawdziwy <a> w RowActionsButtons
  const downloadLink = downloadAction?.href
    ? {
        href: downloadAction.href,
        target: downloadAction.target,
        rel: downloadAction.rel,
        download: downloadAction.download,
        onClick: typeof downloadAction.onClick === 'function' ? downloadAction.onClick : undefined,
      }
    : null

  return (
    <td
      className={clsx('actions-col', tdClass)}
      onClick={handleCellClick}
      data-testid={testId}
      data-column="actions"
    >
      <div className={clsx('actions-col__inner', isSticky && 'actions-col__inner--sticky')}>
        {hasActions ? (
          <RowActionsButtons
            onPreview={makeHandler(previewAction)}
            onEdit={makeHandler(editAction)}
            onDelete={makeHandler(deleteAction)}
            onForm={makeHandler(formAction)}
            onDownload={!downloadLink ? makeHandler(downloadAction) : undefined}
            downloadLink={downloadLink || undefined}
            size={size}
            stopPropagation={stopPropagation}
            titles={{
              preview: previewAction?.title || previewAction?.label || 'Podgląd',
              edit: editAction?.title || editAction?.label || 'Edytuj',
              delete: deleteAction?.title || deleteAction?.label || 'Usuń',
              form: formAction?.title || formAction?.label || 'Formularz',
              download: downloadAction?.title || downloadAction?.label || 'Pobierz',
            }}
            disabled={{
              preview: !!previewAction?.disabled,
              edit: !!editAction?.disabled,
              delete: !!deleteAction?.disabled,
              form: !!formAction?.disabled,
              download: !!downloadAction?.disabled,
            }}
            data-testid={testId ? `${testId}-group` : undefined}
            aria-label={ariaLabel}
          />
        ) : (
          <span className="actions-col__placeholder" aria-hidden="true">
            &nbsp;
          </span>
        )}
      </div>
    </td>
  )
})

ActionsCell.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      type: PropTypes.string,
      label: PropTypes.string,
      title: PropTypes.string,
      icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.string]),
      href: PropTypes.string,
      target: PropTypes.string,
      rel: PropTypes.string,
      download: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
    })
  ),
  className: PropTypes.string,
  size: PropTypes.number,
  ariaLabel: PropTypes.string,
  stopPropagation: PropTypes.bool,
  'data-testid': PropTypes.string,
  sticky: PropTypes.bool,
}

export default ActionsCell