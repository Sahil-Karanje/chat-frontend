import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { io } from 'socket.io-client'
import { getConversationsApi, getMessagesApi } from '../api/chat'
import { useAuth } from './AuthContext'
import { getAccessToken } from '../api/axios'

const ChatContext = createContext(null)

const SOCKET_URL = 'https://chat-qqh8.onrender.com'

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const socketRef = useRef(null)

  // Initialize / reconnect socket when auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const token = getAccessToken()
    if (!token) return

    // Cleanup old socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    // Handshake authentication
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('receive_message', (message) => {
      // add new message
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === message._id)) return prev
        return [...prev, message]
      })

      // Update conversation last message preview
      setConversations((prev) =>
        prev.map((c) => {
          const otherId =
            c.participants?.find((p) => p._id !== user?._id)?._id ||
            c.otherUser?._id

          if (
            message.conversationId === c._id ||
            message.sender === otherId ||
            message.receiver === user?._id
          ) {
            return { ...c, lastMessage: message }
          }
          return c
        })
      )
    })

    socket.on('message_sent', (message) => {
      setMessages((prev) => {
        // Replace optimistic or add
        if (prev.some((m) => m._id === message._id)) return prev
        return [...prev, message]
      })

      // Update conversation last message preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === message.conversationId
            ? { ...c, lastMessage: message }
            : c
        )
      )
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, user])

  // Reconnect socket with new token after refresh
  const reconnectSocket = useCallback(() => {
    const token = getAccessToken()
    if (!token || !socketRef.current) return
    socketRef.current.auth = { token }
    if (!socketRef.current.connected) {
      socketRef.current.connect()
    }
  }, [])

  // fetching conversations which we will see on sidebar
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true)
    try {
      const res = await getConversationsApi()
      setConversations(res.data.data || res.data.conversations || [])
    } catch (err) {
      console.error('[Chat] Failed to fetch conversations', err)
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  // set the active conversation when we will click on a particular chat
  const selectConversation = useCallback(async (conversation) => {
    setActiveConversation(conversation)

    // 🔥 If it's a temporary conversation (optimistic one)
    if (!conversation?._id || conversation._id.startsWith("temp-")) {
      setMessages([])
      return
    }

    setLoadingMessages(true)
    setMessages([])

    try {
      const res = await getMessagesApi(conversation._id)
      setMessages(res.data.data || res.data.messages || [])
    } catch (err) {
      console.error('[Chat] Failed to fetch messages', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [])


  const sendMessage = useCallback(
    (receiverId, content, conversationId) => {
      if (!socketRef.current?.connected) {
        console.warn('[Socket] Not connected')
        return
      }
      socketRef.current.emit('send_message', {
        receiverId,
        content,
        conversationId,
      })
    },
    []
  )

  // Load conversations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    } else {
      setConversations([])
      setActiveConversation(null)
      setMessages([])
    }
  }, [isAuthenticated, fetchConversations])

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        fetchConversations,
        selectConversation,
        sendMessage,
        reconnectSocket,
        socket: socketRef,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
