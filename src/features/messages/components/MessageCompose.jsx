// src/features/messages/components/MessageCompose.jsx
import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import '../styles/messages.css' // Upewnij się co do nazwy pliku (case-sensitive)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseRecipients(raw) {
  // przetwarza: "a@x.com, b@x.com ; c@x.com"
  return String(raw || '')
    .split(/[;,]/g)
    .map(s => s.trim())
    .filter(Boolean)
}

function validateRecipients(list) {
  const invalid = list.filter(r => !EMAIL_RE.test(r))
  return { ok: invalid.length === 0, invalid }
}

export default function MessageCompose({
  initialTo = '',
  initialSubject = '',
  initialContent = '',
  onSend,
  onCancel,
  maxSubject = 150,
  maxContent = 10_000,
}) {
  const [to, setTo] = useState(initialTo)
  const [subject, setSubject] = useState(initialSubject)
  const [content, setContent] = useState(initialContent)
  const [errors, setErrors] = useState({ to: '', subject: '', content: '' })
  const [sending, setSending] = useState(false)

  const recipients = useMemo(() => parseRecipients(to), [to])

  const canSend = useMemo(() => {
    if (!recipients.length) return false
    if (!subject.trim()) return false
    if (!content.trim()) return false
    if (subject.length > maxSubject || content.length > maxContent) return false
    return validateRecipients(recipients).ok
  }, [recipients, subject, content, maxSubject, maxContent])

  const runValidation = () => {
    const next = { to: '', subject: '', content: '' }
    const { ok, invalid } = validateRecipients(recipients)
    if (!recipients.length) next.to = 'Podaj co najmniej jednego adresata.'
    else if (!ok) next.to = `Nieprawidłowe adresy: ${invalid.join(', ')}`

    if (!subject.trim()) next.subject = 'Temat jest wymagany.'
    else if (subject.length > maxSubject) next.subject = `Maks. ${maxSubject} znaków.`

    if (!content.trim()) next.content = 'Treść jest wymagana.'
    else if (content.length > maxContent) next.content = `Maks. ${maxContent} znaków.`

    setErrors(next)
    return !next.to && !next.subject && !next.content
  }

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault()
    if (!runValidation()) return
    try {
      setSending(true)
      const payload = { to: recipients, subject: subject.trim(), content: content.trim() }

      if (typeof onSend === 'function') {
        await onSend(payload)
      } else {
        // fallback – zachowuje Twoje dotychczasowe zachowanie w dev
        // eslint-disable-next-line no-console
        console.log(payload)
        alert('Wiadomość wysłana (symulacja)')
      }

      setTo('')
      setSubject('')
      setContent('')
      setErrors({ to: '', subject: '', content: '' })
    } finally {
      setSending(false)
    }
  }, [recipients, subject, content, onSend])

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e)
    } else if (e.key === 'Escape' && typeof onCancel === 'function') {
      onCancel()
    }
  }

  return (
    <form className='message-compose' onSubmit={handleSubmit} onKeyDown={onKeyDown} noValidate>
      <label className='mc-row'>
        <span className='mc-label'>Do</span>
        <input
          type='text'
          inputMode='email'
          autoComplete='email'
          placeholder='Adresy e-mail (oddziel przecinkami lub średnikiem)'
          value={to}
          onChange={e => setTo(e.target.value)}
          aria-invalid={errors.to ? 'true' : 'false'}
          aria-describedby={errors.to ? 'mc-to-err' : undefined}
        />
        {errors.to && <div id='mc-to-err' className='mc-error'>{errors.to}</div>}
      </label>

      <label className='mc-row'>
        <span className='mc-label'>Temat</span>
        <input
          type='text'
          placeholder='Temat wiadomości'
          value={subject}
          onChange={e => setSubject(e.target.value)}
          maxLength={maxSubject}
          aria-invalid={errors.subject ? 'true' : 'false'}
          aria-describedby={errors.subject ? 'mc-subj-err' : undefined}
        />
        <div className='mc-help'>
          {subject.length}/{maxSubject}
        </div>
        {errors.subject && <div id='mc-subj-err' className='mc-error'>{errors.subject}</div>}
      </label>

      <label className='mc-row'>
        <span className='mc-label'>Treść</span>
        <textarea
          placeholder='Treść wiadomości...'
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={maxContent}
          rows={8}
          aria-invalid={errors.content ? 'true' : 'false'}
          aria-describedby={errors.content ? 'mc-body-err' : undefined}
        />
        <div className='mc-help'>
          {content.length}/{maxContent} • Ctrl/⌘+Enter – wyślij
        </div>
        {errors.content && <div id='mc-body-err' className='mc-error'>{errors.content}</div>}
      </label>

      <div className='modal-actions'>
        {typeof onCancel === 'function' && (
          <button type='button' className='btn btn-muted' onClick={onCancel} disabled={sending}>
            Anuluj
          </button>
        )}
        <button type='submit' className='btn btn-primary' disabled={!canSend || sending}>
          {sending ? 'Wysyłanie…' : 'Wyślij'}
        </button>
      </div>
    </form>
  )
}

MessageCompose.propTypes = {
  initialTo: PropTypes.string,
  initialSubject: PropTypes.string,
  initialContent: PropTypes.string,
  onSend: PropTypes.func,   // async OK
  onCancel: PropTypes.func,
  maxSubject: PropTypes.number,
  maxContent: PropTypes.number,
}
