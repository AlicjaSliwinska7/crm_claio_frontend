// src/features/administration/pages/TrainingsDirectory.jsx
import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// skórka „registers”
import '../../../shared/tables/styles/directories_lists_registers/index.css'
// jeśli statuses.css nie jest podpięty w index.css – ten import jest konieczny:
import '../../../shared/tables/styles/directories_lists_registers/statuses.css'

import { Modal, DeleteDialog } from '../../../shared/modals'
import TrainingForm from '../forms/TrainingForm'

import {
  ListLayout,
  SearchBar,
  AddButton,
  DataTableWithActions,
  Pagination,
  ListSummary,
  ExportCsvButton,
  FilterSelect,
  useUrlPagination,
  useListCrud,
  useListQuery,
  useCsvExport,
  rowNavigateProps as makeRowNavigateProps,
  PAGE_SIZE,
  CSV_DELIMITER,
  CSV_BOM,
  SCROLL_SELECTOR,
  csvFilename,
  editDeleteActions,
} from '../../../shared/tables'

import { rid } from '../../../shared/utils/id'
import { joinArray } from '../../../shared/utils/formatters'

import {
  DEFAULT_TRAINING,
  TRAINING_TABLE_COLS,
  TRAINING_CSV_COLUMNS,
  validateTraining,
  normalizeTraining,
  TRAINING_TYPES,
  INITIAL_TRAININGS,
  getSearchFields,
  getTypeLabel,
  getStatusLabel,
  labelForDelete,
} from '../config/trainings.config'

const joinParticipants = (arr) => joinArray(arr, ', ')

export default function TrainingsDirectory() {
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()

  const [filterType, setFilterType] = useState('wszystkie')
  const [filterParticipant, setFilterParticipant] = useState('wszyscy')

  const validate = useCallback((draft) => {
    const normalized = normalizeTraining(draft || {})
    const errs = validateTraining(normalized)
    const first = Object.values(errs)[0]
    return first || null
  }, [])

  const normalizeOnSave = useCallback((x) => normalizeTraining(x), [])

  const {
    list: trainings,
    form,
    setForm,
    modalOpen,
    openAdd,
    openEdit,
    closeModal,
    isEditing,
    showDeleteModal,
    askDelete,
    cancelDelete,
    confirmDelete,
    deleteLabel,
    save,
  } = useListCrud({
    initialItems: INITIAL_TRAININGS,
    idKey: 'id',
    makeId: () => rid('TR'),
    validate,
    normalizeOnSave,
    labelForDelete,
  })

  const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(
    trainings,
    TRAINING_TABLE_COLS,
    {
      initialSort: { key: 'date', direction: 'desc' },
      getSearchFields,
    }
  )

  const participantOptions = useMemo(() => {
    const set = new Set()
    for (const t of trainings) {
      for (const p of t.participants || []) set.add(p)
    }
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), 'pl', { sensitivity: 'base' }))
  }, [trainings])

  const filtered = useMemo(
    () =>
      filteredSorted.filter((t) => {
        if (filterType !== 'wszystkie' && t.type !== filterType) return false
        if (filterParticipant !== 'wszyscy' && !(t.participants || []).includes(filterParticipant)) return false
        return true
      }),
    [filteredSorted, filterType, filterParticipant]
  )

  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filtered, {
    pageSize: PAGE_SIZE,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  const csvRows = useMemo(
    () =>
      filtered.map((r) => ({
        ...r,
        type: getTypeLabel(r.type),
        status: getStatusLabel(r.status),
        participants: joinParticipants(r.participants || []),
      })),
    [filtered]
  )

  const exportCSV = useCsvExport({
    columns: TRAINING_CSV_COLUMNS,
    rows: csvRows,
    filename: csvFilename('szkolenia'),
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  const handleRowClick = useCallback((id) => navigate(`/administracja/szkolenia/${encodeURIComponent(id)}`), [navigate])
  const rowNavProps = useCallback((id) => makeRowNavigateProps(id, handleRowClick), [handleRowClick])

  const totalTrainings = filtered.length
  const typeInternal = filtered.filter((t) => t.type === 'wewnętrzne').length
  const typeExternal = filtered.filter((t) => t.type === 'zewnętrzne').length

  const typeOptions = useMemo(
    () => [{ key: 'wszystkie', value: 'wszystkie', label: 'Wszystkie' }, ...TRAINING_TYPES.map((t) => ({ key: t.key, value: t.key, label: t.label }))],
    []
  )

  const participantFilterOptions = useMemo(
    () => [{ key: 'wszyscy', value: 'wszyscy', label: 'Wszyscy uczestnicy' }, ...participantOptions.map((u) => ({ key: u, value: u, label: u }))],
    [participantOptions]
  )

  return (
    <ListLayout
      rootClassName="trainings-list"
      controlsClassName="trainings-controls"
      controls={
        <>
          <SearchBar
            value={searchQuery}
            placeholder="Znajdź szkolenie..."
            onChange={(val) => {
              setSearchQuery(val)
              resetToFirstPage(true)
            }}
            onClear={() => {
              setSearchQuery('')
              resetToFirstPage(true)
            }}
          />

          {/* ✅ custom FilterSelect (bez legacy className "training-filter-select") */}
          <FilterSelect
            label={null}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              resetToFirstPage(true)
            }}
            options={typeOptions}
            includeAll={false}
            title="Filtr typu szkolenia"
            ariaLabel="Filtr typu szkolenia"
            className="trainings-list__typeFilter"
          />

          <FilterSelect
            label={null}
            value={filterParticipant}
            onChange={(e) => {
              setFilterParticipant(e.target.value)
              resetToFirstPage(true)
            }}
            options={participantFilterOptions}
            includeAll={false}
            title="Filtr uczestnika"
            ariaLabel="Filtr uczestnika"
            className="trainings-list__participantFilter"
          />

          <AddButton title="Dodaj szkolenie" ariaLabel="Dodaj szkolenie" onClick={() => openAdd(DEFAULT_TRAINING)} />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary
            ariaLabel="Podsumowanie listy szkoleń"
            items={[
              ['Szkolenia', totalTrainings],
              ['Wewnętrzne', typeInternal],
              ['Zewnętrzne', typeExternal],
            ]}
          />
        </>
      }
    >
      <DataTableWithActions
        columns={TRAINING_TABLE_COLS}
        rows={visible}
        sortConfig={sortConfig}
        setSortConfig={(cfg) => {
          setSortConfig(cfg)
          resetToFirstPage(true)
        }}
        rowProps={(row) => ({
          ...rowNavProps(row.id),
          className: 'row-clickable',
        })}
        actionsForRow={(row) =>
          editDeleteActions(
            () => openEdit(row.id),
            () => askDelete(row.id)
          )
        }
        actionsSticky
        ariaLabel="Tabela szkoleń"
      />

      {modalOpen && (
        <Modal title={isEditing ? 'Edytuj szkolenie' : 'Dodaj szkolenie'} onClose={closeModal} size="sm">
          <TrainingForm
            newTraining={form || DEFAULT_TRAINING}
            setNewTraining={setForm}
            onSubmit={(e) => save(e, { after: () => resetToFirstPage(true) })}
            onClose={closeModal}
            users={participantOptions}
            showTitle={false}
          />
        </Modal>
      )}

      <DeleteDialog
        open={showDeleteModal}
        onConfirm={() => confirmDelete({ after: () => resetToFirstPage(true) })}
        onClose={cancelDelete}
        label={deleteLabel}
        what="szkolenie"
      />
    </ListLayout>
  )
}