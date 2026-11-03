import type { ExampleReport } from "./types";
import budgetApp from "./samples/budget-app.jp.json";
import plantCare from "./samples/plant-care.jp.json";
import vocabApp from "./samples/vocab-app.jp.json";

export type { ExampleReport } from "./types";

export const EXAMPLES: ExampleReport[] = [
  budgetApp as ExampleReport,
  plantCare as ExampleReport,
  vocabApp as ExampleReport,
];
