# 会社LP — CLAUDE.md

## プロジェクト概要

株式会社WEBY の新卒採用ランディングページ。単一ファイル構成 (`index.html`)。
ブランド: THE RED EDGE / `#FF1F4B` red + black/white / Montserrat + Noto Serif JP。

## ハーネス: LP Build

**目標:** 採用LPの構築・改善を、デザイン・コピー・QAエージェントチームで高品質に実施する。

**エージェントチーム:**

| エージェント | 役割 |
|------------|------|
| lp-designer | HTML/CSS実装・レイアウト・ビジュアルデザイン |
| lp-copywriter | 日本語コピー・採用メッセージの生成・改善 |
| lp-qa | ブランド整合性・HTML構造・画像パスの品質検証 |

**スキル:**

| スキル | 用途 | 担当 |
|-------|------|------|
| lp-build | LPの構築・編集・改善オーケストレーター | 全エージェント |
| harness | エージェントチーム・スキル設計メタスキル | - |

**実行規則:**
- LP編集・改善・セクション追加・コピー変更など LP に関わる作業は `lp-build` スキルを通じてエージェントチームで処理する
- 単純な質問・確認は直接応答してよい
- すべてのエージェントは `model: "opus"` を使用する
- 中間産出物: `_workspace/` ディレクトリ
- プレビュー: http://localhost:8080

**ディレクトリ構造:**

```
.claude/
├── agents/
│   ├── lp-designer.md
│   ├── lp-copywriter.md
│   └── lp-qa.md
└── skills/
    ├── lp-build/
    │   └── SKILL.md
    └── harness/
        ├── SKILL.md
        └── references/
```

**変更履歴:**

| 日付 | 変更内容 | 対象 | 理由 |
|------|---------|------|------|
| 2026-04-07 | 初期ハーネス構成 | 全体 | 会社LP開発開始 |
