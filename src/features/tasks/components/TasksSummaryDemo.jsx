import React from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import TasksSummary from '../pages/TasksSummary'

export default function TasksSummaryDemo() {
	const users = [
		'Alicja Śliwińska',
		'Jan Kowalski',
		'Anna Nowak',
		'Piotr Zieliński',
		'Ewa Dąbrowska',
		'Tomasz Wójcik',
		'Karolina Mazur',
	]

	const base = startOfDay(new Date('2025-09-25'))
	const d = offset => format(addDays(base, offset), 'yyyy-MM-dd')

	const tasks = [
		{
			id: 'T-001',
			title: 'Raport – wyniki wrzesień',
			dueDate: d(-1),
			assignees: ['Alicja Śliwińska'],
			status: 'do zrobienia',
			type: 'Raport',
		},
		{
			id: 'T-002',
			title: 'Audyt wewnętrzny – dział B',
			dueDate: d(0),
			assignees: ['Jan Kowalski', 'Anna Nowak'],
			status: 'w toku',
			type: 'Audyt',
		},
		{
			id: 'T-003',
			title: 'Kalibracja wagi nr 12',
			dueDate: d(1),
			assignees: ['Piotr Zieliński'],
			status: 'zrobione',
			type: 'Kalibracja',
		},
		{
			id: 'T-004',
			title: 'Oferta – GreenEnergy S.A.',
			dueDate: d(2),
			assignees: ['Ewa Dąbrowska'],
			status: 'do zrobienia',
			type: 'Oferta',
		},
		{
			id: 'T-005',
			title: 'Próbki – rejestr i opis',
			dueDate: d(3),
			assignees: ['Tomasz Wójcik', 'Karolina Mazur'],
			status: 'w toku',
			type: 'Próbki',
		},
		{
			id: 'T-006',
			title: 'Aktualizacja instrukcji przyjęcia',
			dueDate: d(4),
			assignees: ['Alicja Śliwińska'],
			status: 'w toku',
			type: 'Dokumentacja',
		},
		{
			id: 'T-007',
			title: 'Raport – klient Meditech',
			dueDate: d(5),
			assignees: ['Jan Kowalski'],
			status: 'zrobione',
			type: 'Raport',
		},
		{
			id: 'T-008',
			title: 'Audyt – lista kontrolna',
			dueDate: d(6),
			assignees: ['Anna Nowak'],
			status: 'do zrobienia',
			type: 'Audyt',
		},
		{
			id: 'T-009',
			title: 'Kalibracja – termopara T-08',
			dueDate: d(-2),
			assignees: ['Piotr Zieliński', 'Ewa Dąbrowska'],
			status: 'w toku',
			type: 'Kalibracja',
		},
		{
			id: 'T-010',
			title: 'Oferta – TechSolutions',
			dueDate: d(-3),
			assignees: ['Karolina Mazur'],
			status: 'zrobione',
			type: 'Oferta',
		},
		{
			id: 'T-011',
			title: 'Próbki – przygotowanie do badań',
			dueDate: d(-4),
			assignees: ['Tomasz Wójcik'],
			status: 'do zrobienia',
			type: 'Próbki',
		},
		{
			id: 'T-012',
			title: 'Dokumentacja – karta procesu',
			dueDate: d(0),
			assignees: ['Ewa Dąbrowska'],
			status: 'zrobione',
			type: 'Dokumentacja',
		},
		{
			id: 'T-013',
			title: 'Raport – podsumowanie Q3',
			dueDate: d(8),
			assignees: ['Alicja Śliwińska', 'Jan Kowalski'],
			status: 'do zrobienia',
			type: 'Raport',
		},
		{
			id: 'T-014',
			title: 'Spot-check kalibracyjny',
			dueDate: d(9),
			assignees: ['Piotr Zieliński'],
			status: 'w toku',
			type: 'Kalibracja',
		},
		{
			id: 'T-015',
			title: 'Dokumentacja – wzór protokołu',
			dueDate: d(-6),
			assignees: ['Karolina Mazur'],
			status: 'do zrobienia',
			type: 'Dokumentacja',
		},
		{
			id: 'T-016',
			title: 'Oferta – Meditech',
			dueDate: d(2),
			assignees: ['Anna Nowak'],
			status: 'w toku',
			type: 'Oferta',
		},
		{
			id: 'T-017',
			title: 'Próbki – archiwizacja',
			dueDate: d(-1),
			assignees: ['Tomasz Wójcik'],
			status: 'zrobione',
			type: 'Próbki',
		},
		{
			id: 'T-018',
			title: 'Inne – porządkowanie repo',
			dueDate: d(3),
			assignees: ['Jan Kowalski'],
			status: 'do zrobienia',
			type: 'Inne',
		},
		{
			id: 'T-019',
			title: 'Raport – reklamacje',
			dueDate: d(-5),
			assignees: ['Ewa Dąbrowska'],
			status: 'w toku',
			type: 'Raport',
		},
		{
			id: 'T-020',
			title: 'Audyt – działania korygujące',
			dueDate: d(1),
			assignees: ['Karolina Mazur', 'Alicja Śliwińska'],
			status: 'zrobione',
			type: 'Audyt',
		},
	]

	return <TasksSummary users={users} tasks={tasks} />
}
