import { useAuth } from '../context/AuthContext'

const MessageBubble = ({ message, showDate }) => {
  const { user } = useAuth()

  const isOwn =
    message.sender === user?._id ||
    message.sender?._id === user?._id

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.setHours(0,0,0,0) - d.setHours(0,0,0,0)
    if (diff === 0) return 'Today'
    if (diff === 86400000) return 'Yesterday'
    return new Date(dateStr).toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      {showDate && (
        <div className="flex items-center justify-center my-4">
          <span className="px-3 py-1 bg-surface-3 text-muted text-xs rounded-full font-mono">
            {formatDate(message.createdAt)}
          </span>
        </div>
      )}
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-popIn`}
      >
        <div className={`max-w-[72%] sm:max-w-[60%]`}>
          <div className={isOwn ? 'msg-bubble-out' : 'msg-bubble-in'}>
            <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <p
            className={`text-[10.5px] text-muted mt-1 font-mono ${
              isOwn ? 'text-right' : 'text-left'
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </>
  )
}

export default MessageBubble
