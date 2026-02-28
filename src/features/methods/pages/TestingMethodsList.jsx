import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  ListLayout,
  SearchBar,
  FilterSelect,
  ListSummary,
  Pagination,
  ExportCsvButton,
  TableScrollWrapper,
  useUrlPagination,
  useCsvExport,
  PAGE_SIZE,
  CSV_DELIMITER,
  CSV_BOM,
  SCROLL_SELECTOR,
  sortRows,
  AddButton,
} from '../../../shared/tables'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

import { DeleteDialog } from '../../../shared/modals'
import { MethodModal } from '../../../shared/modals'

import MethodsTable from '../components/MethodsTable'
import { demoStandards } from '../components/constants'

import {
  CSV_COLUMNS,
  flattenMethods,
  groupByStandard,
  labelForDeleteMethod,
  EMPTY_METHOD_FORM,
  normalizeOnLoad,
} from '../config/methods.config'

export default function TestingMethodsList({ standards = demoStandards }) {
  const [data, setData] = useState(() => normalizeOnLoad(standards))

  // filtry/sterowanie
  const [query, setQuery] = useState('')
  const [accFilter, setAccFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'standardNo', direction: 'asc' })

  // modal edycji/dodawania
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editKey, setEditKey] = useState(null)
  const [form, setForm] = useState(EMPTY_METHOD_FORM)
  const [formErr, setFormErr] = useState('')
  const [softWarn, setSoftWarn] = useState('')

  // modal kasowania
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteRow, setDeleteRow] = useState(null)

  // jeśli parent podmieni standards
  useEffect(() => {
    setData(normalizeOnLoad(standards))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standards])

  // ===== Flatten do tabeli =====
  const flatRows = useMemo(() => flattenMethods(data), [data])

  // 🔎 Filtr tekst + filtr akredytacji
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return flatRows.filter((r) => {
      if (accFilter === 'acc' && !r.accredited) return false
      if (accFilter === 'non' && r.accredited) return false
      if (!q) return true

      return (
        String(r.standardNo || '').toLowerCase().includes(q) ||
        String(r.title || '').toLowerCase().includes(q) ||
        String(r.methodNo || '').toLowerCase().includes(q) ||
        String(r.methodName || '').toLowerCase().includes(q) ||
        String(r.reportMethodId || '').toLowerCase().includes(q)
      )
    })
  }, [flatRows, accFilter, query])

  // grupowanie po normie
  const grouped = useMemo(() => groupByStandard(filteredRows), [filteredRows])

  // sortowanie (grupy lub metody w grupach)
  const groupedSorted = useMemo(() => {
    const { key, direction } = sortConfig

    // sortuj grupy po standardNo/title
    if (key === 'standardNo' || key === 'title') {
      return sortRows(grouped, { key, direction })
    }

    // sortuj wiersze w grupach (metody)
    return grouped.map((g) => ({
      ...g,
      rows: sortRows(g.rows, { key, direction }),
    }))
  }, [grouped, sortConfig])

  // summary
  const summaryItems = useMemo(() => {
    const standardsCount = new Set(filteredRows.map((r) => r.standardNo)).size
    const methodsCount = filteredRows.length
    const acc = filteredRows.filter((r) => r.accredited).length
    return [
      ['Normy', standardsCount],
      ['Metody', methodsCount],
      ['Akredytowane', acc],
      ['Nieakredytowane', methodsCount - acc],
    ]
  }, [filteredRows])

  // ===== Paginacja (URL) =====
  const [sp, setSp] = useSearchParams()
  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(groupedSorted, {
    pageSize: PAGE_SIZE,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  // deps do przeliczenia scrolla
  const scrollDeps = useMemo(
    () => [visible?.length, sortConfig?.key, sortConfig?.direction, query, accFilter],
    [visible?.length, sortConfig?.key, sortConfig?.direction, query, accFilter]
  )

  // ===== Duplikaty nr metody w obrębie normy =====
  const hasDuplicateInTarget = useCallback(
    (stdNo, methNo) => {
      const s = (stdNo || '').trim()
      const m = (methNo || '').trim()
      if (!s || !m) return false

      return data.some((std) =>
        std.standardNo === s &&
        (std.methods || []).some((method) => {
          if (!isEditing || !editKey) return method.methodNo === m
          const sameOriginal = editKey.standardNo === s && editKey.methodNo === m
          return method.methodNo === m && !sameOriginal
        })
      )
    },
    [data, isEditing, editKey]
  )

  useEffect(() => {
    setFormErr(hasDuplicateInTarget(form.standardNo, form.methodNo) ? 'Metoda o tym numerze już istnieje w tej normie.' : '')
  }, [form.standardNo, form.methodNo, hasDuplicateInTarget])

  // ===== CRUD =====
  const openAdd = useCallback(() => {
    setForm(EMPTY_METHOD_FORM)
    setIsEditing(false)
    setEditKey(null)
    setFormErr('')
    setSoftWarn('')
    setShowModal(true)
  }, [])

  const openEdit = useCallback((row) => {
    setForm({
      ...EMPTY_METHOD_FORM,
      ...row,
      accredited: !!row.accredited,
    })
    setIsEditing(true)
    setEditKey({ standardNo: row.standardNo, methodNo: row.methodNo })
    setFormErr('')
    setSoftWarn('')
    setShowModal(true)
  }, [])

  const submitSave = (e) => {
    e.preventDefault()

    const standardNo = String(form.standardNo || '').trim()
    const title = String(form.title || '').trim()
    const methodNo = String(form.methodNo || '').trim()
    const methodName = String(form.methodName || '').trim()

    if (!standardNo || !title || !methodNo || !methodName) {
      alert('Uzupełnij: nr normy, tytuł, nr metody, nazwę metody.')
      return
    }
    if (hasDuplicateInTarget(standardNo, methodNo)) {
      setFormErr('Metoda o tym numerze już istnieje w tej normie.')
      return
    }

    const newMethod = {
      methodNo,
      methodName,
      accredited: !!form.accredited,

      sampleType: String(form.sampleType || '').trim(),
      matrix: String(form.matrix || '').trim(),
      rangeMin: String(form.rangeMin || '').trim(),
      rangeMax: String(form.rangeMax || '').trim(),
      rangeUnit: String(form.rangeUnit || '').trim(),
      loq: String(form.loq || '').trim(),
      lod: String(form.lod || '').trim(),
      tatDays: form.tatDays === '' ? '' : Number(form.tatDays),
      priceNet: form.priceNet === '' ? '' : Number(form.priceNet),
      reportMethodId: String(form.reportMethodId || '').trim(),
    }

    if (isEditing && editKey) {
      setData((prev) => {
        const copy = prev.map((s) => ({ ...s, methods: [...(s.methods || [])] }))

        // usuń starą metodę z poprzedniej normy
        const oldIdx = copy.findIndex((s) => s.standardNo === editKey.standardNo)
        if (oldIdx >= 0) {
          copy[oldIdx] = {
            ...copy[oldIdx],
            methods: (copy[oldIdx].methods || []).filter((m) => m.methodNo !== editKey.methodNo),
          }
        }

        // dodaj/aktualizuj w docelowej normie
        let tgtIdx = copy.findIndex((s) => s.standardNo === standardNo)
        if (tgtIdx === -1) {
          copy.push({ standardNo, title, methods: [] })
          tgtIdx = copy.length - 1
        }

        const tgt = { ...copy[tgtIdx], methods: [...(copy[tgtIdx].methods || [])] }
        tgt.title = title

        const existsIdx = tgt.methods.findIndex((m) => m.methodNo === newMethod.methodNo)
        if (existsIdx >= 0) tgt.methods[existsIdx] = newMethod
        else tgt.methods.push(newMethod)

        copy[tgtIdx] = tgt
        return copy.filter((s) => (s.methods || []).length > 0)
      })
    } else {
      setData((prev) => {
        const idx = prev.findIndex((s) => s.standardNo === standardNo)
        if (idx >= 0) {
          const copy = [...prev]
          const std = { ...copy[idx], methods: [...(copy[idx].methods || [])] }
          std.title = title
          std.methods.push(newMethod)
          copy[idx] = std
          return copy
        }
        return [...prev, { standardNo, title, methods: [newMethod] }]
      })
    }

    setShowModal(false)
    setIsEditing(false)
    setEditKey(null)
    resetToFirstPage(true)
  }

  const askDelete = (row) => {
    setDeleteRow(row)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (!deleteRow) return
    setData((prev) => {
      const copy = prev.map((s) => ({ ...s, methods: [...(s.methods || [])] }))
      const idx = copy.findIndex((s) => s.standardNo === deleteRow.standardNo)
      if (idx >= 0) {
        copy[idx] = {
          ...copy[idx],
          methods: (copy[idx].methods || []).filter((m) => m.methodNo !== deleteRow.methodNo),
        }
      }
      return copy.filter((s) => (s.methods || []).length > 0)
    })
    setShowDeleteModal(false)
    setDeleteRow(null)
    resetToFirstPage(true)
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteRow(null)
  }

  // ===== CSV =====
  const exportCSV = useCsvExport({
    columns: CSV_COLUMNS,
    rows: filteredRows, // flattenMethods już daje accreditedText + range itd.
    filename: 'metody_badawcze.csv',
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  const accOptions = useMemo(
    () => [
      { key: 'all', value: 'all', label: 'Wszystkie' },
      { key: 'acc', value: 'acc', label: 'Tylko akredytowane' },
      { key: 'non', value: 'non', label: 'Nieakredytowane' },
    ],
    []
  )

  return (
    <ListLayout
      rootClassName="testingMethods-list"
      controlsClassName="testingMethods-controls"
      controls={
        <>
          <SearchBar
            value={query}
            placeholder="Szukaj w normach i metodach..."
            onChange={(val) => {
              setQuery(val)
              resetToFirstPage(true)
            }}
            onClear={() => {
              setQuery('')
              resetToFirstPage(true)
            }}
          />

          {/* ✅ nowy FilterSelect (headless) – ten sam styl co Documents */}
          <FilterSelect
            label={null}
            value={accFilter}
            onChange={(e) => {
              setAccFilter(e.target.value)
              resetToFirstPage(true)
            }}
            options={accOptions}
            includeAll={false}
            ariaLabel="Filtr akredytacji"
            title="Filtr akredytacji"
            className="testingMethods-filter"
          />

          <AddButton title="Dodaj metodę" ariaLabel="Dodaj metodę" onClick={openAdd} />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary ariaLabel="Podsumowanie norm i metod (bieżący widok)" items={summaryItems} />
        </>
      }
    >
      <TableScrollWrapper deps={scrollDeps} className="table-container">
        <MethodsTable
          visibleGroups={visible}
          sortConfig={sortConfig}
          setSortConfig={(cfg) => {
            setSortConfig(cfg)
            resetToFirstPage(true)
          }}
          resetToFirstPage={resetToFirstPage}
          onEdit={openEdit}
          onDelete={askDelete}
        />
      </TableScrollWrapper>

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
        label={labelForDeleteMethod(deleteRow)}
        what="metodę badawczą"
      />
    </ListLayout>
  )
}