import { useEffect, useRef } from 'react'
import {
  ArtifactsIcon,
  ChatsIcon,
  ClaudeMark,
  CloseIcon,
  ComposeIcon,
  MoreIcon,
  PanelLeftIcon,
  ProjectsIcon,
  SearchIcon,
} from './icons'

type SidebarProps = {
  /** Whether the sidebar is reachable in the current layout. */
  visible: boolean
  /** Whether the mobile drawer is open. */
  mobileOpen: boolean
  /** Title of the conversation currently in the thread, when there is one. */
  recentTitle: string | null
  onNewChat: () => void
  onClose: () => void
  onCollapse: () => void
  onSelectRecent: () => void
  onPlaceholder: (message: string) => void
}

export function Sidebar({
  visible,
  mobileOpen,
  recentTitle,
  onNewChat,
  onClose,
  onCollapse,
  onSelectRecent,
  onPlaceholder,
}: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (mobileOpen) closeButtonRef.current?.focus()
  }, [mobileOpen])

  return (
    <aside
      id="app-sidebar"
      className="sidebar"
      data-open={mobileOpen ? 'true' : 'false'}
      aria-label="Sidebar"
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="sidebar-top">
        <div className="brand">
          <ClaudeMark className="brand-mark" />
          <span className="brand-name">Anvia</span>
        </div>
        <button
          className="icon-button sidebar-collapse"
          type="button"
          aria-label="Hide sidebar"
          title="Hide sidebar"
          onClick={onCollapse}
        >
          <PanelLeftIcon />
        </button>
        <button
          ref={closeButtonRef}
          className="icon-button sidebar-close"
          type="button"
          aria-label="Close sidebar"
          title="Close sidebar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="sidebar-scroll">
        <button className="new-chat" type="button" onClick={onNewChat}>
          <ComposeIcon width={16} height={16} />
          <span>New chat</span>
        </button>

        <nav className="sidebar-nav" aria-label="Workspace">
          <button
            className="nav-item"
            type="button"
            onClick={() => onPlaceholder('Search is coming soon.')}
          >
            <SearchIcon width={17} height={17} />
            <span>Search</span>
          </button>
          <span className="nav-item is-active" aria-current="page">
            <ChatsIcon width={17} height={17} />
            <span>Chats</span>
          </span>
          <button
            className="nav-item"
            type="button"
            onClick={() => onPlaceholder('Projects are coming soon.')}
          >
            <ProjectsIcon width={17} height={17} />
            <span>Projects</span>
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => onPlaceholder('Artifacts are coming soon.')}
          >
            <ArtifactsIcon width={17} height={17} />
            <span>Artifacts</span>
          </button>
        </nav>

        <section className="recents" aria-labelledby="recents-heading">
          <h2 className="recents-heading" id="recents-heading">
            Recents
          </h2>
          {recentTitle ? (
            <button
              className="recent-item"
              type="button"
              title={recentTitle}
              onClick={onSelectRecent}
            >
              <span className="recent-item-title">{recentTitle}</span>
            </button>
          ) : (
            <div className="recents-empty">
              <ChatsIcon width={17} height={17} />
              <p>No chats yet</p>
              <span>Your conversations will appear here.</span>
            </div>
          )}
        </section>
      </div>

      <div className="sidebar-footer">
        <button
          className="account"
          type="button"
          aria-label="Account menu"
          onClick={() => onPlaceholder('Account settings are coming soon.')}
        >
          <span className="account-avatar" aria-hidden="true">
            A
          </span>
          <span className="account-copy">
            <span className="account-name">Anvia Support</span>
            <span className="account-meta">Support workspace</span>
          </span>
          <MoreIcon width={16} height={16} className="account-more" />
        </button>
      </div>
    </aside>
  )
}
