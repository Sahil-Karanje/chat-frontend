import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import ConversationItem from './ConversationItem'
import Avatar from './Avatar'
import { searchUsersApi } from '../api/chat'

const NewChatModal = ({ onClose, onStartChat, conversations, user }) => {
  const [searchUsers, setSearchUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const inputRef = useRef(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Debounced user search
  useEffect(() => {
    if (!userSearch.trim()) {
      setSearchUsers([])
      return
    }

    setLoadingUsers(true)
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsersApi(userSearch)
        setSearchUsers(res.data.data || [])
      } catch (err) {
        console.error('User search failed', err)
        setSearchUsers([])
      } finally {
        setLoadingUsers(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [userSearch])

  const handleSelect = (selectedUser) => {
    // Check if conversation already exists with this user
    const existing = conversations.find((c) => {
      const other =
        c.otherUser?._id ||
        c.participants?.find((p) => p._id !== user?._id)?._id
      return other === selectedUser._id
    })

    onStartChat(selectedUser, existing || null)
  }

  return (
    // Backdrop — clicking it closes the modal
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        // Only close if clicking the backdrop itself, not children
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-surface-1 border border-border rounded-xl w-[90%] max-w-sm p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-200">Start New Chat</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search users..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-muted outline-none focus:border-accent/50 transition-colors"
        />

        <div className="mt-3 max-h-48 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex flex-col gap-1 px-1 py-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <div className="w-8 h-8 rounded-full bg-surface-3 animate-pulse" />
                  <div className="h-3 w-28 bg-surface-3 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : searchUsers.length === 0 ? (
            <p className="text-xs text-muted mt-2 px-1">
              {userSearch.trim() ? 'No users found' : 'Start typing to search'}
            </p>
          ) : (
            searchUsers.map((u) => {
              const alreadyExists = conversations.some((c) => {
                const other =
                  c.otherUser?._id ||
                  c.participants?.find((p) => p._id !== user?._id)?._id
                return other === u._id
              })

              return (
                <div
                  key={u._id}
                  onClick={() => handleSelect(u)}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-surface-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={u.username || u.name} size="sm" />
                    <span className="text-sm text-gray-200">
                      {u.username || u.name}
                    </span>
                  </div>
                  {alreadyExists && (
                    <span className="text-[10px] text-muted border border-border rounded px-1.5 py-0.5">
                      existing
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const Sidebar = ({ onSelectConversation, mobileVisible, onClose }) => {
  const { user, logout } = useAuth()
  const { conversations, activeConversation, selectConversation, loadingConversations, setConversations } = useChat()
  const [search, setSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)

  // Stable close handler so modal's useEffect dep doesn't re-run
  const handleCloseModal = useCallback(() => setShowNewChat(false), [])

  // Called from modal with the selected user and existing convo (if any)
  const handleStartChat = useCallback((selectedUser, existingConversation) => {
    if (existingConversation) {
      selectConversation(existingConversation)
    } else {
      const tempConversation = {
        _id: `temp-${selectedUser._id}`,
        participants: [user, selectedUser],
        otherUser: selectedUser,
        lastMessage: null,
      }
      // Avoid adding duplicate temp convos (e.g. from a double-click)
      setConversations((prev) => {
        const alreadyTemp = prev.some((c) => c._id === tempConversation._id)
        return alreadyTemp ? prev : [tempConversation, ...prev]
      })
      selectConversation(tempConversation)
    }

    handleCloseModal()
    onSelectConversation?.()
    onClose?.()
  }, [user, selectConversation, setConversations, handleCloseModal, onSelectConversation, onClose])

  const filtered = conversations.filter((c) => {
    const other =
      c.otherUser ||
      c.participants?.find((p) => p._id !== user?._id) ||
      {}
    const name = other.username || other.name || other.email || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const handleSelect = (conversation) => {
    selectConversation(conversation)
    onSelectConversation?.()
    onClose?.()
  }

  return (
    <>
      <aside
        className={`
          flex flex-col w-full sm:w-[320px] lg:w-[340px] h-full
          bg-surface-1 border-r border-border
          ${mobileVisible !== undefined ? (mobileVisible ? 'flex' : 'hidden sm:flex') : 'flex'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse_soft" />
              <span className="text-[13px] font-semibold text-gray-100 tracking-wide uppercase font-mono">
                Pulse
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name={user?.username || user?.name || user?.email || ''} size="sm" />
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-muted hover:text-gray-300 hover:bg-surface-3 transition-all"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.047a.75.75 0 1 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06l-1.047-1.048H18.25A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-border">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-muted outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 relative overflow-y-auto px-2 py-2">
          {loadingConversations ? (
            <div className="flex flex-col gap-2 px-1 py-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-surface-3 animate-pulse_soft" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-surface-3 rounded animate-pulse_soft" />
                    <div className="h-2.5 w-40 bg-surface-3 rounded animate-pulse_soft" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-muted text-sm">
                {search ? 'No matches found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filtered.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isActive={activeConversation?._id === conversation._id}
                onClick={() => handleSelect(conversation)}
              />
            ))
          )}

          {/* New chat FAB */}
          <button
            onClick={() => setShowNewChat(true)}
            className="flex items-center justify-center w-10 h-10 bg-accent absolute right-4 bottom-4 text-white rounded-full shadow-lg hover:bg-accent/80 transition-all text-xl leading-none"
            title="New Chat"
            aria-label="Start new chat"
          >
            +
          </button>
        </div>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[11px] text-muted font-mono">
            @{user?.username || user?.name || user?.email?.split('@')[0] || 'user'}
          </p>
        </div>
      </aside>

      {/* Modal rendered outside aside to avoid stacking context / overflow clipping issues */}
      {showNewChat && (
        <NewChatModal
          onClose={handleCloseModal}
          onStartChat={handleStartChat}
          conversations={conversations}
          user={user}
        />
      )}
    </>
  )
}

export default Sidebar