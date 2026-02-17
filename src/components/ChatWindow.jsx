import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { useAutoScroll } from '../hooks/useAutoScroll'
import MessageBubble from './MessageBubble'
import Avatar from './Avatar'

const ChatWindow = ({ onBack }) => {
  const { user } = useAuth()
  const { activeConversation, messages, loadingMessages, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)
  const scrollRef = useAutoScroll(messages)

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConversation) {
      inputRef.current?.focus()
    }
    setInput('')
  }, [activeConversation?._id])

  const getOtherUser = useCallback(() => {
    if (!activeConversation) return {}
    return (
      activeConversation.otherUser ||
      activeConversation.participants?.find((p) => p._id !== user?._id) ||
      {}
    )
  }, [activeConversation, user])

  const otherUser = getOtherUser()
  const otherName =
    otherUser.username || otherUser.name || otherUser.email?.split('@')[0] || 'User'
  const otherUserId = otherUser._id

  const handleSend = (e) => {
    e?.preventDefault()
    const content = input.trim()
    if (!content || !otherUserId || !activeConversation) return

    sendMessage(otherUserId, content, activeConversation._id)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages to show date separators
  const shouldShowDate = (msg, idx) => {
    if (idx === 0) return true
    const prev = messages[idx - 1]
    const prevDate = new Date(prev.createdAt).toDateString()
    const currDate = new Date(msg.createdAt).toDateString()
    return prevDate !== currDate
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-0 gap-6">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8 text-accent/60">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <h3 className="text-gray-300 font-medium">Select a conversation</h3>
          <p className="text-muted text-sm">Choose from the list to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-0 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface-1">
        {/* Back button on mobile */}
        <button
          className="sm:hidden p-1.5 -ml-1 rounded-lg text-muted hover:text-gray-300 hover:bg-surface-3 transition-all"
          onClick={onBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
        </button>

        <Avatar name={otherName} size="md" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-gray-100 truncate">{otherName}</h2>
          <p className="text-[11px] text-accent font-mono">online</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34,197,94,0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(34,197,94,0.02) 0%, transparent 50%)`,
        }}
      >
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-muted text-xs font-mono">loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <p className="text-muted text-sm">No messages yet</p>
              <p className="text-muted/60 text-xs">Say hello to {otherName}!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 mt-auto">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg._id || i}
                message={msg}
                showDate={shouldShowDate(msg, i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-border bg-surface-1">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${otherName}...`}
              rows={1}
              className="w-full bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-muted outline-none resize-none transition-all duration-200 focus:border-accent/50 focus:ring-1 focus:ring-accent/10 leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white translate-x-px">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.254 4.594a.75.75 0 0 0 .577.54L8.5 9.25l-4.39.867a.75.75 0 0 0-.577.541L2.28 15.252a.75.75 0 0 0 .826.95l14.5-6.5a.75.75 0 0 0 0-1.402l-14.5-6.5Z" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-muted/50 mt-1.5 ml-1 font-mono">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
