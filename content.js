let lastMouseEvent = null;

document.addEventListener('mouseup', function (e) {
  lastMouseEvent = e;
  const selection = window.getSelection().toString().trim();
  if (selection.length > 0) {
    chrome.runtime.sendMessage({ type: 'WORD_SELECTED', word: selection });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SHOW_MEANING_POPUP') {
    showMeaningPopup(msg.word, msg.meaning);
  }
});

function showMeaningPopup(word, meaning) {
  // 既存のポップアップを削除
  const oldPopup = document.getElementById('ai-meaning-popup');
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'ai-meaning-popup';
  popup.className = 'ai-meaning-popup';
  // \n を <br> に変換
  const formattedMeaning = meaning.replace(/\\n|\n/g, '<br>');
  popup.innerHTML = `<strong>${word}</strong><br>${formattedMeaning}`;
  document.body.appendChild(popup);

  // マウス位置に表示
  if (lastMouseEvent) {
    popup.style.top = `${lastMouseEvent.clientY + 10}px`;
    popup.style.left = `${lastMouseEvent.clientX + 10}px`;
  } else {
    popup.style.top = `100px`;
    popup.style.left = `100px`;
  }

  // クリックで消す
  popup.addEventListener('click', () => popup.remove());
}
