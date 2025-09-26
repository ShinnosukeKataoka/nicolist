
// === popup.js ===
// 拡張機能のポップアップ画面用スクリプト

// UI 初期化
window.addEventListener('DOMContentLoaded', () => {
  loadPlaylists(renderPlaylists);

  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importData);
});

// プレイリスト表示
function renderPlaylists(data) {
  const container = document.getElementById('playlistContainer');
  container.innerHTML = '';

  //各プレイリストごとにセクションを作成
  (data.playlists || []).forEach((pl) => {
    const playlist = document.createElement('section');
    playlist.className = 'playlists';

    const playlistTitle = document.createElement('h2');
    playlistTitle.textContent = pl.name;
    playlist.appendChild(playlistTitle);


    
    //プレイリスト内の各動画を描画
    const videoContainer = document.createElement('div');
    (pl.videos || []).forEach((video, index) => {
      const videoCard = document.createElement('div');
      videoCard.className = 'video-Cards inline-flex';
      // クリックで動画再生
      videoCard.addEventListener('click', () => {
        window.open(`https://www.nicovideo.jp/watch/${video.videoId}`, '_blank');
      });
      
      // left side 
      const cardLeft = document.createElement('div');
      cardLeft.className = 'card-left';
      videoCard.appendChild(cardLeft);

      const thumbnail = document.createElement('img');
      thumbnail.src = video.thumbnailUrl;
      thumbnail.alt = video.title || 'サムネイル';
      thumbnail.className = 'thumbnail';
      cardLeft.appendChild(thumbnail);

      const videotime = document.createElement('p');
      videotime.textContent = video.length || '0:00';
      videotime.className = 'video-time';
      cardLeft.appendChild(videotime);

      // right side
      const cardRight = document.createElement('div');
      cardRight.className = 'card-right';
      videoCard.appendChild(cardRight);


      const title = document.createElement('h3');
      title.textContent = `${video.title} (${video.videoId})`;
      title.className = 'video-title';
      cardRight.appendChild(title);

      const authorPostdateContainer = document.createElement('div');
      authorPostdateContainer.className = 'author-postdate-container inline-flex';
      cardRight.appendChild(authorPostdateContainer);

      const author = document.createElement('p');
      author.textContent = `投稿者: ${video.owner.userNickname || '不明'}`;
      author.className = 'video-author';
      authorPostdateContainer.appendChild(author);

      const postDate = document.createElement('p');
      postDate.textContent = `投稿日: ${video.firstRetrieve ? new Date(video.firstRetrieve).toLocaleDateString() : '不明'}`;
      postDate.className = 'video-postdate';
      authorPostdateContainer.appendChild(postDate);


      const videoDescription = document.createElement('p');
      videoDescription.textContent = video.discription || '説明なし';
      videoDescription.className = 'video-description';
      cardRight.appendChild(videoDescription);

      // 追加日 + 削除ボタン
      const addedDelContainer = document.createElement('div');
      addedDelContainer.className = 'added-del-container inline-flex';
      cardRight.appendChild(addedDelContainer);

      const dateAdded = document.createElement('p');
      dateAdded.textContent = `追加日: ${new Date(video.addedAt).toLocaleString()}`;
      dateAdded.className = 'date-added';
      addedDelContainer.appendChild(dateAdded);

      const delBtn = document.createElement('button');
      delBtn.textContent = '削除';
      delBtn.className = 'delete-button';
      delBtn.addEventListener('click', (event) => {
        //動画再生を防止
        event.stopPropagation();
        //動画削除
        pl.videos.splice(index, 1);
        savePlaylists(data, () => renderPlaylists(data));
      });
      addedDelContainer.appendChild(delBtn);



      // Append video element to container
      videoContainer.appendChild(videoCard);
    });
    // Append video container to playlist
    playlist.appendChild(videoContainer);
    // Append playlist to main container
    container.appendChild(playlist);
  });
}

// データのエクスポート
function exportData() {
  chrome.storage.local.get(['nicolist_data'], (result) => {
    const blob = new Blob([result.nicolist_data || '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nicolist_backup.json';
    a.click();
  });
}

// データのインポート
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      chrome.storage.local.set({ nicolist_data: JSON.stringify(json) }, () => {
        loadPlaylists(renderPlaylists);
      });
    } catch (e) {
      alert('無効なJSONファイルです');
    }
  };
  reader.readAsText(file);
}


//ストレージ
// ストレージから読み込む共通関数
function loadPlaylists(callback) {
  chrome.storage.local.get(['nicolist_data'], (result) => {
    try {
      const data = JSON.parse(result.nicolist_data || '{}');
      callback(data);
    } catch (e) {
      // 解析エラー時は空データを返す
      callback({ playlists: [] });
    }
  });
}

// ストレージへ保存する共通関数
function savePlaylists(data, callback) {
  chrome.storage.local.set({ nicolist_data: JSON.stringify(data) }, () => {
    if (callback) callback();
  });
}
