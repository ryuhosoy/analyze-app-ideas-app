import type { ExampleReport } from "./types";
import budgetApp from "./data/budget-app.en.json";
import plantCare from "./data/plant-care.en.json";
import vocabApp from "./data/vocab-app.en.json";

export const EXAMPLES_EN: ExampleReport[] = [
  budgetApp as ExampleReport,
  plantCare as ExampleReport,
  vocabApp as ExampleReport,
];
