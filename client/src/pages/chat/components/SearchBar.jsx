import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserPlus, faComments } from "../../../utils/icons";
import AvatarDisplay from "../../../components/common/AvatarDisplay";
import { normalizeAvatarData } from "../../../utils/avatarUtils";

/**
 * Search Bar Component
 * Handles user search and displays results
 */
const SearchBar = React.memo(function SearchBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchResults,
  isSearching,
  friends,
  sentRequests,
  conversations,
  handleSendRequest,
  handleStartChatWithFriend,
  // Theme props
  isDark,
  border,
  txtMuted,
  text,
  primary,
}) {
  return (
    <div className="chat-search-container" style={{ 
      padding: "16px", 
      borderBottom: `2px solid ${border}` 
    }}>
      <div style={{ position: "relative" }}>
        <FontAwesomeIcon 
          icon={faSearch} 
          style={{ 
            position: "absolute", 
            left: 12, 
            top: "50%", 
            transform: "translateY(-50%)", 
            color: txtMuted,
            fontSize: 14 
          }} 
        />
        <input
          type="text"
          placeholder="Поиск пользователей..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="chat-search-input"
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            border: `1px solid ${border}`,
            borderRadius: 8,
            background: isDark ? "rgba(255,255,255,0.05)" : "var(--nt-background-secondary)",
            color: text,
            fontSize: 14,
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = primary;
            e.target.style.boxShadow = `0 0 0 3px ${primary}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = border;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
      
      {/* Search Results */}
      {searchQuery && (
        <div className="chat-search-results" style={{ 
          marginTop: 12, 
          maxHeight: 300, 
          overflowY: "auto",
          borderTop: `1px solid ${border}`,
          paddingTop: 12
        }}>
          {isSearching ? (
            <div style={{ padding: 16, textAlign: "center", color: txtMuted, fontSize: 13 }}>
              Поиск...
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: txtMuted, fontSize: 13 }}>
              Ничего не найдено
            </div>
          ) : (
            searchResults.map((user) => {
              // Нормализуем данные пользователя перед передачей в AvatarDisplay
              const normalizedUser = normalizeAvatarData(user);
              
              const isFriend = friends.some((f) => f.id === user.id);
              const hasPendingRequest = sentRequests.some((r) => r.target_id === user.id);
              const hasConversation = conversations.some((c) => (c.user_id || c.partner_id) === user.id);
              
              return (
                <div key={user.id} className="chat-search-result-item" style={{ 
                  display: "flex", 
                  gap: 10, 
                  alignItems: "center", 
                  padding: "8px 0",
                  borderBottom: `1px solid ${border}`
                }}>
                  <Link to={`/profile/${user.id}`} style={{ textDecoration: "none" }}>
                    <AvatarDisplay 
                      user={normalizedUser}
                      size={32}
                    />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/profile/${user.id}`} style={{ 
                      textDecoration: "none", 
                      color: text, 
                      fontWeight: 600, 
                      fontSize: 13, 
                      display: "block", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap" 
                    }}>
                      {user.name}
                    </Link>
                  </div>
                  {hasConversation && (
                    <button 
                      onClick={() => {
                        const conv = conversations.find(c => (c.user_id || c.partner_id) === user.id);
                        if (conv) handleStartChatWithFriend(normalizeAvatarData(user));
                      }}
                      className="chat-action-btn chat-add-friend-btn"
                      style={{ 
                        background: primary, 
                        color: "#fff",
                        padding: "4px 8px",
                        fontSize: 11
                      }}
                    >
                      <FontAwesomeIcon icon={faComments} />
                    </button>
                  )}
                  {!isFriend && !hasPendingRequest && !hasConversation && (
                    <button 
                      onClick={() => handleSendRequest(user.id)} 
                      className="chat-action-btn chat-add-friend-btn"
                      style={{ 
                        background: primary, 
                        color: "#fff",
                        padding: "4px 8px",
                        fontSize: 11
                      }}
                    >
                      <FontAwesomeIcon icon={faUserPlus} />
                    </button>
                  )}
                  {hasPendingRequest && (
                    <span style={{ fontSize: 10, color: txtMuted, fontStyle: "italic" }}>
                      Отправлено
                    </span>
                  )}
                  {isFriend && !hasConversation && (
                    <button 
                      onClick={() => handleStartChatWithFriend(normalizeAvatarData(user))}
                      className="chat-action-btn chat-add-friend-btn"
                      style={{ 
                        background: primary, 
                        color: "#fff",
                        padding: "4px 8px",
                        fontSize: 11
                      }}
                    >
                      <FontAwesomeIcon icon={faComments} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

export default SearchBar;
