import React from "react";
import NewConversationItem from "./NewConversationItem";

/**
 * New Conversations List Component
 * Displays friends without conversation history
 */
const NewConversationsList = React.memo(function NewConversationsList({
  friendsWithoutConversations,
  selectedPartner,
  handleStartChatWithFriend,
  // Theme props
  border,
  txtMuted,
  text,
  primary,
}) {
  if (friendsWithoutConversations.length === 0) return null;

  return (
    <>
      <div style={{ 
        padding: "16px 16px 8px", 
        borderTop: `2px solid ${border}`,
        marginTop: 8
      }}>
        <div className="chat-section-header" style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: txtMuted, 
          textTransform: "uppercase", 
          letterSpacing: 0.5 
        }}>
          Начать диалог
        </div>
      </div>
      
      {friendsWithoutConversations.map((friend) => (
        <NewConversationItem
          key={friend.id}
          friend={friend}
          selectedPartner={selectedPartner}
          handleStartChatWithFriend={handleStartChatWithFriend}
          border={border}
          txtMuted={txtMuted}
          text={text}
          primary={primary}
        />
      ))}
    </>
  );
});

export default NewConversationsList;