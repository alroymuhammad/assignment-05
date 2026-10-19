import { createHttpClientTransport, messageText } from '@anvia/client'
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
  ClaudeMark,
  ComposeIcon,
  CopyIcon,
  MenuIcon,
  PanelLeftIcon,
  PlusIcon,
  RefreshIcon,
  SlidersIcon,
  StopIcon,
} from '../components/icons'
import { useMediaQuery } from '../lib/use-media-query'

const transport = createHttpClientTransport({ endpoint: '/api/chat' })

const MOBILE_QUERY = '(max-width: 900px)'
const SIDEBAR_STORAGE_KEY = 'anvia:sidebar'
const NOTICE_DURATION_MS = 2600

export const Route = createFileRoute('/')({ component: Home })

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getConversationTitle(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return 'New conversation'
  return normalized.length > 120 ? `${normalized.slice(0, 120).trimEnd()}…` : normalized
}

function readStoredSidebarState() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'hidden'
  } catch {
    return false
  }
}

function Home() {
  const chat = useChat({ transport })
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [sidebarHidden, setSidebarHidden] = useState(readStoredSidebarState)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [composerKey, setComposerKey] = useState(0)

  const noticeTimeout = useRef<number | null>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const reopenButtonRef = useRef<HTMLButtonElement>(null)

  const greeting = getGreeting(new Date().getHours())
  const firstUserMessage = chat.messages.find((message) => message.role === 'user')
  const recentTitle = firstUserMessage
    ? getConversationTitle(messageText(firstUserMessage))
    : null
  const sidebarVisible = isMobile ? mobileSidebarOpen : !sidebarHidden

  const showNotice = useCallback((message: string) => {
    setNotice(message)

    if (noticeTimeout.current !== null) {
      window.clearTimeout(noticeTimeout.current)
    }

    noticeTimeout.current = window.setTimeout(() => {
      setNotice(null)
      noticeTimeout.current = null
    }, NOTICE_DURATION_MS)
  }, [])

  const focusComposer = useCallback(() => {
    window.requestAnimationFrame(() => {
      composerRef.current
        ?.querySelector<HTMLElement>('[contenteditable="true"]')
        ?.focus()
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

  const handleNewChat = useCallback(() => {
    chat.reset()
    setComposerKey((key) => key + 1)
    setMobileSidebarOpen(false)
    focusComposer()
  }, [chat, focusComposer])

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
      if (event.key === 'Escape') {
        closeMobileSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeMobileSidebar, isMobile, mobileSidebarOpen])

  useEffect(() => {
    return () => {
      if (noticeTimeout.current !== null) {
        window.clearTimeout(noticeTimeout.current)
      }
    }
  }, [])

  return (
    <div
      className="app-shell"
      data-sidebar={sidebarHidden ? 'hidden' : 'visible'}
      data-mobile-sidebar={mobileSidebarOpen ? 'open' : 'closed'}
    >
      <Sidebar
        visible={sidebarVisible}
        mobileOpen={mobileSidebarOpen}
        recentTitle={recentTitle}
        onNewChat={handleNewChat}
        onClose={closeMobileSidebar}
        onCollapse={collapseSidebar}
        onPlaceholder={showNotice}
        onSelectRecent={isMobile ? closeMobileSidebar : () => {}}
      />

      {isMobile && mobileSidebarOpen ? (
        <button
          className="sidebar-scrim"
          type="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <main className="main" inert={isMobile && mobileSidebarOpen}>
        <header className="mobile-bar">
          <button
            ref={menuButtonRef}
            className="icon-button"
            type="button"
            aria-label="Open sidebar"
            aria-expanded={mobileSidebarOpen}
            aria-controls="app-sidebar"
            onClick={openSidebar}
          >
            <MenuIcon />
          </button>
          <div className="brand brand--mobile">
            <ClaudeMark className="brand-mark" />
            <span className="brand-name">Anvia</span>
          </div>
          <button
            className="icon-button mobile-new-chat"
            type="button"
            aria-label="New chat"
            title="New chat"
            onClick={handleNewChat}
          >
            <ComposeIcon />
          </button>
        </header>

        <button
          ref={reopenButtonRef}
          className="icon-button reopen-sidebar"
          type="button"
          aria-label="Show sidebar"
          title="Show sidebar"
          onClick={openSidebar}
        >
          <PanelLeftIcon />
        </button>

        <ChatProvider controller={chat}>
          <ThreadPrimitive.Root className="thread">
            <ThreadPrimitive.Viewport className="thread-viewport">
              {/* Empty and Messages must stay siblings: Empty only renders while
                  there are no messages, so it cannot wrap the message list. */}
              <ThreadPrimitive.Empty className="welcome">
                <div className="welcome-mark">
                  <ClaudeMark />
                </div>
                <h1>{greeting}</h1>
                <p>Ask about products, billing, or troubleshooting.</p>
              </ThreadPrimitive.Empty>

              <ThreadPrimitive.Messages className="message-list">
                <MessagePrimitive.Root className="message">
                  {(message) => (
                    <>
                      <MessagePrimitive.Content className="message-content">
                        {message.role === 'assistant' ? (
                          <MessagePrimitive.Markdown />
                        ) : (
                          <MessagePrimitive.Parts />
                        )}
                      </MessagePrimitive.Content>
                      {message.role === 'assistant' ? (
                        <MessagePrimitive.Actions className="message-actions">
                          <MessagePrimitive.Copy
                            className="message-action"
                            aria-label="Copy response"
                            title="Copy response"
                          >
                            <CopyIcon className="icon-copy" width={16} height={16} />
                            <CheckIcon className="icon-check" width={16} height={16} />
                          </MessagePrimitive.Copy>
                          <MessagePrimitive.Regenerate
                            className="message-action"
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

              <ThreadPrimitive.Loading className="thinking" role="status">
                <span className="thinking-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span>Anvia is thinking</span>
              </ThreadPrimitive.Loading>

              <ThreadPrimitive.Error className="thread-error">
                <span>Something went wrong. Please try again.</span>
                <button
                  className="thread-error-retry"
                  type="button"
                  onClick={() => void chat.regenerate()}
                >
                  Retry
                </button>
              </ThreadPrimitive.Error>
            </ThreadPrimitive.Viewport>

            <div className="composer-region">
              <div className="composer-inner">
                <ComposerPrimitive.Root key={composerKey} className="composer-form">
                  <ComposerPrimitive.Input
                    ref={composerRef}
                    className="composer-input"
                    placeholder="How can I help you today?"
                    aria-label="Message Anvia"
                  />

                  <div className="composer-toolbar">
                    <div className="composer-tools">
                      <button
                        className="composer-tool"
                        type="button"
                        aria-label="Add attachment"
                        title="Attachments coming soon"
                        onClick={() => showNotice('Attachments are coming soon.')}
                      >
                        <PlusIcon width={18} height={18} />
                      </button>
                      <button
                        className="composer-tool-pill"
                        type="button"
                        title="Tools coming soon"
                        onClick={() => showNotice('Tools are coming soon.')}
                      >
                        <SlidersIcon width={16} height={16} />
                        <span>Tools</span>
                      </button>
                    </div>

                    <div className="composer-actions">
                      <button
                        className="composer-model"
                        type="button"
                        title="Model selection"
                        onClick={() =>
                          showNotice('Anvia Support is the only assistant available.')
                        }
                      >
                        <span>Anvia Support</span>
                        <ChevronDownIcon width={14} height={14} />
                      </button>
                      <ComposerPrimitive.Stop
                        className="stop-button"
                        aria-label="Stop response"
                      >
                        <StopIcon width={16} height={16} />
                      </ComposerPrimitive.Stop>
                      <ComposerPrimitive.Submit
                        className="send-button"
                        aria-label="Send message"
                      >
                        <ArrowUpIcon width={17} height={17} />
                      </ComposerPrimitive.Submit>
                    </div>
                  </div>
                </ComposerPrimitive.Root>

                <p className="composer-hint">
                  Anvia can make mistakes. Please double-check responses.
                </p>
              </div>
            </div>
          </ThreadPrimitive.Root>
        </ChatProvider>
      </main>

      {notice ? (
        <div className="app-toast" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}
    </div>
  )
}
