# @sushichan044/minsaka-csv-parser

> [!CAUTION]
> 本ライブラリは、適法に取得された参加者名簿 CSV を解析するためのツールです。
>
> 個人情報の外部送信・共有機能は含まれません。[ミンサカの利用規約](https://www.sakaseru.jp/mina/agreement/terms-of-service) および関連法令に反する用途（目的外利用・第三者提供等）での使用は禁止されています。
>
> 利用者は自己の責任において適法性を確認の上、本ライブラリを使用してください。

フラスタ・応援広告・贈り物企画プラットフォーム ミンサカ <https://www.sakaseru.jp/mina> で立てた企画の管理画面からダウンロードできる寄付者情報の CSV を構造化されたデータとしてパースするライブラリです。

## Installation

```bash
npm install @sushichan044/minsaka-csv-parser

yarn add @sushichan044/minsaka-csv-parser

pnpm add @sushichan044/minsaka-csv-parser

bun add @sushichan044/minsaka-csv-parser
```

## Usage

`parseAsync` は、CSV の大きさがそれほど大きくない場合に簡単に全体をパースして結果を得るのに適しています。

CSV が大きい可能性がある場合やメモリ使用量を気にする場合は、`parseStream` を使用してください。

詳細なデータ構造は型定義等を参照してください。

### `parseAsync`

```ts
import { readFile } from "node:fs/promises";

import { parseAsync } from "@sushichan044/minsaka-csv-parser";

const csv = await readFile("./supporters.csv", "utf8");
const result = await parseAsync(csv);

if (!result.ok) {
  throw result.error;
}

console.log(result.data);
console.log(result.warnings);
```

### `parseStream`

```ts
import { open } from "node:fs/promises";

import { parseStream } from "@sushichan044/minsaka-csv-parser";

const file = await open("./supporters.csv");
const stream = parseStream(file.readableWebStream());

for await (const result of stream) {
  if (!result.ok) {
    throw result.error;
  }

  console.log(result.data);
  console.log(result.warnings);
}
```
