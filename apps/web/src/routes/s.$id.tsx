import { createFileRoute } from '@tanstack/react-router'
import {
  getConversation,
  listConversations,
  pendingMessage,
  selectSession,
} from '../lib/conversations'
import { ChatPage } from './index'

export const Route = createFileRoute('/s/$id')({
  loader: async ({ params }) => {
    selectSession(params.id)
    const conversations = await listConversations()
    const active = conversations.find(
      (conversation) => conversation.sessionId === params.id,
    )
    const initialMessages = active
      ? (await getConversation(active.ref)).messages
      : []

    return {
      conversations,
      initialMessages,
      pendingMessage: pendingMessage(params.id),
    }
  },
  component: Session,
})

function Session() {
  const { conversations, initialMessages, pendingMessage } = Route.useLoaderData()
  const { id } = Route.useParams()

  return (
    <ChatPage
      conversations={conversations}
      initialMessages={initialMessages}
      pendingMessage={pendingMessage}
      sessionId={id}
    />
  )
}
