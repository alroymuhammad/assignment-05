import { useChat } from '@anvia/react'
import {
  ChatProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@anvia/react-ui'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Sidebar } from '../components/sidebar'
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ComposeIcon,
  CopyIcon,
  MajuTelcoMark,
  MenuIcon,
  PanelLeftIcon,
  PlusIcon,
  RefreshIcon,
  SlidersIcon,
  StopIcon,
} from '../components/icons'
import {
  chatTransport,
  currentSessionId,
  getConversation,
  listConversations,
  selectSession,
  startNewSession,
  type ConversationSummary,
} from '../lib/conversations'
import { useMediaQuery } from '../lib/use-media-query'

const MOBILE_QUERY = '(max-width: 900px)'
const SIDEBAR_STORAGE_KEY = 'maju-telco:sidebar'
const NOTICE_DURATION_MS = 2600

const iconButton =
  'grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-200'
const messageContent =
  'min-w-0 break-words text-[15.5px] leading-[1.7] text-slate-800 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:text-2xl [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-[1.08rem] [&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:text-base [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h4]:font-semibold [&_h1]:tracking-[-0.02em] [&_h2]:tracking-[-0.02em] [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_li]:pl-0.5 [&_li::marker]:text-slate-400 [&_strong]:font-semibold [&_a]:text-blue-700 [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[3px] hover:[&_a]:text-blue-900 [&_code]:rounded-md [&_code]:border [&_code]:border-slate-200 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.86em] [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0b1739] [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_pre]:text-slate-100 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[inherit] [&_blockquote]:my-4 [&_blockquote]:border-l [&_blockquote]:border-blue-500 [&_blockquote]:py-0.5 [&_blockquote]:pl-4 [&_blockquote]:text-slate-600 [&_hr]:my-6 [&_hr]:border-slate-200 [&_table]:my-4 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_tr:nth-child(even)_td]:bg-slate-50 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl'

export const Route = createFileRoute('/')({ component: Home })

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function readStoredSidebarState() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'hidden'
  } catch {
    return false
  }
}

function MessageContentParts() {
  return (
    <MessagePrimitive.Parts>
      {(part) =>
        part.type === 'text' ? (
          <MessagePrimitive.Markdown />
        ) : (
          <MessagePrimitive.Part />
        )
      }
    </MessagePrimitive.Parts>
  )
}

