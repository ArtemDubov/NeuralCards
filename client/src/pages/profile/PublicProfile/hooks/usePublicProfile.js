import { useState, useEffect } from "react";
import { publicProfileApi } from "../../../../features/profile/api/publicProfileApi";
import { chatApi } from "../../../../features/chat/api/chatApi";

export function usePublicProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
    checkFriend();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicProfileApi.getPublicProfile(userId);
      console.log("[usePublicProfile] Received profile data:", {
        user_id: response.data.user_id,
        name: response.data.name,
        avatar_type: response.data.avatar_type,
        avatar_emoji: response.data.avatar_emoji,
        avatar_color: response.data.avatar_color,
        avatar_url: response.data.avatar_url,
      });
      setProfile(response.data);
    } catch (err) {
      console.error("Error loading public profile:", err);
      setError("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  const checkFriend = async () => {
    try {
      const response = await chatApi.checkFriendship(userId);
      setFriendshipStatus(response.data.status);
    } catch (err) {
      console.error("Error checking friendship:", err);
    }
  };

  const handleAddFriend = async () => {
    setSendingRequest(true);
    try {
      await chatApi.sendFriendRequest(userId);
      setFriendshipStatus("pending");
    } catch (err) {
      console.error("Error sending friend request:", err);
    } finally {
      setSendingRequest(false);
    }
  };

  return {
    profile,
    friendshipStatus,
    loading,
    error,
    sendingRequest,
    handleAddFriend,
    reload: loadProfile,
  };
}
