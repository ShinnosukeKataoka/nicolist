// === content_script.js ===

// ——————————————————————————————————————————————————
// ユーティリティ関数：ニコニコ動画の videoId を取得する
// ——————————————————————————————————————————————————
// URL 例： https://www.nicovideo.jp/watch/sm12345678
function getVideoIdFromUrl() {
  const url = location.href;
  const match = url.match(/\/watch\/([a-z0-9]+)/i);
  return match ? match[1] : null;
}

// ——————————————————————————————————————————————————
// ユーティリティ関数：chrome.storage.local からプレイリストデータを取得する
// ——————————————————————————————————————————————————
// まだ保存がなければ、{ playlists: [] } を返す
function loadPlaylists(callback) {
  chrome.storage.local.get(['nicolist_data'], (result) => {
    if (result.nicolist_data) {
      try {
        const data = JSON.parse(result.nicolist_data);
        callback(data);
      } catch (e) {
        console.error('nicolist_data parse error:', e);
        callback({ playlists: [] });
      }
    } else {
      callback({ playlists: [] });
    }
  });
}

// ——————————————————————————————————————————————————
// ユーティリティ関数：chrome.storage.local にプレイリストデータを保存する
// ——————————————————————————————————————————————————
function savePlaylists(data, callback) {
  chrome.storage.local.set({ nicolist_data: JSON.stringify(data) }, () => {
    if (callback) callback();
  });
}

// ——————————————————————————————————————————————————
// メイン：ページ読み込み時に「ニコリスト」ボタンを挿入する
// ——————————————————————————————————————————————————
function insertNicoListButton() {
  // 「マイリストに追加」メニュー項目を特定
  const mylistMenuItem = Array.from(document.querySelectorAll('[role="menuitem"]')).find((el) => {
    return el.textContent.includes("マイリストに追加");
  });

  if (!mylistMenuItem) {
    console.warn('「マイリストに追加」項目が見つかりませんでした。');
    return;
  }

  // 「ニコリスト」ボタンを生成（同じクラスを継承）
  const nicoListItem = mylistMenuItem.cloneNode(true);
  const nicoButton = nicoListItem.querySelector('button');
  if (nicoButton) {
    nicoButton.textContent = 'ニコリストに追加';
    nicoButton.setAttribute('data-element-name', 'nicolist');
    
    nicoButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleDropdown(e.currentTarget); // 既存の処理を呼ぶ
    });
    
  }

  // マイリストに追加のすぐあとに挿入
  mylistMenuItem.parentNode.insertBefore(nicoListItem, mylistMenuItem.nextSibling);
}


// ——————————————————————————————————————————————————
// ドロップダウンメニューを表示／非表示 切り替え
// ——————————————————————————————————————————————————
function toggleDropdown(buttonElem) {
  let dropdown = document.getElementById('nico-list-dropdown');

  if (dropdown) {
    // すでに生成済みの場合はトグル
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) positionDropdown(buttonElem, dropdown);
  } else {
    // まだ生成していないなら新規作成
    dropdown = createDropdownMenu();
    document.body.appendChild(dropdown);
    positionDropdown(buttonElem, dropdown);
    loadAndRenderPlaylists(dropdown);
  }

  // ドロップダウンの外をクリックしたら閉じるようにリスナーを追加
  document.addEventListener('click', onDocumentClick);
}

// ——————————————————————————————————————————————————
// ドロップダウンの位置をボタンのすぐ下に合わせる
// ——————————————————————————————————————————————————
function positionDropdown(buttonElem, dropdownElem) {
  const rect = buttonElem.getBoundingClientRect();
  dropdownElem.style.top = `${rect.bottom + window.scrollY + 4}px`;
  dropdownElem.style.left = `${rect.left + window.scrollX}px`;
}

// ——————————————————————————————————————————————————
// ドロップダウン以外をクリックしたら閉じる
// ——————————————————————————————————————————————————
function onDocumentClick(event) {
  const dropdown = document.getElementById('nico-list-dropdown');

  if (dropdown.style.display == 'none' ) return;

  if (!dropdown.contains(event.target)) {
    dropdown.style.display = 'none';
    document.removeEventListener('click', onDocumentClick);
  }
}

// ——————————————————————————————————————————————————
// ドロップダウンの HTML 要素を生成する
// ——————————————————————————————————————————————————
function createDropdownMenu() {
  const container = document.createElement('div');
  container.id = 'nico-list-dropdown';

  // プレイリスト項目を挿入するエリア
  const listArea = document.createElement('div');
  listArea.id = 'nico-list-listarea';
  container.appendChild(listArea);

  // 「新規プレイリスト作成」フォーム
  const createArea = document.createElement('div');
  createArea.id = 'nico-list-create';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '新しいプレイリスト名';
  input.id = 'nico-list-newname';

  const createBtn = document.createElement('button');
  createBtn.textContent = '作成';
  createBtn.addEventListener('click', () => {
    const name = input.value.trim();
    if (name) {
      createNewPlaylist(name, () => {
        input.value = ''; // フィールドをクリア
        loadAndRenderPlaylists(container);
      });
    } else {
      alert('プレイリスト名を入力してください。');
    }
  });

  createArea.appendChild(input);
  createArea.appendChild(createBtn);
  container.appendChild(createArea);

  return container;
}

