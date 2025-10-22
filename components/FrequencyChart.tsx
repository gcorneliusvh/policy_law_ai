import React from 'react';
import { CommonClause } from '../types';

interface FrequencyChartProps {
  data: CommonClause[];
}

const FrequencyChart: React.FC<FrequencyChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No data available for chart.</p>;
  }

  const sortedData = [...data].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="space-y-4">
      {sortedData.map((item, index) => (
        <div key={index} className="group">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-text truncate group-hover:text-primary">{item.clause}</p>
            <p className="text-sm font-bold text-accent">{item.frequency}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="bg-accent h-4 rounded-full transition-all duration-500"
              style={{ width: `${item.frequency}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FrequencyChart;
