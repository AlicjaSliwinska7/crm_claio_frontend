import React from 'react'
import '../styles/full-screen-modal.css'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  TextRun,
} from 'docx'

const exportToWord = (employees, daysInMonth, schedule) => {
  const tableRows = []

  // Nagłówek
  const headerCells = [
    new TableCell({
      children: [new Paragraph('Pracownik')],
      width: { size: 20, type: WidthType.PERCENTAGE },
    }),
    ...daysInMonth.map(day =>
      new TableCell({
        children: [new Paragraph(format(day, 'dd'))],
        width: { size: 80 / daysInMonth.length, type: WidthType.PERCENTAGE },
      })
    ),
  ]

  tableRows.push(new TableRow({ children: headerCells }))

  // Wiersze z danymi
  employees.forEach(name => {
    const rowCells = [
      new TableCell({
        children: [new Paragraph(name)],
        width: { size: 20, type: WidthType.PERCENTAGE },
      }),
      ...daysInMonth.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const val = schedule[name]?.[dateKey]?.toUpperCase() || ''
        return new TableCell({
          children: [new Paragraph(val)],
          width: { size: 80 / daysInMonth.length, type: WidthType.PERCENTAGE },
        })
      }),
    ]
    tableRows.push(new TableRow({ children: rowCells }))
  })

  // Dokument
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: 'landscape',
            },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          new Paragraph({
            text: 'Harmonogram pracy',
            heading: 'Heading1',
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  })

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, 'harmonogram.docx')
  })
}

function FullScreenModal({ children, onClose, employees, daysInMonth, schedule }) {
	return (
		<div className='fullscreen-modal-overlay'>
			<div className='fullscreen-modal'>
				<button className='close-button' onClick={onClose}>
					×
				</button>
				{children}
				<div className='print-wrapper'>
					<div className='no-print'>
						<button onClick={() => exportToWord(employees, daysInMonth, schedule)}>Eksportuj</button>
						<button onClick={() => window.print()}>Drukuj</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default FullScreenModal
