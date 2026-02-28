import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

// U Ciebie Modal jest w shared/modals — zostawiam import jak w typowej strukturze.
// Jeśli masz inną ścieżkę w projekcie, podmień tylko import.
import Modal from './Modal'

// U Ciebie FileUploaderCompact i AddButton są w shared/tables (z rozmowy).
// Jeśli ścieżki masz inne – podmień importy, nie logikę.
import { FileUploaderCompact } from '../../tables'

export default function DocumentUploadModal({
  open,
  onClose,
  onSubmit,

  categories = [],
  defaultCategory = 'inne',

  validate,
  allowedExts = [],

  title = 'Dodaj dokument',
  namePlaceholder = 'Nazwa dokumentu',

  mode = 'modal', // 'modal' | 'inline'
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(defaultCategory)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({ name: '', file: '' })

  useEffect(() => {
    if (!open) return
    setName('')
    setCategory(defaultCategory)
    setFile(null)
    setErrors({ name: '', file: '' })
  }, [open, defaultCategory])

  const runValidate = (nextName, nextFile) => {
    if (typeof validate !== 'function') return { name: '', file: '' }
    const res = validate(nextName, nextFile) || {}
    return { name: res.name || '', file: res.file || '' }
  }

  const isValid = useMemo(() => {
    const hasErr = Boolean(errors?.name || errors?.file)
    return Boolean(name.trim()) && Boolean(file) && !hasErr
  }, [name, file, errors])

  const handleSubmit = () => {
    const nextErrors = runValidate(name, file)
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.file) return

    onSubmit?.({
      name: name.trim(),
      category,
      file,
    })
  }

  if (!open) return null

  const form = (
    <div className="documents-upload">
      <div className="form-row">
        {/* Nazwa */}
        <div className="doc-name">
          <input
            type="text"
            placeholder={namePlaceholder}
            value={name}
            onChange={(e) => {
              const v = e.target.value
              setName(v)
              setErrors(runValidate(v, file))
            }}
            className={errors.name ? 'input-error' : undefined}
            aria-label="Nazwa dokumentu"
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </div>

        {/* Kategoria */}
        <div className="doc-cat">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="training-filter-select"
            aria-label="Kategoria dokumentu"
          >
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Plik */}
        <div className="doc-file">
          <FileUploaderCompact
            value={file}
            onChange={(f) => {
              setFile(f)
              setErrors(runValidate(name, f))
            }}
            accept={allowedExts?.length ? allowedExts.join(',') : undefined}
            error={errors.file}
          />
          {errors.file ? <small className="field-error">{errors.file}</small> : null}
        </div>

        {/* Akcje */}
        <div className="doc-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Anuluj
          </button>

          <button
            type="button"
            className="btn btn--primary addbar-submit"
            onClick={handleSubmit}
            disabled={!isValid}
            aria-label="Dodaj dokument"
            title="Dodaj dokument"
          >
            Dodaj
          </button>
        </div>
      </div>
    </div>
  )

  if (mode === 'inline') {
    return (
      <section className="inline-modal inline-modal--document-upload" role="region" aria-label={title}>
        <div className="inline-modal__body">{form}</div>
      </section>
    )
  }

  return (
    <Modal title={title} onClose={onClose} size="sm">
      {form}
    </Modal>
  )
}

DocumentUploadModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,

  categories: PropTypes.array,
  defaultCategory: PropTypes.string,

  validate: PropTypes.func,
  allowedExts: PropTypes.array,

  title: PropTypes.string,
  namePlaceholder: PropTypes.string,

  mode: PropTypes.oneOf(['modal', 'inline']),
}