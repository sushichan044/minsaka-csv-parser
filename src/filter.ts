import type { MinsakaSupporter } from "./types";

/**
 * 名前の掲載を希望していない支援者を除外したリストを返す
 *
 * minsaka で申込時に 名前の掲載を希望しなかった場合は、掲載名が `掲載なし希望` になる
 */
export function excludeNonPublishableSupporters(
  supporters: MinsakaSupporter[],
): MinsakaSupporter[] {
  return supporters.filter((supporter) => supporter.掲載名 !== MINSAKA_NO_DISPLAY);
}

const MINSAKA_NO_DISPLAY = "掲載なし希望";
