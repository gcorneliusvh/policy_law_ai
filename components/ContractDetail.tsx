
import React from 'react';
import { Contract } from '../types';

interface ContractDetailProps {
  contract: Contract;
  onClose: () => void;
}

const ContractDetail: React.FC<ContractDetailProps> = ({ contract, onClose }) => {
  return (
    <div className="fixed inset-0 bg-background bg-opacity-80 flex items-center justify-center z-40" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-8 max-w-2xl w-full m-4 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">{contract.policyTitle}</h2>
            <p className="text-md text-muted-foreground">{contract.country}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary text-2xl">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Summary</h3>
            <p className="text-text whitespace-pre-wrap">{contract.summary}</p>
          </div>
          
          {contract.suggestions && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-accent">Suggestions</h3>
              <p className="text-text whitespace-pre-wrap">{contract.suggestions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
