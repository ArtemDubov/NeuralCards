# Скрипт для полной миграции стилей ProfilePage.jsx
# Заменяет style={modalStyles.xxx} и style={{...}} на соответствующие className

$filePath = "client\src\pages\profile\ProfilePage.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Маппинг modalStyles свойств к CSS классам
$styleMappings = @{
    'modalStyles\.overlay' = 'className="modal-overlay"'
    'modalStyles\.modal' = 'className="modal-container"'
    'modalStyles\.closeButton' = 'className="modal-close-btn"'
    'modalStyles\.title' = 'className="modal-title"'
    'modalStyles\.label' = 'className="profile-label"'
    'modalStyles\.input' = 'className="profile-input"'
    'modalStyles\.textarea' = 'className="profile-textarea"'
    'modalStyles\.actions' = 'className="modal-actions"'
    'modalStyles\.cancelButton' = 'className="profile-btn-secondary"'
    'modalStyles\.submitButton' = 'className="profile-btn-primary"'
    'modalStyles\.emojiGrid' = 'className="emoji-grid"'
    'modalStyles\.emojiButton' = 'className="emoji-button"'
    'modalStyles\.colorGrid' = 'className="color-grid"'
    'modalStyles\.colorButton' = 'className="color-button"'
    'modalStyles\.colorPicker' = 'className="color-picker-input"'
    'modalStyles\.colorText' = 'className="color-text-input"'
    'modalStyles\.applyColorButton' = 'className="profile-btn-primary"'
    'modalStyles\.imagePreview' = 'className="image-preview"'
    'modalStyles\.uploadButton' = 'className="upload-button"'
    'modalStyles\.selectButton' = 'className="select-button"'
    'modalStyles\.formGroup' = 'className="profile-form-group"'
    'modalStyles\.strengthContainer' = 'className="password-strength-container"'
    'modalStyles\.strengthLabel' = 'className="password-strength-label"'
    'modalStyles\.strengthBar' = 'className="password-strength-bar"'
    'modalStyles\.strengthFill' = 'className="password-strength-fill"'
    'modalStyles\.imagePreviewContainer' = 'className="image-preview-container"'
    'modalStyles\.imagePlaceholder' = 'className="image-placeholder"'
}

Write-Host "Начинаем миграцию стилей..."
Write-Host "Файл: $filePath"

# Применяем замены
foreach ($key in $styleMappings.Keys) {
    $pattern = "style=\{$key\}"
    $replacement = $styleMappings[$key]
    
    if ($content -match [regex]::Escape($pattern)) {
        $content = $content -replace [regex]::Escape($pattern), $replacement
        Write-Host "Заменено: $key -> $($styleMappings[$key])"
    }
}

# Сохраняем файл
Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "`nМиграция завершена!"
Write-Host "Проверьте файл на ошибки с помощью get_problems"
