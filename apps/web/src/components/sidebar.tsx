import { useEffect, useRef } from 'react'
import {
  conversationTitle,
  type ConversationSummary,
} from '../lib/conversations'
import {
  ArtifactsIcon,
  ChatsIcon,
  CloseIcon,
  ComposeIcon,
  MajuTelcoMark,
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
  conversations: ConversationSummary[]
  activeSessionId: string
  onNewChat: () => void
  onClose: () => void
  onCollapse: () => void
  onSelectRecent: (conversation: ConversationSummary) => void
  onPlaceholder: (message: string) => void
}

const iconButton =
  'grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-white/10 hover:text-white active:bg-white/15'
const navItem =
  'flex h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13.5px] text-slate-300 transition-colors duration-150 hover:bg-white/8 hover:text-white [&_svg]:shrink-0 [&_svg]:text-slate-400'

export function Sidebar({
  visible,
  mobileOpen,
  conversations,
  activeSessionId,
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
      className={`fixed inset-y-0 left-0 z-50 invisible flex w-[min(312px,86vw)] shrink-0 -translate-x-[102%] flex-col overflow-hidden border-r border-[#1d315c] bg-[#0b1739] pt-[env(safe-area-inset-top)] text-slate-100 shadow-[0_24px_70px_-30px_rgb(2_8_23/0.9)] transition-[transform,visibility,margin,opacity] duration-300 ease-out data-[open=true]:visible data-[open=true]:translate-x-0 lg:visible lg:relative lg:z-20 lg:w-[280px] lg:basis-[280px] lg:translate-x-0 lg:pt-0 lg:shadow-none ${
        visible ? '' : 'lg:-ml-[280px] lg:pointer-events-none lg:opacity-0'
      }`}
      data-open={mobileOpen ? 'true' : 'false'}
      aria-label="Sidebar"
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-[15px]">
        <div className="inline-flex min-w-0 items-center gap-2.5 text-cyan-300">
          <MajuTelcoMark className="size-6 shrink-0" />
          <span className="truncate text-[18px] font-semibold tracking-[-0.02em] text-white">
            Maju-Telco
          </span>
        </div>
        <button
          className={`${iconButton} hidden lg:grid`}
          type="button"
          aria-label="Hide sidebar"
          title="Hide sidebar"
          onClick={onCollapse}
        >
          <PanelLeftIcon />
        </button>
        <button
          ref={closeButtonRef}
          className={`${iconButton} lg:hidden`}
          type="button"
          aria-label="Close sidebar"
          title="Close sidebar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2.5 pb-[18px] pt-1.5 [scrollbar-color:#385080_transparent] [scrollbar-width:thin]">
        <button
          className="new-chat my-1 mb-3 flex h-[38px] w-full shrink-0 items-center gap-2.5 rounded-[10px] border border-cyan-200/20 bg-cyan-300/10 px-3 text-sm font-medium text-white shadow-sm transition hover:border-cyan-200/35 hover:bg-cyan-300/15 active:translate-y-px [&_svg]:text-cyan-200"
          type="button"
          onClick={onNewChat}
        >
          <ComposeIcon width={16} height={16} />
          <span>New chat</span>
        </button>

        <nav className="mb-[17px] flex flex-col gap-px" aria-label="Workspace">
          <button
            className={navItem}
            type="button"
            onClick={() => onPlaceholder('Search is coming soon.')}
          >
            <SearchIcon width={17} height={17} />
            <span>Search</span>
          </button>
          <span
            className={`${navItem} cursor-default bg-white/10 font-medium text-white [&_svg]:text-cyan-300`}
            aria-current="page"
          >
            <ChatsIcon width={17} height={17} />
            <span>Chats</span>
          </span>
          <button
            className={navItem}
            type="button"
            onClick={() => onPlaceholder('Projects are coming soon.')}
          >
            <ProjectsIcon width={17} height={17} />
            <span>Projects</span>
          </button>
          <button
            className={navItem}
            type="button"
            onClick={() => onPlaceholder('Artifacts are coming soon.')}
          >
            <ArtifactsIcon width={17} height={17} />
            <span>Artifacts</span>
          </button>
        </nav>

        <section className="border-t border-white/10 pt-[15px]" aria-labelledby="recents-heading">
          <h2
            className="mb-[7px] px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400"
            id="recents-heading"
          >
            Recents
          </h2>
          {conversations.length > 0 ? (
            <div className="flex flex-col gap-px">
              {conversations.map((conversation) => {
                const title = conversationTitle(conversation)
                const active = conversation.sessionId === activeSessionId
                return (
                  <button
                    className={`flex h-[33px] w-full items-center rounded-lg px-2.5 text-left text-[13.5px] transition-colors hover:bg-white/8 hover:text-white ${active ? 'bg-white/10 font-medium text-white' : 'text-slate-300'}`}
                    type="button"
                    title={title}
                    aria-current={active ? 'page' : undefined}
                    key={conversation.ref}
                    onClick={() => onSelectRecent(conversation)}
                  >
                    <span className="truncate">{title}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="px-2.5 py-2 text-slate-400">
              <ChatsIcon className="mb-2.5 opacity-70" width={17} height={17} />
              <p className="m-0 text-[13px] leading-5 text-slate-300">No chats yet</p>
              <span className="mt-0.5 block text-xs leading-[1.45]">
                Your conversations will appear here.
              </span>
            </div>
          )}
        </section>
      </div>

      <div className="shrink-0 border-t border-white/10 p-2.5">
        <button
          className="flex w-full items-center gap-2.5 rounded-[10px] p-1.5 text-left transition-colors hover:bg-white/8"
          type="button"
          aria-label="Account menu"
          onClick={() => onPlaceholder('Account settings are coming soon.')}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cyan-300 text-[11px] font-bold text-[#07132f]">
            M
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[12.5px] font-semibold text-white">
              Maju-Telco Support
            </span>
            <span className="truncate text-[11px] text-slate-400">Support workspace</span>
          </span>
          <MoreIcon width={16} height={16} className="shrink-0 text-slate-400" />
        </button>
      </div>
    </aside>
  )
}
