import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

const Chat = () => {
  // On mobile, toggle between sidebar (true) and chat (false)
  const [showSidebar, setShowSidebar] = useState(true)

  const handleSelectConversation = () => {
    setShowSidebar(false)
  }

  const handleBack = () => {
    setShowSidebar(true)
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar - always visible on sm+, toggleable on mobile */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex h-full`}>
        <Sidebar
          onSelectConversation={handleSelectConversation}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Chat window - always visible on sm+, toggleable on mobile */}
      <div
        className={`${!showSidebar ? 'flex' : 'hidden'} sm:flex flex-1 h-full min-w-0`}
      >
        <ChatWindow onBack={handleBack} />
      </div>
    </div>
  )
}

export default Chat
