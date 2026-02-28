// src/app/layout/bars/index.js

// ✅ ładujemy style “bars” raz, centralnie
import './shared/styles/index.css'
import './shared/styles/scroll-bars.css'
import './shared/styles/sidebar-core.css'
// --- eksporty komponentów bars ---
// (dopasuj tylko, jeśli Twoje pliki nazywają się inaczej — reszta ma zostać 1:1)
export { default as UpperNavBar } from './UpperNavBar'
export { default as LowerNavBar } from './LowerNavBar'
export { default as LeftSideBar } from './LeftSideBar'
export { default as RightSideBar } from './RightSideBar'
