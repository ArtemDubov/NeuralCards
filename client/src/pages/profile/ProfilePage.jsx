import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import DeleteAccountModal from "../../components/common/DeleteAccountModal";
import PageShell from "../../components/layout/PageShell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "../../utils/icons";

// Хуки
import { useProfile } from "./hooks/useProfile";
import { useAvatar } from "./hooks/useAvatar";
import { useEmail } from "./hooks/useEmail";
import { usePassword } from "./hooks/usePassword";
import { useName } from "./hooks/useName";
import { useDeleteAccount } from "./hooks/useDeleteAccount";

// Компоненты
import ProfileTopbar from "./components/ProfileTopbar";
import AvatarSection from "./components/AvatarSection";
import BioSection from "./components/BioSection";

// Модальные окна
import EmailModal from "./modals/EmailModal";
import PasswordModal from "./modals/PasswordModal";
import ImageModal from "./modals/ImageModal";
import NameModal from "./modals/NameModal";
import AvatarSettingsModal from "./modals/AvatarSettingsModal";

export default function ProfilePage() {
  const { user, logout, loadUser } = useAuth();
  const { currentTheme } = useTheme();
  const toast = useToast();

  // Состояние формы профиля
  const [formData, setFormData] = useState({
    bio: "",
    avatar_type: "letter",
    avatar_emoji: "👤",
    avatar_color: "var(--nt-primary)",
    avatar_url: "",
    last_avatar_emoji: "👤",
    last_avatar_color: "var(--nt-primary)",
    dark_mode: false,
  });

  // Хуки
  const { profile, loadProfile, updateProfile } = useProfile(toast, loadUser);
  const {
    imagePreview,
    setImagePreview,
    handleImageSelect,
    handleImageUpload,
    handleRemoveAvatarPhoto,
  } = useAvatar(toast, loadProfile, loadUser);
  
  const {
    emailForm,
    setEmailForm,
    showModal: showEmailModal,
    openModal: openEmailModal,
    closeModal: closeEmailModal,
    handleChangeEmail,
  } = useEmail(toast, loadProfile, loadUser);
  
  const {
    passwordForm,
    setPasswordForm,
    passwordStrength,
    showModal: showPasswordModal,
    openModal: openPasswordModal,
    closeModal: closePasswordModal,
    handleChangePassword,
  } = usePassword(toast);
  
  const {
    nameForm,
    setNameForm,
    showModal: showNameModal,
    openModal: openNameModal,
    closeModal: closeNameModal,
    handleChangeName,
  } = useName(toast, loadProfile, loadUser);
  
  const {
    deletePassword,
    setDeletePassword,
    showModal: showDeleteModal,
    loading: deleteLoading,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    handleDeleteAccount,
  } = useDeleteAccount(toast, logout);

  // Состояния модальных окон аватара
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAvatarSettingsModal, setShowAvatarSettingsModal] = useState(false);

  // Обработчики
  const handleBioChange = async (value) => {
    setFormData({ ...formData, bio: value });
    // Автосохранение биографии при изменении
    await updateProfile({ ...formData, bio: value });
  };

  // Обновляем formData при загрузке профиля или user
  React.useEffect(() => {
    const profileData = profile?.profile || user?.profile;
    if (profileData) {
      setFormData({
        bio: profileData.bio || "",
        avatar_type: profileData.avatar_type || "letter",
        avatar_emoji: profileData.avatar_emoji || "👤",
        avatar_color: profileData.avatar_color || "var(--nt-primary)",
        avatar_url: profileData.avatar_url || "",
        last_avatar_emoji: profileData.last_avatar_emoji || "👤",
        last_avatar_color: profileData.last_avatar_color || "var(--nt-primary)",
        dark_mode: profileData.dark_mode || false,
      });
    }
  }, [profile, user]);

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon icon={faUser} style={{ marginRight: "8px", color: currentTheme.primary }} />
          Профиль
        </h1>
      </div>

      {/* Секция аватара */}
      <AvatarSection
        user={user}
        profile={profile}
        formData={formData}
        onAvatarClick={() => setShowAvatarSettingsModal(true)}
        onNameChange={openNameModal}
        onEmailChange={openEmailModal}
        onPasswordChange={openPasswordModal}
        onDeleteAccount={openDeleteModal}
        onLogout={logout}
      />

      {/* Секция биографии */}
      <BioSection
        bio={formData.bio}
        onBioChange={handleBioChange}
      />

      {/* Модальные окна */}
      {showEmailModal && (
        <EmailModal
          emailForm={emailForm}
          setEmailForm={setEmailForm}
          onClose={closeEmailModal}
          onSubmit={handleChangeEmail}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          passwordStrength={passwordStrength}
          onClose={closePasswordModal}
          onSubmit={handleChangePassword}
        />
      )}

      {showImageModal && (
        <ImageModal
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          onClose={() => {
            setShowImageModal(false);
            setImagePreview(null);
          }}
          onSubmit={() => handleImageUpload(formData, setFormData)}
        />
      )}

      {showAvatarSettingsModal && (
        <AvatarSettingsModal
          formData={formData}
          setFormData={setFormData}
          user={user}
          onClose={() => setShowAvatarSettingsModal(false)}
          onSave={async (newData) => {
            // Сначала обновляем локальное состояние
            setFormData(newData);
            // Затем сохраняем на сервер
            await updateProfile(newData);
            setShowAvatarSettingsModal(false);
          }}
          onImageSelect={(file) => {
            setImagePreview(URL.createObjectURL(file));
            setShowImageModal(true);
            setShowAvatarSettingsModal(false);
          }}
          onRemovePhoto={() => {
            handleRemoveAvatarPhoto(formData, setFormData);
            setShowAvatarSettingsModal(false);
          }}
        />
      )}

      {showNameModal && (
        <NameModal
          nameForm={nameForm}
          setNameForm={setNameForm}
          onClose={closeNameModal}
          onSubmit={handleChangeName}
        />
      )}

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        password={deletePassword}
        setPassword={setDeletePassword}
        loading={deleteLoading}
        currentTheme={currentTheme}
      />
    </PageShell>
  );
}
