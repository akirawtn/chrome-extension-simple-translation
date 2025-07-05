chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === 'WORD_SELECTED') {
    // APIキーをストレージから取得
    chrome.storage.local.get(['OPENAI_API_KEY'], async (result) => {
      const apiKey = result.OPENAI_API_KEY;
      const meaning = await fetchMeaningFromOpenAI(msg.word, apiKey);
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'SHOW_MEANING_POPUP',
        word: msg.word,
        meaning: meaning,
      });
    });
  }
});

async function fetchMeaningFromOpenAI(word, apiKey) {
  if (!apiKey) {
    return 'APIキーが設定されていません';
  }
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `「${word}」の意味を日本語で1行、英語で1行、それぞれ簡潔に教えてください。フォーマットは「日本語: ...\\nEnglish: ...」としてください。`,
        },
      ],
      max_tokens: 100,
    }),
  });
  const data = await response.json();
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  } else if (data.error) {
    return `エラー: ${data.error.message}`;
  } else {
    return '意味が取得できませんでした';
  }
}
