import { Readable } from "node:stream";
import { parse } from "papaparse";
import * as v from "valibot";

import type { MinsakaSupporter, Result } from "./types.ts";

import { ParseError, ValidationError } from "./errors";
import { minsakaCSVRowSchema } from "./schema";

/**
 * Parse a Minsaka CSV string into structured supporter data.
 */
export async function parseAsync(
  raw: string,
): Promise<Result<MinsakaSupporter[], ParseError | ValidationError>> {
  const input = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(raw));
      controller.close();
    },
  });

  const supporters: MinsakaSupporter[] = [];
  const allWarnings: string[] = [];
  for await (const result of parseStream(input)) {
    if (!result.ok) {
      return { error: result.error, ok: false };
    }
    supporters.push(result.data);
    allWarnings.push(...result.warnings);
  }

  return { data: supporters, ok: true, warnings: allWarnings };
}

type StreamingResult = Result<MinsakaSupporter, ParseError | ValidationError>;

function isRecoverableParseError(error: Papa.ParseError): boolean {
  // minsaka の CSV は、optional な列に値がない場合に列自体が存在しない
  // よって TooFewFields が発生するが、これは許容する
  return error.type === "FieldMismatch" && error.code === "TooFewFields";
}

function checkDonationTotals(supporter: MinsakaSupporter, rowNumber: number): string[] {
  const warnings: string[] = [];
  for (const [index, donation] of supporter.参加履歴.entries()) {
    const expected = donation.一口金額 * donation.参加口数;
    if (expected !== donation.合計金額) {
      warnings.push(
        `line ${rowNumber} (${supporter.ユーザー名}): ${index + 1}回目の参加: 一口金額(${donation.一口金額}) × 参加口数(${donation.参加口数}) = ${expected} が 合計金額(${donation.合計金額}) と一致しません`,
      );
    }
  }
  return warnings;
}

/**
 * Parse a Minsaka CSV stream into structured supporter data, row by row.
 */
export function parseStream(input: ReadableStream): ReadableStream<StreamingResult> {
  const nodeReadable = Readable.fromWeb(input);

  return new ReadableStream<StreamingResult>({
    cancel() {
      nodeReadable.destroy();
    },
    start(controller) {
      let rowNumber = 1;
      parse(nodeReadable, {
        complete: () => controller.close(),

        header: true,
        skipEmptyLines: true,
        step: (result) => {
          const currentRow = rowNumber++;
          const unrecoverableErrors = result.errors.filter(
            (error) => !isRecoverableParseError(error),
          );

          if (unrecoverableErrors.length > 0) {
            controller.enqueue({
              error: new ParseError(unrecoverableErrors, result.meta),
              ok: false,
            });
            return;
          }

          const validated = v.safeParse(minsakaCSVRowSchema, result.data);
          if (!validated.success) {
            controller.enqueue({
              error: new ValidationError("CSV validation error", validated.issues),
              ok: false,
            });
            return;
          }

          const warnings = checkDonationTotals(validated.output, currentRow);
          controller.enqueue({ data: validated.output, ok: true, warnings });
        },
      });
    },
  });
}
