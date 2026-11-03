/** サンプルレポート生成用（scripts/generate-examples.ts と共有） */
export const EXAMPLE_SPECS = [
  {
    slug: "budget-app",
    country: "us",
    jp: {
      title: "家計簿アプリ",
      idea: "レシートを撮るだけで支出を記録できる、一人暮らし向けのシンプルな家計簿",
    },
    en: {
      title: "Budget app",
      idea: "A simple budget app for solo living—log spending by snapping receipts",
    },
  },
  {
    slug: "plant-care",
    country: "us",
    jp: {
      title: "植物の水やりアプリ",
      idea: "写真から植物を判定して、水やりのタイミングを通知してくれるアプリ",
    },
    en: {
      title: "Plant care app",
      idea: "Identify plants from photos and get watering reminders",
    },
  },
  {
    slug: "vocab-app",
    country: "us",
    jp: {
      title: "英単語アプリ",
      idea: "1日5分、通勤中に使える英単語の暗記アプリ",
    },
    en: {
      title: "Vocabulary app",
      idea: "Five minutes a day—vocabulary flashcards for your commute",
    },
  },
] as const;
