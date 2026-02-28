// src/app/layout/MainLayout.jsx
import React, { useEffect, Suspense, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { UpperNavBar, LowerNavBar, LeftSideBar, RightSideBar } from './bars'
import { MainContent, QuickAccess, ShiftDrawer, Footer } from './core'
import usePageTitle from './hooks/usePageTitle'
import './core/shift-drawer/styles/shift-drawer.css'
import { mountTopBarsOffsetObserver } from './utils/navOffset'

const SUSPENSE_FALLBACK = <div style={{ padding: 16 }}>Ładowanie…</div>

function MainLayout({ clients }) {
  const { pathname } = useLocation()

  const { title: pageTitle, Icon, iconClass, subtitle, suppressHeading } = usePageTitle()

  const isBoardPreview = useMemo(() => pathname.startsWith('/tablica/podglad'), [pathname])

  useEffect(() => {
    if (pageTitle) document.title = `${pageTitle} | LIMS`
  }, [pageTitle])

  useEffect(() => {
    if (isBoardPreview) return
    const unmount =
      typeof mountTopBarsOffsetObserver === 'function' ? mountTopBarsOffsetObserver() : null
    return () => {
      if (typeof unmount === 'function') unmount()
    }
  }, [isBoardPreview])

  if (isBoardPreview) {
    return (
      <div className='app-container minimal-shell'>
        <main className='main-area' role='main'>
          <Suspense fallback={SUSPENSE_FALLBACK}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    )
  }

  return (
    <div className='app-container'>
      <UpperNavBar clients={clients} />
      <LowerNavBar />

      <div className='shift-handle-buffer' aria-hidden='true'>
        <span id='shift-handle-anchor' className='shift-handle-anchor' />
      </div>

      <ShiftDrawer anchorSelector='#shift-handle-anchor' />

      <div className='layout-body'>
        <LeftSideBar />

        <main className='main-area' role='main'>
          <QuickAccess />
          <MainContent
            title={suppressHeading ? '' : pageTitle}
            Icon={Icon}
            iconClass={iconClass}
            subtitle={subtitle}
          >
            <Suspense fallback={SUSPENSE_FALLBACK}>
              <Outlet />
            </Suspense>
          </MainContent>
        </main>

        <RightSideBar />
      </div>

      <Footer />
    </div>
  )
}

export default MainLayout
