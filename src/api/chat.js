import api from "./axios";

export const getConversationsApi = () => api.get("/api/message/conversations");

export const getMessagesApi = (conversationId) =>
  api.get(`/api/message/messages/${conversationId}`);

export const sendMessageApi = (payload) =>
  api.post("/api/message/send", payload);

export const searchUsersApi = (query) =>
  api.get("/api/users/search", {
    params: { query },
  });
