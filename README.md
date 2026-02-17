# Pulse Chat — Real-time 1-to-1 Chat App

A production-ready React frontend for real-time messaging.

## Tech Stack

- React 18 + Vite
- TailwindCSS (dark theme, custom design system)
- Axios (with automatic token refresh interceptor)
- Socket.io-client (real-time messaging)
- React Router v6

## Features

- **Secure Auth**: accessToken in memory only, refreshToken in httpOnly cookie
- **Auto token refresh**: 401 interceptor retries failed requests after refreshing
- **Real-time messages**: Socket.io with `send_message` / `receive_message` / `message_sent`
- **Session persistence**: Restores session via refresh cookie on page reload
- **Responsive**: Mobile-first, sidebar/chat toggle on small screens
- **Dark theme**: Custom Tailwind design tokens

## Setup

```bash
npm install
npm run dev
```

## Folder Structure

```
src/
├── api/
│   ├── axios.js       # Axios instance + interceptors + token store
│   ├── auth.js        # Auth API calls
│   └── chat.js        # Chat API calls
├── context/
│   ├── AuthContext.jsx # User + token state, login/logout/register
│   └── ChatContext.jsx # Conversations, messages, Socket.io
├── components/
│   ├── ProtectedRoute.jsx
│   ├── Avatar.jsx
│   ├── ConversationItem.jsx
│   ├── MessageBubble.jsx
│   ├── Sidebar.jsx
│   └── ChatWindow.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Chat.jsx
├── hooks/
│   └── useAutoScroll.js
└── App.jsx
```

## Backend

Base URL: `https://chat-qqh8.onrender.com`

Endpoints used:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `GET /api/message/conversations`
- `GET /api/message/messages/:conversationId`
- `POST /api/message/send`
