import React from 'react'
import PropTypes from 'prop-types'
import { Download } from 'lucide-react'

// eksport bazujemy na shared/tables (tak jak chcesz)
import { ExportCsvButton, csvFilename } from '../../tables'

export default function CsvIconAction({ csv, title = 'Eksportuj CSV', iconSize = 18 }) {
  const resolvedTitle = csv?.title || title
  const resolvedFilename =
    typeof csv?.filename === 'function'
      ? csv.filename()
      : (csv?.filename || csvFilename('export'))

  return (
    <ExportCsvButton
      rows={csv?.rows || []}
      columns={csv?.columns}
      filename={resolvedFilename}
      title={resolvedTitle}
      className="tss-icon-btn tss-btn--icon tss-btn--export"
    >
      <Download size={iconSize} />
    </ExportCsvButton>
  )
}

CsvIconAction.propTypes = {
  csv: PropTypes.shape({
    rows: PropTypes.array,
    columns: PropTypes.array,
    filename: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    title: PropTypes.string,
  }),
  title: PropTypes.string,
  iconSize: PropTypes.number,
}