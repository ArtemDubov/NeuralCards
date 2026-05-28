import React from "react";
import { ActiveConversationsList, NewConversationsList } from "./ConversationSections";

/**
 * Conversation List Component
 * Displays chat conversations organized by sections
 */
const ConversationList = React.memo(function ConversationList({
  conversations,
  selectedPartner,
  handleSelectConversation,
  loading,
  friends,
  handleStartChatWithFriend,
  // Theme props
  border,
  txtMuted,
  text,
  primary,
}) {
  // Фильтруем друзей без диалогов
  const friendsWithoutConversations = friends.filter(friend => 
    !conversations.some(conv => (conv.partner_id || conv.user_id) === friend.id)
  );

  return (
    <div className="chat-conversations-section">
      {/* Активные диалоги */}
      <ActiveConversationsList
        conversations={conversations}
        selectedPartner={selectedPartner}
        handleSelectConversation={handleSelectConversation}
        loading={loading}
        border={border}
        txtMuted={txtMuted}
        text={text}
        primary={primary}
      />

      {/* Начать диалог - только если есть друзья без истории */}
      <NewConversationsList
        friendsWithoutConversations={friendsWithoutConversations}
        selectedPartner={selectedPartner}
        handleStartChatWithFriend={handleStartChatWithFriend}
        border={border}
        txtMuted={txtMuted}
        text={text}
        primary={primary}
      />
    </div>
  );
});

export default ConversationList;