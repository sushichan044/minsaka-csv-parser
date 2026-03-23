import * as v from "valibot";

import type { DonationData } from "./types.ts";

const donationNumArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const coerceNumber = v.pipe(v.string(), v.toNumber());
const coerceDate = v.pipe(v.string(), v.toDate());

const rawCSVRowSchema = v.object({
  "1回目の参加一口金額": coerceNumber,
  "1回目の参加口数": coerceNumber,
  "1回目の参加合計金額金額": coerceNumber,
  "1回目の参加日時": coerceDate,
  "2回目の参加一口金額": v.optional(coerceNumber),
  "2回目の参加口数": v.optional(coerceNumber),
  "2回目の参加合計金額金額": v.optional(coerceNumber),
  "2回目の参加日時": v.optional(coerceDate),
  "3回目の参加一口金額": v.optional(coerceNumber),
  "3回目の参加口数": v.optional(coerceNumber),
  "3回目の参加合計金額金額": v.optional(coerceNumber),
  "3回目の参加日時": v.optional(coerceDate),
  "4回目の参加一口金額": v.optional(coerceNumber),
  "4回目の参加口数": v.optional(coerceNumber),
  "4回目の参加合計金額金額": v.optional(coerceNumber),
  "4回目の参加日時": v.optional(coerceDate),
  "5回目の参加一口金額": v.optional(coerceNumber),
  "5回目の参加口数": v.optional(coerceNumber),
  "5回目の参加合計金額金額": v.optional(coerceNumber),
  "5回目の参加日時": v.optional(coerceDate),
  "6回目の参加一口金額": v.optional(coerceNumber),
  "6回目の参加口数": v.optional(coerceNumber),
  "6回目の参加合計金額金額": v.optional(coerceNumber),
  "6回目の参加日時": v.optional(coerceDate),
  "7回目の参加一口金額": v.optional(coerceNumber),
  "7回目の参加口数": v.optional(coerceNumber),
  "7回目の参加合計金額金額": v.optional(coerceNumber),
  "7回目の参加日時": v.optional(coerceDate),
  "8回目の参加一口金額": v.optional(coerceNumber),
  "8回目の参加口数": v.optional(coerceNumber),
  "8回目の参加合計金額金額": v.optional(coerceNumber),
  "8回目の参加日時": v.optional(coerceDate),
  "9回目の参加一口金額": v.optional(coerceNumber),
  "9回目の参加口数": v.optional(coerceNumber),
  "9回目の参加合計金額金額": v.optional(coerceNumber),
  "9回目の参加日時": v.optional(coerceDate),
  "10回目の参加一口金額": v.optional(coerceNumber),
  "10回目の参加口数": v.optional(coerceNumber),
  "10回目の参加合計金額金額": v.optional(coerceNumber),
  "10回目の参加日時": v.optional(coerceDate),
  ユーザー名: v.string(),
  掲載名: v.string(),
});

export const minsakaCSVRowSchema = v.pipe(
  rawCSVRowSchema,
  v.transform((val) => {
    const donations = donationNumArray.reduce<DonationData[]>((acc, n) => {
      const tankaKey = `${n}回目の参加一口金額` as const;
      const amountKey = `${n}回目の参加口数` as const;
      const totalAmountKey = `${n}回目の参加合計金額金額` as const;
      const dateKey = `${n}回目の参加日時` as const;

      if (
        val[tankaKey] == null ||
        val[amountKey] == null ||
        val[totalAmountKey] == null ||
        val[dateKey] == null
      ) {
        return acc;
      }

      return [
        ...acc,
        {
          一口金額: val[tankaKey],
          参加口数: val[amountKey],
          合計金額: val[totalAmountKey],
          日時: val[dateKey],
        } satisfies DonationData,
      ];
    }, []);

    return {
      ユーザー名: val["ユーザー名"],
      参加履歴: donations,
      掲載名: val["掲載名"],
    };
  }),
);

/**
 * @package
 */
export const minsakaCSVDataSchema = v.array(minsakaCSVRowSchema);
