import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "../../../../utils/icons";
import ActiveConversationItem from "./ActiveConversationItem";

/**
 * Active Conversations List Component
 * Displays conversations with message history
 */
const ActiveConversationsList = React.memo(function ActiveConversationsList({
  conversations,
  selectedPartner,
  handleSelectConversation,
  loading,
  // Theme props
  border,
  txtMuted,
  text,
  primary,
}) {
  return (
    <div>
      <div style={{ 
        padding: "12px 16px 8px", 
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div className="chat-section-header" style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: txtMuted, 
          textTransform: "uppercase", 
          letterSpacing: 0.5 
        }}>
          Диалоги
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: txtMuted }}>
          Загрузка...
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: txtMuted }}>
          <FontAwesomeIcon icon={faComments} style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }} />
          <p>Нет диалогов</p>
        </div>
      ) : (
        conversations.map((conv) => (
          <ActiveConversationItem
            key={conv.id || conv.user_id}
            conv={conv}
            selectedPartner={selectedPartner}
            handleSelectConversation={handleSelectConversation}
            border={border}
            txtMuted={txtMuted}
            text={text}
            primary={primary}
          />
        ))
      )}
    </div>
  );
});

export default ActiveConversationsList;