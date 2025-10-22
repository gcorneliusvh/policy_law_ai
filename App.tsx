import React, { useState } from 'react';
import { generateAnalysisFromPrompt } from './services/geminiService';
import type { FullAnalysis, Contract } from './types';
import Dashboard from './components/Dashboard';
import ContractDetail from './components/ContractDetail';
import Loader from './components/Loader';
import ChatAgent from './components/ChatAgent';

const TOP_20_GDP_COUNTRIES = [
    "United States", "China", "Germany", "Japan", "India", "United Kingdom",
    "France", "Italy", "Brazil", "Canada", "Russia", "Mexico", "Australia",
    "South Korea", "Spain", "Indonesia", "Netherlands", "Saudi Arabia", "Turkey", "Switzerland"
];

const EXAMPLE_PROMPTS = [
    "Analyze national AI strategies, highlighting approaches to ethics and public investment.",
    "Compare renewable energy policies, focusing on solar and wind incentives.",
    "What are the differences in data privacy laws like GDPR across various non-EU countries?",
    "Examine public healthcare funding models and their outcomes in developed nations."
];

function App() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [countries, setCountries] = useState<string[]>(TOP_20_GDP_COUNTRIES);
  const [newCountry, setNewCountry] = useState('');

  const handleAddCountry = () => {
    if (newCountry && !countries.find(c => c.toLowerCase() === newCountry.toLowerCase())) {
      setCountries([...countries, newCountry]);
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (countryToRemove: string) => {
    setCountries(countries.filter(c => c !== countryToRemove));
  };
    
  const handleGenerate = async () => {
    if (!prompt || countries.length === 0) {
      setError("Please provide a prompt and select at least one country.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await generateAnalysisFromPrompt(prompt, countries);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (contract: Contract) => setSelectedContract(contract);
  const handleCloseDetails = () => setSelectedContract(null);
  const toggleChat = () => setIsChatOpen(prev => !prev);
  
  const handleExamplePromptClick = (example: string) => {
      setPrompt(example);
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      {isLoading && <Loader message="Generating analysis... This may take a moment." />}
      
      <header className="bg-card shadow-md">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-primary text-center">AI-Powered Policy Dashboard</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {error && (
          <div className="bg-destructive border border-red-400 text-destructive-foreground px-4 py-3 rounded-md mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!analysis && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold text-primary mb-1">Analysis Configuration</h2>
              <p className="text-muted-foreground mb-6">Enter your analysis topic and configure the countries to include.</p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Analyze data privacy laws and their impact on international business..."
                className="w-full p-3 border rounded-md bg-input text-text focus:outline-none focus:ring-2 focus:ring-accent mb-4 h-28"
              />

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-3">Example Prompts</h3>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLE_PROMPTS.map((p, i) => (
                            <button key={i} onClick={() => handleExamplePromptClick(p)} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-3">Countries for Analysis</h3>
                <div className="flex mb-3">
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCountry()}
                    placeholder="Add a country..."
                    className="flex-1 p-2 border rounded-l-md bg-input text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button onClick={handleAddCountry} className="px-4 py-2 bg-accent text-accent-foreground font-bold rounded-r-md">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {countries.map(country => (
                    <span key={country} className="flex items-center bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                      {country}
                      <button onClick={() => handleRemoveCountry(country)} className="ml-2 text-primary-foreground hover:text-red-300">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground font-bold py-3 px-6 rounded-lg text-lg hover:bg-opacity-90 transition-colors shadow-lg disabled:bg-muted disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Generate Dashboard'}
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div>
            <Dashboard dashboardSummary={analysis.dashboardSummary} />

            <div className="mt-8 bg-card p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-primary border-b pb-2">Individual Policy Summaries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.contracts.map(contract => (
                  <div key={contract.id} className="p-4 bg-muted rounded-md flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-accent">{contract.policyTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{contract.country}</p>
                      <p className="text-sm line-clamp-3">{contract.summary}</p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(contract)}
                      className="text-sm font-semibold text-accent hover:underline mt-4 text-left"
                    >
                      View Details & Suggestions
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={toggleChat}
              className="fixed bottom-4 left-4 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-opacity-90 z-40"
              title="Open Chat Agent"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
          </div>
        )}
      </main>

      {selectedContract && (
        <ContractDetail contract={selectedContract} onClose={handleCloseDetails} />
      )}
      
      {isChatOpen && analysis && (
          <ChatAgent analysis={analysis} onClose={toggleChat} />
      )}
    </div>
  );
}

export default App;