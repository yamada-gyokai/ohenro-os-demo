# ohenro-os

四国遍路における通過型観光を消費行動に変換するPoC。  
QR起点でユーザー行動を取得し、宿・体験への導線を可視化する。

## 構成

| レイヤー | 技術 |
|---|---|
| フロント | HTML + Tailwind CSS + Vanilla JS（GitHub Pages） |
| バックエンド | Google Apps Script（GAS） |
| データ | Googleスプレッドシート（シート名: `log`） |

## ファイル構成

```
index.html          # メインSPA（ユーザー向け）
dashboard.html      # 管理者向けダッシュボード
locationMaster.json # 札所・宿・クーポンの座標マスタ
gas/Code.gs         # GASコード（手動でGASエディタに貼り付け）
config/config.js    # GAS URL設定
js/app.js           # メインロジック
js/i18n.js          # 多言語テキスト
```

## GAS API

### doPost — ログ受信

フロントから `sendLog()` が呼ぶ。受信データをスプレッドシートに追記する。

### doGet — ログ一覧取得

スプレッドシートの `log` シート全行をJSON配列で返す。  
dashboard.html からの呼び出しを想定。

**レスポンス例**
```json
[
  { "timestamp": "2026-05-13T10:00:00Z", "event": "inn_select", "inn": "inn_01", "lat": 33.667, "lng": 132.973 },
  ...
]
```

**フロント側fetch雛形**（dashboard.htmlへの組み込みは別途実装）
```js
fetch("https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec")
  .then(res => res.json())
  .then(data => {
    console.log(data);
  });
```

## GASデプロイ手順

`gas/Code.gs` の内容をGASエディタに貼り付けた後、以下を実施する。

1. GASエディタ右上「デプロイ」→「新しいデプロイ」
2. 種類：**ウェブアプリ**
3. 説明：任意（例: `ohenro-os v1`）
4. 実行ユーザー：**自分**
5. アクセスできるユーザー：**全員**
6. 「デプロイ」をクリック → 表示されたURLをコピー
7. `config/config.js` の `GAS_URL` に貼り付ける

> doGet を追加・変更した場合は「新しいデプロイ」ではなく「デプロイを管理」→「編集」→バージョンを新しく作成して更新する。

## ローカル開発

GitHub Pages はそのまま `main` ブランチを参照。  
`index.html` / `dashboard.html` をブラウザで直接開いても動作する（GAS通信はCORS制限あり）。
