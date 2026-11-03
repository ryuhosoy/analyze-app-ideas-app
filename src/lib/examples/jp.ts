import type { ExampleReport } from "./types";
import budgetApp from "./data/budget-app.jp.json";
import plantCare from "./data/plant-care.jp.json";
import vocabApp from "./data/vocab-app.jp.json";

export type { ExampleReport } from "./types";

export const EXAMPLES: ExampleReport[] = [
  budgetApp as ExampleReport,
  plantCare as ExampleReport,
  vocabApp as ExampleReport,
];
