# HiO-core 設計書

## 1. 概要

このドキュメントは、Discord Bot「HiO-core」の設計と開発方法について記述したものです。
新規参画者がこのプロジェクトの開発にスムーズに参加できることを目的としています。

HiO-coreは、Discord.js v14をベースにしたTypeScript製のDiscord Botフレームワークです。
主な機能として、特定のメッセージ（プレフィックス）に反応してコマンドを実行するメッセージトリガー型のコマンド機構を備えています。

## 2. プロジェクトの技術スタック

-   **言語:** TypeScript
-   **実行環境:** Node.js
-   **主要ライブラリ:**
    -   [Discord.js](https://discord.js.org/): Discord APIとの連携
    -   [Prisma](https://www.prisma.io/): データベースORM
-   **パッケージマネージャー:** pnpm

## 3. アーキテクチャとディレクトリ構造

本プロジェクトは、機能ごとに責務を分離したディレクトリ構造を採用しています。

```
HiO-core/
├── prisma/              # Prismaスキーマとマイグレーションファイル
│   └── schema.prisma
├── src/
│   ├── core/            # Botのコア機能（コマンドハンドラなど）
│   │   ├── messageTriggerCommand/ # メッセージトリガーコマンドの基盤
│   │   └── prisma/
│   ├── msgTrigger/      # メッセージトリガーコマンドの実装
│   │   └── commands/    # コマンドクラスの配置場所
│   ├── types/           # プロジェクト共通の型定義
│   │   └── command.ts   # コマンドのインターフェース定義
│   ├── bot.ts           # Discordクライアントの初期化
│   └── main.ts          # アプリケーションのエントリーポイント
├── package.json         # 依存関係とスクリプト
└── tsconfig.json        # TypeScriptコンパイル設定
```

### 3.1. 主要コンポーネント

-   **`main.ts`**:
    -   アプリケーションの起動点です。
    -   環境変数を読み込み、Discord Botをログインさせます。
    -   `messageCreate` イベントを監視し、受信したメッセージをコマンド処理機構に渡します。
-   **`bot.ts`**:
    -   Discordクライアント（`Client`）を生成し、必要な`Intents`（Botが受け取るイベントの種類）や`Partials`を設定します。
-   **`core/messageTriggerCommand/`**:
    -   メッセージによってコマンドを実行するための基盤となるロジックが格納されています。
    -   **`messageCommandFactory.ts`**: 受信したメッセージを解析し、適切なコマンドの`execute`メソッドを実行します。
    -   **`messageCommandNameInstanceFactory.ts`**: `src/msgTrigger/commands/`内のコマンドファイルを動的に読み込み、コマンド名とクラスインスタンスのペアを生成します。
    -   **`messageCommandNameTriggerFactory.ts`**: コマンドのトリガー（プレフィックス）とコマンド名のペアを生成します。
-   **`msgTrigger/commands/`**:
    -   実際のコマンド処理を記述するクラスを配置します。
    -   ここに追加されたコマンドは、起動時に自動的に読み込まれます。
-   **`types/command.ts`**:
    -   コマンドクラスが実装すべき`MessageCommand`インターフェースを定義しています。

## 4. 開発フロー

### 4.1. セットアップ

1.  リポジトリをクローンします。
2.  pnpmをインストールします。
3.  依存関係をインストールします。
    ```bash
    pnpm install
    ```
4.  `.env.development` ファイルを作成し、環境変数を設定します。
    ```env
    # .env.development
    TOKEN=YOUR_DISCORD_BOT_TOKEN
    BOT_NAME=HiO-core-dev
    ADMIN_USER=YOUR_DISCORD_USER_ID
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```

### 4.2. 開発サーバーの起動

以下のコマンドで開発サーバーを起動します。ファイル変更を監視し、自動的に再起動します。

```bash
pnpm run dev-watcher
```

### 4.3. 新規メッセージトリガーコマンドの追加方法

新しいコマンドを追加する手順は以下の通りです。`ping`コマンド（`src/msgTrigger/commands/ping.ts`）がシンプルな実装例となります。

1.  **コマンドクラスの作成:**
    `src/msgTrigger/commands/`ディレクトリに、新しいTypeScriptファイルを作成します。（例: `hello.ts`）

2.  **`MessageCommand`インターフェースの実装:**
    作成したファイル内で、`MessageCommand`インターフェースを実装したクラスを定義します。

    ```typescript
    // src/msgTrigger/commands/hello.ts
    import { Message } from "discord.js";
    import type { MessageCommand } from "../../types/command.js";

    export default class hello implements MessageCommand {
      // コマンド名（ファイル名やクラス名と一致させる）
      name: string = 'hello';

      // コマンドを起動するプレフィックス
      prefix: string = '!hello';

      // エイリアス（別名）のプレフィックス
      aliasPrefix: string = '！こんにちは';

      // 実行される処理
      execute = async (ctx: Message): Promise<void> => {
        ctx.reply('Hello, world!');
      }
    }
    ```

3.  **動作確認:**
    開発サーバーを起動（または再起動）すると、新しいコマンドが自動的に読み込まれます。
    Discordで`!hello`または`！こんにちは`とメッセージを送信し、Botが`Hello, world!`と返信すれば完了です。

### 4.4. データベースマイグレーション

Prismaを使用してデータベースのスキーマを管理します。

1.  **スキーマの編集:**
    `prisma/schema.prisma` を編集して、モデルを定義・変更します。

2.  **マイグレーションの実行:**
    以下のコマンドでマイグレーションファイルを作成し、データベースに適用します。

    ```bash
    # 開発環境の場合
    pnpm run dev-prisma-migrate --name <migration_name>
    ```

3.  **Prisma Clientの生成:**
    マイグレーション後、以下のコマンドで型安全なPrisma Clientを再生成します。

    ```bash
    pnpm run dev-prisma-generate
    ```
