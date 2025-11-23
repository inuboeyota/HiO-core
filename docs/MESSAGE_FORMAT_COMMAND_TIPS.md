# `messageFormatCommand` の実装に関するTips

このドキュメントは、未実装の `messageFormatCommand` を実装する上でのヒントや方針をまとめたものです。

## 1. `messageFormatCommand`の目的（推測）

`messageTriggerCommand` が特定のプレフィックスを持つメッセージに反応するのに対し、`messageFormatCommand` は**特定の「フォーマット」に一致するメッセージを検知し、整形して応答する**機能であると推測されます。

例えば、以下のようなユースケースが考えられます。

-   **議事録フォーマット:**
    -   **入力:**
        ```
        #議題
        今日の夕飯について
        #内容
        カレーライスが食べたい
        ```
    -   **Botの応答（整形後）:**
        ```
        【議事録】
        ■議題
        今日の夕飯について
        ■内容
        カレーライスが食べたい
        ```
-   **タスク登録フォーマット:**
    -   **入力:** `[TODO] 設計書を書く 期限:2025/12/31`
    -   **Botの応答（整形・登録）:** `タスク「設計書を書く」を登録しました。期限: 2025/12/31`

## 2. 実装方針の提案

既存の `messageTriggerCommand` のアーキテクチャを踏襲することで、一貫性のある実装が可能です。

### 2.1. `MessageFormatCommand` インターフェースの定義

まず、`src/types/command.ts` に `messageFormatCommand` 用の新しいインターフェースを定義します。トリガーとして文字列の `prefix` の代わりに、正規表現 `pattern` を持たせると柔軟性が高まります。

```typescript
// src/types/command.ts に追記

import { Message } from 'discord.js';

/**
 * @class 特定のフォーマットを持つメッセージのコマンドを定義するための型
 */
export interface MessageFormatCommand {
  name: string;

  // メッセージのフォーマットを検知するための正規表現
  pattern: RegExp;

  // 実行される処理
  // 正規表現のキャプチャグループを params として渡す
  execute: (ctx: Message, params: RegExpMatchArray) => Promise<void>;
}
```

### 2.2. コマンドクラスの作成

`src/msgTrigger/format/` のような新しいディレクトリを作成し、そこにコマンドクラスを配置します。

```typescript
// src/msgTrigger/format/meetingLog.ts

import { Message } from "discord.js";
import type { MessageFormatCommand } from "../../types/command.js";

export default class meetingLog implements MessageFormatCommand {
  name: string = 'meetingLog';

  // 「#議題」と「#内容」を含むメッセージにマッチする正規表現
  pattern: RegExp = /#議題\s*([\s\S]+?)\s*#内容\s*([\s\S]+)/;

  execute = async (ctx: Message, params: RegExpMatchArray): Promise<void> => {
    const title = params[1].trim(); // キャプチャグループ1（議題）
    const content = params[2].trim(); // キャプチャグループ2（内容）

    const formattedMessage = `
【議事録】
■議題
${title}
■内容
${content}
    `;

    ctx.reply(formattedMessage);
  }
}
```

### 2.3. コアロジックの作成 (`core/messageFormatCommand/`)

`messageTriggerCommand` と同様に、以下のファクトリやハンドラを `src/core/messageFormatCommand/` に作成します。

1.  **`messageFormatCommandNameInstanceFactory.ts`**:
    -   `src/msgTrigger/format/` ディレクトリからコマンドクラスを動的にインポートし、 `{コマンド名: クラスインスタンス}` のペアを作成します。

2.  **`messageFormatCommandFactory.ts`**:
    -   `messageCreate` イベントから呼び出されるメインの処理です。
    -   すべての `MessageFormatCommand` インスタンスをループし、メッセージ本文が `pattern`（正規表現）に一致するかをテストします。
    -   一致した場合、対応するコマンドの `execute` メソッドを、`RegExpMatchArray`（キャプチャグループなどを含む配列）を引数にして実行します。

### 2.4. `main.ts` への統合

`main.ts` の `messageCreate` イベントハンドラに、`messageFormatCommand` の処理を追加します。

```typescript
// src/main.ts の messageCreate イベント内

botClient.on('messageCreate', async (message: Message) => {
	if (message.author.bot) return;

	// === メッセージトリガーコマンドの処理 =================
	const canExecute = await messageCommandPermission(message, await msgNameTriggerPairs);
	if (canExecute) {
		messageCommandFactory(message, await msgNameTriggerPairs, await msgNameInstancePairs);
    // トリガーコマンドが実行されたら、フォーマットコマンドは実行しない
    return;
	}

  // === メッセージフォーマットコマンドの処理（追記） ========
  // ここに messageFormatCommandFactory を呼び出す処理を実装する
  // 例: messageFormatCommandFactory(message, await formatNameInstancePairs);

});
```

**補足:**
`messageTriggerCommand` と `messageFormatCommand` の両方に一致する可能性があるため、どちらを優先するか、あるいは両方実行するかといった制御を `main.ts` で決定する必要があります。
上の例では、トリガーコマンドが実行された場合は、フォーマットコマンドの処理は行わずに `return` しています。

この方針で実装を進めることで、既存の設計思想を活かしつつ、新しい機能を拡張できるはずです。
