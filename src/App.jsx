import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <div className="h-screen flex flex-col overflow-hidden">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/chat" element={<Chat />} />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
