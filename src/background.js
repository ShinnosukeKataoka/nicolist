// background.js


// ニコニコのAPIにアクセスして動画情報を取得する
chrome.runtime.onMessage.addListener((message ,sender, sendResponse) => {
    if (message.type === "FETCH_VIDEO_INFO") {
      (async () => {
      try {
        const apiUrl = `https://ext.nicovideo.jp/api/getthumbinfo/${encodeURIComponent(message.videoId)}`;
        const res = await fetch(apiUrl, { headers: { "Content-Type": "application/xml" } });
        const text = await res.text();
        sendResponse({
          success: res.ok,
          data: res.ok ? text : null,
          error: res.ok ? null : `HTTP ${res.status}`
        });
      } catch (e) {
        sendResponse({ success: false, data: null, error: String(e?.message || e) });
      }
    })();

    return true; // 非同期で応答するためにtrueを返す
  }
});
