import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  ListLayout,
  ListSummary,
  Pagination,
  useUrlPagination,
  useCsvExport,
  PAGE_SIZE,
  CSV_DELIMITER,
  CSV_BOM,
} from '../../../shared/tables'

import { DeleteDialog } from '../../../shared/modals'
import { sortRows } from '../../../shared/tables/utils/sorters'

// ⬇️ SSOT konfiguracja metod
import {
  CSV_COLUMNS,
  GROUP_TYPE_MAP,
  METHOD_TYPE_MAP,
  flattenMethods,
  groupByStandard,
  labelForDeleteMethod,
} from '../../../features/methods/config/testingMethods.config'

// lokalne komponenty
import Controls from '../components/Controls'
import MethodsTable from '../components/MethodsTable'
import MethodModal from '../components/MethodModal'
import { demoStandards } from '../components/constants'

export default function TestingMethodsList({ standards = demoStandards }) {
  const [data, setData] = useState(standards)

  const [query, setQuery] = useState('')
  const [accFilter, setAccFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'standardNo', direction: 'asc' })

  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editKey, setEditKey] = useState(null)

  const [form, setForm] = useState({
    standardNo: '',
    title: '',
    methodNo: '',
    methodName: '',
    accredited: false,
  })

  const [formErr, setFormErr] = useState('')
  const [softWarn, setSoftWarn] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteKey, setDeleteKey] = useState(null)

  /* ─────────────────────────────────
   * Flatten -> filtr -> widok tabeli
   * ───────────────────────────────── */
  const flatRows = useMemo(() => flattenMethods(data), [data])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return flatRows.filter(r => {
      if (accFilter === 'acc' && !r.accredited) return false
      if (accFilter === 'non' && r.accredited) return false
      if (!q) return true
      return (
        r.standardNo.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.methodNo.toLowerCase().includes(q) ||
        r.methodName.toLowerCase().includes(q)
      )
    })
  }, [flatRows, query, accFilter])

  const grouped = useMemo(
    () => groupByStandard(filteredRows),
    [filteredRows]
  )

  const groupedSorted = useMemo(() => {
    const { key, direction } = sortConfig

    // sortowanie grup
    if (key === 'standardNo' || key === 'title') {
      return sortRows([...grouped], { key, direction }, GROUP_TYPE_MAP)
    }

    // sortowanie metod w grupach
    return grouped.map(g => ({
      ...g,
      rows: sortRows(g.rows, { key, direction }, METHOD_TYPE_MAP),
    }))
  }, [grouped, sortConfig])

  /* ─────────────────────────────────
   * Summary
   * ───────────────────────────────── */
  const summaryItems = useMemo(() => {
    const standardsCount = new Set(filteredRows.map(r => r.standardNo)).size
    const methodsCount = filteredRows.length
    const acc = filteredRows.filter(r => r.accredited).length
    return [
      ['Normy', standardsCount],
      ['Metody', methodsCount],
      ['Akredytowane', acc],
      ['Nieakredytowane', methodsCount - acc],
    ]
  }, [filteredRows])

  /* ─────────────────────────────────
   * Pagination (URL)
   * ───────────────────────────────── */
  const [sp, setSp] = useSearchParams()

  const {
    pageCount,
    currentPage,
    visible,
    onPageChange,
    resetToFirstPage,
  } = useUrlPagination(groupedSorted, {
    pageSize: PAGE_SIZE,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: '.table-container, .testingMethods-list',
    canonicalize: true,
  })

  /* ─────────────────────────────────
   * Walidacja duplikatów w ramach normy
   * ───────────────────────────────── */
  const hasDuplicate = (stdNo, methNo) => {
    const s = (stdNo || '').trim()
    const m = (methNo || '').trim()
    if (!s || !m) return false
    return data.some(std =>
      std.standardNo === s &&
      (std.methods || []).some(method => {
        if (!isEditing || !editKey) return method.methodNo === m
        const same = editKey.standardNo === s && editKey.methodNo === m
        return method.methodNo === m && !same
      })
    )
  }

  useEffect(() => {
    setFormErr(hasDuplicate(form.standardNo, form.methodNo)
      ? 'Metoda o tym numerze już istnieje w tej normie.'
      : ''
    )
  }, [form.standardNo, form.methodNo, isEditing, editKey, data])

  /* ─────────────────────────────────
   * CRUD
   * ───────────────────────────────── */
  const openAdd = () => {
    setForm({ standardNo: '', title: '', methodNo: '', methodName: '', accredited: false })
    setIsEditing(false)
    setEditKey(null)
    setShowModal(true)
  }

  const openEdit = row => {
    setForm({ ...row, accredited: !!row.accredited })
    setIsEditing(true)
    setEditKey({ standardNo: row.standardNo, methodNo: row.methodNo })
    setShowModal(true)
  }

  const submitSave = e => {
    e.preventDefault()

    const { standardNo, title, methodNo, methodName, accredited } = form
    if (!standardNo || !title || !methodNo || !methodName) {
      alert('Uzupełnij: nr normy, tytuł, nr metody, nazwę metody.')
      return
    }
    if (hasDuplicate(standardNo, methodNo)) return

    // tryb edycji
    if (isEditing && editKey) {
      setData(prev => {
        const copy = prev.map(s => ({ ...s, methods: [...(s.methods || [])] }))
        const oldIdx = copy.findIndex(s => s.standardNo === editKey.standardNo)

        // usuń starą metodę
        if (oldIdx >= 0) {
          copy[oldIdx] = {
            ...copy[oldIdx],
            methods: copy[oldIdx].methods.filter(m => m.methodNo !== editKey.methodNo),
          }
        }

        // znajdź nową grupę lub utwórz
        let tgtIdx = copy.findIndex(s => s.standardNo === standardNo)
        if (tgtIdx === -1) {
          copy.push({ standardNo, title, methods: [] })
          tgtIdx = copy.length - 1
        }

        const tgt = { ...copy[tgtIdx] }
        tgt.title = title
        const newMethod = { methodNo, methodName, accredited: !!accredited }

        const exists = tgt.methods.findIndex(m => m.methodNo === methodNo)
        if (exists >= 0) tgt.methods[exists] = newMethod
        else tgt.methods.push(newMethod)

        copy[tgtIdx] = tgt
        return copy.filter(s => (s.methods || []).length > 0)
      })
    }
    else {
      // nowa metoda
      setData(prev => {
        const idx = prev.findIndex(s => s.standardNo === standardNo)
        if (idx >= 0) {
          const copy = [...prev]
          const std = { ...copy[idx] }
          std.title = title
          std.methods = [...(std.methods || []), { methodNo, methodName, accredited: !!accredited }]
          copy[idx] = std
          return copy
        }
        return [...prev, { standardNo, title, methods: [{ methodNo, methodName, accredited: !!accredited }] }]
      })
    }

    setShowModal(false)
    resetToFirstPage(true)
  }

  const askDelete = row => {
    setDeleteKey(row)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (!deleteKey) return
    setData(prev =>
      prev
        .map(s => ({
          ...s,
          methods: (s.methods || []).filter(m => m.methodNo !== deleteKey.methodNo),
        }))
        .filter(s => (s.methods || []).length > 0)
    )
    setShowDeleteModal(false)
    resetToFirstPage(true)
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteKey(null)
  }

  /* ─────────────────────────────────
   * CSV
   * ───────────────────────────────── */
  const csvRows = useMemo(
    () => filteredRows.map(r => ({ ...r, accreditedText: r.accredited ? 'tak' : 'nie' })),
    [filteredRows]
  )

  const exportCSV = useCsvExport({
    columns: CSV_COLUMNS,
    rows: csvRows,
    filename: 'metody_badawcze.csv',
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  /* ─────────────────────────────────
   * RENDER
   * ───────────────────────────────── */
  return (
    <ListLayout
      rootClassName="testingMethods-list"
      controlsClassName="testingMethods-controls"
      controls={
        <Controls
          query={query}
          setQuery={setQuery}
          accFilter={accFilter}
          setAccFilter={setAccFilter}
          onAdd={openAdd}
          resetToFirstPage={resetToFirstPage}
        />
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <button className="download-btn download-btn--primary" onClick={exportCSV}>
              <i className="fa-solid fa-file-export" />
            </button>
          </div>

          <ListSummary ariaLabel="Podsumowanie norm i metod" items={summaryItems} />
        </>
      }
    >
      <MethodsTable
        visibleGroups={visible}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        resetToFirstPage={resetToFirstPage}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      <MethodModal
        open={showModal}
        onClose={() => setShowModal(false)}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        formErr={formErr}
        softWarn={softWarn}
        setSoftWarn={setSoftWarn}
        submitSave={submitSave}
      />

      <DeleteDialog
        open={showDeleteModal}
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        label={labelForDeleteMethod(deleteKey)}
        what="metodę badawczą"
      />
    </ListLayout>
  )
}
