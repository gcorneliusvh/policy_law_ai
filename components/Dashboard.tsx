import React from 'react';
import type { DashboardAnalysis } from '../types';
import FrequencyChart from './FrequencyChart';

interface DashboardProps {
  dashboardSummary: DashboardAnalysis;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardSummary }) => {
  const { keyThemes, commonClauses, divergentApproaches } = dashboardSummary;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Themes */}
      <div className="lg:col-span-1 bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-primary border-b pb-2">Key Themes</h2>
        <ul className="space-y-2">
          {keyThemes.map((theme, index) => (
            <li key={index} className="flex items-start">
              <span className="text-accent font-bold mr-2">&#10003;</span>
              <span className="text-text">{theme}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Common Clauses */}
      <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-primary border-b pb-2">Most Common Clauses</h2>
        <FrequencyChart data={commonClauses} />
      </div>

      {/* Divergent Approaches */}
      <div className="lg:col-span-3 bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-primary border-b pb-2">Divergent Approaches</h2>
        <div className="space-y-4">
          {divergentApproaches.map((approach, index) => (
            <div key={index} className="p-4 bg-muted rounded-md">
              <h3 className="font-semibold text-lg text-accent">{approach.approach}</h3>
              <p className="text-text mt-1 mb-2">{approach.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-muted-foreground">Examples:</span>
                {approach.examples.map((example, i) => (
                  <span key={i} className="px-2 py-1 bg-background text-xs font-medium rounded-full">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
