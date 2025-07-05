document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key-input');
  const saveBtn = document.getElementById('save-api-key');
  const saveStatus = document.getElementById('save-status');

  // 保存済みAPIキーを表示（マスク）
  chrome.storage.local.get(['OPENAI_API_KEY'], (result) => {
    if (result.OPENAI_API_KEY) {
      apiKeyInput.value = result.OPENAI_API_KEY;
    }
  });

  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key.startsWith('sk-')) {
      chrome.storage.local.set({ OPENAI_API_KEY: key }, () => {
        saveStatus.textContent = '保存しました';
        setTimeout(() => (saveStatus.textContent = ''), 1500);
      });
    } else {
      saveStatus.textContent = '無効なキー';
      setTimeout(() => (saveStatus.textContent = ''), 1500);
    }
  });
});
