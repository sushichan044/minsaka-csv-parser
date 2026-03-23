import { assert, describe, expect, it } from "vitest";

import { ParseError, ValidationError } from "./errors";
import { parseStream } from "./parse";

function stringToStream(str: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str));
      controller.close();
    },
  });
}

async function collect<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const item of gen) results.push(item);
  return results;
}

const VALID_HEADERS =
  "ユーザー名,掲載名,1回目の参加一口金額,1回目の参加口数,1回目の参加合計金額金額,1回目の参加日時";
const VALID_ROW = "user1,表示名1,1000,1,1000,2024-01-01T00:00:00";

type Stream = ReturnType<typeof parseStream>;

const cases: Array<{
  assert: (stream: Stream) => Promise<void>;
  name: string;
  rows: string[];
}> = [
  {
    async assert(stream) {
      const results = await collect(stream);
      const first = results[0];
      assert.isTrue(first?.ok);
      expect(first.data.ユーザー名).toBe("user1");
      expect(first.data.掲載名).toBe("表示名1");
      expect(first.data.参加履歴).toHaveLength(1);
      expect(first.data.参加履歴[0]?.一口金額).toBe(1000);
    },
    name: "正常な CSV を1行 ParseResult として emit する",
    rows: [VALID_ROW],
  },
  {
    async assert(stream) {
      const results = await collect(stream);
      const [first, second] = results;
      assert.isTrue(first?.ok);
      assert.isTrue(second?.ok);
      expect(first.data.ユーザー名).toBe("user1");
      expect(second.data.ユーザー名).toBe("user2");
    },
    name: "複数行を順番に emit する",
    rows: [VALID_ROW, "user2,表示名2,2000,2,4000,2024-02-01T00:00:00"],
  },
  {
    async assert(stream) {
      const results = await collect(stream);
      expect(results).toHaveLength(0);
    },
    name: "ヘッダーのみの空 CSV は何も emit せず終了する",
    rows: [],
  },
  {
    async assert(stream) {
      const results = await collect(stream);
      const first = results[0];
      assert.isFalse(first?.ok);
      expect(first.error).toBeInstanceOf(ParseError);
    },
    name: "CSV パースエラーがある行は CSVParseError で emit する",
    rows: ['"クォートが閉じていない,表示名1,1000,1,1000,2024-01-01T00:00:00'],
  },
  {
    async assert(stream) {
      const results = await collect(stream);
      const first = results[0];
      assert.isFalse(first?.ok);
      expect(first.error).toBeInstanceOf(ValidationError);
    },
    name: "バリデーションエラーがある行は ValidationError で emit する",
    rows: ["user1,表示名1,NOT_A_NUMBER,1,1000,2024-01-01T00:00:00"],
  },
  {
    async assert(stream) {
      const reader = stream.getReader();
      await reader.read();
      await reader.cancel();
      const { done } = await reader.read();
      expect(done).toBe(true);
    },
    name: "キャンセル後はストリームが閉じられそれ以上 emit されない",
    rows: [VALID_ROW, VALID_ROW, VALID_ROW],
  },
  {
    async assert(stream) {
      const results = await collect(stream);
      assert.lengthOf(results, 2);
      const [, invalid] = results;
      assert.isFalse(invalid?.ok);
      expect(invalid.error).toBeInstanceOf(ValidationError);
    },
    name: "有効行とエラー行が混在する場合、それぞれ正しく emit する",
    rows: [VALID_ROW, "user2,表示名2,NOT_A_NUMBER,1,1000,2024-01-01T00:00:00"],
  },
];

describe("parseStream", () => {
  it.each(cases)("$name", async ({ assert: assertFn, rows }) => {
    const csv = [VALID_HEADERS, ...rows].join("\n");
    await assertFn(parseStream(stringToStream(csv)));
  });
});
