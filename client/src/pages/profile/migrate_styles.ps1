# Скрипт миграции ProfilePage с inline-стилей на CSS классы
# Заменяет style={styles.xxx} на className="xxx"

$file = "ProfilePage.jsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Карта замен: styles.xxx -> className
$replacements = @{
    'style=\{styles\.topBar\}' = 'className="profile-topbar"'
    'style=\{styles\.topBarLeft\}' = 'className="profile-topbar-left"'
    'style=\{\s*\.\.\.styles\.pageTitle,\s*color:\s*currentTheme\?\.text\s*\|\|\s*"\#333"\s*\}' = 'className="profile-title"'
    'style=\{styles\.topBarActions\}' = 'className="profile-topbar-actions"'
    'style=\{styles\.iconButton\}' = 'className="profile-icon-btn"'
    'style=\{styles\.iconButtonCancel\}' = 'className="profile-icon-btn-cancel"'
    'style=\{styles\.iconButtonSave\}' = 'className="profile-icon-btn-save"'
    'style=\{styles\.dropdown\}' = 'className="profile-dropdown"'
    'style=\{styles\.menuButton\}' = 'className="profile-menu-btn"'
    'style=\{styles\.dropdownMenu\}' = 'className="profile-dropdown-menu"'
    'style=\{styles\.dropdownItem\}' = 'className="profile-dropdown-item"'
    'style=\{styles\.dropdownItemDanger\}' = 'className="profile-dropdown-item-danger"'
    'style=\{styles\.dropdownDivider\}' = 'className="profile-dropdown-divider"'
    'style=\{styles\.section\}' = 'className="profile-section"'
    'style=\{styles\.avatarSection\}' = 'className="profile-avatar-section"'
    'style=\{styles\.avatarClickableWrapper\}' = 'className="profile-avatar-clickable"'
    'style=\{styles\.avatarPreview\}' = 'className="profile-avatar-preview"'
    'style=\{styles\.avatarImage\}' = 'className="profile-avatar-image"'
    'style=\{styles\.avatarEditOverlay\}' = 'className="profile-avatar-edit-overlay"'
    'style=\{styles\.avatarEmoji\}' = 'className="profile-avatar-emoji"'
    'style=\{styles\.avatarLetter\}' = 'className="profile-avatar-letter"'
    'style=\{styles\.avatarHint\}' = 'className="profile-avatar-hint"'
    'style=\{styles\.avatarOptions\}' = 'className="profile-avatar-options"'
    'style=\{styles\.optionGroup\}' = 'className="profile-avatar-option-group"'
    'style=\{styles\.quickActions\}' = 'className="profile-avatar-quick-actions"'
    'style=\{styles\.actionButton\}' = 'className="profile-action-btn"'
    'style=\{styles\.actionButtonDanger\}' = 'className="profile-action-btn-danger"'
    'style=\{styles\.currentSettings\}' = 'className="profile-current-settings"'
    'style=\{styles\.settingRow\}' = 'className="profile-setting-row"'
    'style=\{styles\.settingLabel\}' = 'className="profile-setting-label"'
    'style=\{styles\.currentSettingButton\}' = 'className="profile-setting-button"'
    'style=\{styles\.bio\}' = 'className="profile-bio-display"'
    'style=\{styles\.textarea\}' = 'className="profile-bio-textarea"'
}

# Применяем замены
foreach ($key in $replacements.Keys) {
    $content = $content -replace $key, $replacements[$key]
}

# Сохраняем файл
Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline

Write-Host "Миграция завершена! Заменено $($replacements.Count) типов стилей."
