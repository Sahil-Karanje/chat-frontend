import Avatar from './Avatar'
import { useAuth } from '../context/AuthContext'

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { user } = useAuth()

  // Resolve the "other" participant
  const otherUser =
    conversation.otherUser ||
    conversation.participants?.find((p) => p._id !== user?._id) ||
    {}

  const name =
    otherUser.username ||
    otherUser.name ||
    otherUser.email?.split('@')[0] ||
    'Unknown'

  const lastMsg = conversation.lastMessage
  const preview = lastMsg?.content
    ? lastMsg.content.length > 38
      ? lastMsg.content.slice(0, 38) + '…'
      : lastMsg.content
    : 'Start a conversation'

  const isMine = lastMsg?.sender === user?._id || lastMsg?.sender?._id === user?._id

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div
      className={`sidebar-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <Avatar name={name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[14px] font-medium text-gray-100 truncate">{name}</span>
          {lastMsg?.createdAt && (
            <span className="text-[11px] text-muted flex-shrink-0 font-mono">
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-muted truncate">
          {isMine && <span className="text-accent/70 mr-1">You:</span>}
          {preview}
        </p>
      </div>
    </div>
  )
}

export default ConversationItem
