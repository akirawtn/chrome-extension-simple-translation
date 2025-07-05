let lastMouseEvent = null;
let lastSelection = '';
let showMeaningButton = null;
let meaningPopupVisible = false;

document.addEventListener('mouseup', function (e) {
  setTimeout(() => {
    if (meaningPopupVisible) return; // ポップアップ表示中はボタンを出さない
    lastMouseEvent = e;
    const selection = window.getSelection().toString().trim();
    lastSelection = selection;
    removeShowMeaningButton();
    if (selection.length > 0) {
      showShowMeaningButton(e.clientX, e.clientY);
    }
  }, 10); // 選択確定後に実行
});

document.addEventListener('mousedown', function (e) {
  // ボタンやポップアップ以外をクリックしたら消す
  if (
    !e.target.closest('#ai-show-meaning-btn') &&
    !e.target.closest('#ai-meaning-popup')
  ) {
    removeShowMeaningButton();
    removeMeaningPopup();
    meaningPopupVisible = false;
  }
});

function showShowMeaningButton(x, y) {
  if (showMeaningButton) return;
  showMeaningButton = document.createElement('button');
  showMeaningButton.id = 'ai-show-meaning-btn';
  showMeaningButton.textContent = 'translate';
  showMeaningButton.style.position = 'fixed';
  showMeaningButton.style.top = `${y + 10}px`;
  showMeaningButton.style.left = `${x + 10}px`;
  showMeaningButton.style.zIndex = 10000;
  showMeaningButton.style.padding = '6px 12px';
  showMeaningButton.style.fontSize = '14px';
  showMeaningButton.style.borderRadius = '6px';
  showMeaningButton.style.background = '#1976d2';
  showMeaningButton.style.color = '#fff';
  showMeaningButton.style.border = 'none';
  showMeaningButton.style.cursor = 'pointer';
  showMeaningButton.addEventListener('mousedown', (e) => e.stopPropagation());
  showMeaningButton.addEventListener('click', onShowMeaningButtonClick);
  document.body.appendChild(showMeaningButton);
}

function removeShowMeaningButton() {
  if (showMeaningButton) {
    showMeaningButton.removeEventListener('click', onShowMeaningButtonClick);
    showMeaningButton.remove();
    showMeaningButton = null;
  }
}

function removeMeaningPopup() {
  const oldPopup = document.getElementById('ai-meaning-popup');
  if (oldPopup) oldPopup.remove();
}

function onShowMeaningButtonClick(e) {
  e.stopPropagation();
  removeShowMeaningButton();
  if (lastSelection.length > 0) {
    meaningPopupVisible = true;
    chrome.runtime.sendMessage({ type: 'WORD_SELECTED', word: lastSelection });
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SHOW_MEANING_POPUP') {
    showMeaningPopup(msg.word, msg.meaning);
  }
});

function showMeaningPopup(word, meaning) {
  removeMeaningPopup();
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

  popup.addEventListener('mousedown', (e) => e.stopPropagation());
  // クリックで消す
  popup.addEventListener('click', () => {
    popup.remove();
    meaningPopupVisible = false;
  });
}
