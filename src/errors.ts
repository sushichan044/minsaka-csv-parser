import type { ParseError as _ParseError, ParseMeta } from "papaparse";
import type * as v from "valibot";

import type { minsakaCSVDataSchema } from "./schema";

export class ParseError extends Error {
  issues: _ParseError[];
  meta: ParseMeta;

  constructor(issues: _ParseError[], meta: ParseMeta, cause?: unknown) {
    const line = issues.at(0)?.row;

    super(`Failed to parse CSV${line != null ? ` at row ${line}` : ""}`, { cause });
    this.name = "ParseError";
    this.issues = issues;
    this.meta = meta;
  }
}

type ValidationIssue = v.InferIssue<typeof minsakaCSVDataSchema>;

export class ValidationError extends Error {
  issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[], cause?: unknown) {
    super(message, { cause });
    this.name = "ValidationError";
    this.issues = issues;
  }
}
