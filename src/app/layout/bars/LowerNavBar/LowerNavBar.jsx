// src/app/layout/bars/LowerNavBar/LowerNavBar.jsx
import React, { lazy, Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import './styles/lower-nav-bar.css'

import { MENU } from './config'
import NavLinkItem from './components/NavLinkItem'
import NavDropdown from './components/NavDropdown'

import { useNotifications } from '../../../providers/NotificationsProvider.jsx'
import { useMessages } from '../../../providers/MessagesProvider.jsx'
import { usePasswordModal } from '../../../providers/PasswordModalProvider.jsx'

// ✅ Inbox (ten z logic + NewConversationModal)
const MessagesInbox = lazy(() => import('../../../../features/messages/pages/MessagesInboxView'))

export default function LowerNavBar() {
  const { unreadCount: unreadNotifications } = useNotifications()
  const { unreadCount: unreadMessages } = useMessages()
  const { openPasswordModal } = usePasswordModal()

  const [openId, setOpenId] = useState(null)
  const [inboxOpen, setInboxOpen] = useState(false)
  const barRef = useRef(null)

  const badges = useMemo(
    () => ({
      messages: unreadMessages ?? 0,
      notifications: unreadNotifications ?? 0,
    }),
    [unreadMessages, unreadNotifications]
  )

  const openInboxModal = useCallback(() => {
    setOpenId(null)
    setInboxOpen(true)
  }, [])

  const handleAction = useCallback(
    (action) => {
      switch (action) {
        case 'openInbox':
          openInboxModal()
          break

        case 'changePassword':
          setOpenId(null)
          openPasswordModal()
          break

        default:
          break
      }
    },
    [openPasswordModal, openInboxModal]
  )

  useEffect(() => {
    const onDocClick = (e) => {
      const el = barRef.current
      if (!el) return
      if (!el.contains(e.target)) setOpenId(null)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    document.addEventListener('click', onDocClick, { capture: true })
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick, { capture: true })
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <>
      <nav
        ref={barRef}
        className="lower-navbar"
        data-topbar
        role="navigation"
        aria-label="Dolny pasek nawigacyjny"
      >
        <div className="nav-links">
          {MENU.map((item) => {
            const isMessagesTrigger =
              item?.badgeKey === 'messages' ||
              item?.id === 'wiadomosci' ||
              item?.id === 'messages'

            if (isMessagesTrigger) {
              return (
                <NavLinkItem
                  key={item.id}
                  to={item.to || '#'}
                  iconClass={item.iconClass}
                  label={item.label}
                  badgeCount={badges.messages}
                  onClick={(e) => {
                    e?.preventDefault?.()
                    openInboxModal()
                  }}
                />
              )
            }

            if (item.type === 'link') {
              return (
                <NavLinkItem
                  key={item.id}
                  to={item.to}
                  iconClass={item.iconClass}
                  label={item.label}
                  badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                  onClick={() => setOpenId(null)}
                />
              )
            }

            return (
              <NavDropdown
                key={item.id}
                id={item.id}
                iconClass={item.iconClass}
                label={item.label}
                items={item.items}
                badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                openId={openId}
                setOpenId={setOpenId}
                onAction={handleAction}
              />
            )
          })}
        </div>
      </nav>

      <Suspense fallback={null}>
        {inboxOpen && (
          <MessagesInbox
            inModal
            open={inboxOpen}
            onClose={() => setInboxOpen(false)}
            unreadSubtitle={badges.messages ? `Nieprzeczytane: ${badges.messages}` : undefined}
          />
        )}
      </Suspense>
    </>
  )
}