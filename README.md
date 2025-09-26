# nicolist

ニコニコ動画の **マイリスト上限** を回避し、自由に管理できる **カスタムプレイリスト** を作成・編集できる Chrome 拡張です。



## 特長

- **プレイリスト作成／削除**  
  任意の名前で作成、不要になったらワンクリック削除  
- **動画追加**  
  視聴中の動画 ID（例：`sm9`）を取得してプレイリストに登録  
- **メタ情報取得**  
  バックグラウンドでニコニコ API を呼び出し、タイトル・説明などを取得  
- **シンプル UI**  
  拡張アイコンのポップアップで一覧表示  
- **ローカル保存**  
  データはブラウザのストレージに保存（サーバ不要）



## インストール方法

1. 本リポジトリを **Clone** するか ZIP をダウンロードして解凍  
2. Chrome で `chrome://extensions/` を開く  
3. 右上の **デベロッパーモード** を ON  
4. **パッケージ化されていない拡張機能を読み込む** → 解凍した `src/` フォルダを選択  


## 使い方

### 1. プレイリストを作る
- ニコニコ動画の視聴ページを開く 
- ハンバーガーメニューからニコリストに追加を選択
- <img width="257" height="314" alt="image" src="https://github.com/user-attachments/assets/8b9a199b-b08d-4df4-881e-400a3197f813" />

- 新しいプレイリスト名を入力して作成ボタンを選択
- <img width="250" height="130" alt="image" src="https://github.com/user-attachments/assets/bd8f89bc-2d68-401c-87a5-582b147766c2" />


### 2. 動画を追加する
- ニコニコ動画の視聴ページを開く
- ハンバーガーメニューからニコリストに追加を選択
- ポップアップから対象プレイリストを選び「追加」
- <img width="233" height="110" alt="image" src="https://github.com/user-attachments/assets/c6aba3d1-1410-491a-83e4-106ba3ebe8d2" />


### 3. プレイリストを管理する
- ブラウザ右上の拡張機能アイコンからニコリストをクリック
- ポップアップにプレイリストとプレイリスト内の動画が表示される
- 各プレイリストには「削除」ボタンあり  
- 動画は一覧表示されクリックで再生
- <img width="542" height="378" alt="image" src="https://github.com/user-attachments/assets/5bb14e0c-fe32-4db8-9944-55911e378987" />


## クレジット
- ニコニコ動画 サムネイル API (`getthumbinfo`) を利用しています  
- 制作者: [@ShinnosukeKataoka](https://github.com/ShinnosukeKataoka)