function Home() {
  const chat = useChat({ transport: chatTransport })
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [sidebarHidden, setSidebarHidden] = useState(readStoredSidebarState)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [composerKey, setComposerKey] = useState(0)
  const [activeSessionId, setActiveSessionId] = useState(currentSessionId)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])

  const noticeTimeout = useRef<number | null>(null)
  const restoredSession = useRef(false)
  const composerRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const reopenButtonRef = useRef<HTMLButtonElement>(null)

  const greeting = getGreeting(new Date().getHours())
  const sidebarVisible = isMobile ? mobileSidebarOpen : !sidebarHidden

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    if (noticeTimeout.current !== null) window.clearTimeout(noticeTimeout.current)
    noticeTimeout.current = window.setTimeout(() => {
      setNotice(null)
      noticeTimeout.current = null
    }, NOTICE_DURATION_MS)
  }, [])

  const focusComposer = useCallback(() => {
    window.requestAnimationFrame(() => {
      composerRef.current?.querySelector<HTMLElement>('[contenteditable="true"]')?.focus()
    })
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false)
    window.requestAnimationFrame(() => menuButtonRef.current?.focus())
  }, [])

  const openSidebar = useCallback(() => {
    if (isMobile) {
      setMobileSidebarOpen(true)
      return
    }
    setSidebarHidden(false)
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('#app-sidebar .new-chat')?.focus()
    })
  }, [isMobile])

  const collapseSidebar = useCallback(() => {
    setSidebarHidden(true)
    window.requestAnimationFrame(() => reopenButtonRef.current?.focus())
  }, [])

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await listConversations())
    } catch {
      showNotice('Could not load conversation history.')
    }
  }, [showNotice])

  const handleNewChat = useCallback(() => {
    const sessionId = startNewSession()
    setActiveSessionId(sessionId)
    chat.reset()
    setComposerKey((key) => key + 1)
    setMobileSidebarOpen(false)
    focusComposer()
  }, [chat, focusComposer])

  const handleSelectRecent = useCallback(
    async (summary: ConversationSummary) => {
      try {
        const conversation = await getConversation(summary.ref)
        selectSession(conversation.sessionId)
        setActiveSessionId(conversation.sessionId)
        chat.reset()
        chat.setMessages(conversation.messages)
        setComposerKey((key) => key + 1)
        setMobileSidebarOpen(false)
      } catch {
        showNotice('Could not open that conversation.')
      }
    },
    [chat, showNotice],
  )

  useEffect(() => {
    if (restoredSession.current) return
    restoredSession.current = true

    void (async () => {
      try {
        const items = await listConversations()
        setConversations(items)
        const active = items.find(
          (conversation) => conversation.sessionId === activeSessionId,
        )
        if (active) {
          const conversation = await getConversation(active.ref)
          chat.setMessages(conversation.messages)
        }
      } catch {
        showNotice('Could not load conversation history.')
      }
    })()
  }, [activeSessionId, chat, showNotice])

  useEffect(() => {
    if (chat.status === 'ready' && chat.messages.length > 0) {
      void refreshConversations()
    }
  }, [chat.messages.length, chat.status, refreshConversations])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        sidebarHidden ? 'hidden' : 'visible',
      )
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  }, [sidebarHidden])

  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false)
      return
    }
    if (!mobileSidebarOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileSidebar()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeMobileSidebar, isMobile, mobileSidebarOpen])

  useEffect(() => {
    return () => {
      if (noticeTimeout.current !== null) window.clearTimeout(noticeTimeout.current)
    }
  }, [])

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-[#f5f7fb] text-slate-900">
      <Sidebar
        visible={sidebarVisible}
        mobileOpen={mobileSidebarOpen}
        conversations={conversations}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onClose={closeMobileSidebar}
        onCollapse={collapseSidebar}
        onPlaceholder={showNotice}
        onSelectRecent={handleSelectRecent}
      />

      {isMobile && mobileSidebarOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/60 animate-[fade-in_180ms_ease-out_both]"
          type="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <main
        className="relative flex h-dvh min-h-0 min-w-0 flex-1 flex-col"
        inert={isMobile && mobileSidebarOpen}
      >
        <header className="flex items-center gap-1.5 px-2.5 pb-2 pt-[max(8px,env(safe-area-inset-top))] lg:hidden">
          <button
            ref={menuButtonRef}
            className={iconButton}
            type="button"
            aria-label="Open sidebar"
            aria-expanded={mobileSidebarOpen}
            aria-controls="app-sidebar"
            onClick={openSidebar}
          >
            <MenuIcon />
          </button>
          <div className="ml-0.5 inline-flex min-w-0 items-center gap-2 text-blue-700">
            <MajuTelcoMark className="size-[22px] shrink-0" />
            <span className="truncate text-[17px] font-semibold tracking-[-0.02em]">
              Maju-Telco
            </span>
          </div>
          <button
            className={`${iconButton} ml-auto`}
            type="button"
            aria-label="New chat"
            title="New chat"
            onClick={handleNewChat}
          >
            <ComposeIcon />
          </button>
        </header>

        {!isMobile && sidebarHidden ? (
          <button
            ref={reopenButtonRef}
            className={`${iconButton} absolute left-4 top-3.5 z-20 border border-slate-200 bg-white shadow-[0_2px_8px_rgb(15_23_42/0.1)]`}
            type="button"
            aria-label="Show sidebar"
            title="Show sidebar"
            onClick={openSidebar}
          >
            <PanelLeftIcon />
          </button>
        ) : null}

        <ChatProvider controller={chat}>
          <ThreadPrimitive.Root className="group/thread relative flex min-h-0 flex-1 flex-col">
            <ThreadPrimitive.Viewport
              className={`flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 [scrollbar-color:#94a3b8_transparent] [scrollbar-width:thin] lg:px-[clamp(16px,4.5vw,44px)] ${sidebarHidden && !isMobile ? 'lg:pt-[34px]' : ''}`}
            >
              <ThreadPrimitive.Empty className="flex flex-1 animate-[welcome-in_420ms_cubic-bezier(0.22,1,0.36,1)_both] flex-col items-center justify-center px-1 pb-8 pt-10 text-center max-lg:pb-[18px] max-lg:pt-6">
                <div className="mb-5 text-blue-700 max-lg:mb-4">
                  <MajuTelcoMark className="size-10 max-lg:size-9" />
                </div>
                <h1 className="mb-2.5 text-balance text-[clamp(2rem,1.1rem+2.7vw,2.85rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-[#0b1739] max-lg:text-[clamp(1.95rem,8.4vw,2.45rem)]">
                  {greeting}
                </h1>
                <p className="m-0 max-w-md text-balance text-[14.5px] leading-relaxed text-slate-600 max-lg:max-w-[21rem] max-lg:text-sm">
                  Ask about Maju-Telco data packages, prices, and terms.
                </p>
              </ThreadPrimitive.Empty>

              <ThreadPrimitive.Messages className="mx-auto flex w-full max-w-3xl shrink-0 flex-col gap-6 pb-4 pt-[clamp(24px,5vh,54px)] empty:hidden">
                <MessagePrimitive.Root className="group/message flex min-w-0 flex-col data-[role=user]:items-end data-[role=assistant]:items-stretch">
                  {(message) => (
                    <>
                      <MessagePrimitive.Content
                        className={`${messageContent} group-data-[role=user]/message:max-w-[min(100%,34rem)] group-data-[role=user]/message:rounded-[18px] group-data-[role=user]/message:bg-[#e8eefc] group-data-[role=user]/message:px-4 group-data-[role=user]/message:py-2.5 group-data-[role=user]/message:text-[15.5px] group-data-[role=user]/message:leading-relaxed group-data-[role=user]/message:text-slate-900 group-data-[role=user]/message:[&_p]:m-0 group-data-[role=user]/message:[&_[data-role=text]]:whitespace-pre-wrap`}
                      >
                        <MessageContentParts />
                      </MessagePrimitive.Content>
                      {message.role === 'assistant' ? (
                        <MessagePrimitive.Actions className="mt-2 -ml-1.5 flex items-center gap-px opacity-0 transition-opacity group-hover/message:opacity-100 group-focus-within/message:opacity-100 [@media(hover:none)]:opacity-100">
                          <MessagePrimitive.Copy
                            className="group/copy grid size-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-800 disabled:cursor-default disabled:opacity-40"
                            aria-label="Copy response"
                            title="Copy response"
                          >
                            <CopyIcon className="group-data-[state=copied]/copy:hidden" width={16} height={16} />
                            <CheckIcon className="hidden text-emerald-600 group-data-[state=copied]/copy:block" width={16} height={16} />
                          </MessagePrimitive.Copy>
                          <MessagePrimitive.Regenerate
                            className="grid size-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-800 disabled:cursor-default disabled:opacity-40"
                            aria-label="Regenerate response"
                            title="Regenerate response"
                          >
                            <RefreshIcon width={16} height={16} />
                          </MessagePrimitive.Regenerate>
                        </MessagePrimitive.Actions>
                      ) : null}
                    </>
                  )}
                </MessagePrimitive.Root>
              </ThreadPrimitive.Messages>

              <ThreadPrimitive.Loading
                className="mx-auto mb-3.5 flex w-full max-w-3xl shrink-0 items-center gap-2.5 text-[13px] text-slate-500 empty:hidden"
                role="status"
              >
                <span className="inline-flex items-center gap-1" aria-hidden="true">
                  <span className="size-1 rounded-full bg-cyan-500 animate-[signal-pulse_1.15s_ease-in-out_infinite]" />
                  <span className="size-1 rounded-full bg-blue-600 animate-[signal-pulse_1.15s_130ms_ease-in-out_infinite]" />
                  <span className="size-1 rounded-full bg-indigo-700 animate-[signal-pulse_1.15s_260ms_ease-in-out_infinite]" />
                </span>
                <span>Maju-Telco is thinking</span>
              </ThreadPrimitive.Loading>

              <ThreadPrimitive.Error className="mx-auto mb-3 flex w-full max-w-3xl shrink-0 items-center justify-between gap-3 rounded-xl bg-red-50 px-3.5 py-3 text-[13.5px] text-red-800 shadow-[inset_0_0_0_1px_rgb(254_202_202)] empty:hidden">
                <span>Something went wrong. Please try again.</span>
                <button
                  className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-red-700 shadow-[inset_0_0_0_1px_rgb(252_165_165)] transition hover:bg-red-100"
                  type="button"
                  onClick={() => void chat.regenerate()}
                >
                  Retry
                </button>
              </ThreadPrimitive.Error>
            </ThreadPrimitive.Viewport>

            <div className="relative z-10 shrink-0 bg-[#f5f7fb] px-3 pb-[max(10px,env(safe-area-inset-bottom))] before:pointer-events-none before:absolute before:inset-x-0 before:-top-8 before:h-8 before:bg-linear-to-b before:from-transparent before:to-[#f5f7fb] lg:px-[clamp(16px,4.5vw,44px)] lg:pb-[max(14px,env(safe-area-inset-bottom))]">
              <div className="mx-auto w-full max-w-3xl">
                <ComposerPrimitive.Root
                  key={composerKey}
                  className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(15_23_42/0.08),0_16px_40px_-24px_rgb(30_64_175/0.35),inset_0_0_0_1px_rgb(203_213_225)] transition-shadow focus-within:shadow-[0_1px_2px_rgb(15_23_42/0.08),0_0_0_4px_rgb(59_130_246/0.15),inset_0_0_0_1px_rgb(37_99_235)] lg:rounded-[18px]"
                >
                  <ComposerPrimitive.Input
                    ref={composerRef}
                    className="max-h-56 overflow-y-auto px-4 pb-0.5 pt-3.5 text-base leading-relaxed text-slate-900 [&_[contenteditable=true]]:min-h-[1.55em] [&_[contenteditable=true]]:outline-none [&_p]:m-0 [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-slate-400 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] lg:px-[17px] lg:pt-[15px]"
                    placeholder="Ask about a Maju-Telco package"
                    aria-label="Message Maju-Telco"
                  />

                  <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-1">
                    <div className="flex min-w-0 items-center gap-0.5">
                      <button
                        className="grid size-8 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        type="button"
                        aria-label="Add attachment"
                        title="Attachments coming soon"
                        onClick={() => showNotice('Attachments are coming soon.')}
                      >
                        <PlusIcon width={18} height={18} />
                      </button>
                      <button
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 max-[380px]:w-8 max-[380px]:justify-center max-[380px]:px-0 max-[380px]:[&_span]:hidden"
                        type="button"
                        title="Tools coming soon"
                        onClick={() => showNotice('Tools are coming soon.')}
                      >
                        <SlidersIcon width={16} height={16} />
                        <span>Tools</span>
                      </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        className="hidden h-[30px] items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:inline-flex"
                        type="button"
                        title="Model selection"
                        onClick={() =>
                          showNotice('Maju-Telco Support is the only assistant available.')
                        }
                      >
                        <span>Maju-Telco Support</span>
                        <ChevronDownIcon className="opacity-70" width={14} height={14} />
                      </button>
                      <ComposerPrimitive.Stop
                        className="hidden size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-800 shadow-[inset_0_0_0_1px_rgb(203_213_225)] transition-colors hover:bg-slate-200 group-data-[state=submitted]/thread:grid group-data-[state=streaming]/thread:grid group-data-[state=waiting]/thread:grid"
                        aria-label="Stop response"
                      >
                        <StopIcon width={16} height={16} />
                      </ComposerPrimitive.Stop>
                      <ComposerPrimitive.Submit
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-white transition hover:-translate-y-px hover:bg-blue-800 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-blue-100 disabled:text-blue-400 group-data-[state=submitted]/thread:hidden group-data-[state=streaming]/thread:hidden group-data-[state=waiting]/thread:hidden"
                        aria-label="Send message"
                      >
                        <ArrowUpIcon width={17} height={17} />
                      </ComposerPrimitive.Submit>
                    </div>
                  </div>
                </ComposerPrimitive.Root>

                <p className="mb-0 mt-2 text-center text-[10.5px] leading-relaxed text-slate-500 lg:mt-2.5 lg:text-[11px]">
                  Maju-Telco can make mistakes. Please double-check responses.
                </p>
              </div>
            </div>
          </ThreadPrimitive.Root>
        </ChatProvider>
      </main>

      {notice ? (
        <div
          className="fixed left-1/2 top-[max(18px,env(safe-area-inset-top))] z-[90] w-max max-w-[min(90vw,27rem)] -translate-x-1/2 animate-[toast-in_200ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-lg bg-[#0b1739] px-3.5 py-2.5 text-center text-[12.5px] leading-snug text-white shadow-[0_14px_34px_-12px_rgb(15_23_42/0.55)] max-lg:top-[calc(env(safe-area-inset-top)+58px)]"
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      ) : null}
    </div>
  )
}
