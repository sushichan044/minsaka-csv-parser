export type DonationData = {
  一口金額: number;
  参加口数: number;
  合計金額: number;
  日時: Date;
};

export type MinsakaSupporter = {
  ユーザー名: string;
  参加履歴: DonationData[];
  掲載名: string;
};

export type Result<T, E extends Error> = { data: T; ok: true } | { error: E; ok: false };
