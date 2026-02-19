import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import ConversationItem from './ConversationItem'
import Avatar from './Avatar'
import { searchUsersApi } from '../api/chat'

const Sidebar = ({ onSelectConversation, mobileVisible, onClose }) => {
  const { user, logout } = useAuth()
  const { conversations, activeConversation, selectConversation, loadingConversations } = useChat()
  const [search, setSearch] = useState('')

  //for searching new users
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchUsers, setSearchUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userSearch.trim()) {
        setSearchUsers([])
        return
      }

      setLoadingUsers(true)
      try {
        const res = await searchUsersApi(userSearch)
        setSearchUsers(res.data.data || [])
      } catch (err) {
        console.error("User search failed", err)
      } finally {
        setLoadingUsers(false)
      }
    }

    const debounce = setTimeout(fetchUsers, 400)
    return () => clearTimeout(debounce)
  }, [userSearch])

  const handleStartChat = (selectedUser) => {
    // Check if conversation already exists
    const existing = conversations.find((c) => {
      const other =
        c.otherUser ||
        c.participants?.find((p) => p._id !== user?._id)

      return other?._id === selectedUser._id
    })

    if (existing) {
      selectConversation(existing)
    } else {
      // Create temporary conversation object
      const tempConversation = {
        _id: `temp-${selectedUser._id}`,
        participants: [user, selectedUser],
        otherUser: selectedUser,
        lastMessage: null,
      }

      selectConversation(tempConversation)
    }

    setShowNewChat(false)
    setUserSearch('')
    setSearchUsers([])
    onSelectConversation?.()
  }

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

        {/* add new chat button */}
        <button
          onClick={() => setShowNewChat(true)}
          className="p-1.5 rounded-lg text-muted hover:text-gray-300 hover:bg-surface-3 transition-all"
          title="New Chat"
        >
          +
        </button>

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
      <div className="flex-1 overflow-y-auto px-2 py-2">
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
      </div>

      {showNewChat && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface-1 border border-border rounded-xl w-[90%] max-w-sm p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Start New Chat
            </h3>

            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent/50"
            />

            <div className="mt-3 max-h-48 overflow-y-auto">
              {loadingUsers ? (
                <p className="text-xs text-muted">Searching...</p>
              ) : searchUsers.length === 0 ? (
                <p className="text-xs text-muted mt-2">
                  {userSearch ? "No users found" : "Start typing to search"}
                </p>
              ) : (
                searchUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleStartChat(u)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-3 cursor-pointer"
                  >
                    <Avatar name={u.username || u.name} size="sm" />
                    <span className="text-sm text-gray-200">
                      {u.username || u.name}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNewChat(false)}
              className="mt-3 text-xs text-muted hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[11px] text-muted font-mono">
          @{user?.username || user?.name || user?.email?.split('@')[0] || 'user'}
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
