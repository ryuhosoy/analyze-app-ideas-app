import type { CompetitorSummary, ReportResult } from "../report-schema";

export type ExampleReport = {
  slug: string;
  title: string;
  idea: string;
  topCompetitor: string;
  reviewCount: number;
  competitors: CompetitorSummary[];
  result: ReportResult;
};
