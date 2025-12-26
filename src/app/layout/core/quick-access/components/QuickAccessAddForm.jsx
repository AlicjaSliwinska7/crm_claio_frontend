import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useId,
} from 'react'
import PropTypes from 'prop-types'
import '../styles/quick-access-form.css'

const hasProtocol = (s) => /^https?:\/\//i.test(s)
const sanitizeUrl = (s) => (s && !hasProtocol(s) ? `https://${s}` : (s?.trim() || ''))

const isLikelyUrl = (s) => {
  if (!s) return false
  try {
    // eslint-disable-next-line no-new
    new URL(sanitizeUrl(s))
    return true
  } catch {
    return false
  }
}

function QuickAccessAddForm({
  onSubmit = () => {},
  onCancel = () => {},
  defaults,
  autoFocus = true,
  containerClassName = '',
  cancelLabel = 'Anuluj',
  wrapInPanel = true,     // ← NOWE
  'data-testid': testId,
}) {
  const [form, setForm] = useState(() => ({
    title: defaults?.title ?? '',
    url: defaults?.url ?? '',
    tag: defaults?.tag ?? '',
  }))

  const baseId = useId()
  const idTitle = `qa-title-${baseId}`
  const idTitleErr = `qa-title-err-${baseId}`
  const idUrl = `qa-url-${baseId}`
  const idUrlErr = `qa-url-err-${baseId}`

  useEffect(() => {
    setForm({
      title: defaults?.title ?? '',
      url: defaults?.url ?? '',
      tag: defaults?.tag ?? '',
    })
  }, [defaults?.title, defaults?.url, defaults?.tag])

  const errors = useMemo(() => {
    const next = {}
    if (!form.title.trim()) next.title = 'Tytuł jest wymagany.'
    if (!form.url.trim()) next.url = 'Link jest wymagany.'
    else if (!isLikelyUrl(form.url)) next.url = 'Podaj prawidłowy adres (np. https://example.com).'
    return next
  }, [form.title, form.url])

  const canSave = useMemo(() => Object.keys(errors).length === 0, [errors])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }, [])

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    if (!value) return
    setForm((f) => ({ ...f, [name]: value.trim() }))
  }, [])

  const submit = useCallback((e) => {
    e.preventDefault()
    if (!canSave) return
    onSubmit({
      title: form.title.trim(),
      url: sanitizeUrl(form.url),
      tag: form.tag.trim(),
    })
  }, [canSave, form.title, form.url, form.tag, onSubmit])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onCancel()
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (canSave) {
        onSubmit({
          title: form.title.trim(),
          url: sanitizeUrl(form.url),
          tag: form.tag.trim(),
        })
      }
    }
  }, [canSave, form.title, form.url, form.tag, onCancel, onSubmit])

  // tu decydujemy, czy ma być ten „kartowy” wrapper
  const Wrapper = wrapInPanel ? 'div' : React.Fragment
  const wrapperProps = wrapInPanel
    ? {
        className: `quick-access-panel ${containerClassName}`,
        'data-testid': testId ? `${testId}-container` : undefined,
      }
    : {}

  return (
    <Wrapper {...wrapperProps}>
      <form
        className="qa-form qa-form--inline"
        onSubmit={submit}
        noValidate
        data-testid={testId}
        onKeyDown={onKeyDown}
      >
        <div className={`qa-field qa-field--title ${errors.title ? 'is-invalid' : ''}`}>
          <label htmlFor={idTitle}>Tytuł</label>
          <input
            id={idTitle}
            name="title"
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nazwa skrótu"
            required
            autoFocus={autoFocus}
            autoComplete="off"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? idTitleErr : undefined}
          />
          {errors.title && (
            <div id={idTitleErr} className="qa-error" aria-live="polite">
              {errors.title}
            </div>
          )}
        </div>

        <div className={`qa-field qa-field--url ${errors.url ? 'is-invalid' : ''}`}>
          <label htmlFor={idUrl}>Link</label>
          <input
            id={idUrl}
            name="url"
            type="url"
            value={form.url}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://adres.twojej-strony.pl"
            required
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="none"
            aria-invalid={!!errors.url}
            aria-describedby={errors.url ? idUrlErr : undefined}
          />
          {errors.url && (
            <div id={idUrlErr} className="qa-error" aria-live="polite">
              {errors.url}
            </div>
          )}
        </div>

        <div className="qa-actions">
          <button
            type="button"
            className="btn"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            aria-disabled={!canSave}
            disabled={!canSave}
          >
            Zapisz
          </button>
        </div>
      </form>
    </Wrapper>
  )
}

QuickAccessAddForm.propTypes = {
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  defaults: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string,
    tag: PropTypes.string,
  }),
  autoFocus: PropTypes.bool,
  containerClassName: PropTypes.string,
  cancelLabel: PropTypes.string,
  wrapInPanel: PropTypes.bool,  // ← NOWE
  'data-testid': PropTypes.string,
}

export default React.memo(QuickAccessAddForm)