// ——————————————————————————————————————————————————
// ストレージからプレイリストデータを取得し、ドロップダウンに表示する
// ——————————————————————————————————————————————————
function loadAndRenderPlaylists(dropdownElem) {
  const listArea = dropdownElem.querySelector('#nico-list-listarea');
  listArea.innerHTML = ''; // 既存のリストをクリア

  loadPlaylists((data) => {
    const playlists = data.playlists || [];
    if (playlists.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'nico-list-item';
      emptyMsg.textContent = 'プレイリストがありません';
      emptyMsg.style.color = '#888';
      listArea.appendChild(emptyMsg);
      return;
    }

    // 各プレイリストを1行ずつ追加
    playlists.forEach((pl) => {
      const item = document.createElement('div');
      item.className = 'nico-list-item';
      item.textContent = pl.name;
      // data 属性に playlistId を保持
      item.dataset.playlistId = pl.id;
      item.addEventListener('click', () => {
        addVideoToPlaylist(pl.id, () => {
          alert(`「${pl.name}」に動画を追加しました。`);
        });
      });
      listArea.appendChild(item);
    });
  });
}

// ——————————————————————————————————————————————————
// 新規プレイリストを作成する
// ——————————————————————————————————————————————————
function createNewPlaylist(name, callback) {
  loadPlaylists((data) => {
    const playlists = data.playlists || [];

    // 一意な ID を簡易に生成（ランダム文字列＋日時）
    const newId = 'plist-' + Math.random().toString(36).substr(2, 9) + Date.now();

    playlists.push({
      id: newId,
      name: name,
      videos: []
    });

    const newData = { playlists };
    savePlaylists(newData, () => {
      if (callback) callback();
    });
  });
}


// ——————————————————————————————————————————————————
// 指定されたプレイリスト ID から、現在再生中の動画を削除する
// ——————————————————————————————————————————————————
function removeVideoFromPlaylist(playlistId, videoId, callback) {
  loadPlaylists((data) => {
    const playlists = data.playlists || [];
    const target = playlists.find((pl) => pl.id === playlistId);
    if (!target) {
      alert('指定したプレイリストが見つかりませんでした。');
      return;
    }

    // 動画を検索して削除
    const index = target.videos.findIndex((v) => v.videoId === videoId);
    if (index === -1) {
      alert('指定した動画はプレイリストに存在しません。');
      return;
    }

    target.videos.splice(index, 1);

    // 保存
    savePlaylists({ playlists }, () => {
      if (callback) callback();
    });
  });
}



// ——————————————————————————————————————————————————
// 指定されたプレイリスト ID に、現在再生中の動画を追加する
// ——————————————————————————————————————————————————
function addVideoToPlaylist(playlistId, callback) {
  const videoId = getVideoIdFromUrl();
  if (!videoId) {
    alert('動画IDが取得できませんでした。');
    return;
  }

  loadPlaylists(async (data) => {
    const playlists = data.playlists || [];
    const target = playlists.find((pl) => pl.id === playlistId);
    if (!target) {
      alert('指定したプレイリストが見つかりませんでした。');
      return;
    }

    // 既に登録済みかチェック
    const exists = target.videos.some((v) => v.videoId === videoId);
    if (exists) {
      alert('この動画はすでにプレイリストに登録されています。');
      return;
    }

    // API から動画情報を取得
    let videoInfo;
    try {
      videoInfo = await fetchVideoInfo(videoId);
      console.log(videoInfo);
    } catch (e) {
      console.error('動画情報の取得に失敗:', e);
    }

    // 動画情報を追加
    target.videos.push({
      videoId: videoId,
      title: videoInfo.title || 'タイトル不明',
      discription: videoInfo.description || '',
      thumbnailUrl: videoInfo.thumbnailUrl || '',
      url: videoInfo.url || `https://www.nicovideo.jp/watch/${videoId}`,
      length: videoInfo.length || '',
      viewCount: videoInfo.viewCount || 0,
      commentCount: videoInfo.commentCount || 0,
      firstRetrieve: videoInfo.firstRetrieve || '',
      owner: videoInfo.owner || { userId: '', userNickname: '' },
      addedAt: new Date().toISOString(),
    });

    // 保存
    savePlaylists({ playlists }, () => {
      if (callback) callback();
    });
  });
}


// ——————————————————————————————————————————————————
//ニコニコのAPIを使って動画情報を取得する
// ——————————————————————————————————————————————————
function fetchVideoInfo(videoId) {

  // 動画情報を含んだプロミス型 を返すラッパー
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "FETCH_VIDEO_INFO", videoId }, (response) => {
      if (!response.success) {
        reject(new Error(response.error));
      } else {
        const text = response.data;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const info = xml.querySelector("thumb");
        const pick = (sel) => info?.querySelector(sel)?.textContent ?? null;

        //json形式に変換
        resolve({
          videoId:       pick('video_id'),
          title:         pick('title'),
          description:   pick('description'),
          length:        pick('length'),
          url:           pick('watch_url'),
          thumbnailUrl:  pick('thumbnail_url'),
          firstRetrieve: pick('first_retrieve'),
          viewCount:     Number(pick('view_counter')),
          commentCount:  Number(pick('comment_num')),
          owner: {
            userId:       pick('user_id'),
            userNickname: pick('user_nickname'),
          }
        });
      }
    });
  });


}


// ——————————————————————————————————————————————————
// 初期化：DOM が準備できたらボタンを挿入
// ——————————————————————————————————————————————————
function init() {
  // ページ内の要素がまだロードされていない可能性があるので、
  // 適当なタイミング（例：DOMContentLoaded または一定時間後）で実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertNicoListButton);
  } else {
    insertNicoListButton();
  }

  const observer = new MutationObserver(() => {
  const alreadyInserted = document.querySelector('[data-element-name="nicolist"]');
  if (!alreadyInserted) {
    insertNicoListButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
}

// 実行
init();