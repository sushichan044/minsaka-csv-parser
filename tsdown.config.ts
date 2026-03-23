import { defineConfig } from "tsdown";

const cautionBanner = [
  "/**",
  " * 本ライブラリは、適法に取得された参加者名簿 CSV を解析するためのツールです。",
  " *",
  " * 個人情報の外部送信・共有機能は含まれません。",
  " *",
  " * [ミンサカの利用規約](https://www.sakaseru.jp/mina/agreement/terms-of-service) および",
  " * 関連法令に反する用途（目的外利用・第三者提供等）での使用は禁止されています。",
  " *",
  " * 利用者は自己の責任において適法性を確認の上、本ライブラリを使用してください。",
  " */",
].join("\n");

export default defineConfig({
  attw: { level: "error", profile: "esm-only" },
  banner: {
    dts: cautionBanner,
    js: cautionBanner,
  },
  clean: true,
  dts: {
    tsgo: true,
  },
  entry: ["src/index.ts"],
  fixedExtension: true,
  format: "esm",
  fromVite: true,
  minify: "dce-only",
  nodeProtocol: true,
  outDir: "dist",
  publint: true,
  sourcemap: false,
  treeshake: true,
  unused: true,
});
