import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { chatApi } from "../../../features/chat/api/chatApi";
import { chatWS } from "../../../features/chat/chatWebSocket";

/**
 * Custom hook for Chat Page logic
 * Manages conversations, messages, friends, and WebSocket connection
 */
export function useChatLogic() {
  const { user } = useAuth();
  const toast = useToast();
  const currentUserId = user?.id;

  // Chat state
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);

  // Friends state
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadConversations();
    loadFriendRequests();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getConversations();
      setConversations(res.data || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const [friendsRes, requestsRes, sentRes] = await Promise.all([
        chatApi.getFriends(),
        chatApi.getFriendRequests(),
        chatApi.getSentRequests(),
      ]);
      setFriends(friendsRes.data || []);
      setFriendRequests(requestsRes.data || []);
      setSentRequests(sentRes.data || []);
    } catch (err) {
      console.error("Failed to load friend requests:", err);
    }
  };

  // Search users via API
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await chatApi.searchUsers(query);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("Search failed", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv => 
      (conv.user_name || conv.partner_name || "").toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, conversations]);

  // WebSocket connection
  useEffect(() => {
    if (!currentUserId) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    chatWS.connect(token, currentUserId);

    const unsubscribe = chatWS.on("msg", (data) => {
      // Добавляем сообщение только если это текущий открытый чат
      const currentPartnerId = window.__chatPartnerId;
      if (currentPartnerId && 
          (data.sender_id === currentPartnerId || data.receiver_id === currentPartnerId)) {
        setMessages((prev) => {
          // Удаляем временное сообщение с таким же содержимым от текущего пользователя
          const filtered = prev.filter(msg => 
            !(msg.is_temp && msg.sender_id === currentUserId && msg.content === data.content)
          );
          // Проверяем, нет ли уже такого сообщения (по ID)
          const exists = filtered.some(msg => msg.id === data.id);
          if (exists) {
            return filtered;
          }
          return [...filtered, data];
        });
        
        // Скроллим вниз только для новых сообщений
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
      
      // Обновляем список диалогов только при изменении статуса прочтения или нового диалога
      // loadConversations() убран - вызывается только при явной необходимости
    });

    return () => {
      unsubscribe();
      chatWS.disconnect();
    };
  }, [currentUserId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Скроллим только если пользователь уже близко к низу (в пределах 100px)
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          // Используем smooth scroll без принудительной перерисовки
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth"
          });
        }
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (partnerId) => {
    try {
      const res = await chatApi.getMessages(partnerId);
      // Заменяем сообщения только если партнер не изменился
      if (window.__chatPartnerId === partnerId) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast.error("Не удалось загрузить сообщения");
    }
  };

  const handleSelectConversation = async (conv) => {
    const partnerId = conv.partner_id || conv.user_id;
    console.log("[Chat] Selecting conversation with partner:", partnerId);
    
    // Сначала устанавливаем партнера с полными данными аватара (сообщения остаются от предыдущего чата, чтобы избежать белого экрана)
    setSelectedPartner({ 
      id: partnerId, 
      name: conv.partner_name || conv.user_name || "Пользователь",
      avatar_type: conv.avatar_type || "letter",
      avatar_emoji: conv.avatar_emoji || "👤",
      avatar_color: conv.avatar_color || "#667eea",
      avatar_url: conv.avatar_url || null,
    });
    window.__chatPartnerId = partnerId;
    
    // Запускаем параллельные запросы без очистки сообщений
    try {
      await Promise.all([
        chatApi.markAllRead(partnerId).catch(err => console.error("Failed to mark as read:", err)),
        loadMessages(partnerId)
      ]);
      
      // Обновляем диалоги после загрузки сообщений
      await loadConversations();
    } catch (err) {
      console.error("Error in handleSelectConversation:", err);
    }
  };

  const handleStartChatWithFriend = async (friend) => {
    // Проверяем, есть ли уже диалог
    const existingConv = conversations.find(
      conv => (conv.partner_id || conv.user_id) === friend.id
    );
    
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      // Создаем новый диалог с полными данными аватара
      setSelectedPartner({ 
        id: friend.id, 
        name: friend.name,
        avatar_type: friend.avatar_type || "letter",
        avatar_emoji: friend.avatar_emoji || "👤",
        avatar_color: friend.avatar_color || "#667eea",
        avatar_url: friend.avatar_url || null,
      });
      await loadMessages(friend.id);
      window.__chatPartnerId = friend.id;
      // Перезагружаем диалоги чтобы показать новый
      await loadConversations();
    }
  };

  const handleSend = useCallback(() => {
    if (!newMessage.trim() || !selectedPartner) return;

    const tempMsg = {
      id: Date.now(),
      content: newMessage,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      is_temp: true,
    };

    // Оптимистичное обновление - сразу добавляем сообщение
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    
    // Скроллим вниз
    requestAnimationFrame(() => {
      scrollToBottom();
    });

    // Отправляем на сервер
    chatWS.send("send", {
      content: newMessage,
      receiver_id: selectedPartner.id,
    });
  }, [newMessage, selectedPartner, currentUserId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleSendRequest = async (userId) => {
    try {
      await chatApi.sendFriendRequest(userId);
      toast.success("Заявка отправлена");
      loadConversations();
      loadFriendRequests();
    } catch (err) {
      toast.error("Ошибка отправки заявки");
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      await chatApi.acceptFriendRequest(requesterId);
      toast.success("Заявка принята");
      loadConversations();
      loadFriendRequests();
    } catch (err) {
      toast.error("Ошибка принятия заявки");
    }
  };

  const handleDeclineRequest = async (requesterId) => {
    try {
      await chatApi.rejectFriendRequest(requesterId);
      toast.success("Заявка отклонена");
      loadFriendRequests();
    } catch (err) {
      toast.error("Ошибка отклонения заявки");
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await chatApi.cancelFriendRequest(userId);
      toast.success("Заявка отменена");
      loadFriendRequests();
    } catch (err) {
      toast.error("Ошибка отмены заявки");
    }
  };

  return {
    // State
    conversations,
    messages,
    selectedPartner,
    newMessage,
    loading,
    showEmoji,
    friends,
    friendRequests,
    sentRequests,
    searchQuery,
    searchResults,
    isSearching,
    currentUserId,
    
    // Refs
    messagesEndRef,
    inputRef,
    chatContainerRef,
    
    // Setters
    setSelectedPartner,
    setNewMessage,
    setShowEmoji,
    setSearchQuery,
    
    // Handlers
    handleSelectConversation,
    handleStartChatWithFriend,
    handleSend,
    handleKeyDown,
    insertEmoji,
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelRequest,
    handleSearch,
    handleSendRequest,
  };
}
