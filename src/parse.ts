import { Readable } from "node:stream";
import * as Papa from "papaparse";
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
  for await (const result of parseStream(input)) {
    if (!result.ok) {
      return { error: result.error, ok: false };
    }
    supporters.push(result.data);
  }

  return { data: supporters, ok: true };
}

type StreamingResult = Result<MinsakaSupporter, ParseError | ValidationError>;

/**
 * Parse a Minsaka CSV stream into structured supporter data, row by row.
 */
export function parseStream(input: ReadableStream<Uint8Array>): ReadableStream<StreamingResult> {
  const nodeReadable = Readable.fromWeb(input);

  return new ReadableStream<StreamingResult>({
    cancel() {
      nodeReadable.destroy();
    },
    start(controller) {
      Papa.parse(nodeReadable, {
        complete: () => controller.close(),
        header: true,
        skipEmptyLines: true,
        step: (result) => {
          if (result.errors.length > 0) {
            controller.enqueue({
              error: new ParseError(result.errors, result.meta),
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
          } else {
            controller.enqueue({ data: validated.output, ok: true });
          }
        },
      });
    },
  });
}
