export interface Contract {
  id: number;
  country: string;
  policyTitle: string;
  summary: string;
  suggestions?: string;
}

export interface CommonClause {
    clause: string;
    description: string;
    frequency: number;
}

export interface DivergentApproach {
    approach: string;
    description: string;
    examples: string[];
}

export interface DashboardAnalysis {
  keyThemes: string[];
  commonClauses: CommonClause[];
  divergentApproaches: DivergentApproach[];
}

export interface FullAnalysis {
  dashboardSummary: DashboardAnalysis;
  contracts: Contract[];
}
