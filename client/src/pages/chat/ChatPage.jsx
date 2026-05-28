import React, { useRef, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import PageShell from "../../components/layout/PageShell";
import { useChatLogic } from "./hooks/useChatLogic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "../../utils/icons";
import {
  MessageBubble,
  SearchBar,
  ConversationList,
  FriendRequests,
  ChatInput,
  ChatHeader,
  EmptyChatState,
} from "./components";

/**
 * Chat Page - Refactored
 * Main component that orchestrates chat functionality
 */
const ChatPage = React.memo(function ChatPageComponent() {
  const { currentTheme } = useTheme();

  // All logic extracted to custom hook
  const {
    conversations,
    messages,
    selectedPartner,
    newMessage,
    loading,
    showEmoji,
    friendRequests,
    sentRequests,
    searchQuery,
    searchResults,
    isSearching,
    currentUserId,
    messagesEndRef,
    inputRef,
    chatContainerRef,
    setSelectedPartner,
    setNewMessage,
    setShowEmoji,
    setSearchQuery,
    handleSelectConversation,
    handleSend,
    handleKeyDown,
    insertEmoji,
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelRequest,
    handleSearch,
    friends,
    handleStartChatWithFriend,
    handleSendRequest,
  } = useChatLogic();

  // Theme values - memoized to prevent unnecessary recalculations
  const themeValues = useMemo(
    () => ({
      isDark: currentTheme?.mode === "dark",
      primary: currentTheme?.primary || "var(--nt-primary)",
      bgSec:
        currentTheme?.backgroundSecondary ||
        (currentTheme?.mode === "dark"
          ? "var(--nt-surface)"
          : "var(--nt-background-secondary)"),
      border:
        currentTheme?.border ||
        (currentTheme?.mode === "dark"
          ? "var(--nt-border)"
          : "var(--nt-border)"),
      txtMuted:
        currentTheme?.textMuted ||
        (currentTheme?.mode === "dark"
          ? "var(--nt-text-muted)"
          : "var(--nt-text-muted)"),
      text:
        currentTheme?.text ||
        (currentTheme?.mode === "dark" ? "var(--nt-text)" : "var(--nt-text)"),
      surface:
        currentTheme?.surface ||
        (currentTheme?.mode === "dark"
          ? "var(--nt-surface)"
          : "var(--nt-surface)"),
    }),
    [currentTheme],
  );

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon
            icon={faComments}
            style={{ marginRight: "8px", color: currentTheme.primary }}
          />
          Чат и друзья
        </h1>
      </div>

      <div className="chat-page-container">
        {/* Left Sidebar */}
        <div className="chat-sidebar" style={{ padding: "16px" }}>
          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            searchResults={searchResults}
            isSearching={isSearching}
            friends={friends}
            sentRequests={sentRequests}
            conversations={conversations}
            handleSendRequest={handleSendRequest}
            handleStartChatWithFriend={handleStartChatWithFriend}
            isDark={themeValues.isDark}
            border={themeValues.border}
            txtMuted={themeValues.txtMuted}
            text={themeValues.text}
            primary={themeValues.primary}
          />

          {/* Conversations */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ConversationList
              conversations={conversations}
              selectedPartner={selectedPartner}
              handleSelectConversation={handleSelectConversation}
              loading={loading}
              friends={friends}
              handleStartChatWithFriend={handleStartChatWithFriend}
              border={themeValues.border}
              txtMuted={themeValues.txtMuted}
              text={themeValues.text}
              primary={themeValues.primary}
            />
          </div>

          {/* Friend Requests - pinned to bottom */}
          <FriendRequests
            friendRequests={friendRequests}
            sentRequests={sentRequests}
            handleAcceptRequest={handleAcceptRequest}
            handleDeclineRequest={handleDeclineRequest}
            handleCancelRequest={handleCancelRequest}
            border={themeValues.border}
            txtMuted={themeValues.txtMuted}
            text={themeValues.text}
          />
        </div>

        {/* Right Chat Area */}
        <div className="chat-area">
          {!selectedPartner ? (
            <EmptyChatState
              primary={themeValues.primary}
              text={themeValues.text}
              txtMuted={themeValues.txtMuted}
            />
          ) : selectedPartner?.name ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                selectedPartner={selectedPartner}
                isDark={themeValues.isDark}
                border={themeValues.border}
                text={themeValues.text}
                primary={themeValues.primary}
              />

              {/* Messages */}
              <div
                className="chat-messages-container"
                ref={chatContainerRef}
                style={{ position: "relative", flex: 1, overflowY: "auto" }}
              >
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      color: themeValues.txtMuted,
                    }}
                  >
                    Загрузка сообщений...
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      color: themeValues.txtMuted,
                    }}
                  >
                    Нет сообщений
                  </div>
                ) : (
                  <div>
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        currentUserId={currentUserId}
                        isDark={themeValues.isDark}
                        primary={themeValues.primary}
                        bgSec={themeValues.bgSec}
                        text={themeValues.text}
                        txtMuted={themeValues.txtMuted}
                      />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                showEmoji={showEmoji}
                setShowEmoji={setShowEmoji}
                insertEmoji={insertEmoji}
                inputRef={inputRef}
                border={themeValues.border}
                bgSec={themeValues.bgSec}
                text={themeValues.text}
                primary={themeValues.primary}
                surface={themeValues.surface}
                txtMuted={themeValues.txtMuted}
              />
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <p style={{ color: themeValues.txtMuted }}>Нет диалогов</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
});

export default ChatPage;
