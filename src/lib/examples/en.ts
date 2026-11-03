import type { ExampleReport } from "./types";
import budgetApp from "./samples/budget-app.en.json";
import plantCare from "./samples/plant-care.en.json";
import vocabApp from "./samples/vocab-app.en.json";

export const EXAMPLES_EN: ExampleReport[] = [
  budgetApp as ExampleReport,
  plantCare as ExampleReport,
  vocabApp as ExampleReport,
];
