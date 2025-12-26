import React from 'react'
import MySchedulePage from './MySchedulePage' // dostosuj ścieżkę, jeśli plik nazywa się inaczej

const currentUser = 'Alicja Śliwińska'

const tasks = [
  {
    id: 't-1001',
    title: 'Przygotować raport z badań – wrzesień',
    dueDate: '2025-09-22',
    assignees: ['Alicja Śliwińska', 'Jan Kowalski'],
    status: 'przydzielone',
  },
  {
    id: 't-1002',
    title: 'Wprowadzić oferty IX/2025',
    dueDate: '2025-09-25',
    assignees: ['Alicja Śliwińska'],
    status: 'w toku',
  },
  {
    id: 't-1003',
    title: 'Audyt wewnętrzny – checklisty',
    dueDate: '2025-10-01',
    assignees: ['Alicja Śliwińska', 'Anna Nowak'],
    status: 'do zrobienia',
  },
]

const meetings = [
  {
    id: 'm-2001',
    title: 'Status tygodniowy',
    date: '2025-09-23',
    time: '09:30',
    participants: ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak'],
    decisions: [],
  },
  {
    id: 'm-2002',
    title: 'Spotkanie z klientem: AutoMax SA',
    date: '2025-09-26',
    time: '13:00',
    participants: ['Alicja Śliwińska', 'Piotr Kowalski'],
    decisions: [],
  },
]

const trainings = [
  {
    id: 'tr-3001',
    title: 'BHP – szkolenie okresowe',
    type: 'wewnętrzne',
    date: '2025-09-24',
    participants: ['Alicja Śliwińska', 'Zespół produkcji'],
  },
  {
    id: 'tr-3002',
    title: 'ISO 17025: aktualizacje',
    type: 'zewnętrzne',
    date: '2025-10-03',
    participants: ['Alicja Śliwińska'],
  },
]

const posts = [
  {
    id: 'p-4001',
    title: 'Zmiana grafiku na weekend',
    date: '2025-09-27',
    mentions: ['Alicja Śliwińska', '@wszyscy'],
    tags: ['grafik'],
  },
  {
    id: 'p-4002',
    title: 'Nowe procedury przyjęcia próbek',
    date: '2025-09-22',
    mentions: ['Alicja Śliwińska'],
    tags: ['procedury'],
  },
]

export default function MyScheduleDemo() {
  return (
    <MySchedulePage
      currentUser={currentUser}
      tasks={tasks}
      meetings={meetings}
      trainings={trainings}
      posts={posts}
      onGoToTask={(id) => alert(`Idź do zadania: ${id}`)}
      onGoToMeeting={(id) => alert(`Idź do spotkania: ${id}`)}
      onGoToTraining={(id) => alert(`Idź do szkolenia: ${id}`)}
      onGoToPost={(id) => alert(`Idź do posta: ${id}`)}
    />
  )
}
