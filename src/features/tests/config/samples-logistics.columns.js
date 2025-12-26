// src/shared/tables/utils/csvPresets.js (przykładowa ścieżka)

export const CSV_PRE = [
	{ key: 'orderNo', label: 'Nr zlecenia' },
	{ key: 'client', label: 'Klient' },
	{ key: 'contactName', label: 'Osoba kontaktowa' },
	{ key: 'contactPhone', label: 'Telefon' },
	{ key: 'contactEmail', label: 'E-mail' },
	{ key: 'item', label: 'Przedmiot badań' },
	{ key: 'qty', label: 'Ilość próbek' },
	{ key: 'scope', label: 'Zakres badań' },
	{ key: 'etaDelivery', label: 'Przewidywana data dostawy' },
	{ key: 'comment', label: 'Uwagi' },
	{ key: 'delivered', label: 'Dostarczone' },
	{ key: 'deliveredAt', label: 'Data dostawy' },
	{ key: 'id', label: 'ID' },
]

// tu możesz w przyszłości dopisać kolejne:
// export const CSV_PICKUP = [ ... ]
// export const CSV_ARCH_DELIVERED = [ ... ]

export const columnsFor = view => {
	switch (view) {
		case 'pre':
		case 'PRE':
		case 'orders-pre':
			return [...CSV_PRE]

		// case 'pickup':
		//   return [...CSV_PICKUP]

		// case 'arch-delivered':
		//   return [...CSV_ARCH_DELIVERED]

		default:
			// fallback – lepiej zwrócić coś niż undefined
			return [...CSV_PRE]
	}
}
