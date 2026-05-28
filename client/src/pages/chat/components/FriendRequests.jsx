import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faCheck, faXmark, faClock } from "../../../utils/icons";
import AvatarDisplay from "../../../components/common/AvatarDisplay";
import { normalizeRequestData } from "../../../utils/avatarUtils";

/**
 * Friend Requests Component
 * Displays incoming and sent friend requests
 */
const FriendRequests = React.memo(function FriendRequests({
  friendRequests,
  sentRequests,
  handleAcceptRequest,
  handleDeclineRequest,
  handleCancelRequest,
  // Theme props
  border,
  txtMuted,
  text,
}) {
  if (friendRequests.length === 0 && sentRequests.length === 0) return null;

  return (
    <div className="chat-requests-section" style={{ 
      borderTop: `2px solid ${border}`, 
      maxHeight: 250, 
      overflowY: "auto" 
    }}>
      {/* Incoming Requests */}
      {friendRequests.length > 0 && (
        <div className="chat-incoming-requests">
          <div className="chat-section-header" style={{ 
            padding: "12px 16px 8px", 
            fontSize: 11, 
            fontWeight: 700, 
            color: txtMuted, 
            textTransform: "uppercase", 
            letterSpacing: 0.5, 
            display: "flex", 
            alignItems: "center", 
            gap: 6 
          }}>
            <FontAwesomeIcon icon={faUserPlus} style={{ color: "var(--nt-warning)" }} />
            Входящие заявки
            <span className="chat-request-count chat-request-count-incoming" style={{ 
              background: "var(--nt-error)", 
              color: "#fff", 
              borderRadius: 10, 
              padding: "1px 6px", 
              fontSize: 10, 
              fontWeight: 700 
            }}>
              {friendRequests.length}
            </span>
          </div>
          <div>
            {friendRequests.map((req) => {
              // Нормализуем данные заявителя перед передачей в AvatarDisplay
              const requesterData = normalizeRequestData(req, "requester");
              
              return (
                <div key={req.requester_id} className="chat-request-item" style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${border}`,
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <AvatarDisplay 
                      user={requesterData}
                      size={42}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: text }}>
                        {req.requester_name}
                      </div>
                      <div style={{ fontSize: 11, color: txtMuted, marginTop: 2 }}>
                        Хочет добавить вас в друзья
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button 
                        onClick={() => handleAcceptRequest(req.requester_id)} 
                        className="chat-action-btn chat-accept-btn"
                        style={{ background: "var(--nt-success)", color: "#fff" }}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button 
                        onClick={() => handleDeclineRequest(req.requester_id)} 
                        className="chat-action-btn chat-decline-btn"
                        style={{ background: "var(--nt-error)", color: "#fff" }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div className="chat-sent-requests" style={{ 
          borderTop: friendRequests.length > 0 ? `1px solid ${border}` : "none" 
        }}>
          <div className="chat-section-header" style={{ 
            padding: "12px 16px 8px", 
            fontSize: 11, 
            fontWeight: 700, 
            color: txtMuted, 
            textTransform: "uppercase", 
            letterSpacing: 0.5, 
            display: "flex", 
            alignItems: "center", 
            gap: 6 
          }}>
            <FontAwesomeIcon icon={faClock} style={{ color: "var(--nt-secondary)" }} />
            Исходящие заявки
          </div>
          <div>
            {sentRequests.map((req) => {
              // Нормализуем данные целевого пользователя перед передачей в AvatarDisplay
              const targetData = normalizeRequestData(req, "target");
              
              return (
                <div key={req.target_id} className="chat-request-item" style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${border}`,
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <AvatarDisplay 
                      user={targetData}
                      size={42}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: text }}>
                        {req.target_name}
                      </div>
                      <div style={{ fontSize: 11, color: txtMuted, marginTop: 2 }}>
                        Ожидание ответа
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCancelRequest(req.target_id)} 
                      className="chat-action-btn chat-cancel-btn"
                      style={{ background: "var(--nt-text-muted)", color: "#fff" }}
                    >
                      <FontAwesomeIcon icon={faXmark} /> Отменить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default FriendRequests;
